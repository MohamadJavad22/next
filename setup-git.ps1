# PowerShell script to setup Git repository

Write-Host "Checking for Git installation..." -ForegroundColor Cyan

# Try to find Git in common locations
$gitPaths = @(
    "C:\Program Files\Git\bin\git.exe",
    "C:\Program Files (x86)\Git\bin\git.exe",
    "$env:LOCALAPPDATA\Programs\Git\bin\git.exe"
)

$gitPath = $null
foreach ($path in $gitPaths) {
    if (Test-Path $path) {
        $gitPath = $path
        break
    }
}

if ($null -eq $gitPath) {
    Write-Host "ERROR: Git is not installed on your system!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Git first:" -ForegroundColor Yellow
    Write-Host "1. Download from: https://git-scm.com/download/win" -ForegroundColor Green
    Write-Host "2. Or use: winget install Git.Git" -ForegroundColor Green
    Write-Host "3. After installation, restart your terminal and run this script again" -ForegroundColor Green
    exit 1
}

Write-Host "SUCCESS: Git found at: $gitPath" -ForegroundColor Green

# Add Git to PATH for this session
$env:PATH = "$($env:PATH);$(Split-Path $gitPath)"

Write-Host ""
Write-Host "Checking if Git repository is initialized..." -ForegroundColor Cyan

if (Test-Path ".git") {
    Write-Host "SUCCESS: Git repository already exists" -ForegroundColor Green
} else {
    Write-Host "Initializing Git repository..." -ForegroundColor Cyan
    & $gitPath init
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to initialize Git repository" -ForegroundColor Red
        exit 1
    }
    Write-Host "SUCCESS: Git repository initialized" -ForegroundColor Green
}

Write-Host ""
Write-Host "Checking Git status..." -ForegroundColor Cyan
& $gitPath status

Write-Host ""
Write-Host "Checking for remote repository..." -ForegroundColor Cyan
$remotes = & $gitPath remote -v 2>&1

if ($LASTEXITCODE -eq 0 -and $remotes) {
    Write-Host "SUCCESS: Remote repository is configured:" -ForegroundColor Green
    $remotes | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
} else {
    Write-Host "WARNING: No remote repository configured" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Would you like to add a remote repository now? (Y/N)" -ForegroundColor Cyan
    $response = Read-Host
    
    if ($response -eq 'Y' -or $response -eq 'y') {
        Write-Host ""
        Write-Host "Enter the remote repository URL:" -ForegroundColor Cyan
        Write-Host "For SSH: git@github.com:USERNAME/REPO.git" -ForegroundColor Gray
        Write-Host "For HTTPS: https://github.com/USERNAME/REPO.git" -ForegroundColor Gray
        $remoteUrl = Read-Host
        
        & $gitPath remote add origin $remoteUrl
        if ($LASTEXITCODE -eq 0) {
            Write-Host "SUCCESS: Remote repository added successfully" -ForegroundColor Green
        } else {
            Write-Host "ERROR: Failed to add remote repository" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "Summary of Git commands you can run:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Stage all files:" -ForegroundColor Yellow
Write-Host "   git add ." -ForegroundColor Gray
Write-Host ""
Write-Host "2. Commit changes:" -ForegroundColor Yellow
Write-Host "   git commit -m 'Your commit message'" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Check current branch:" -ForegroundColor Yellow
Write-Host "   git branch" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Rename branch to main:" -ForegroundColor Yellow
Write-Host "   git branch -M main" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Push to GitHub:" -ForegroundColor Yellow
Write-Host "   git push -u origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "NOTE: Before pushing, make sure you have:" -ForegroundColor Yellow
Write-Host "   - Staged all files (git add .)" -ForegroundColor Gray
Write-Host "   - Committed changes (git commit -m 'message')" -ForegroundColor Gray
Write-Host "   - Configured SSH key or Personal Access Token" -ForegroundColor Gray
Write-Host ""
