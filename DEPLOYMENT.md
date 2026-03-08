# 🚀 Deployment Guide - Credit Sentinel

This guide covers deploying Credit Sentinel to production with:

- **Frontend**: Vercel (React/Vite)
- **Backend**: Azure App Service (Python/FastAPI)

---

## 📋 Prerequisites

- GitHub account
- Vercel account (free tier works)
- Azure subscription (for backend + Azure services)
- Azure CLI installed: `az --version`

---

## 🔧 Part 1: Backend Deployment (Azure App Service)

### Step 1: Prepare Azure Resources

If you haven't already, create these Azure resources:

```bash
# Set variables
RESOURCE_GROUP="credit-sentinel-rg"
LOCATION="southeastasia"
APP_NAME="credit-sentinel-backend"

# Login to Azure
az login

# Create resource group (if not exists)
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create App Service Plan (Linux, Python)
az appservice plan create \
  --name "${APP_NAME}-plan" \
  --resource-group $RESOURCE_GROUP \
  --is-linux \
  --sku B1

# Create Web App
az webapp create \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --plan "${APP_NAME}-plan" \
  --runtime "PYTHON:3.11"
```

### Step 2: Configure Environment Variables

Set environment variables in Azure App Service:

```bash
# Set app settings (replace with your actual values)
az webapp config appsettings set \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --settings \
    COSMOSDB_ENDPOINT="https://creditsentineldb.documents.azure.com:443/" \
    COSMOSDB_KEY="your-cosmos-key" \
    COSMOSDB_DATABASE_NAME="CreditSentinelDB" \
    AZURE_STORAGE_ACCOUNT_NAME="creditsentinel2026" \
    AZURE_STORAGE_ACCOUNT_KEY="your-storage-key" \
    AZURE_STORAGE_CONTAINER_NAME="ctos-pdfs" \
    AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT="https://doi-creditsentinel2026.cognitiveservices.azure.com/" \
    AZURE_DOCUMENT_INTELLIGENCE_KEY="your-doc-intel-key" \
    OPENAI_API_KEY="your-openai-key" \
    DEMO_AUTH_TOKEN="credit-officer-token"
```

Or set them via Azure Portal:

1. Go to Azure Portal → App Services → Your App
2. Settings → Configuration → Application Settings
3. Add each variable from `backend-python/.env.example`

### Step 3: Deploy Backend

**Option A: Deploy from Local (Recommended)**

```bash
cd backend-python

# Build and deploy using Azure CLI
az webapp up \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --runtime "PYTHON:3.11"
```

**Option B: Deploy via GitHub Actions**

1. Get publish profile:

```bash
az webapp deployment list-publishing-profiles \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --xml > publish-profile.xml
```

2. Add to GitHub Secrets:

   - Go to GitHub repo → Settings → Secrets → Actions
   - Add `AZURE_WEBAPP_PUBLISH_PROFILE` with the XML content

3. GitHub Actions will auto-deploy (workflow file below)

**Option C: Deploy with Docker**

```bash
cd backend-python

# Build Docker image
docker build -t credit-sentinel-backend .

# Tag for Azure Container Registry (if using ACR)
docker tag credit-sentinel-backend youracr.azurecr.io/credit-sentinel-backend:latest

# Push to ACR
docker push youracr.azurecr.io/credit-sentinel-backend:latest

# Update App Service to use container
az webapp config container set \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --docker-custom-image-name youracr.azurecr.io/credit-sentinel-backend:latest
```

### Step 4: Verify Backend

```bash
# Get backend URL
BACKEND_URL=$(az webapp show --name $APP_NAME --resource-group $RESOURCE_GROUP --query "defaultHostName" -o tsv)
echo "Backend URL: https://$BACKEND_URL"

# Test health endpoint
curl https://$BACKEND_URL/health
```

---

## 🌐 Part 2: Frontend Deployment (Vercel)

### Step 1: Push to GitHub

```bash
# From project root
git add .
git commit -m "Ready for production deployment"
git push origin main
```

### Step 2: Deploy to Vercel

**Option A: Vercel CLI (Recommended)**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

**Option B: Vercel Dashboard**

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Other
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/public`
   - **Install Command**: `npm install`

### Step 3: Configure Environment Variables in Vercel

Add environment variable in Vercel Dashboard:

1. Go to Project → Settings → Environment Variables
2. Add:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://your-backend.azurewebsites.net` (your backend URL from Part 1)
   - **Environment**: Production

### Step 4: Redeploy

After adding env vars, trigger a redeploy:

```bash
vercel --prod
```

Or in Vercel Dashboard → Deployments → Redeploy

---

## ✅ Verification

### Test the Full System

1. **Backend Health Check**:

   ```bash
   curl https://your-backend.azurewebsites.net/health
   ```

   Should return: `{"status": "healthy"}`

2. **Frontend**:

   - Visit your Vercel URL: `https://your-project.vercel.app`
   - Should load the dashboard

3. **Upload Test CTOS PDF**:

   - Go to New Application page
   - Upload a test PDF
   - Check if agent processing starts

4. **Check Logs**:
   - **Backend logs**: `az webapp log tail --name $APP_NAME --resource-group $RESOURCE_GROUP`
   - **Frontend**: Vercel Dashboard → Deployments → View Logs

---

## 🔒 Security Checklist

- [ ] All `.env` files are in `.gitignore`
- [ ] Azure App Service uses Managed Identity (recommended) or Key Vault
- [ ] CORS is configured properly in Python backend (`main.py`)
- [ ] API authentication tokens are rotated
- [ ] HTTPS is enforced on both frontend and backend

---

## 📊 Monitoring & Costs

### Azure Costs (Approximate)

- App Service (B1): ~$13/month
- Cosmos DB (Serverless): ~$1-5/month (usage-based)
- Blob Storage: ~$0.02/GB
- Document Intelligence: ~$1.50/1000 pages
- Total: **~$15-30/month** for moderate usage

### Vercel

- Free tier: 100GB bandwidth, unlimited deployments
- Pro ($20/month): If you need more bandwidth

---

## 🐛 Troubleshooting

### Backend not responding

```bash
# Check logs
az webapp log tail --name credit-sentinel-backend --resource-group credit-sentinel-rg

# Restart app
az webapp restart --name credit-sentinel-backend --resource-group credit-sentinel-rg
```

### Frontend can't reach backend

1. Check `VITE_API_URL` in Vercel env vars
2. Check CORS settings in `backend-python/main.py`
3. Verify backend is running: `curl https://your-backend.azurewebsites.net/health`

### Build fails on Vercel

1. Check Node.js version compatibility
2. Verify `package.json` has all dependencies
3. Check build logs in Vercel Dashboard

---

## 🔄 GitHub Actions CI/CD (Optional)

Create `.github/workflows/deploy-backend.yml`:

```yaml
name: Deploy Python Backend to Azure

on:
  push:
    branches: [main]
    paths:
      - "backend-python/**"

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: "3.11"

      - name: Deploy to Azure Web App
        uses: azure/webapps-deploy@v2
        with:
          app-name: "credit-sentinel-backend"
          publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
          package: backend-python
```

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Azure App Service Python](https://docs.microsoft.com/azure/app-service/quickstart-python)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)

---

## 🎯 Next Steps

1. Set up monitoring with Azure Application Insights
2. Configure custom domain in Vercel
3. Set up automated backups for Cosmos DB
4. Implement rate limiting on backend
5. Add integration tests in CI/CD pipeline

---

**Need help?** Check the main README.md or raise an issue on GitHub.
