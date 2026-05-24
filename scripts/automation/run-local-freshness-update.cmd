@echo off
setlocal

REM Hidden/scheduled wrapper for the lightweight hourly freshness lane.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "W:\Websites\sites\ai-resource-hub\scripts\automation\run-local-freshness-update.ps1"
set exitcode=%ERRORLEVEL%

exit /b %exitcode%
