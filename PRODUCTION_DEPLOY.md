# 🚀 Production Deployment Guide — Credit Sentinel

> **Python FastAPI Backend → Azure App Service**  
> Hackathon → Production-Ready Scaling

---

## 📋 Table of Contents

- [Why Python for Production](#why-python-for-production)
- [Quick Deploy (5 Minutes)](#quick-deploy-5-minutes)
- [Detailed Setup](#detailed-setup)
- [Environment Configuration](#environment-configuration)
- [Scaling Options](#scaling-options)
- [Monitoring & Observability](#monitoring--observability)
- [Production Checklist](#production-checklist)

---

## 🎯 Why Python for Production

| Production Need          | TypeScript Backend | Python FastAPI ✅       |
| ------------------------ | ------------------ | ----------------------- |
| **Async I/O**            | ❌ Limited         | ✅ Native async/await   |
| **LangGraph Support**    | ⚠️ Beta (v1.2)     | ✅ Mature (v0.3+)       |
| **Scalability**          | ❌ Node limits     | ✅ Gunicorn + Workers   |
| **Azure Integration**    | ⚠️ Custom libs     | ✅ Official Azure SDKs  |
| **Monitoring**           | Manual setup       | ✅ LangSmith + OpenTel  |
| **AI/ML Ecosystem**      | Limited            | ✅ Industry standard    |
| **Container Deployment** | Custom             | 🐳 Docker → 1-click     |
| **Team Handoff**         | JS devs only       | ✅ AI/ML standard stack |

**Verdict:** Python FastAPI is the production-ready choice for AI-powered workloads on Azure.

---

## ⚡ Quick Deploy (5 Minutes)

### Prerequisites

- Azure CLI installed: `az --version`
- Docker installed (optional, for local testing)
- Azure subscription with permissions

### Option A: Automated Script

```bash
bash deploy.sh
```

This will:

1. ✅ Build Docker image
2. ✅ Push to Azure Container Registry
3. ✅ Deploy to App Service
4. ✅ Configure environment variables
5. ✅ Enable auto-scaling

### Option B: Manual Azure Portal

1. **Open Azure Portal** → App Services → `api-creditsentinel2026`
2. **Deployment Center** → GitHub
3. **Select Repo** → `Credit-Sentinel`
4. **Build Provider** → GitHub Actions
5. **Path** → `/backend-python`
6. **Save** → Auto-deploy on push

**Live API:** `https://api-creditsentinel2026.azurewebsites.net`

---

## 🔧 Detailed Setup

### Step 1: Prepare Backend

```bash
cd backend-python

# Verify all dependencies
pip install -r requirements.txt

# Test locally first
uvicorn main:app --port 8000

# Visit http://localhost:8000/docs to test API
```

### Step 2: Build Docker Image (Local Test)

```dockerfile
# backend-python/Dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```bash
# Build locally
docker build -t credit-sentinel-backend .

# Test container
docker run -p 8000:8000 --env-file .env credit-sentinel-backend

# Verify: http://localhost:8000/health
```

### Step 3: Deploy to Azure App Service

#### 3.1 Login to Azure

```bash
az login
az account set --subscription <your-subscription-id>
```

#### 3.2 Create Container Registry (if not exists)

```bash
az acr create \
  --resource-group ChinHinHackathon \
  --name creditsentinelacr \
  --sku Basic \
  --location southeastasia
```

#### 3.3 Build & Push Image

```bash
# Login to ACR
az acr login --name creditsentinelacr

# Build and push
docker build -t creditsentinelacr.azurecr.io/backend:latest .
docker push creditsentinelacr.azurecr.io/backend:latest
```

#### 3.4 Create App Service (Python 3.11)

```bash
az webapp create \
  --resource-group ChinHinHackathon \
  --plan api-creditsentinel2026-plan \
  --name api-creditsentinel2026 \
  --deployment-container-image-name creditsentinelacr.azurecr.io/backend:latest \
  --runtime "PYTHON:3.11"
```

#### 3.5 Configure Environment Variables

```bash
az webapp config appsettings set \
  --resource-group ChinHinHackathon \
  --name api-creditsentinel2026 \
  --settings \
    PORT=8000 \
    COSMOS_ENDPOINT="https://creditsentineldb.documents.azure.com:443/" \
    COSMOS_KEY="<your-cosmos-key>" \
    COSMOS_DATABASE="CreditSentinelDB" \
    STORAGE_ACCOUNT_NAME="creditsentinel2026" \
    STORAGE_ACCOUNT_KEY="<your-storage-key>" \
    DOC_INTEL_ENDPOINT="https://doi-creditsentinel2026.cognitiveservices.azure.com/" \
    DOC_INTEL_KEY="<your-doc-intel-key>" \
    AZURE_OPENAI_ENDPOINT="https://creditsentinel-ai.openai.azure.com/" \
    AZURE_OPENAI_KEY="<your-openai-key>" \
    AZURE_OPENAI_DEPLOYMENT="gpt-4o"
```

> **Security Note:** For production, use Azure Key Vault references:
>
> ```
> @Microsoft.KeyVault(SecretUri=https://your-vault.vault.azure.net/secrets/cosmos-key/)
> ```

#### 3.6 Enable Continuous Deployment

```bash
az webapp deployment container config \
  --resource-group ChinHinHackathon \
  --name api-creditsentinel2026 \
  --enable-cd true
```

### Step 4: Deploy Frontend (Static Web App)

```bash
# Build frontend
npm run build

# Deploy to Azure Static Web Apps
az staticwebapp create \
  --name dashboard-creditsentinel2026 \
  --resource-group ChinHinHackathon \
  --source https://github.com/<your-org>/Credit-Sentinel \
  --location southeastasia \
  --branch main \
  --app-location "/client" \
  --output-location "dist"
```

**Update API URL in frontend:**

```typescript
// client/src/lib/api.ts
const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://api-creditsentinel2026.azurewebsites.net"
    : "";
```

---

## 🛠️ Environment Configuration

### Production `.env` (Backend)

```bash
# Server
PORT=8000
WORKERS=4  # Gunicorn workers (optional)

# Azure Cosmos DB
COSMOS_ENDPOINT=https://creditsentineldb.documents.azure.com:443/
COSMOS_KEY=9tRh73BCUxBynnIGv8Le...  # Use Key Vault in production!
COSMOS_DATABASE=CreditSentinelDB

# Azure Blob Storage
STORAGE_ACCOUNT_NAME=creditsentinel2026
STORAGE_ACCOUNT_KEY=SVIH1kENB0ycxHZGEf...  # Use Key Vault!

# Azure Document Intelligence
DOC_INTEL_ENDPOINT=https://doi-creditsentinel2026.cognitiveservices.azure.com/
DOC_INTEL_KEY=1XnrC26oShT1Eyv...  # Use Key Vault!

# Azure OpenAI (GPT-4o)
AZURE_OPENAI_ENDPOINT=https://creditsentinel-ai.openai.azure.com/
AZURE_OPENAI_KEY=6qF8o1TjUj6csozl...  # Use Key Vault!
AZURE_OPENAI_DEPLOYMENT=gpt-4o

# Optional: Monitoring
APPLICATIONINSIGHTS_CONNECTION_STRING=InstrumentationKey=...
LANGSMITH_API_KEY=ls_...  # For LangChain tracing
```

### Key Vault Integration (Recommended)

```bash
# Store secrets in Key Vault
az keyvault secret set \
  --vault-name creditsentinel-vault \
  --name cosmos-key \
  --value "<your-cosmos-key>"

# Reference in App Service
az webapp config appsettings set \
  --name api-creditsentinel2026 \
  --resource-group ChinHinHackathon \
  --settings COSMOS_KEY="@Microsoft.KeyVault(VaultName=creditsentinel-vault;SecretName=cosmos-key)"
```

---

## 📈 Scaling Options

### Option 1: Vertical Scaling (App Service Plan)

```bash
# Scale up to Premium tier (2 vCPU, 7GB RAM)
az appservice plan update \
  --name api-creditsentinel2026-plan \
  --resource-group ChinHinHackathon \
  --sku P1V2
```

### Option 2: Horizontal Scaling (Auto-scale)

Enable auto-scaling based on CPU/Memory:

```bash
az monitor autoscale create \
  --resource-group ChinHinHackathon \
  --resource api-creditsentinel2026 \
  --resource-type Microsoft.Web/serverfarms \
  --name autoscale-backend \
  --min-count 2 \
  --max-count 10 \
  --count 3
```

**Auto-scale Rules:**

- Scale out when CPU > 70% for 5 minutes
- Scale in when CPU < 30% for 10 minutes

### Option 3: Async Workers (Celery + Redis)

For high-volume processing:

```python
# backend-python/celery_app.py
from celery import Celery
from redis import Redis

celery = Celery('credit-sentinel', broker='redis://localhost:6379/0')

@celery.task
def process_application_async(app_id: str):
    # Run LangGraph workflow in background
    pass
```

Deploy Redis on Azure:

```bash
az redis create \
  --name creditsentinel-redis \
  --resource-group ChinHinHackathon \
  --location southeastasia \
  --sku Basic \
  --vm-size c0
```

---

## 📊 Monitoring & Observability

### Application Insights (Azure Native)

```bash
# Enable Application Insights
az monitor app-insights component create \
  --app creditsentinel-backend \
  --location southeastasia \
  --resource-group ChinHinHackathon \
  --application-type web

# Link to App Service
az webapp config appsettings set \
  --name api-creditsentinel2026 \
  --resource-group ChinHinHackathon \
  --settings APPLICATIONINSIGHTS_CONNECTION_STRING="<connection-string>"
```

**Monitor:**

- Request rates & latencies
- Failed requests & exceptions
- LangGraph execution times
- Azure SDK call traces

### LangSmith (LangChain Observability)

```python
# backend-python/main.py
import os
os.environ["LANGSMITH_API_KEY"] = "ls_..."
os.environ["LANGSMITH_PROJECT"] = "credit-sentinel-prod"

# LangGraph traces automatically sent to LangSmith
```

**Features:**

- LangGraph node execution times
- LLM token usage & costs
- Agent decision traces
- Error debugging

### Health Check Endpoint

```python
# backend-python/main.py
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "services": {
            "cosmos_db": await check_cosmos(),
            "blob_storage": await check_blob(),
            "document_intelligence": await check_doc_intel(),
            "langgraph": "ok"
        }
    }
```

Configure in Azure:

```bash
az webapp config set \
  --name api-creditsentinel2026 \
  --resource-group ChinHinHackathon \
  --health-check-path "/health"
```

---

## ✅ Production Checklist

### Security

- [ ] Move secrets to Azure Key Vault
- [ ] Enable HTTPS only (auto-redirect)
- [ ] Configure CORS for frontend domain
- [ ] Enable Managed Identity for Azure resources
- [ ] Set up Azure AD authentication (optional)
- [ ] Enable PII masking in logs

### Performance

- [ ] Enable CDN for static assets
- [ ] Configure Redis cache for Cosmos DB queries
- [ ] Set up auto-scaling rules
- [ ] Optimize Docker image size
- [ ] Enable Cosmos DB partition keys

### Reliability

- [ ] Configure health check endpoint
- [ ] Set up alerting (email/SMS on failures)
- [ ] Enable backup for Cosmos DB
- [ ] Configure blob storage redundancy (GRS)
- [ ] Test disaster recovery procedure

### Monitoring

- [ ] Enable Application Insights
- [ ] Set up custom metrics dashboard
- [ ] Configure LangSmith tracing
- [ ] Set up cost alerts (budget thresholds)
- [ ] Create runbook for common issues

### Compliance

- [ ] Audit trail for all credit decisions
- [ ] GDPR-compliant data retention policy
- [ ] PII detection and masking
- [ ] Regular security scans (container vulnerabilities)
- [ ] Document data flow for regulators

---

## 🎯 Post-Deployment Testing

### 1. API Health Check

```bash
curl https://api-creditsentinel2026.azurewebsites.net/health
```

**Expected:**

```json
{
  "status": "healthy",
  "services": {
    "cosmos_db": "connected",
    "blob_storage": "connected",
    "document_intelligence": "connected",
    "langgraph": "ok"
  }
}
```

### 2. Upload Test CTOS PDF

```bash
curl -X POST https://api-creditsentinel2026.azurewebsites.net/api/applications \
  -H "Authorization: Bearer credit-officer-token" \
  -F "pdf=@test_ctos.pdf" \
  -F "customer_name=AHMAD BIN ALI SDN BHD" \
  -F "requested_limit=100000" \
  -F "salesman=Officer-001"
```

### 3. Check Agent Task Status

```bash
curl https://api-creditsentinel2026.azurewebsites.net/api/agent-tasks \
  -H "Authorization: Bearer credit-officer-token"
```

### 4. View Dashboard Stats

```bash
curl https://api-creditsentinel2026.azurewebsites.net/api/dashboard/stats \
  -H "Authorization: Bearer credit-officer-token"
```

---

## 🐛 Troubleshooting

### Issue: App Service not starting

**Check logs:**

```bash
az webapp log tail \
  --name api-creditsentinel2026 \
  --resource-group ChinHinHackathon
```

**Common fixes:**

- Verify environment variables are set
- Check Docker image build succeeded
- Ensure PORT=8000 in settings
- Verify Python 3.11 runtime

### Issue: Cosmos DB connection timeout

**Solution:**

- Check firewall rules allow App Service IP
- Enable "Allow Azure services" in Cosmos DB
- Verify COSMOS_KEY is correct

### Issue: LangGraph execution slow

**Solutions:**

- Scale up App Service plan (more CPU/RAM)
- Enable Redis cache for Cosmos queries
- Switch to async workers (Celery)
- Optimize LangGraph prompt sizes

---

## 📞 Support & Resources

- **Backend API Docs:** `https://api-creditsentinel2026.azurewebsites.net/docs`
- **Azure App Service Docs:** https://learn.microsoft.com/en-us/azure/app-service/
- **FastAPI Deployment:** https://fastapi.tiangolo.com/deployment/
- **LangGraph on Azure:** https://python.langchain.com/docs/langgraph

---

## 🚀 Next Steps

1. **Deploy to Production:** Run `bash deploy.sh`
2. **Test Endpoints:** Use Swagger UI at `/docs`
3. **Monitor Performance:** Check Application Insights
4. **Scale as Needed:** Enable auto-scaling
5. **Optimize Costs:** Review Azure Cost Management

**Your Python backend is production-ready! 🎉**
