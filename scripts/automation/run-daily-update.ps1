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

  $output = & $Command @Arguments 2>&1
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

  $output = & $Command @Arguments 2>&1
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

Push-Location $repoRoot

try {
  Write-Log "Starting daily update for $repoRoot"
  Ensure-SafeDirectory

  $existingChanges = Get-WorkingTreeChanges
  if ($existingChanges.Count -gt 0) {
    Write-Log 'Working tree is not clean. Skipping automated run to avoid touching manual changes.' 'WARN'
    $existingChanges | ForEach-Object {
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

  try {
    Invoke-Logged 'npm.cmd' @('run', 'check:staleness')
  } catch {
    Write-Log $_.Exception.Message 'WARN'
    Write-Log 'Continuing despite staleness warnings.' 'WARN'
  }

  Invoke-Logged 'npm.cmd' @('run', 'build')

  $dbChanges = @(Invoke-Captured 'git' @('status', '--porcelain', '--', 'data/the-ai-resource-hub.db'))
  if ($dbChanges.Count -eq 0) {
    Write-Log 'No database changes detected. Nothing to commit.'
    exit 0
  }

  Invoke-Logged 'git' @('add', 'data/the-ai-resource-hub.db')

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
