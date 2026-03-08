"""
Vercel serverless function entry point for Credit Sentinel FastAPI backend.
This file adapts the FastAPI app to work with Vercel's serverless environment.
"""
import sys
from pathlib import Path

# Add backend-python to Python path
backend_path = Path(__file__).parent.parent / "backend-python"
sys.path.insert(0, str(backend_path))

# Import the FastAPI app
from main import app

# Export for Vercel
handler = app
