"""OS and wireless-adapter detection.

Cross-platform, read-only probes. Nothing here changes system state; it
only reports what hardware and tooling are present so the rest of the
suite can adapt (e.g. show the right driver guidance per platform).
"""

from __future__ import annotations

import platform
import re
import shutil
import subprocess
from dataclasses import dataclass, field

# Realtek vendor id + the RTL8814AU product id used by the Alfa AWUS1900.
ALFA_VID = "0bda"
ALFA_PID = "8814"


@dataclass
class OSInfo:
    system: str          # "Linux" | "Windows" | "Darwin"
    release: str
    distro: str = ""     # best-effort Linux distro id (e.g. "kali", "parrot")

    @property
    def is_linux(self) -> bool:
        return self.system == "Linux"

    @property
    def is_windows(self) -> bool:
        return self.system == "Windows"

    @property
    def is_macos(self) -> bool:
        return self.system == "Darwin"


@dataclass
class Adapter:
    vendor_id: str
    product_id: str
    description: str = ""

    @property
    def is_alfa_awus1900(self) -> bool:
        return (self.vendor_id.lower() == ALFA_VID
                and self.product_id.lower() == ALFA_PID)


@dataclass
class Environment:
    os: OSInfo
    adapters: list[Adapter] = field(default_factory=list)
    tools: dict[str, str | None] = field(default_factory=dict)

    @property
    def alfa(self) -> Adapter | None:
        return next((a for a in self.adapters if a.is_alfa_awus1900), None)


def detect_os() -> OSInfo:
    system = platform.system()
    distro = ""
    if system == "Linux":
        try:
            with open("/etc/os-release", encoding="utf-8") as fh:
                for line in fh:
                    if line.startswith("ID="):
                        distro = line.partition("=")[2].strip().strip('"').lower()
                        break
        except OSError:
            pass
    return OSInfo(system=system, release=platform.release(), distro=distro)


def _run(cmd: list[str]) -> str:
    """Run a read-only probe command, returning stdout or '' on failure."""
    try:
        res = subprocess.run(
            cmd, capture_output=True, text=True, timeout=10, check=False
        )
        return res.stdout or ""
    except (OSError, subprocess.SubprocessError):
        return ""


def detect_adapters(os_info: OSInfo | None = None) -> list[Adapter]:
    """Enumerate USB adapters, best-effort, per platform."""
    os_info = os_info or detect_os()
    if os_info.is_linux:
        return _adapters_linux()
    if os_info.is_windows:
        return _adapters_windows()
    if os_info.is_macos:
        return _adapters_macos()
    return []


def _adapters_linux() -> list[Adapter]:
    out = _run(["lsusb"])
    adapters: list[Adapter] = []
    # Example line: "Bus 001 Device 004: ID 0bda:8814 Realtek ... RTL8814AU"
    for m in re.finditer(r"ID\s+([0-9a-fA-F]{4}):([0-9a-fA-F]{4})\s*(.*)", out):
        adapters.append(Adapter(m.group(1), m.group(2), m.group(3).strip()))
    return adapters


def _adapters_windows() -> list[Adapter]:
    # Query PnP USB devices and parse VID/PID from their hardware ids.
    out = _run([
        "powershell", "-NoProfile", "-Command",
        "Get-PnpDevice -Class Net,USB -PresentOnly | "
        "Select-Object -ExpandProperty InstanceId",
    ])
    adapters: list[Adapter] = []
    for m in re.finditer(r"VID_([0-9A-Fa-f]{4})&PID_([0-9A-Fa-f]{4})", out):
        adapters.append(Adapter(m.group(1), m.group(2), "USB device"))
    return adapters


def _adapters_macos() -> list[Adapter]:
    out = _run(["system_profiler", "SPUSBDataType"])
    adapters: list[Adapter] = []
    vid = pid = None
    for line in out.splitlines():
        line = line.strip()
        if line.startswith("Vendor ID:"):
            mm = re.search(r"0x([0-9a-fA-F]{4})", line)
            vid = mm.group(1) if mm else None
        elif line.startswith("Product ID:"):
            mm = re.search(r"0x([0-9a-fA-F]{4})", line)
            pid = mm.group(1) if mm else None
            if vid and pid:
                adapters.append(Adapter(vid, pid, "USB device"))
            vid = pid = None
    return adapters


# External tools the suite can drive. Only read-only / inventory tooling is
# listed here; offensive tooling is intentionally absent.
KNOWN_TOOLS = ("nmap", "iw", "airmon-ng", "airodump-ng", "tshark", "nmcli")


def detect_tools(tools: tuple[str, ...] = KNOWN_TOOLS) -> dict[str, str | None]:
    """Map each known tool name to its resolved path, or None if absent."""
    return {name: shutil.which(name) for name in tools}


def probe() -> Environment:
    """One-shot environment probe for the dashboard."""
    os_info = detect_os()
    return Environment(
        os=os_info,
        adapters=detect_adapters(os_info),
        tools=detect_tools(),
    )
