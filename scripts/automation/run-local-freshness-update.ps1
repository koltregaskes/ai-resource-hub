$ErrorActionPreference = 'Stop'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = (Resolve-Path (Join-Path $scriptDir '..\..')).Path
$logDir = Join-Path $repoRoot 'logs'
$logFile = Join-Path $logDir 'local-freshness-update.log'
$nodeModulesMarker = Join-Path $repoRoot 'node_modules\astro\package.json'
$restoreAfterVerify = $env:AIRH_LOCAL_REFRESH_RESTORE -eq '1'
$configuredEnvFile = $env:AIRH_ENV_FILE
$scriptExitCode = 0
$generationStarted = $false
$publishPaths = @(
  'data/pg-cache',
  'data/provider-status.json',
  'public/data',
  'src/data/news-pipeline.generated.ts',
  'src/data/model-release-desk.generated.ts'
)

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

  try {
    $resolvedCommand = Get-Command -Name $Command -CommandType Application -ErrorAction Stop |
      Select-Object -First 1
  } catch {
    throw "Command could not be resolved: $Command. $($_.Exception.Message)"
  }

  $previousErrorActionPreference = $ErrorActionPreference
  $output = $null
  $exitCode = $null
  $invocationSucceeded = $false

  try {
    $ErrorActionPreference = 'Continue'
    $global:LASTEXITCODE = $null
    $output = & $resolvedCommand.Path @Arguments 2>&1
    $invocationSucceeded = $?
    $exitCode = $LASTEXITCODE
  } catch {
    throw "Command failed to launch: $Command $argumentText. $($_.Exception.Message)"
  } finally {
    $ErrorActionPreference = $previousErrorActionPreference
  }

  @($output | ForEach-Object { "$_" }) | ForEach-Object {
    Write-Log "$_"
  }

  if (-not $invocationSucceeded -and $null -eq $exitCode) {
    throw "Command failed before returning an exit code: $Command $argumentText"
  }

  if ($exitCode -ne 0) {
    throw "Command failed with exit code ${exitCode}: $Command $argumentText"
  }
}

function Import-ConfiguredEnvironment {
  param([string]$Path)

  if (-not $Path) {
    return
  }
  if (-not (Test-Path -LiteralPath $Path)) {
    throw "Configured environment file not found: $Path"
  }

  foreach ($line in Get-Content -LiteralPath $Path) {
    $trimmed = $line.Trim()
    if (-not $trimmed -or $trimmed.StartsWith('#')) {
      continue
    }

    $equalsIndex = $trimmed.IndexOf('=')
    if ($equalsIndex -lt 1) {
      continue
    }

    $key = $trimmed.Substring(0, $equalsIndex).Trim()
    if ($key -notmatch '^[A-Za-z_][A-Za-z0-9_]*$') {
      continue
    }
    if ($key -ne 'DATABASE_URL') {
      continue
    }
    if ([Environment]::GetEnvironmentVariable($key, 'Process')) {
      continue
    }

    $value = $trimmed.Substring($equalsIndex + 1).Trim()
    if (
      ($value.StartsWith('"') -and $value.EndsWith('"')) -or
      ($value.StartsWith("'") -and $value.EndsWith("'"))
    ) {
      $value = $value.Substring(1, $value.Length - 2)
    }

    [Environment]::SetEnvironmentVariable($key, $value, 'Process')
  }

  Write-Log "Loaded the configured database environment key from $Path without logging its value."
}

