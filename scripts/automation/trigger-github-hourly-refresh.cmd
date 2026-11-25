@echo off
setlocal

REM Hidden/scheduled wrapper for the GitHub hourly refresh fallback.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0trigger-github-hourly-refresh.ps1"
set exitcode=%ERRORLEVEL%

exit /b %exitcode%
