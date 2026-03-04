param(
  [string]$Python = "python",
  [string]$BackendDir = "backend",
  [string]$FrontendDir = "frontend"
)

$ErrorActionPreference = "Stop"

function Resolve-ProjectPath([string]$PathValue) {
  if ([System.IO.Path]::IsPathRooted($PathValue)) {
    return [System.IO.Path]::GetFullPath($PathValue)
  }

  $repoRoot = Split-Path $PSScriptRoot -Parent
  return [System.IO.Path]::GetFullPath((Join-Path $repoRoot $PathValue))
}

function Start-InNewWindow($Title, $WorkDir, $Command) {
  Start-Process powershell -WorkingDirectory $WorkDir -ArgumentList @(
    "-NoExit",
    "-Command",
    "Write-Host '$Title' -ForegroundColor Green; $Command"
  )
}

$backendPath = Resolve-ProjectPath $BackendDir
$frontendPath = Resolve-ProjectPath $FrontendDir
$setupScript = Join-Path $PSScriptRoot "setup.ps1"

if (-not (Test-Path $backendPath -PathType Container)) {
  throw "Backend directory not found: $backendPath"
}

if (-not (Test-Path $frontendPath -PathType Container)) {
  throw "Frontend directory not found: $frontendPath"
}

$needsSetup = @(
  (Join-Path $backendPath ".venv"),
  (Join-Path $backendPath ".env"),
  (Join-Path $frontendPath "node_modules"),
  (Join-Path $frontendPath ".env")
) | Where-Object { -not (Test-Path $_) }

if ($needsSetup.Count -gt 0) {
  Write-Host "==> Ensuring setup is complete" -ForegroundColor Cyan
  & powershell -ExecutionPolicy Bypass -File $setupScript -Python $Python -BackendDir $backendPath -FrontendDir $frontendPath
} else {
  Write-Host "==> Setup already present; skipping setup" -ForegroundColor Cyan
}

$backendCmd = "& .\.venv\Scripts\Activate.ps1; python app.py"
$frontendCmd = "npm run dev"

Write-Host "==> Starting Backend and Frontend in separate terminals" -ForegroundColor Cyan
Start-InNewWindow "Backend" $backendPath $backendCmd
Start-InNewWindow "Frontend" $frontendPath $frontendCmd

Write-Host "`nLaunched two terminals:" -ForegroundColor Green
Write-Host "- Backend: http://127.0.0.1:5000"
Write-Host "- Frontend: Vite dev server URL (shown in terminal)"
