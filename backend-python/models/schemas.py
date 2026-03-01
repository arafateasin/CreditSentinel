"""Pydantic schemas for Credit Sentinel API and database models."""
from datetime import datetime
from typing import List, Optional, Literal
from pydantic import BaseModel, Field


# ─── Application Models ──────────────────────────────────────────────────────

class ApplicationCreate(BaseModel):
    """Input for creating a new credit application."""
    customer_name: str = Field(..., min_length=1)
    requested_limit: float = Field(..., gt=0)
    salesman: str = Field(..., min_length=1)


class Application(BaseModel):
    """Credit application record."""
    id: str
    officer_id: str
    customer_name: str
    requested_limit: float
    salesman: str
    pdf_url: str
    pdf_blob_name: str
    status: Literal["new", "extracting", "extracted", "scoring", "scored", "error", "completed"]
    agent_stage: str = "new"
    created_at: datetime
    updated_at: datetime


# ─── Extraction Models ───────────────────────────────────────────────────────

class ExtractedField(BaseModel):
    """Single extracted field with confidence."""
    value: str
    confidence: Literal["high", "medium", "low"]
    edited: bool = False
    edited_by: Optional[str] = None


class ExtractionDirector(BaseModel):
    """Director information from CTOS."""
    name: str
    id: str
    age: int
    share: str


class ExtractionBankingFacility(BaseModel):
    """Banking facility record."""
    bank: str
    facility: str
    limit: str
    outstanding: str
    status: str


class ExtractionFields(BaseModel):
    """All extracted fields from CTOS report."""
    company_name: ExtractedField
    reg_no: ExtractedField
    inc_date: ExtractedField
    address: ExtractedField
    nature_of_business: ExtractedField
    paid_up_capital: ExtractedField
    net_worth: ExtractedField
    litigation: ExtractedField
    litigation_amount: ExtractedField
    special_attention: ExtractedField
    bankruptcy: ExtractedField
    num_directors: ExtractedField
    directors: List[ExtractionDirector] = []
    banking_facilities: List[ExtractionBankingFacility] = []


class Extraction(BaseModel):
    """Extraction record."""
    id: str
    app_id: str
    raw_text: str
    fields: ExtractionFields
    mandatory_filled: int
    mandatory_total: int
    created_at: datetime


# ─── Score Models ────────────────────────────────────────────────────────────

class ScoreRuleFired(BaseModel):
    """Individual risk rule result."""
    rule: str
    weight: float
    score: float
    detail: str


class Score(BaseModel):
    """Risk score record."""
    id: str
    app_id: str
    total_score: float  # 0-1 range
    risk_category: Literal["Low", "Moderate", "High"]
    recommended_limit: float
    rules_fired: List[ScoreRuleFired]
    rationale: str  # Bahasa Malaysia
    rationale_english: str
    created_at: datetime


# ─── Decision Models ─────────────────────────────────────────────────────────

class DecisionInput(BaseModel):
    """Officer decision input."""
    approved: bool
    final_limit: float
    notes: str = ""


class Decision(BaseModel):
    """Credit decision record."""
    id: str
    app_id: str
    officer_id: str
    approved: bool
    final_limit: float
    notes: str
    created_at: datetime


# ─── Audit Log ───────────────────────────────────────────────────────────────

class AuditLog(BaseModel):
    """Audit trail entry."""
    id: str
    app_id: str
    action: str
    officer_id: str
    detail: str
    timestamp: datetime


# ─── LangGraph State ─────────────────────────────────────────────────────────

class AgentState(BaseModel):
    """LangGraph agent state."""
    # Inputs
    app_id: str
    pdf_url: str
    requested_limit: float
    customer_name: str
    
    # Extraction outputs
    fields: Optional[ExtractionFields] = None
    raw_text: str = ""
    mandatory_filled: int = 0
    mandatory_total: int = 14
    
    # Risk outputs
    rules: List[ScoreRuleFired] = []
    total_score: float = 0.0
    risk_category: str = "High"
    recommended_limit: float = 0.0
    
    # Decision outputs
    rationale: str = ""
    rationale_english: str = ""
    approved: bool = False
    final_limit: float = 0.0
    
    # Error handling
    error: Optional[str] = None


# ─── API Response Models ─────────────────────────────────────────────────────

class ApplicationDetail(Application):
    """Application with all related data."""
    extraction: Optional[Extraction] = None
    score: Optional[Score] = None
    decision: Optional[Decision] = None
    audit_logs: List[AuditLog] = []


class DashboardStats(BaseModel):
    """Dashboard statistics."""
    total_applications: int
    pending_review: int
    approved: int
    rejected: int
    avg_processing_time: float
    recent_applications: List[Application]


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    services: dict
    timestamp: datetime
