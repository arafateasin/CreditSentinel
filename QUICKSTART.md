# 🚀 Credit Sentinel - Quick Start Guide

## Complete Python FastAPI Backend with LangGraph

### 📋 What's Created

✅ **Complete Python Backend** (`backend-python/` directory):

- FastAPI application with 8 API endpoints
- LangGraph multi-agent workflow (Extract → Risk → Decision)
- Azure integrations (Cosmos DB, Blob Storage, Document Intelligence, OpenAI)
- Pydantic models for type safety
- Docker deployment ready

### 📁 New File Structure

```
backend-python/
├── main.py                     # FastAPI app (330 lines)
├── requirements.txt            # Python dependencies
├── Dockerfile                  # Azure deployment
├── .env                        # YOUR Azure credentials (READY TO USE)
├── .env.example                # Template
├── README.md                   # Full documentation
├── test_api.py                 # Test script
│
├── agents/
│   ├── __init__.py
│   ├── credit_graph.py         # LangGraph workflow
│   └── nodes.py                # Extract, Risk, Decision nodes
│
├── services/
│   ├── __init__.py
│   ├── blob.py                 # Azure Blob Storage client
│   ├── cosmos.py               # Cosmos DB operations
│   └── doc_intelligence.py    # PDF extraction
│
├── models/
│   ├── __init__.py
│   └── schemas.py              # Pydantic models
│
└── utils/
    ├── __init__.py
    └── config.py               # Settings loader
```

---

## 🏃 **Step 1: Install Dependencies**

```powershell
cd backend-python
pip install -r requirements.txt
```

**What's installed:**

- FastAPI + Uvicorn
- LangChain + LangGraph
- Azure SDK (Storage, Cosmos, Document Intelligence)
- Pydantic for validation

---

## 🔐 **Step 2: Environment Setup**

Your `.env` file is **already created** with your actual Azure credentials:

```bash
# Check it's there
cat .env

# Should show:
# - COSMOS_ENDPOINT + COSMOS_KEY
# - STORAGE_ACCOUNT_KEY
# - DOC_INTEL_KEY
# - AZURE_OPENAI_KEY
```

---

## 🚀 **Step 3: Run the Server**

```powershell
# Development mode (with auto-reload)
uvicorn main:app --reload --port 8000

# Or run directly
python main.py
```

**You should see:**

```
🚀 Credit Sentinel API starting...
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

---

## 🧪 **Step 4: Test the API**

### Option A: Swagger UI (Interactive)

Open browser: **http://localhost:8000/docs**

You'll see:

- 8 endpoints documented
- "Try it out" buttons
- Schema definitions

### Option B: Test Script

```powershell
cd backend-python
python test_api.py
```

### Option C: Manual cURL

```bash
# Health check
curl http://localhost:8000/health

# List applications
curl -H "Authorization: Bearer credit-officer-token" \
     http://localhost:8000/api/applications
```

---

## 📊 **API Endpoints Overview**

| Endpoint                        | Method | Description                   |
| ------------------------------- | ------ | ----------------------------- |
| `/health`                       | GET    | Health check + service status |
| `/api/applications`             | POST   | Upload CTOS PDF + start agent |
| `/api/applications`             | GET    | List all applications         |
| `/api/applications/{id}`        | GET    | Get application with score    |
| `/api/applications/{id}/decide` | POST   | Officer decision              |
| `/api/dashboard/stats`          | GET    | Dashboard metrics             |
| `/api/agent-tasks`              | GET    | Agent queue status            |
| `/api/history`                  | GET    | Completed applications        |

---

## 🤖 **LangGraph Workflow Explained**

When you upload a PDF via `POST /api/applications`:

```
1. FastAPI receives file
   ↓
2. Upload to Blob Storage (creditsentinel2026)
   ↓
3. Create Cosmos DB record (applications table)
   ↓
4. Start LangGraph agent in background
   ├─ EXTRACT NODE
   │  • Azure Document Intelligence extracts 14 fields
   │  • Saves to extractions table
   │  • Updates status: "extracting" → "extracted"
   │
   ├─ RISK NODE
   │  • Applies 8 Malaysian SME scoring rules
   │  • Net Worth, Banking Conduct, Litigation, etc.
   │  • Calculates weighted score (0-1)
   │  • Updates status: "scoring" → "scored"
   │
   └─ DECISION NODE
      • GPT-4o generates bilingual rationale (BM/EN)
      • Auto-approve if score >= 0.7
      • Officer review if 0.4-0.7
      • Auto-reject if < 0.4
      • Updates status: "completed"
      • Saves to scores table
   ↓
