param(
  [int]$GraceMinutes = 90,
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

  Write-Log "Starting GitHub refresh fallback for $repo"
  Write-Log "Safety mode: no local data edits, no local build, no direct git commit, no direct git push."
  Write-Log "Fallback mode: dispatch $workflow only when the morning, afternoon, or evening slot was missed. A failed run is not started again."

  Invoke-Logged 'gh' @('auth', 'status') | Out-Null

  $latest = Get-LatestScrapeRun
  $nowUtc = (Get-Date).ToUniversalTime()
  $slotHours = @(7, 13, 19)
  $utcMidnight = [datetime]::SpecifyKind($nowUtc.Date, [DateTimeKind]::Utc)
  $slotCandidates = foreach ($dayOffset in @(0, -1)) {
    foreach ($hour in $slotHours) {
      $utcMidnight.AddDays($dayOffset).AddHours($hour).AddMinutes(12)
    }
  }
  $slot = $slotCandidates | Where-Object { $_ -le $nowUtc } | Sort-Object -Descending | Select-Object -First 1
  $graceEnds = $slot.AddMinutes($GraceMinutes)
  Write-Log "Latest expected slot: $($slot.ToString('o')). Grace ends: $($graceEnds.ToString('o')). Now: $($nowUtc.ToString('o'))."

  if ($nowUtc -lt $graceEnds) {
    Write-Log "Still inside the ${GraceMinutes}m grace period for this slot. GitHub's own timer may still start it."
    exit 0
  }

  if ($latest) {
    $created = ([datetimeoffset]::Parse([string]$latest.createdAt)).UtcDateTime
    Write-Log "Latest scrape run: id=$($latest.databaseId) event=$($latest.event) status=$($latest.status) conclusion=$($latest.conclusion) created=$($latest.createdAt) updated=$($latest.updatedAt)"

    if ($created -ge $slot) {
      Write-Log "This slot was already attempted (status=$($latest.status), conclusion=$($latest.conclusion)). Not dispatching another run."
      exit 0
    }
  } else {
    Write-Log 'No existing scrape workflow runs found.' 'WARN'
  }

  Write-Log "Scheduled slot $($slot.ToString('o')) has no run after the grace period. Dispatching one fallback run." 'WARN'

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

  Write-Log 'GitHub refresh fallback completed successfully.'
  exit 0
} catch {
  Write-Log $_.Exception.Message 'ERROR'
  exit 1
} finally {
  Pop-Location
}
