@echo off
setlocal

REM Local freshness check. Provider status is skipped when it was checked in the last 5 hours.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "W:\Websites\sites\ai-resource-hub\scripts\automation\run-local-freshness-update.ps1"
set exitcode=%ERRORLEVEL%

exit /b %exitcode%
