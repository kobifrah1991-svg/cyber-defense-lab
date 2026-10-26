"""PyInstaller entry point: bundles the AlfaMaster CLI into one executable."""

from alfamaster.cli import main

if __name__ == "__main__":
    raise SystemExit(main())
