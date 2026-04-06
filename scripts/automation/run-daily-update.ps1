$ErrorActionPreference = 'Stop'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = (Resolve-Path (Join-Path $scriptDir '..\..')).Path
$logDir = Join-Path $repoRoot 'logs'
$logFile = Join-Path $logDir 'daily-update.log'
$nodeModulesMarker = Join-Path $repoRoot 'node_modules\astro\package.json'

New-Item -ItemType Directory -Path $logDir -Force | Out-Null

function Write-Log {
  param(
    [string]$Message,
    [string]$Level = 'INFO'
  )

  $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
  $line = "[$timestamp] [$Level] $Message"
  Write-Host $line
  Add-Content -Path $logFile -Value $line
}

function Invoke-Logged {
  param(
    [string]$Command,
    [string[]]$Arguments
  )

  $argumentText = if ($Arguments) { $Arguments -join ' ' } else { '' }
  Write-Log "Running: $Command $argumentText" 'STEP'

  $previousErrorActionPreference = $ErrorActionPreference
  $ErrorActionPreference = 'Continue'
  $output = & $Command @Arguments 2>&1
  $ErrorActionPreference = $previousErrorActionPreference
  $exitCode = $LASTEXITCODE

  @($output | ForEach-Object { "$_" }) | ForEach-Object {
    Write-Log "$_"
  }

  if ($exitCode -ne 0) {
    throw "Command failed with exit code ${exitCode}: $Command $argumentText"
  }
}

function Invoke-Captured {
  param(
    [string]$Command,
    [string[]]$Arguments
  )

  $previousErrorActionPreference = $ErrorActionPreference
  $ErrorActionPreference = 'Continue'
  $output = & $Command @Arguments 2>&1
  $ErrorActionPreference = $previousErrorActionPreference
  if ($LASTEXITCODE -ne 0) {
    $argumentText = if ($Arguments) { $Arguments -join ' ' } else { '' }
    throw "Command failed with exit code ${LASTEXITCODE}: $Command $argumentText"
  }

  return @($output | ForEach-Object { "$_" })
}

function Ensure-SafeDirectory {
  $safeDirectories = @()

  try {
    $safeDirectories = @(Invoke-Captured 'git' @('config', '--global', '--get-all', 'safe.directory'))
  } catch {
    $safeDirectories = @()
  }

  if ($safeDirectories -notcontains $repoRoot) {
    Invoke-Logged 'git' @('config', '--global', '--add', 'safe.directory', $repoRoot)
  }
}

function Get-WorkingTreeChanges {
  return @(
    Invoke-Captured 'git' @('status', '--porcelain') |
      ForEach-Object { "$_" } |
      Where-Object { $_.Trim().Length -gt 0 }
  )
}

function Get-ChangePath {
  param(
    [string]$StatusLine
  )

  if ([string]::IsNullOrWhiteSpace($StatusLine)) {
    return ''
  }

  if ($StatusLine.Length -le 3) {
    return $StatusLine.Trim()
  }

  return $StatusLine.Substring(3).Trim()
}

function Test-IgnorableGeneratedChange {
  param(
    [string]$StatusLine
  )

  $path = Get-ChangePath $StatusLine
  if ([string]::IsNullOrWhiteSpace($path)) {
    return $false
  }

  $normalised = $path.Replace('\', '/')
  return (
    $normalised -eq 'src/data/news-feed-latest.json' -or
    $normalised -match '^src/data/news-feed-\d{4}-\d{2}-\d{2}\.json$' -or
    $normalised -match '^src/data/digest-\d{4}-\d{2}-\d{2}\.md$'
  )
}

Push-Location $repoRoot

try {
  Write-Log "Starting daily update for $repoRoot"
  Ensure-SafeDirectory

  $existingChanges = Get-WorkingTreeChanges
  $blockingChanges = @($existingChanges | Where-Object { -not (Test-IgnorableGeneratedChange $_) })
  $ignorableChanges = @($existingChanges | Where-Object { Test-IgnorableGeneratedChange $_ })

  if ($ignorableChanges.Count -gt 0) {
    Write-Log "Ignoring $($ignorableChanges.Count) generated news snapshot change(s) when checking tree cleanliness."
  }

  if ($blockingChanges.Count -gt 0) {
    Write-Log 'Working tree is not clean. Skipping automated run to avoid touching manual changes.' 'WARN'
    $blockingChanges | ForEach-Object {
      Write-Log "Pending change: $_" 'WARN'
    }
    exit 0
  }

  $headBeforePull = ((Invoke-Captured 'git' @('rev-parse', 'HEAD') | Select-Object -Last 1).ToString()).Trim()
  Invoke-Logged 'git' @('pull', '--ff-only', 'origin', 'main')
  $headAfterPull = ((Invoke-Captured 'git' @('rev-parse', 'HEAD') | Select-Object -Last 1).ToString()).Trim()

  $needsInstall = -not (Test-Path $nodeModulesMarker)
  if ($headBeforePull -ne $headAfterPull) {
    $changedFiles = @(Invoke-Captured 'git' @('diff', '--name-only', $headBeforePull, $headAfterPull))
    if ($changedFiles -contains 'package.json' -or $changedFiles -contains 'package-lock.json') {
      $needsInstall = $true
    }
  }

  if ($needsInstall) {
    Invoke-Logged 'npm.cmd' @('ci')
  }

  Invoke-Logged 'npm.cmd' @('run', 'scrape')
  Invoke-Logged 'npm.cmd' @('run', 'generate:spreadsheet')
  Invoke-Logged 'node' @('scripts/dump-pg-to-json.mjs')

  Invoke-Logged 'npm.cmd' @('run', 'check:staleness')

  Invoke-Logged 'npm.cmd' @('run', 'build')

  $publishPaths = @('data/the-ai-resource-hub.db', 'data/pg-cache')
  $publishChanges = @(Invoke-Captured 'git' (@('status', '--porcelain', '--') + $publishPaths))
  if ($publishChanges.Count -eq 0) {
    Write-Log 'No publishable data changes detected. Nothing to commit.'
    exit 0
  }

  Invoke-Logged 'git' (@('add') + $publishPaths)

  $commitMessage = "chore: local daily data refresh $(Get-Date -Format 'yyyy-MM-dd') [automated]"
  & git commit -m $commitMessage 2>&1 | ForEach-Object {
    Write-Log "$_"
  }

  if ($LASTEXITCODE -ne 0) {
    $stagedChanges = @(Invoke-Captured 'git' @('diff', '--cached', '--name-only'))
    if ($stagedChanges.Count -eq 0) {
      Write-Log 'Nothing was staged after the scrape run. Skipping push.'
      exit 0
    }

    throw "git commit failed with exit code ${LASTEXITCODE}"
  }

  Invoke-Logged 'git' @('push', 'origin', 'main')
  Write-Log 'Daily update completed successfully.'
  exit 0
} catch {
  Write-Log $_.Exception.Message 'ERROR'
  exit 1
} finally {
  Pop-Location
}
