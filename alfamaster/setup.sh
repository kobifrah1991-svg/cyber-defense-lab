#!/usr/bin/env bash
# AlfaMaster Suite — Linux installer (Kali / Parrot / Debian / Ubuntu).
#
# Installs the external CLI tools the authorized-testing core drives and
# verifies the Python package can run. Read-only / inventory tooling only.
#
# Usage:  ./setup.sh            # install + verify
#         ./setup.sh --check    # verify only, install nothing
set -euo pipefail

# Tools the legitimate core uses: nmap (scanning), tshark (capture analysis),
# iw (wireless info), plus aircrack-ng's passive utilities for Wi-Fi survey.
PKGS=(nmap tshark iw aircrack-ng)
CHECK_ONLY=0
[[ "${1:-}" == "--check" ]] && CHECK_ONLY=1

say()  { printf '\033[1;36m[AlfaMaster]\033[0m %s\n' "$1"; }
warn() { printf '\033[1;33m[warn]\033[0m %s\n' "$1"; }

# --- Python check ----------------------------------------------------------
if ! command -v python3 >/dev/null 2>&1; then
  warn "python3 not found — install it first (sudo apt install python3)"
  exit 1
fi
say "python3: $(python3 --version)"

# --- System tools ----------------------------------------------------------
if [[ "$CHECK_ONLY" -eq 0 ]]; then
  if command -v apt >/dev/null 2>&1; then
    say "Installing system tools: ${PKGS[*]}"
    sudo apt update
    sudo apt install -y "${PKGS[@]}"
  else
    warn "apt not found. Install these manually: ${PKGS[*]}"
  fi
fi

# --- Verify tools ----------------------------------------------------------
say "Checking tools on PATH:"
missing=0
for t in nmap tshark iw airodump-ng; do
  if command -v "$t" >/dev/null 2>&1; then
    printf '  \033[1;32m✓\033[0m %-12s %s\n' "$t" "$(command -v "$t")"
  else
    printf '  \033[1;31m·\033[0m %-12s (not found)\n' "$t"
    missing=1
  fi
done

# --- Verify the package runs ----------------------------------------------
say "Verifying AlfaMaster CLI:"
if python3 -m alfamaster.cli --version 2>/dev/null; then
  say "Core OK.  Try:  python3 -m alfamaster.cli info --lang he"
else
  warn "Run from the repository root so 'alfamaster' is importable."
fi

[[ "$missing" -eq 1 ]] && warn "Some tools are missing — related features will be disabled."
say "Reminder: only scan/survey systems you own or are authorized to test."
