@echo off
setlocal

REM Hidden/scheduled wrapper for the lightweight hourly freshness lane.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0run-local-freshness-update.ps1"
set exitcode=%ERRORLEVEL%

exit /b %exitcode%
