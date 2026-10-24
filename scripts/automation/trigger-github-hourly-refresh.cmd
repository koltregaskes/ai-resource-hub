@echo off
setlocal

REM Starts the GitHub refresh fallback. Safe to call often: the script dispatches
REM only when the morning, afternoon, or evening slot was missed.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "W:\Websites\sites\ai-resource-hub\scripts\automation\trigger-github-hourly-refresh.ps1"
set exitcode=%ERRORLEVEL%

exit /b %exitcode%
