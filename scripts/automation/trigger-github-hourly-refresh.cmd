@echo off
setlocal

REM Hidden/scheduled wrapper for the GitHub hourly refresh fallback.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "W:\Websites\sites\ai-resource-hub\scripts\automation\trigger-github-hourly-refresh.ps1"
set exitcode=%ERRORLEVEL%

exit /b %exitcode%
