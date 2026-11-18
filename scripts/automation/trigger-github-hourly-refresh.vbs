' AI Resource Hub - hidden hourly GitHub refresh fallback launcher.
Option Explicit

Dim shell, command, exitCode, scriptDir

Set shell = CreateObject("WScript.Shell")
scriptDir = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
command = "cmd.exe /d /c """ & scriptDir & "\trigger-github-hourly-refresh.cmd"""
exitCode = shell.Run(command, 0, True)

WScript.Quit exitCode
