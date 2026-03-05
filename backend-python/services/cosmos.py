"""Cosmos DB service for data persistence."""
import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
from azure.cosmos import CosmosClient, PartitionKey
from utils.config import settings
from models.schemas import (
    Application,
    Extraction,
    Score,
    Decision,
    AuditLog,
)


class CosmosDBService:
    """Handles all Cosmos DB operations."""
    
    def __init__(self):
        self.endpoint = settings.cosmos_endpoint
        self.key = settings.cosmos_key
        self.database_name = settings.cosmos_database
        
        # Initialize client
        self.client = CosmosClient(self.endpoint, credential=self.key)
        self.database = None
        self.containers = {}
        
        self._initialize_database()
    
    def _initialize_database(self):
        """Create database and containers if they don't exist."""
        # Create database
        self.database = self.client.create_database_if_not_exists(
            id=self.database_name
        )
        
        # Create containers
        container_names = [
            "applications",
            "extractions",
            "scores",
            "decisions",
            "audit_logs",
        ]
        
        for container_name in container_names:
            container = self.database.create_container_if_not_exists(
                id=container_name,
                partition_key=PartitionKey(path="/id")
                # Note: offer_throughput removed for serverless Cosmos DB support
            )
            self.containers[container_name] = container
    
    def _doc_to_dict(self, doc: Dict[str, Any]) -> Dict[str, Any]:
        """Remove Cosmos DB metadata fields."""
        if doc:
            doc.pop("_rid", None)
            doc.pop("_self", None)
            doc.pop("_etag", None)
            doc.pop("_attachments", None)
            doc.pop("_ts", None)
        return doc
    
    # ─── Applications ────────────────────────────────────────────────────────
    
    async def create_application(
        self,
        officer_id: str,
        customer_name: str,
        requested_limit: float,
        salesman: str,
        pdf_url: str,
        pdf_blob_name: str,
        original_filename: str = "CTOS_REPORT.pdf",
    ) -> Application:
        """Create a new application."""
        now = datetime.utcnow()
        app_id = str(uuid.uuid4())
        
        doc = {
            "id": app_id,
            "officer_id": officer_id,
            "customer_name": customer_name,
            "requested_limit": requested_limit,
            "salesman": salesman,
            "pdf_url": pdf_url,
            "pdf_blob_name": pdf_blob_name,
            "original_filename": original_filename,
            "status": "new",
            "agent_stage": "new",
            "created_at": now.isoformat(),
            "updated_at": now.isoformat(),
        }
        
        result = self.containers["applications"].create_item(body=doc)
        return Application(**self._doc_to_dict(result))
    
    async def get_application(self, app_id: str) -> Optional[Application]:
        """Get application by ID."""
        try:
            item = self.containers["applications"].read_item(
                item=app_id,
                partition_key=app_id
            )
            return Application(**self._doc_to_dict(item))
        except:
            return None
    
    async def update_application(
        self,
        app_id: str,
        updates: Dict[str, Any]
    ) -> Optional[Application]:
        """Update application fields."""
        try:
            item = self.containers["applications"].read_item(
                item=app_id,
                partition_key=app_id
            )
            item.update(updates)
            item["updated_at"] = datetime.utcnow().isoformat()
            
            result = self.containers["applications"].replace_item(
                item=app_id,
                body=item
            )
            return Application(**self._doc_to_dict(result))
        except:
            return None
    
    async def list_applications(self, limit: int = 50) -> List[Application]:
        """List all applications."""
        query = "SELECT * FROM c ORDER BY c.created_at DESC"
        items = list(self.containers["applications"].query_items(
            query=query,
            enable_cross_partition_query=True
        ))
        return [Application(**self._doc_to_dict(item)) for item in items[:limit]]
    
    # ─── Extractions ─────────────────────────────────────────────────────────
    
    async def save_extraction(
        self,
        app_id: str,
        raw_text: str,
        fields: Dict[str, Any],
        mandatory_filled: int,
        mandatory_total: int,
    ) -> Extraction:
        """Save extraction results."""
        doc = {
            "id": str(uuid.uuid4()),
            "app_id": app_id,
            "raw_text": raw_text,
            "fields": fields,
            "mandatory_filled": mandatory_filled,
            "mandatory_total": mandatory_total,
            "created_at": datetime.utcnow().isoformat(),
        }
        
        result = self.containers["extractions"].create_item(body=doc)
        return Extraction(**self._doc_to_dict(result))
    
    async def get_extraction_by_app(self, app_id: str) -> Optional[Extraction]:
        """Get extraction for an application."""
        query = f"SELECT * FROM c WHERE c.app_id = '{app_id}'"
        items = list(self.containers["extractions"].query_items(
            query=query,
            enable_cross_partition_query=True
        ))
        return Extraction(**self._doc_to_dict(items[0])) if items else None
    
    # ─── Scores ──────────────────────────────────────────────────────────────
    
    async def save_score(
        self,
        app_id: str,
        total_score: float,
        risk_category: str,
        recommended_limit: float,
        rules_fired: List[Dict[str, Any]],
        rationale: str,
        rationale_english: str,
    ) -> Score:
        """Save risk score results."""
        doc = {
            "id": str(uuid.uuid4()),
            "app_id": app_id,
            "total_score": total_score,
            "risk_category": risk_category,
            "recommended_limit": recommended_limit,
            "rules_fired": rules_fired,
            "rationale": rationale,
            "rationale_english": rationale_english,
            "created_at": datetime.utcnow().isoformat(),
        }
        
        result = self.containers["scores"].create_item(body=doc)
        return Score(**self._doc_to_dict(result))
    
    async def get_score_by_app(self, app_id: str) -> Optional[Score]:
        """Get score for an application."""
        query = f"SELECT * FROM c WHERE c.app_id = '{app_id}'"
        items = list(self.containers["scores"].query_items(
            query=query,
            enable_cross_partition_query=True
        ))
        return Score(**self._doc_to_dict(items[0])) if items else None
    
    # ─── Decisions ───────────────────────────────────────────────────────────
    
    async def save_decision(
        self,
        app_id: str,
        officer_id: str,
        approved: bool,
        final_limit: float,
        notes: str,
    ) -> Decision:
        """Save officer decision."""
        doc = {
            "id": str(uuid.uuid4()),
            "app_id": app_id,
            "officer_id": officer_id,
            "approved": approved,
            "final_limit": final_limit,
            "notes": notes,
            "created_at": datetime.utcnow().isoformat(),
        }
        
        result = self.containers["decisions"].create_item(body=doc)
        return Decision(**self._doc_to_dict(result))
    
    async def get_decision_by_app(self, app_id: str) -> Optional[Decision]:
        """Get decision for an application."""
        query = f"SELECT * FROM c WHERE c.app_id = '{app_id}'"
        items = list(self.containers["decisions"].query_items(
            query=query,
            enable_cross_partition_query=True
        ))
        return Decision(**self._doc_to_dict(items[0])) if items else None
    
    # ─── Audit Logs ──────────────────────────────────────────────────────────
    
    async def add_audit_log(
        self,
        app_id: str,
        action: str,
        officer_id: str,
        detail: str,
    ) -> AuditLog:
        """Add audit log entry."""
        doc = {
            "id": str(uuid.uuid4()),
            "app_id": app_id,
            "action": action,
            "officer_id": officer_id,
            "detail": detail,
            "timestamp": datetime.utcnow().isoformat(),
        }
        
        result = self.containers["audit_logs"].create_item(body=doc)
        return AuditLog(**self._doc_to_dict(result))
    
    async def get_audit_logs(self, app_id: str) -> List[AuditLog]:
        """Get all audit logs for an application."""
        query = f"SELECT * FROM c WHERE c.app_id = '{app_id}' ORDER BY c.timestamp DESC"
        items = list(self.containers["audit_logs"].query_items(
            query=query,
            enable_cross_partition_query=True
        ))
        return [AuditLog(**self._doc_to_dict(item)) for item in items]


# Global instance
cosmos_service = CosmosDBService()
