#!/bin/bash
# Deployment script for Credit Sentinel Python Backend

echo "🚀 Deploying Credit Sentinel Backend to Azure..."

# Variables
RESOURCE_GROUP="credit-sentinel-rg"
APP_SERVICE="api-creditsentinel2026"
LOCATION="southeastasia"

# Build Docker image
echo "📦 Building Docker image..."
docker build -t creditsentinel-api:latest ./backend-python

# Tag for Azure Container Registry (if using ACR)
# docker tag creditsentinel-api:latest <your-acr>.azurecr.io/creditsentinel-api:latest
# docker push <your-acr>.azurecr.io/creditsentinel-api:latest

# Option 1: Deploy from local (requires Docker Desktop)
echo "🚢 Deploying to Azure App Service..."
az webapp up \
  --name $APP_SERVICE \
  --resource-group $RESOURCE_GROUP \
  --runtime "PYTHON:3.11" \
  --sku B1 \
  --location $LOCATION

# Option 2: Deploy using Docker container
# az webapp create \
#   --resource-group $RESOURCE_GROUP \
#   --plan creditsentinel-plan \
#   --name $APP_SERVICE \
#   --deployment-container-image-name creditsentinel-api:latest

# Set environment variables
echo "🔐 Setting environment variables..."
az webapp config appsettings set \
  --resource-group $RESOURCE_GROUP \
  --name $APP_SERVICE \
  --settings @backend-python/.env

echo "✅ Deployment complete!"
echo "🌐 API URL: https://$APP_SERVICE.azurewebsites.net"
echo "📊 Health: https://$APP_SERVICE.azurewebsites.net/health"
echo "📚 Docs: https://$APP_SERVICE.azurewebsites.net/docs"
