# AlfaMaster Suite (authorized-testing core)

Cross-platform security & network orchestrator — the portion of the
AlfaMaster spec that is safe and appropriate to ship.

## What this delivers

| Area | Module | Status |
|------|--------|--------|
| Localization | `i18n.py` — EN / RU / HE-RTL / AR-RTL with direction metadata | ✅ |
| Detection | `detect.py` — OS + USB adapter (Alfa AWUS1900 / `0bda:8814`) + tool discovery | ✅ |
| Network scan | `tools/nmap_engine.py` — real nmap (quick / service+OS / aggressive) | ✅ |
| CLI | `cli.py` — `info`, `scan` | ✅ |

```bash
python3 -m alfamaster.cli info --lang he
python3 -m alfamaster.cli scan 192.168.1.0/24 --profile service_os
```

Targets are validated (IP / CIDR / hostname) and every tool is invoked
with an explicit argv list — never through a shell — so there is no
command-injection surface.

## What this deliberately does NOT include

The original spec asked for *one-click real execution* of three things
this suite will not ship:

1. **Wireless deauthentication / packet injection** — disconnecting
   clients is a denial-of-service attack and, aimed at surrounding
   networks, hits third parties you do not own.
2. **Deauth-forced handshake capture** against arbitrary ("surrounding")
   networks.
3. **Automated credential brute-forcing** (Hydra) against arbitrary
   SSH/FTP/HTTP/SMB/RDP targets with no scope or authorization control.

These require an authorization context the tool cannot establish on its
own. If you are doing authorized work in a lab **you own**, the upstream
tools (aircrack-ng suite, hydra) are available directly on Kali/Parrot;
this suite focuses on the inventory, discovery and localization layers
instead.

## Authorization

Use only against systems you own or are explicitly authorized to test.
Unauthorized scanning or disruption of networks is illegal in most
jurisdictions.
