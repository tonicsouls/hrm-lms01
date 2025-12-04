# Quick Start Script
# Run this to get the LMS up and running quickly

Write-Host "🚀 Human Risk Management LMS - Quick Start" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (!(Test-Path "package.json")) {
    Write-Host "❌ Error: Please run this script from the MVP_LMS directory" -ForegroundColor Red
    exit 1
}

Write-Host "Step 1: Installing dependencies..." -ForegroundColor Yellow
npm run install:all

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 2: Seeding database with course content..." -ForegroundColor Yellow
npm run seed

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to seed database" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Demo Credentials:" -ForegroundColor Cyan
Write-Host "   Student: student@example.com / password123"
Write-Host "   Admin: admin@example.com / admin123"
Write-Host ""
Write-Host "🌐 Starting development servers..." -ForegroundColor Yellow
Write-Host "   Frontend: http://localhost:5173"
Write-Host "   Backend: http://localhost:3000"
Write-Host ""
Write-Host "Press Ctrl+C to stop the servers" -ForegroundColor Gray
Write-Host ""

npm run dev
