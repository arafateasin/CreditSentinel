# Credit Sentinel - Backend Setup Script (Windows PowerShell)

Write-Host "🛡️  Credit Sentinel - Python Backend Setup" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Python is installed
Write-Host "📋 Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found. Please install Python 3.11+" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Change to backend directory
Write-Host "📁 Navigating to backend-python directory..." -ForegroundColor Yellow
Set-Location backend-python
Write-Host ""

# Check if .env exists
if (Test-Path ".env") {
    Write-Host "✅ .env file found (credentials configured)" -ForegroundColor Green
} else {
    Write-Host "⚠️  .env file not found - copying from .env.example" -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "📝 Please edit .env with your Azure credentials" -ForegroundColor Yellow
}
Write-Host ""

# Install dependencies
Write-Host "📦 Installing Python dependencies..." -ForegroundColor Yellow
Write-Host "This may take 2-3 minutes..." -ForegroundColor Gray
pip install -r requirements.txt --quiet

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Create test database containers (optional)
Write-Host "🗄️  Initializing Cosmos DB containers..." -ForegroundColor Yellow
Write-Host "(This will happen automatically on first API call)" -ForegroundColor Gray
Write-Host ""

# Show status
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Options menu
Write-Host "What would you like to do?" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Start development server (with auto-reload)" -ForegroundColor White
Write-Host "2. Run API tests" -ForegroundColor White
Write-Host "3. Open Swagger UI documentation" -ForegroundColor White
Write-Host "4. Exit" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter choice (1-4)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "🚀 Starting FastAPI development server..." -ForegroundColor Green
        Write-Host "Opening http://localhost:8000" -ForegroundColor Gray
        Write-Host "Press Ctrl+C to stop" -ForegroundColor Gray
        Write-Host ""
        Start-Sleep -Seconds 2
        Start-Process "http://localhost:8000"
        uvicorn main:app --reload --port 8000
    }
    "2" {
        Write-Host ""
        Write-Host "🧪 Running API tests..." -ForegroundColor Green
        Write-Host ""
        python test_api.py
        Write-Host ""
        Write-Host "Press any key to exit..." -ForegroundColor Gray
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    }
    "3" {
        Write-Host ""
        Write-Host "📚 Opening Swagger UI..." -ForegroundColor Green
        Start-Process "http://localhost:8000/docs"
        Write-Host ""
        Write-Host "Server starting in background..." -ForegroundColor Gray
        Write-Host "Press Ctrl+C to stop" -ForegroundColor Gray
        Write-Host ""
        uvicorn main:app --port 8000
    }
    "4" {
        Write-Host ""
        Write-Host "👋 Goodbye!" -ForegroundColor Cyan
        exit 0
    }
    default {
        Write-Host ""
        Write-Host "Invalid choice. Starting server..." -ForegroundColor Yellow
        uvicorn main:app --reload --port 8000
    }
}
