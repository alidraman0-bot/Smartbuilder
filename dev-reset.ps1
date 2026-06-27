# Smartbuilder Dev Reset Script
# This script clears dev locks, stops existing node/uvicorn processes, and cleans the environment.

Write-Host "Stopping existing Node and Python processes..." -ForegroundColor Cyan
Get-Process -Name node, python, uvicorn -ErrorAction SilentlyContinue | Stop-Process -Force

Write-Host "Cleaning Next.js dev artifacts..." -ForegroundColor Cyan
if (Test-Path "frontend\.next") {
    Remove-Item -Recurse -Force "frontend\.next"
}

Write-Host "Environment clean. To start fresh, run this from the ROOT directory:" -ForegroundColor Green
Write-Host "  npm run dev" -ForegroundColor Green
