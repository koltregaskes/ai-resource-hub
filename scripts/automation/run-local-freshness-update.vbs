' AI Resource Hub - hidden hourly local freshness launcher.
Option Explicit

Dim shell, here, command, exitCode

Set shell = CreateObject("WScript.Shell")
here = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
command = "cmd.exe /d /c """ & here & "\run-local-freshness-update.cmd"""
exitCode = shell.Run(command, 0, True)

WScript.Quit exitCode
