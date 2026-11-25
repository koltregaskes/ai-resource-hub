' AI Resource Hub - hidden hourly GitHub refresh fallback launcher.
Option Explicit

Dim shell, here, command, exitCode

Set shell = CreateObject("WScript.Shell")
here = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
' cmd /s /c ""<path>"": the outer pair is stripped as a whole, so a path with spaces or & stays quoted.
command = "cmd.exe /d /s /c """"" & here & "\trigger-github-hourly-refresh.cmd"""""
exitCode = shell.Run(command, 0, True)

WScript.Quit exitCode
