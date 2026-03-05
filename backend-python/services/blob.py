"""Azure Blob Storage service for PDF uploads."""
import uuid
from datetime import datetime, timedelta
from azure.storage.blob import (
    BlobServiceClient,
    BlobSasPermissions,
    generate_blob_sas,
    ContentSettings,
)
from utils.config import settings


class BlobStorageService:
    """Handles PDF uploads to Azure Blob Storage."""
    
    def __init__(self):
        self.connection_string = settings.storage_connection_string
        self.container_name = settings.storage_container
        self.account_name = settings.storage_account_name
        self.account_key = settings.storage_account_key
        
        # Initialize client
        self.blob_service_client = BlobServiceClient.from_connection_string(
            self.connection_string
        )
        self._ensure_container()
    
    def _ensure_container(self):
        """Create container if it doesn't exist."""
        try:
            container_client = self.blob_service_client.get_container_client(
                self.container_name
            )
            if not container_client.exists():
                # Create private container (public access disabled by storage account policy)
                container_client.create_container()
        except Exception as e:
            print(f"Container creation warning: {e}")
    
    async def upload_pdf(self, file_data: bytes, original_filename: str) -> dict:
        """
        Upload PDF to blob storage.
        
        Args:
            file_data: PDF file bytes
            original_filename: Original filename
        
        Returns:
            dict with url and blob_name
        """
        # Generate unique blob name
        file_ext = original_filename.split(".")[-1] if "." in original_filename else "pdf"
        blob_name = f"{uuid.uuid4()}-{original_filename.replace(' ', '_')}"
        
        # Get blob client
        blob_client = self.blob_service_client.get_blob_client(
            container=self.container_name,
            blob=blob_name
        )
        
        # Upload with content type
        blob_client.upload_blob(
            file_data,
            content_settings=ContentSettings(content_type="application/pdf"),
            overwrite=True
        )
        
        # Generate SAS URL for Azure Document Intelligence to access (valid for 24 hours)
        sas_url = self.generate_sas_url(blob_name, expiry_hours=24)
        print(f"[BLOB] Generated SAS URL: {sas_url[:80]}...{sas_url[-40:]}")
        
        return {
            "url": sas_url,
            "blob_name": blob_name
        }
    
    def generate_sas_url(self, blob_name: str, expiry_hours: int = 24) -> str:
        """
        Generate a SAS URL for temporary access.
        
        Args:
            blob_name: Name of the blob
            expiry_hours: Hours until SAS expires
        
        Returns:
            SAS URL string
        """
        sas_token = generate_blob_sas(
            account_name=self.account_name,
            container_name=self.container_name,
            blob_name=blob_name,
            account_key=self.account_key,
            permission=BlobSasPermissions(read=True),
            expiry=datetime.utcnow() + timedelta(hours=expiry_hours)
        )
        
        blob_url = f"https://{self.account_name}.blob.core.windows.net/{self.container_name}/{blob_name}?{sas_token}"
        return blob_url
    
    async def delete_blob(self, blob_name: str):
        """Delete a blob from storage."""
        blob_client = self.blob_service_client.get_blob_client(
            container=self.container_name,
            blob=blob_name
        )
        blob_client.delete_blob(delete_snapshots="include")


# Global instance
blob_service = BlobStorageService()
