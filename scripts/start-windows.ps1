$ErrorActionPreference = "Stop"
Set-Location "$PSScriptRoot\.."

Write-Host "Building Prelegal..."
docker compose build

Write-Host "Starting Prelegal..."
docker compose up -d

Write-Host ""
Write-Host "Prelegal is running at http://localhost:8000"
