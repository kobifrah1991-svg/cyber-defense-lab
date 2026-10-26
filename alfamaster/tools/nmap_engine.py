"""Nmap orchestration engine.

A thin, safe wrapper that builds and runs real `nmap` scans for network
inventory and service discovery. Targets are validated and arguments are
passed as an explicit list (never via a shell), so there is no command
injection surface.

Intended for scanning hosts and networks you own or are explicitly
authorized to assess.
"""

from __future__ import annotations

import ipaddress
import re
import shutil
import subprocess
from dataclasses import dataclass

# Scan profiles map a stable id to a fixed, reviewed set of nmap flags.
# -A (aggressive) enables version/OS detection, default scripts and
# traceroute — all standard discovery, nothing that modifies a target.
PROFILES: dict[str, list[str]] = {
    "quick":      ["-T4", "-F"],
    "service_os": ["-sV", "-O", "-T4"],
    "aggressive": ["-A", "-T4"],
}

# Hostnames per RFC 1123 (labels of letters/digits/hyphen, dot-separated).
_HOSTNAME_RE = re.compile(
    r"^(?=.{1,253}$)(?!-)[A-Za-z0-9-]{1,63}(?<!-)"
    r"(\.(?!-)[A-Za-z0-9-]{1,63}(?<!-))*$"
)


class ScanError(Exception):
    """Raised when a scan cannot be started (bad target, missing tool…)."""


@dataclass
class ScanResult:
    target: str
    profile: str
    command: list[str]
    returncode: int
    stdout: str
    stderr: str

    @property
    def ok(self) -> bool:
        return self.returncode == 0


def is_valid_target(target: str) -> bool:
    """Accept a single IP, a CIDR range, or a DNS hostname."""
    target = target.strip()
    if not target or any(c.isspace() for c in target):
        return False
    try:
        ipaddress.ip_address(target)
        return True
    except ValueError:
        pass
    try:
        ipaddress.ip_network(target, strict=False)
        return True
    except ValueError:
        pass
    return bool(_HOSTNAME_RE.match(target))


def build_command(target: str, profile: str = "quick",
                  extra: list[str] | None = None) -> list[str]:
    """Return the argv list for a scan, validating inputs first."""
    if profile not in PROFILES:
        raise ScanError(f"unknown profile: {profile!r}")
    if not is_valid_target(target):
        raise ScanError(f"invalid target: {target!r}")
    cmd = ["nmap", *PROFILES[profile]]
    if extra:
        cmd.extend(extra)
    cmd.append(target)
    return cmd


def run_scan(target: str, profile: str = "quick", *,
             extra: list[str] | None = None,
             timeout: int = 900) -> ScanResult:
    """Execute a validated nmap scan and capture its output."""
    if shutil.which("nmap") is None:
        raise ScanError("nmap not found on PATH")
    cmd = build_command(target, profile, extra)
    try:
        proc = subprocess.run(
            cmd, capture_output=True, text=True, timeout=timeout, check=False
        )
    except subprocess.TimeoutExpired as exc:
        raise ScanError(f"scan timed out after {timeout}s") from exc
    except OSError as exc:
        raise ScanError(str(exc)) from exc
    return ScanResult(
        target=target, profile=profile, command=cmd,
        returncode=proc.returncode,
        stdout=proc.stdout or "", stderr=proc.stderr or "",
    )


_PORT_LINE = re.compile(
    r"^(\d+)/(tcp|udp)\s+(\w+)\s+(\S+)(?:\s+(.*))?$", re.MULTILINE
)


def parse_open_ports(stdout: str) -> list[dict]:
    """Extract a structured list of ports from nmap's normal output."""
    rows = []
    for m in _PORT_LINE.finditer(stdout):
        rows.append({
            "port": int(m.group(1)),
            "proto": m.group(2),
            "state": m.group(3),
            "service": m.group(4),
            "version": (m.group(5) or "").strip(),
        })
    return rows
