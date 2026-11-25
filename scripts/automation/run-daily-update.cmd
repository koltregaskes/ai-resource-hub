@echo off
setlocal

REM Wrapper to ensure Task Scheduler gets a stable exit code.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0run-daily-update.ps1"
set exitcode=%ERRORLEVEL%

exit /b %exitcode%
