param(
  [int]$LookbackMinutes = 50,
  [switch]$WhatIfTrigger
)

$ErrorActionPreference = 'Stop'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = (Resolve-Path (Join-Path $scriptDir '..\..')).Path
$logDir = Join-Path $repoRoot 'logs'
$logFile = Join-Path $logDir 'github-hourly-refresh-trigger.log'
$repo = 'koltregaskes/ai-resource-hub'
$workflow = 'scrape.yml'
$ref = 'main'

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

  return @($output | ForEach-Object { "$_" })
}

function Get-LatestScrapeRun {
  $jsonLines = Invoke-Logged 'gh' @(
    'run', 'list',
    '--repo', $repo,
    '--workflow', $workflow,
    '--limit', '5',
    '--json', 'databaseId,status,conclusion,createdAt,updatedAt,headSha,event,url'
  )

  $json = $jsonLines -join [Environment]::NewLine
  $parsed = $json | ConvertFrom-Json
  $runs = if ($parsed -is [array]) { $parsed } else { @($parsed) }
  if (-not $runs -or $runs.Count -eq 0) {
    return $null
  }

  return ($runs | Sort-Object -Property @{ Expression = { [datetime]$_.createdAt }; Descending = $true } | Select-Object -First 1)
}

try {
  Push-Location $repoRoot

  Write-Log "Starting GitHub hourly refresh fallback for $repo"
  Write-Log "Safety mode: no local data edits, no local build, no direct git commit, no direct git push."
  Write-Log "Fallback mode: dispatch $workflow only when no recent successful or running scrape workflow exists."

  Invoke-Logged 'gh' @('auth', 'status') | Out-Null

  $latest = Get-LatestScrapeRun
  $cutoff = (Get-Date).ToUniversalTime().AddMinutes(-1 * $LookbackMinutes)

  if ($latest) {
    $created = ([datetime]$latest.createdAt).ToUniversalTime()
    Write-Log "Latest scrape run: id=$($latest.databaseId) event=$($latest.event) status=$($latest.status) conclusion=$($latest.conclusion) created=$($latest.createdAt) updated=$($latest.updatedAt)"

    if ($created -ge $cutoff -and ($latest.status -ne 'completed' -or $latest.conclusion -eq 'success')) {
      Write-Log "Recent scrape workflow exists inside ${LookbackMinutes}m window; no fallback dispatch needed."
      exit 0
    }

    if ($created -ge $cutoff -and $latest.status -eq 'completed' -and $latest.conclusion -ne 'success') {
      Write-Log "Recent scrape workflow completed with conclusion '$($latest.conclusion)'; dispatching a replacement run." 'WARN'
    }
  } else {
    Write-Log 'No existing scrape workflow runs found; dispatching fallback run.' 'WARN'
  }

  if ($WhatIfTrigger) {
    Write-Log 'WhatIfTrigger set; would dispatch GitHub scrape workflow now.'
    exit 0
  }

  Invoke-Logged 'gh' @('workflow', 'run', $workflow, '--repo', $repo, '--ref', $ref) | Out-Null
  Start-Sleep -Seconds 8
  $newLatest = Get-LatestScrapeRun

  if ($newLatest) {
    Write-Log "Latest scrape run after dispatch: id=$($newLatest.databaseId) event=$($newLatest.event) status=$($newLatest.status) conclusion=$($newLatest.conclusion) created=$($newLatest.createdAt) url=$($newLatest.url)"
  }

  Write-Log 'GitHub hourly refresh fallback completed successfully.'
  exit 0
} catch {
  Write-Log $_.Exception.Message 'ERROR'
  exit 1
} finally {
  Pop-Location
}
