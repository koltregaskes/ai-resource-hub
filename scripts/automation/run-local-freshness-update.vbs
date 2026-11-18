' AI Resource Hub - hidden hourly local freshness launcher.
Option Explicit

Dim shell, command, exitCode, scriptDir

Set shell = CreateObject("WScript.Shell")
scriptDir = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
command = "cmd.exe /d /c """ & scriptDir & "\run-local-freshness-update.cmd"""
exitCode = shell.Run(command, 0, True)

WScript.Quit exitCode
