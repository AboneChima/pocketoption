# PocketOption Clone Deployment Script
# This script helps deploy the application to production

Write-Host "PocketOption Clone Deployment Script" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green

# Check if required tools are installed
Write-Host "`nChecking prerequisites..." -ForegroundColor Yellow

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check npm
try {
    $npmVersion = npm --version
    Write-Host "npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "npm not found. Please install npm first." -ForegroundColor Red
    exit 1
}

# Check git
try {
    $gitVersion = git --version
    Write-Host "Git: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "Git not found. Please install Git first." -ForegroundColor Red
    exit 1
}

Write-Host "`nInstalling dependencies..." -ForegroundColor Yellow
npm install

Write-Host "`nGenerating Prisma client..." -ForegroundColor Yellow
npx prisma generate

Write-Host "`nBuilding application..." -ForegroundColor Yellow
npm run build

Write-Host "`nBuild completed successfully!" -ForegroundColor Green

Write-Host "`nNext Steps:" -ForegroundColor Cyan
Write-Host "1. Set up MongoDB Atlas database" -ForegroundColor White
Write-Host "2. Deploy backend to Render.com using the render.yaml file" -ForegroundColor White
Write-Host "3. Deploy frontend to Netlify using the netlify.toml file" -ForegroundColor White
Write-Host "4. Update environment variables in both services" -ForegroundColor White

Write-Host "`nFor detailed instructions, see DEPLOYMENT.md" -ForegroundColor Cyan

Write-Host "`nDeployment preparation complete!" -ForegroundColor Green