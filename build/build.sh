#!/usr/bin/env bash
# Build a standalone single-file executable with PyInstaller.
#   Linux  -> dist/alfamaster
#   macOS  -> dist/alfamaster  (and a .app-style binary; run from Terminal)
# Run from the repository root:  build/build.sh
set -euo pipefail

command -v python3 >/dev/null 2>&1 || { echo "[ERROR] python3 not found"; exit 1; }

echo "[build] Installing PyInstaller (if needed)..."
python3 -m pip install --upgrade "pyinstaller>=6.0"

echo "[build] Building single-file executable..."
python3 -m PyInstaller \
  --onefile \
  --name alfamaster \
  --console \
  --distpath dist \
  --workpath build/_work \
  --specpath build/_work \
  entry.py

OUT="dist/alfamaster"
echo
echo "[build] Done -> ${OUT}"
echo "[build] Test:  ${OUT} info --lang he"
