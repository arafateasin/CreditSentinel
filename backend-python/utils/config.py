"""Configuration loader for Credit Sentinel backend."""
import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load .env file
load_dotenv()


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Server
    port: int = int(os.getenv("PORT", "8000"))
    environment: str = os.getenv("ENVIRONMENT", "development")
    
    # Cosmos DB
    cosmos_endpoint: str = os.getenv("COSMOS_ENDPOINT", "")
    cosmos_key: str = os.getenv("COSMOS_KEY", "")
    cosmos_database: str = os.getenv("COSMOS_DATABASE", "CreditSentinelDB")
    
    # Blob Storage
    storage_account_name: str = os.getenv("STORAGE_ACCOUNT_NAME", "creditsentinel2026")
    storage_account_key: str = os.getenv("STORAGE_ACCOUNT_KEY", "")
    storage_connection_string: str = os.getenv("STORAGE_CONNECTION_STRING", "")
    storage_container: str = os.getenv("STORAGE_CONTAINER", "ctos-pdfs")
    
    # Document Intelligence
    doc_intel_endpoint: str = os.getenv("DOC_INTEL_ENDPOINT", "")
    doc_intel_key: str = os.getenv("DOC_INTEL_KEY", "")
    
    # Azure OpenAI
    azure_openai_endpoint: str = os.getenv("AZURE_OPENAI_ENDPOINT", "")
    azure_openai_key: str = os.getenv("AZURE_OPENAI_KEY", "")
    azure_openai_deployment: str = os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-4o")
    azure_openai_api_version: str = os.getenv("AZURE_OPENAI_API_VERSION", "2024-02-15-preview")
    
    # Auth
    demo_auth_token: str = os.getenv("DEMO_AUTH_TOKEN", "credit-officer-token")
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Global settings instance
settings = Settings()