5. Frontend polls /api/applications/{id} to see results
```

---

## 🎯 **Testing the Full Flow**

### Create Sample Application

```bash
# Prepare a test CTOS PDF (or use any PDF)
# Name it: test-ctos.pdf

curl -X POST http://localhost:8000/api/applications \
  -H "Authorization: Bearer credit-officer-token" \
  -F "pdf=@test-ctos.pdf" \
  -F "customer_name=AHMAD BIN ALI" \
  -F "requested_limit=100000" \
  -F "salesman=John Doe"

# Response:
{
  "id": "abc123...",
  "customer_name": "AHMAD BIN ALI",
  "status": "new",
  "agent_stage": "new",
  ...
}
```

### Check Progress

```bash
# Wait 5-10 seconds for agent to process
sleep 10

# Get application details
curl -H "Authorization: Bearer credit-officer-token" \
     http://localhost:8000/api/applications/abc123...

# Response includes:
{
  "extraction": { "fields": {...}, "mandatory_filled": 12 },
  "score": {
    "total_score": 0.85,
    "risk_category": "Low",
    "recommended_limit": 250000,
    "rationale": "Syarikat mempunyai...",
    "rules_fired": [...]
  }
}
```

---

## 🚢 **Deployment to Azure**

### Option 1: Quick Deploy

```bash
cd ..
bash deploy.sh
```

### Option 2: Manual Steps

```bash
# Build Docker image
docker build -t creditsentinel-api ./backend-python

# Deploy to Azure App Service
az webapp up \
  --name api-creditsentinel2026 \
  --resource-group credit-sentinel-rg \
  --runtime "PYTHON:3.11" \
  --sku B1

# Set environment variables in Azure Portal
# Configuration → Application Settings
# Copy all variables from .env
```

**Production URL:** `https://api-creditsentinel2026.azurewebsites.net`

---

## 🔗 **Connect Frontend to Python Backend**

Update `client/src/lib/api.ts`:

```typescript
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://api-creditsentinel2026.azurewebsites.net";
```

Then rebuild frontend:

```bash
npm run build
```

---

## 🐛 **Troubleshooting**

### 1. Import Errors

```powershell
pip install -r requirements.txt --upgrade
```

### 2. Cosmos DB Connection Failed

Check `.env`:

```bash
COSMOS_ENDPOINT=https://creditsentineldb.documents.azure.com:443/
COSMOS_KEY=9tRh73BCUxBynnIGv8Le8vuFgCkg6iYzQ...
```

### 3. Document Intelligence 400 Error

Verify PDF URL is publicly accessible:

```bash
curl <blob-url>
```

### 4. Port Already in Use

```powershell
# Change port
uvicorn main:app --port 8001
```

### 5. LangGraph Errors

Check logs in terminal. Each node prints:

```
[EXTRACT] Starting extraction for app abc123...
[EXTRACT] Completed: 12/14 fields
[RISK] Starting risk assessment...
[RISK] Score: 0.85, Category: Low, Limit: RM250,000
```

---

## 📚 **Next Steps**

1. **Test with Real CTOS PDF**

   - Upload actual Malaysian CTOS report
   - Verify field extraction accuracy

2. **Customize Risk Rules**

   - Edit `agents/nodes.py` → `risk_node()`
   - Adjust weights and thresholds

3. **Add Authentication**

   - Replace demo token with Azure AD B2C
   - Update `verify_token()` in `main.py`

4. **Deploy to Production**
   - Run `bash deploy.sh`
   - Update frontend API URL
   - Test end-to-end flow

---

## ✅ **What You Have Now**

- ✅ Working Python FastAPI backend
- ✅ LangGraph agent with 3 nodes
- ✅ Azure integrations (Cosmos, Blob, Doc Intel, OpenAI)
- ✅ 8 API endpoints
- ✅ Pydantic models for type safety
- ✅ Docker deployment ready
- ✅ Actual Azure credentials configured
- ✅ Test script included
- ✅ Full documentation

---

## 🎉 **You're Ready!**

```powershell
cd backend-python
uvicorn main:app --reload
```

Open: **http://localhost:8000/docs**

Start uploading CTOS PDFs and watch the agent work! 🚀

---

**Questions?** Check `backend-python/README.md` for detailed docs.
