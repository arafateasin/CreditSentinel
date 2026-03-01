# Credit Sentinel - Python Backend

🐍 FastAPI + LangGraph backend for autonomous Malaysian SME credit assessment.

## 🏗️ Architecture

```
FastAPI (main.py)
    ↓
LangGraph Workflow (agents/credit_graph.py)
    ├── Extract Node → Azure Document Intelligence
    ├── Risk Node → 8 Malaysian SME Rules
    └── Decision Node → Azure OpenAI GPT-4o
    ↓
Cosmos DB (services/cosmos.py) → Audit Trail
```

## 📁 Structure

```
backend-python/
├── main.py                    # FastAPI app with routes
├── requirements.txt           # Python dependencies
├── Dockerfile                 # Azure App Service deployment
├── .env                       # Your Azure credentials
│
├── agents/
│   ├── credit_graph.py        # LangGraph workflow
│   └── nodes.py               # Extract, Risk, Decision nodes
│
├── services/
│   ├── blob.py                # Azure Blob Storage
│   ├── cosmos.py              # Cosmos DB CRUD
│   └── doc_intelligence.py   # PDF extraction
│
├── models/
│   └── schemas.py             # Pydantic models
│
└── utils/
    └── config.py              # Configuration loader
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend-python
pip install -r requirements.txt
```

### 2. Set Environment Variables

Copy `.env.example` to `.env` and fill in your Azure credentials:

```bash
cp .env.example .env
# Edit .env with your keys
```

### 3. Run Development Server

```bash
uvicorn main:app --reload --port 8000
```

Visit: http://localhost:8000/docs (Swagger UI)

## 📡 API Endpoints

### Health Check

```http
GET /health
```

### Create Application

```http
POST /api/applications
Content-Type: multipart/form-data

pdf: <file>
customer_name: "AHMAD BIN ALI"
requested_limit: 100000
salesman: "John Doe"
```

### List Applications

```http
GET /api/applications?limit=50&status=completed
```

### Get Application Details

```http
GET /api/applications/{app_id}
```

### Make Decision (Officer)

```http
POST /api/applications/{app_id}/decide
Content-Type: application/json

{
  "approved": true,
  "final_limit": 150000,
  "notes": "Approved with conditions"
}
```

### Dashboard Stats

```http
GET /api/dashboard/stats
```

### Agent Tasks

```http
GET /api/agent-tasks
```

## 🤖 LangGraph Workflow

### Node 1: Extract

- Uses Azure Document Intelligence
- Extracts 14 mandatory fields from CTOS PDF
- Saves to Cosmos DB `extractions` container

### Node 2: Risk Assessment

- Applies 8 Malaysian SME scoring rules:
  1. Net Worth (20%)
  2. Banking Conduct (20%)
  3. Litigation (15%)
  4. Director Age (10%)
  5. Company Age (10%)
  6. Paid-Up Capital (10%)
  7. Director Shareholding (8%)
  8. Bankruptcy (7%)
- Calculates weighted score (0-1)
- Determines risk category: Low/Moderate/High

### Node 3: Decision

- Uses GPT-4o for bilingual rationale (BM/EN)
- Auto-approve: score >= 0.7 (RM 250k limit)
- Officer review: 0.4 <= score < 0.7
- Auto-reject: score < 0.4
- Saves to Cosmos DB `scores` container

## 🔐 Azure Resources Required

| Resource              | Name                     | Purpose          |
| --------------------- | ------------------------ | ---------------- |
| Cosmos DB             | `creditsentineldb`       | Data persistence |
| Blob Storage          | `creditsentinel2026`     | PDF storage      |
| Document Intelligence | `doi-creditsentinel2026` | PDF extraction   |
| Azure OpenAI          | `creditsentinel-ai`      | GPT-4o rationale |

## 🚢 Deployment

### Option 1: Azure App Service (Docker)

```bash
# Build image
docker build -t creditsentinel-api .

# Run locally
docker run -p 8000:8000 --env-file .env creditsentinel-api

# Deploy to Azure
bash ../deploy.sh
```

### Option 2: Azure App Service (Python)

```bash
az webapp up \
  --name api-creditsentinel2026 \
  --resource-group credit-sentinel-rg \
  --runtime "PYTHON:3.11" \
  --sku B1
```

Set environment variables in Azure Portal:

- Configuration → Application Settings
- Add all variables from `.env`

## 🧪 Testing

### Test Health Endpoint

```bash
curl http://localhost:8000/health
```

### Test Application Creation

```bash
curl -X POST http://localhost:8000/api/applications \
  -H "Authorization: Bearer credit-officer-token" \
  -F "pdf=@sample-ctos.pdf" \
  -F "customer_name=AHMAD BIN ALI" \
  -F "requested_limit=100000" \
  -F "salesman=John Doe"
```

### View API Docs

Navigate to: http://localhost:8000/docs

## 📊 Business Logic

### Score Calculation

```python
total_score = Σ(rule_score * weight) / 10.0
# Range: 0.0 to 1.0

if score >= 0.7:
    decision = "Auto-Approve"
    limit = min(net_worth * 0.5, 250000)
elif score >= 0.4:
    decision = "Officer Review Required"
    limit = net_worth * 0.3
else:
    decision = "Auto-Reject"
    limit = 0
```

### PII Masking

All IC numbers, phone numbers, and emails are automatically masked in LLM outputs:

- IC: `██████-██-████`
- Phone: `+60-XXXXX`
- Email: `█████@█████.com`

## 🛠️ Development

### Add New Agent Node

1. Create function in `agents/nodes.py`:

```python
async def my_node(state: Dict[str, Any]) -> Dict[str, Any]:
    # Your logic here
    return {**state, "new_field": value}
```

2. Add to graph in `agents/credit_graph.py`:

```python
workflow.add_node("my_node", my_node)
workflow.add_edge("risk", "my_node")
workflow.add_edge("my_node", "decision")
```

### Add New API Route

In `main.py`:

```python
@app.get("/api/my-endpoint")
async def my_endpoint(authorization: Optional[str] = Header(None)):
    verify_token(authorization)
    # Your logic
    return {"result": "data"}
```

## 📝 Environment Variables

See `.env.example` for all required variables.

**Critical**:

- `COSMOS_KEY` - Cosmos DB access key
- `STORAGE_ACCOUNT_KEY` - Blob storage access key
- `DOC_INTEL_KEY` - Document Intelligence key
- `AZURE_OPENAI_KEY` - GPT-4o access key

## 🔒 Security

- Bearer token authentication (demo: `credit-officer-token`)
- PII masking on all LLM outputs
- CORS middleware (configure for production)
- Audit logging for all actions

## 📚 Dependencies

Key packages:

- `fastapi` - Web framework
- `langchain` + `langgraph` - AI orchestration
- `azure-*` - Azure SDK libraries
- `pydantic` - Data validation
- `uvicorn` - ASGI server

## 🐛 Troubleshooting

### Cosmos DB Connection Error

Check `COSMOS_ENDPOINT` and `COSMOS_KEY` in `.env`

### Document Intelligence Fails

Verify `DOC_INTEL_ENDPOINT` and `DOC_INTEL_KEY`

### LangGraph Node Errors

Check logs: `print()` statements in `agents/nodes.py`

### Port Already in Use

Change port: `uvicorn main:app --port 8001`

## 📞 Support

For issues, check:

1. `/health` endpoint status
2. Cosmos DB connection
3. Azure resource availability
4. Environment variables

---

**Built for Chin Hin Hackathon 2025** 🛡️
