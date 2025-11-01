# PowerShell script to push to GitHub

Write-Host "Setting up Git environment..." -ForegroundColor Cyan
$env:PATH = "$($env:PATH);C:\Program Files\Git\bin"

Write-Host "Checking Git status..." -ForegroundColor Cyan
git status

Write-Host ""
Write-Host "Checking remote configuration..." -ForegroundColor Cyan
git remote -v

Write-Host ""
Write-Host "Attempting to push to GitHub..." -ForegroundColor Cyan
Write-Host "Note: You may need to authenticate" -ForegroundColor Yellow

git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "SUCCESS: Code pushed to GitHub!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "ERROR: Failed to push. Possible reasons:" -ForegroundColor Red
    Write-Host "1. Authentication required (username/password or Personal Access Token)" -ForegroundColor Yellow
    Write-Host "2. Repository doesn't exist or you don't have access" -ForegroundColor Yellow
    Write-Host "3. Network/firewall issues" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To create a Personal Access Token:" -ForegroundColor Cyan
    Write-Host "1. Go to: https://github.com/settings/tokens" -ForegroundColor Green
    Write-Host "2. Click 'Generate new token' > 'Generate new token (classic)'" -ForegroundColor Green
    Write-Host "3. Select 'repo' scope" -ForegroundColor Green
    Write-Host "4. Copy the token and use it as password when Git asks for credentials" -ForegroundColor Green
}

