<#
run-dev.ps1
Convenience script to start the Vite dev server.
It prefers `node` from PATH but will fall back to a local Node distribution
at $env:USERPROFILE\node-v24.16.0-win-x64 if present.
#>

$proj = Split-Path -Parent $MyInvocation.MyCommand.Path
$nodeDir = Join-Path $proj "node-v24.16.0-win-x64"
$nodeExe = Join-Path $nodeDir "node.exe"
$npmCmd = Join-Path $nodeDir "npm.cmd"
$viteCli = Join-Path $proj "node_modules\vite\bin\vite.js"

Write-Host "Starting dev server from: $proj"

if (Get-Command node -ErrorAction SilentlyContinue) {
  Write-Host "Using 'node' from PATH"
  node $viteCli dev
  exit $LASTEXITCODE
}

if (Test-Path $nodeExe) {
  Write-Host "Using local node at: $nodeExe"
  & $nodeExe $viteCli dev
  exit $LASTEXITCODE
}

if (Test-Path $npmCmd) {
  Write-Host "Using local npm at: $npmCmd"
  & $npmCmd run dev
  exit $LASTEXITCODE
}

Write-Error "Node not found. Install Node or update this script to point to your local Node folder."
exit 1
