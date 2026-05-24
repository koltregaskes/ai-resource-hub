' AI Resource Hub - hidden hourly local freshness launcher.
Option Explicit

Dim shell, command, exitCode

Set shell = CreateObject("WScript.Shell")
command = "cmd.exe /d /c ""W:\Websites\sites\ai-resource-hub\scripts\automation\run-local-freshness-update.cmd"""
exitCode = shell.Run(command, 0, True)

WScript.Quit exitCode
