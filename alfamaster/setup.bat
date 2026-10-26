@echo off
REM AlfaMaster Suite - Windows installer / checker (Windows 10 / 11).
REM Verifies Python, Npcap (for capture), and the external CLI tools the
REM authorized-testing core drives, then checks the package runs.
setlocal enabledelayedexpansion

echo [AlfaMaster] Windows setup
echo.

REM --- Python ---------------------------------------------------------------
where python >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Python not found. Install from https://www.python.org/downloads/
  echo         and tick "Add python.exe to PATH".
  exit /b 1
)
for /f "delims=" %%v in ('python --version') do echo [AlfaMaster] %%v

REM --- Npcap (needed by tshark/wireshark captures) --------------------------
if exist "%SystemRoot%\System32\Npcap\" (
  echo   [ok] Npcap installed
) else (
  echo   [--] Npcap not detected. Install from https://npcap.com/ for capture features.
)

REM --- External tools on PATH ----------------------------------------------
echo.
echo [AlfaMaster] Checking tools on PATH:
set MISSING=0
for %%t in (nmap.exe tshark.exe) do (
  where %%t >nul 2>&1
  if errorlevel 1 (
    echo   [--] %%t  ^(not found^)
    set MISSING=1
  ) else (
    for /f "delims=" %%p in ('where %%t') do echo   [ok] %%t  %%p
  )
)
echo   note: install Nmap from https://nmap.org/download and Wireshark/tshark
echo         from https://www.wireshark.org/download.html, then re-open the shell.

REM --- Verify package -------------------------------------------------------
echo.
echo [AlfaMaster] Verifying AlfaMaster CLI:
python -m alfamaster.cli --version
if errorlevel 1 (
  echo   [warn] Run this from the repository root so 'alfamaster' is importable.
) else (
  echo   Try:  python -m alfamaster.cli info --lang he
)

echo.
echo [AlfaMaster] Reminder: only scan systems you own or are authorized to test.
endlocal
