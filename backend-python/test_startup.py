"""Quick diagnostic script to test backend startup."""
import sys
import traceback

print("=" * 60)
print("CREDIT SENTINEL BACKEND DIAGNOSTIC")
print("=" * 60)

# Test 1: Python version
print("\n[1/8] Python Version:", sys.version)

# Test 2: Import FastAPI
try:
    import fastapi
    print("[2/8] ✅ FastAPI imported:", fastapi.__version__)
except Exception as e:
    print("[2/8] ❌ FastAPI import failed:", e)
    sys.exit(1)

# Test 3: Import LangGraph
try:
    import langgraph
    print("[3/8] ✅ LangGraph imported")
except Exception as e:
    print("[3/8] ❌ LangGraph import failed:", e)
    sys.exit(1)

# Test 4: Load .env
try:
    from dotenv import load_dotenv
    load_dotenv()
    print("[4/8] ✅ .env file loaded")
except Exception as e:
    print("[4/8] ❌ .env loading failed:", e)
    sys.exit(1)

# Test 5: Load config
try:
    from utils.config import settings
    print("[5/8] ✅ Config loaded")
    print(f"    - Port: {settings.port}")
    print(f"    - Environment: {settings.environment}")
    print(f"    - Cosmos Endpoint: {settings.cosmos_endpoint[:50]}...")
    print(f"    - Cosmos Key present: {'Yes' if settings.cosmos_key else 'No'}")
except Exception as e:
    print("[5/8] ❌ Config loading failed:")
    traceback.print_exc()
    sys.exit(1)

# Test 6: Initialize Cosmos DB
try:
    from services.cosmos import cosmos_service
    print("[6/8] ✅ Cosmos DB service initialized")
except Exception as e:
    print("[6/8] ❌ Cosmos DB initialization failed:")
    traceback.print_exc()
    sys.exit(1)

# Test 7: Initialize Blob Storage
try:
    from services.blob import blob_service
    print("[7/8] ✅ Blob Storage service initialized")
except Exception as e:
    print("[7/8] ❌ Blob Storage initialization failed:")
    traceback.print_exc()
    sys.exit(1)

# Test 8: Load FastAPI app
try:
    from main import app
    print("[8/8] ✅ FastAPI app loaded")
    print(f"    - Routes: {len(app.routes)}")
except Exception as e:
    print("[8/8] ❌ FastAPI app loading failed:")
    traceback.print_exc()
    sys.exit(1)

print("\n" + "=" * 60)
print("✅ ALL TESTS PASSED - Backend is ready!")
print("=" * 60)
print("\nYou can now run:")
print("  uvicorn main:app --reload --port 8000")
print("=" * 60)
