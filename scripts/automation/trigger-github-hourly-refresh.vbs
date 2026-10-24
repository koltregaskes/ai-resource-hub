' AI Resource Hub - hidden GitHub refresh fallback launcher.
' Calling this often is safe. The script dispatches only a missed morning, afternoon, or evening slot.
Option Explicit

Dim shell, command, exitCode

Set shell = CreateObject("WScript.Shell")
command = "cmd.exe /d /c ""W:\Websites\sites\ai-resource-hub\scripts\automation\trigger-github-hourly-refresh.cmd"""
exitCode = shell.Run(command, 0, True)

WScript.Quit exitCode
