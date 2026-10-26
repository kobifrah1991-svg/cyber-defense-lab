"""AlfaMaster command-line entry point.

Subcommands
-----------
    info                 show OS, adapters and available tools
    scan <target>        run an nmap scan (profile via --profile)

Examples
--------
    python -m alfamaster.cli info --lang he
    python -m alfamaster.cli scan 192.168.1.0/24 --profile quick
"""

from __future__ import annotations

import argparse
import sys

from . import __version__
from .detect import probe
from .i18n import Translator, available_languages
from .tools import nmap_engine


def _cmd_info(args: argparse.Namespace, t: Translator) -> int:
    env = probe()
    print(f"{t('app.title')}  v{__version__}")
    print(f"OS: {env.os.system} {env.os.release}"
          + (f" ({env.os.distro})" if env.os.distro else ""))
    print()
    print(t("hw.detecting"))
    if env.alfa:
        print(f"  ✓ {t('hw.alfa_found')}")
    else:
        print(f"  · {t('hw.alfa_missing')}")
    for a in env.adapters:
        print(f"    - {a.vendor_id}:{a.product_id}  {a.description}")
    print()
    print("Tools:")
    for name, path in env.tools.items():
        print(f"  {'✓' if path else '·'} {name:<12} {path or '(not found)'}")
    return 0


def _cmd_scan(args: argparse.Namespace, t: Translator) -> int:
    if not nmap_engine.is_valid_target(args.target):
        print(t("err.bad_target", target=args.target), file=sys.stderr)
        return 2
    print(t("auth.reminder"))
    print(t("scan.running", target=args.target))
    try:
        result = nmap_engine.run_scan(args.target, args.profile)
    except nmap_engine.ScanError as exc:
        print(t("err.tool_missing", tool="nmap") if "not found" in str(exc)
              else str(exc), file=sys.stderr)
        return 1
    print(result.stdout)
    if result.stderr:
        print(result.stderr, file=sys.stderr)
    ports = nmap_engine.parse_open_ports(result.stdout)
    if ports:
        print(f"\n{t('scan.done')} — {len(ports)} port(s):")
        for p in ports:
            print(f"  {p['port']}/{p['proto']:<3} {p['state']:<6} "
                  f"{p['service']} {p['version']}".rstrip())
    return 0 if result.ok else 1


def build_parser() -> argparse.ArgumentParser:
    # A parent parser carries --lang so it is accepted on either side of the
    # subcommand (e.g. "info --lang he" as well as "--lang he info").
    common = argparse.ArgumentParser(add_help=False)
    common.add_argument("--lang", default="en",
                        choices=[lang["code"] for lang in available_languages()],
                        help="UI language (en, ru, he, ar)")

    p = argparse.ArgumentParser(prog="alfamaster", description="AlfaMaster Suite",
                                parents=[common])
    p.add_argument("--version", action="version", version=f"%(prog)s {__version__}")
    sub = p.add_subparsers(dest="command", required=True)

    sub.add_parser("info", parents=[common], help="show environment and hardware")

    sp = sub.add_parser("scan", parents=[common], help="run an nmap scan")
    sp.add_argument("target", help="IP, CIDR range, or hostname")
    sp.add_argument("--profile", default="quick",
                    choices=list(nmap_engine.PROFILES),
                    help="scan profile")
    return p


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    t = Translator(args.lang)
    if args.command == "info":
        return _cmd_info(args, t)
    if args.command == "scan":
        return _cmd_scan(args, t)
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