function Write-ExecutionProof {
  $gitCommand = Get-Command -Name 'git' -CommandType Application -ErrorAction Stop |
    Select-Object -First 1
  $sourceCommitOutput = & $gitCommand.Path -C $repoRoot rev-parse HEAD 2>&1
  if ($LASTEXITCODE -ne 0) {
    throw "Could not resolve the execution source commit: $($sourceCommitOutput -join ' ')"
  }

  $sourceCommit = ($sourceCommitOutput -join '').Trim()
  $worktreeStatus = @(& $gitCommand.Path -C $repoRoot status --porcelain --untracked-files=normal 2>&1)
  if ($LASTEXITCODE -ne 0) {
    throw "Could not resolve the execution worktree state: $($worktreeStatus -join ' ')"
  }

  $worktreeState = if ($worktreeStatus.Count -gt 0) { 'modified' } else { 'clean' }
  $publishVerifierPath = Join-Path $repoRoot 'scripts\verify-publish-readiness.ts'
  $strictBenchmarkGatePath = Join-Path $repoRoot 'scripts\benchmark-provenance.ts'
  $strictBenchmarkGateWired = (
    (Test-Path -LiteralPath $strictBenchmarkGatePath) -and
    (Select-String -LiteralPath $publishVerifierPath -Pattern 'getBenchmarkProvenanceGateFailures' -Quiet)
  )
  $publishPolicy = if ($strictBenchmarkGateWired) {
    'strict-benchmark-provenance-v1'
  } else {
    'production-cache-parity-and-routing-v1'
  }
  $verifierHash = (Get-FileHash -LiteralPath $publishVerifierPath -Algorithm SHA256).Hash.ToLowerInvariant()

  $level = if ($worktreeState -eq 'clean') { 'PROOF' } else { 'WARN' }
  Write-Log "Execution proof: sourceCommit=$sourceCommit; worktreeState=$worktreeState; publishPolicy=$publishPolicy; verifierSha256=$verifierHash" $level
}

function Restore-GeneratedPublishArtifacts {
  Write-Log 'Restoring generated publish artifacts because AIRH_LOCAL_REFRESH_RESTORE=1.'
  Invoke-Logged 'git' (@('restore', '--source', 'HEAD', '--worktree', '--') + $publishPaths)
  Invoke-Logged 'git' (@('add', '--renormalize', '--') + $publishPaths)
  Invoke-Logged 'git' (@('restore', '--staged', '--') + $publishPaths)
}

Push-Location $repoRoot

try {
  Write-Log "Starting local-only freshness update for $repoRoot"
  Write-Log 'Safety mode: no git pull, no commit, no push, no deploy, no publish.'
  Write-ExecutionProof
  if ($restoreAfterVerify) {
    Write-Log 'Restore mode: generated publish artifacts will be restored after verification.'
  } else {
    Write-Log 'Refresh mode: generated publish artifacts will be left in place for the local preview and fallback cache.'
  }

  Import-ConfiguredEnvironment $configuredEnvFile

  if (-not (Test-Path $nodeModulesMarker)) {
    throw "node_modules marker not found: $nodeModulesMarker"
  }

  Invoke-Logged 'npm.cmd' @('run', 'sync:catalog')
  Invoke-Logged (Join-Path $repoRoot 'node_modules\.bin\tsx.cmd') @('scripts/seed-glossary.ts')
  $generationStarted = $true
  Invoke-Logged 'node' @('scripts/dump-pg-to-json.mjs')
  Invoke-Logged 'npm.cmd' @('run', 'generate:release-desk')
  Invoke-Logged 'node' @('scripts/sync-news-pipeline-data.mjs')
  Invoke-Logged 'npm.cmd' @('run', 'scrape:status')
  Invoke-Logged 'npm.cmd' @('run', 'generate:spreadsheet')
  Invoke-Logged 'npm.cmd' @('run', 'verify:publish')

  if (-not $restoreAfterVerify) {
    Write-Log 'Generated publish artifacts remain refreshed locally; use AIRH_LOCAL_REFRESH_RESTORE=1 for dry-run restore mode.'
  }
  Write-Log 'Leaving news feed and digest artifacts in place; the shared site filter owns local news freshness.'
} catch {
  Write-Log $_.Exception.Message 'ERROR'
  $scriptExitCode = 1
} finally {
  if ($restoreAfterVerify -and $generationStarted) {
    try {
      Restore-GeneratedPublishArtifacts
    } catch {
      Write-Log "Generated artifact restore failed: $($_.Exception.Message)" 'ERROR'
      $scriptExitCode = 1
    }
  } elseif ($restoreAfterVerify) {
    Write-Log 'Generation did not start, so existing publish artifacts were left untouched.'
  }
  Pop-Location
}

if ($scriptExitCode -eq 0) {
  Write-Log 'Local-only freshness update completed successfully.'
}
exit $scriptExitCode
