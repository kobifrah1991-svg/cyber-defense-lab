@echo off
REM Build a standalone Windows executable (alfamaster.exe) with PyInstaller.
REM Run from the repository root:  build\build_exe.bat
setlocal

where python >nul 2>&1 || (echo [ERROR] Python not on PATH & exit /b 1)

echo [build] Installing PyInstaller (if needed)...
python -m pip install --upgrade "pyinstaller>=6.0" || exit /b 1

echo [build] Building alfamaster.exe ...
python -m PyInstaller ^
  --onefile ^
  --name alfamaster ^
  --console ^
  --distpath dist ^
  --workpath build\_work ^
  --specpath build\_work ^
  entry.py || exit /b 1

echo.
echo [build] Done -> dist\alfamaster.exe
echo [build] Test:  dist\alfamaster.exe info --lang he
endlocal
