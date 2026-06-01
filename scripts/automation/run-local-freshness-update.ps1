$ErrorActionPreference = 'Stop'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = (Resolve-Path (Join-Path $scriptDir '..\..')).Path
$logDir = Join-Path $repoRoot 'logs'
$logFile = Join-Path $logDir 'local-freshness-update.log'
$nodeModulesMarker = Join-Path $repoRoot 'node_modules\astro\package.json'
$restoreAfterVerify = $env:AIRH_LOCAL_REFRESH_RESTORE -eq '1'

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

Push-Location $repoRoot

try {
  Write-Log "Starting local-only freshness update for $repoRoot"
  Write-Log 'Safety mode: no git pull, no commit, no push, no deploy, no publish.'
  if ($restoreAfterVerify) {
    Write-Log 'Restore mode: generated publish artifacts will be restored after verification.'
  } else {
    Write-Log 'Refresh mode: generated publish artifacts will be left in place for the local preview and fallback cache.'
  }

  if (-not (Test-Path $nodeModulesMarker)) {
    Write-Log "node_modules marker not found. Skipping local freshness; daily update can reinstall dependencies." 'WARN'
    exit 0
  }

  Invoke-Logged 'node' @('scripts/dump-pg-to-json.mjs')
  Invoke-Logged 'npm.cmd' @('run', 'generate:release-desk')
  Invoke-Logged 'node' @('scripts/sync-news-pipeline-data.mjs')
  Invoke-Logged 'npm.cmd' @('run', 'scrape:status')
  Invoke-Logged 'npm.cmd' @('run', 'generate:spreadsheet')
  Invoke-Logged 'npm.cmd' @('run', 'verify:publish')

  if ($restoreAfterVerify) {
    $publishPaths = @(
      'data/pg-cache',
      'data/provider-status.json',
      'public/data',
      'src/data/news-pipeline.generated.ts',
      'src/data/model-release-desk.generated.ts'
    )
    Write-Log 'Restoring generated publish artifacts after local-only verification because AIRH_LOCAL_REFRESH_RESTORE=1.'
    Invoke-Logged 'git' (@('restore', '--source', 'HEAD', '--worktree', '--') + $publishPaths)
    Invoke-Logged 'git' (@('add', '--renormalize', '--') + $publishPaths)
    Invoke-Logged 'git' (@('restore', '--staged', '--') + $publishPaths)
  } else {
    Write-Log 'Generated publish artifacts remain refreshed locally; use AIRH_LOCAL_REFRESH_RESTORE=1 for dry-run restore mode.'
  }
  Write-Log 'Leaving news feed and digest artifacts in place; the shared site filter owns local news freshness.'

  Write-Log 'Local-only freshness update completed successfully.'
  exit 0
} catch {
  Write-Log $_.Exception.Message 'ERROR'
  exit 1
} finally {
  Pop-Location
}
