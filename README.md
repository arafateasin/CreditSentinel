# 🛡️ Credit Sentinel — Autonomous Credit Assessment Platform

> **AI-Powered Malaysian SME Credit Scoring** | Chin Hin Hackathon 2025  
> LangGraph Multi-Agent System + Azure Cloud Infrastructure

[![Python](https://img.shields.io/badge/Python-3.11-blue)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688)](https://fastapi.tiangolo.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61dafb)](https://react.dev/)
[![LangGraph](https://img.shields.io/badge/LangGraph-0.3-orange)](https://langchain-ai.github.io/langgraph/)
[![Azure](https://img.shields.io/badge/Azure-Cloud-0078d4)](https://azure.microsoft.com/)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [Development](#development)
- [Deployment](#deployment)
- [Business Logic](#business-logic)
- [API Documentation](#api-documentation)

---

## 🎯 Overview

**Credit Sentinel** is an autonomous credit assessment platform designed for Malaysian SME lending. It combines:

- **Azure Document Intelligence** for CTOS report extraction
- **LangGraph** for multi-agent AI workflow orchestration
- **GPT-4** for risk assessment and decision rationale (bilingual: BM/EN)
- **Real-time UI** with SSE streaming for live agent progress
- **Cosmos DB** for audit trail and compliance

### Problem Solved

Traditional credit assessment takes **3-5 days** per application. Credit Sentinel reduces this to **<30 seconds** while maintaining:

- ✅ Regulatory compliance (audit logs)
- ✅ Human-in-the-loop (officer review for edge cases)
- ✅ Bilingual support (Bahasa Malaysia + English)
- ✅ PII masking for data protection

---

## 🏗️ Architecture

```mermaid
graph LR
    A[Officer Uploads CTOS PDF] --> B[Azure Blob Storage]
    B --> C[Document Intelligence]
    C --> D[LangGraph Agent]
    D --> E[Extraction Node]
    E --> F[Risk Scoring Node]
    F --> G[Decision Node]
    G --> H[Cosmos DB]
    H --> I[Dashboard UI]
    D -.SSE Stream.-> I
```

### LangGraph Workflow

```
__start__
   ↓
EXTRACT (Azure Doc Intelligence)
   ↓ fields, rawText, confidence
RISK (8-rule Malaysian scoring)
   ↓ totalScore, rulesFired, category
DECIDE (RM limit calculation)
   ↓ recommendedLimit, rationale (BM/EN)
AUDIT (Cosmos DB logging)
   ↓
__end__
```

---

## ✨ Features

### Core Functionality

- 📄 **CTOS PDF Upload** — Drag-and-drop interface
- 🤖 **Autonomous Extraction** — 14 mandatory fields + tables (directors, banking facilities)
- 📊 **8-Rule Risk Scoring** — Malaysian SME-specific rules
- 🎯 **Auto-Decision** — Score >0.7 = RM250k approve, <0.4 = reject
- 👨‍💼 **Officer Review** — Human approval for 0.4–0.7 range
- 📡 **Real-Time Streaming** — Live agent progress via SSE
- 🔍 **Audit Trail** — Every action logged to Cosmos DB
- 🌐 **Bilingual** — Rationale in Bahasa Malaysia & English
- 🔒 **PII Masking** — IC numbers, phone numbers auto-redacted

### UI Components (11 Pages)

1. **Dashboard** — KPIs, charts, recent applications
2. **Applications Queue** — Sortable table with filters
3. **New Application** — PDF upload + customer search
4. **Agent Pack** — Agent configuration (future)
5. **Decision Approval** — Officer review queue
6. **Agent Tasks** — Real-time task status
7. **History** — All completed applications
8. **Reports** — Analytics and trends
9. **Review Extraction** — Step 1: Verify extracted fields
10. **Score Recommendation** — Step 2: Risk assessment details
11. **Agent Assessment** — Step 3: Final decision + rationale

---

## 🛠️ Tech Stack

### Frontend

- **React 19.2** — UI framework
- **TypeScript** — Type safety
- **Vite** — Build tool
- **Wouter** — Routing
- **TanStack Query** — Server state management
- **Tailwind CSS** — Styling
- **shadcn/ui** — Component library (50+ components)
- **Recharts** — Data visualization

### Backend (Python FastAPI - Production)

- **FastAPI** — Modern async Python web framework
- **LangChain + LangGraph** — AI agent orchestration (Python native)
- **Azure Document Intelligence** — PDF extraction
- **Azure Blob Storage** — File storage
- **Cosmos DB (NoSQL)** — Database
- **Uvicorn** — ASGI server with auto-reload
- **Pydantic** — Data validation and settings

> **Note:** TypeScript backend (`server/`) is archived. Python backend (`backend-python/`) is production-ready.

### Azure Resources

| Resource              | Name                           | Purpose                       |
| --------------------- | ------------------------------ | ----------------------------- |
| Cosmos DB             | `creditsentineldb`             | Application data + audit logs |
| Blob Storage          | `creditsentinel2026`           | PDF document storage          |
| Document Intelligence | `doi-creditsentinel2026`       | CTOS extraction               |
| Static Web Apps       | `dashboard-creditsentinel2026` | Frontend hosting              |
| App Service           | `api-creditsentinel2026`       | Backend API                   |

---

## 📁 Project Structure

```
Credit-Sentinel/
├── client/                        # Frontend (React + TypeScript)
│   └── src/
│       ├── pages/                 # 11 UI pages
│       ├── components/            # shadcn/ui components
│       ├── hooks/                 # React Query hooks
│       │   ├── useApplications.ts # Application CRUD + SSE
│       │   └── useAgentTasks.ts   # Task queue polling
│       └── lib/
│           └── api.ts             # Fetch wrappers
│
├── backend-python/                # Backend (FastAPI + LangGraph) ✅ PRODUCTION
│   ├── agents/
│   │   ├── credit_graph.py        # LangGraph StateGraph workflow
│   │   └── nodes.py               # Extract/Risk/Decision nodes (430 lines)
│   ├── services/
│   │   ├── cosmos.py              # Cosmos DB operations (280 lines)
│   │   ├── blob.py                # Azure Blob Storage
│   │   └── doc_intelligence.py    # PDF extraction (150 lines)
│   ├── models/
│   │   └── schemas.py             # Pydantic models (190 lines)
│   ├── utils/
│   │   └── config.py              # Settings management
│   ├── main.py                    # FastAPI app (380 lines, 8 endpoints)
│   ├── requirements.txt           # Python dependencies
│   ├── Dockerfile                 # Production container
│   ├── .env                       # Azure credentials
│   └── README.md                  # API documentation
│
├── server/                        # [ARCHIVED] TypeScript backend
│   └── agents/credit-agent.ts     # Reference implementation
│
├── shared/
│   └── schema.ts                  # TypeScript types for frontend
│
├── setup-backend.ps1              # Windows PowerShell setup wizard
└── .env.example                   # Environment template
```

---

## 🚀 Setup Instructions

### Prerequisites

- **Node.js 20+** (for frontend)
- **Python 3.11+** (for backend)
- **Azure Subscription** (with above resources created)
- **Azure OpenAI** (GPT-4o deployment)

### 1. Clone & Install Frontend

```bash
git clone <repository-url>
cd Credit-Sentinel
npm install
```

### 2. Setup Python Backend (Windows)

**Option A: Automated Setup (Recommended)**

```powershell
.\setup-backend.ps1
```

This wizard will:

- ✅ Check Python installation
- ✅ Install dependencies
- ✅ Start dev server with auto-reload
- ✅ Open Swagger UI docs

**Option B: Manual Setup**

```bash
cd backend-python
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your Azure credentials
uvicorn main:app --reload --port 8000
```

**Required variables:**

- `COSMOSDB_CONNECTION_STRING` or `COSMOSDB_ENDPOINT` + `COSMOSDB_KEY`
- `AZURE_STORAGE_CONNECTION_STRING` or `AZURE_STORAGE_ACCOUNT_NAME` + `AZURE_STORAGE_ACCOUNT_KEY`
- `AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT` + `AZURE_DOCUMENT_INTELLIGENCE_KEY`
- `OPENAI_API_KEY`

See [Environment Variables](#environment-variables) for full list.

### 3. Create Azure Resources

**Option A: Azure Portal**

1. Create Cosmos DB (NoSQL API)
2. Create Storage Account (Standard LRS)
3. Create Document Intelligence (S0 tier)

**Option B: Azure CLI**

````bash
az group create --name credit-sentinel-rg --location southeastasia

# Cosmos DB
az cosmosdb create --name creditsentineldb --resource-group credit-sentinel-rg

# Storage
az storage account create --name creditsentinel2026 --resource-group credit-sentinel-rg

# Document Intelligence
az cognitiveservices account create \
  --name doi-creditsentinel2026 \
  --resource-group credit-sentinel-rg \
  --kind FormRecognizer \
  --sku S0 \
  --location southeastasia
### 4. Run Development Server

**Terminal 1: Backend (Python)**
```bash
cd backend-python
uvicorn main:app --reload --port 8000
# API docs: http://localhost:8000/docs
````

**Terminal 2: Frontend (React)**

```bash
npm run dev
# UI: http://localhost:5000
```

> Frontend proxies `/api/*` requests to Python backend on port 8000

---

## 🔐 Environment Variables

### Python Backend (`backend-python/.env`)

All Azure credentials are configured in `backend-python/.env`:

```bash
# Server
PORT=8000

# Azure Cosmos DB
COSMOS_ENDPOINT=https://creditsentineldb.documents.azure.com:443/
COSMOS_KEY=<your-cosmos-key>
COSMOS_DATABASE=CreditSentinelDB

# Azure Blob Storage
STORAGE_ACCOUNT_NAME=creditsentinel2026
STORAGE_ACCOUNT_KEY=<your-storage-key>

# Azure Document Intelligence
DOC_INTEL_ENDPOINT=https://doi-creditsentinel2026.cognitiveservices.azure.com/
DOC_INTEL_KEY=<your-doc-intel-key>

# Azure OpenAI (GPT-4o)
AZURE_OPENAI_ENDPOINT=https://creditsentinel-ai.openai.azure.com/
AZURE_OPENAI_KEY=<your-openai-key>
AZURE_OPENAI_DEPLOYMENT=gpt-4o
```

> **Note:** TypeScript backend is archived. Frontend-only environment variables are not needed.

---

## 💻 Development

### Available Scripts

**Frontend:**

```bash
npm run dev              # Vite dev server (port 5000) with proxy to Python
npm run dev:frontend     # Same as above
npm run build            # Production build (outputs to dist/public)
npm run check            # TypeScript type check
```

**Backend (Python):**

```bash
npm run dev:backend      # Start Python FastAPI (port 8000)
# Or manually:
cd backend-python
uvicorn main:app --reload --port 8000
```

**Testing:**

```bash
cd backend-python
python test_api.py       # Run automated API tests
```

### Project Commands

```bash
# Type check
npm run check

# Build frontend + backend
npm run build

# Start production server
npm run start
```

### Adding New Components (shadcn/ui)

```bash
npx shadcn@latest add <component-name>
```

Example:

```bash
npx shadcn@latest add badge
```

---

## 🚀 Deployment

### Frontend (Azure Static Web Apps)

1. Build frontend:

   ```bash
   npm run build
   ```

2. Deploy `client/dist/` to `dashboard-creditsentinel2026`:
   ```bash
   az staticwebapp upload \
     --name dashboard-creditsentinel2026 \
     --resource-group credit-sentinel-rg \
     --source client/dist/
   ```

### Backend (Azure App Service)

1. Create deployment package:

   ```bash
   npm run build
   ```

2. Deploy to `api-creditsentinel2026`:

   ```bash
   az webapp up \
     --name api-creditsentinel2026 \
     --resource-group credit-sentinel-rg \
     --runtime "NODE:20-lts" \
     --sku B1
   ```

3. Set environment variables in Azure Portal:
   - Go to Configuration → Application Settings
   - Add all `.env` variables

---

## 📊 Business Logic

### Risk Scoring Rules (8 Rules)

| Rule                | Weight | Criteria                                            | Score Impact |
| ------------------- | ------ | --------------------------------------------------- | ------------ |
| 1. Net Worth        | 20%    | >RM500k = 10pts, RM100k-500k = 6pts, <RM100k = 2pts | 0–10         |
| 2. Banking Conduct  | 20%    | 0 SA accounts = 10pts, 1-2 = 5pts, 3+ = 0pts        | 0–10         |
| 3. Litigation       | 15%    | None = 10pts, <RM50k = 5pts, >RM50k = 0pts          | 0–10         |
| 4. Director Age     | 10%    | 40-60yo = 10pts, 30-40 or 60+ = 5pts, <30 = 3pts    | 0–10         |
| 5. Company Age      | 10%    | >5yr = 10pts, 2-5yr = 6pts, <2yr = 2pts             | 0–10         |
| 6. Paid-Up Capital  | 10%    | >RM1M = 10pts, RM500k-1M = 6pts, <RM500k = 3pts     | 0–10         |
| 7. Director Share % | 8%     | >50% = 10pts, 25-50% = 6pts, <25% = 3pts            | 0–10         |
| 8. Bankruptcy       | 7%     | None = 10pts, Any = 0pts                            | 0 or 10      |

**Total Score:** 0–100 (weighted average)

### Decision Thresholds

```
Score >= 0.7  → AUTO-APPROVE  (RM 250,000 limit)
Score 0.4-0.7 → OFFICER REVIEW (human decision required)
Score <  0.4  → AUTO-REJECT
```

### Credit Limit Calculation

```typescript
if (score >= 0.7) {
  limit = Math.min(netWorth * 0.5, 250000); // Cap at RM250k
} else if (score >= 0.4) {
  limit = netWorth * 0.3; // Conservative limit
} else {
  limit = 0; // Rejected
}
```

---

## 📡 API Documentation

### Authentication

All endpoints require Bearer token (hardcoded for demo):

```
Authorization: Bearer credit-officer-token
```

### Endpoints

#### `POST /api/applications`

Create new credit application and start agent pipeline.

**Request:**

```http
POST /api/applications
Content-Type: multipart/form-data

pdf: <file>
customerName: "AHMAD BIN ALI"
requestedLimit: 100000
salesman: "John Doe"
```

**Response:**

```json
{
  "id": "uuid",
  "customerName": "AHMAD BIN ALI",
  "status": "extracting",
  "agentStage": "extract",
  "createdAt": "2026-03-01T10:00:00Z"
}
```

#### `GET /api/applications`

List all applications (sorted by most recent).

**Response:**

```json
[
  {
    "id": "uuid",
    "customerName": "AHMAD BIN ALI",
    "status": "completed",
    "agentStage": "audit",
    "requestedLimit": 100000,
    "createdAt": "2026-03-01T10:00:00Z"
  }
]
```

#### `GET /api/applications/:id`

Get application details with extraction, score, and decision.

**Response:**

```json
{
  "id": "uuid",
  "customerName": "AHMAD BIN ALI",
  "status": "completed",
  "extraction": {
    "fields": {
      /* 14 fields */
    },
    "mandatoryFilled": 14,
    "mandatoryTotal": 14
  },
  "score": {
    "totalScore": 0.85,
    "riskCategory": "Low",
    "recommendedLimit": 250000,
    "rulesFired": [
      /* 8 rules */
    ]
  },
  "decision": {
    "approved": true,
    "finalLimit": 250000,
    "rationale": "Syarikat mempunyai kedudukan kewangan yang kukuh...",
    "rationaleEnglish": "Company has strong financial position..."
  }
}
```

#### `GET /api/applications/:id/stream`

Server-Sent Events stream for real-time agent progress.

**Response (SSE):**

```
event: message
data: {"node":"extract","status":"start","message":"Starting extraction..."}

event: message
data: {"node":"extract","status":"done","data":{"mandatoryFilled":14}}

event: message
data: {"node":"risk","status":"start","message":"Calculating risk score..."}
```

#### `POST /api/applications/:id/decide`

Officer makes final decision (for 0.4-0.7 score range).

**Request:**

```json
{
  "approved": true,
  "finalLimit": 150000,
  "notes": "Approved with conditions"
}
```

#### `GET /api/agent-tasks`

Get current agent task queue status.

**Response:**

```json
[
  {
    "appId": "uuid",
    "status": "running",
    "currentNode": "risk",
    "progress": 40,
    "startedAt": "2026-03-01T10:00:00Z"
  }
]
```

#### `GET /api/dashboard/stats`

Dashboard statistics and metrics.

**Response:**

```json
{
  "totalApplications": 150,
  "pendingReview": 12,
  "approved": 85,
  "rejected": 41,
  "avgProcessingTime": 28.5
}
```

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Upload valid CTOS PDF (14 fields extracted)
- [ ] Upload invalid PDF (error handling)
- [ ] Monitor real-time SSE stream
- [ ] Verify score calculation (8 rules)
- [ ] Test auto-approve (score >0.7)
- [ ] Test auto-reject (score <0.4)
- [ ] Test officer review (score 0.4-0.7)
- [ ] Check audit logs in Cosmos DB
- [ ] Verify PII masking in rationale
- [ ] Test bilingual rationale (BM/EN)

---

## 🔒 Security & Compliance

### PII Protection

- IC numbers masked: `████████████`
- Phone numbers masked: `+60-XXXXX`
- Email addresses masked: `█████@█████.com`

### Audit Trail

Every action logged to Cosmos DB:

```typescript
{
  "appId": "uuid",
  "action": "decision_approved",
  "officerId": "officer-demo",
  "detail": "Approved RM250k limit",
  "timestamp": "2026-03-01T10:05:30Z"
}
```

### Authentication

- Bearer token (demo: `credit-officer-token`)
- Production: Integrate Azure AD B2C or Entra ID

---

## 📝 License

MIT License — See LICENSE file for details.

---

## 👥 Contributors

Built for **Chin Hin Group Hackathon 2025**

---

## 📞 Support

For issues or questions:

- Open GitHub Issue
- Contact: [your-email@example.com]

---

**🛡️ Credit Sentinel** — Making SME credit assessment instant, accurate, and compliant.
