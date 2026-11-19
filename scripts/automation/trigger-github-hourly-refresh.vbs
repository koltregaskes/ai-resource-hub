' AI Resource Hub - hidden hourly GitHub refresh fallback launcher.
Option Explicit

Dim shell, here, command, exitCode

Set shell = CreateObject("WScript.Shell")
here = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
command = "cmd.exe /d /c """ & here & "\trigger-github-hourly-refresh.cmd"""
exitCode = shell.Run(command, 0, True)

WScript.Quit exitCode
