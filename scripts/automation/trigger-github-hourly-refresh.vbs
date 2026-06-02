' AI Resource Hub - hidden hourly GitHub refresh fallback launcher.
Option Explicit

Dim shell, command, exitCode

Set shell = CreateObject("WScript.Shell")
command = "cmd.exe /d /c ""W:\Websites\sites\ai-resource-hub\scripts\automation\trigger-github-hourly-refresh.cmd"""
exitCode = shell.Run(command, 0, True)

WScript.Quit exitCode
