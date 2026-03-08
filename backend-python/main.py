"""FastAPI backend for Credit Sentinel - Malaysian SME Credit Assessment."""
import asyncio
from datetime import datetime
from typing import Optional
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Header, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from models.schemas import (
    Application,
    ApplicationDetail,
    ApplicationResponse,
    DashboardStats,
    DecisionInput,
    HealthResponse,
)
from services.blob import blob_service
from services.cosmos import cosmos_service
from agents.credit_graph import run_credit_agent
from utils.config import settings


# ─── Lifespan Context ────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    print("🚀 Credit Sentinel API starting...")
    yield
    print("👋 Credit Sentinel API shutting down...")


# ─── FastAPI App ─────────────────────────────────────────────────────────────

app = FastAPI(
    title="Credit Sentinel API",
    description="Autonomous Malaysian SME Credit Assessment with LangGraph",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://credit-sentinel-five.vercel.app",  # Vercel production
        "https://*.vercel.app",  # Vercel preview deployments
        "http://localhost:5000",  # Local development
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Authentication ──────────────────────────────────────────────────────────

def verify_token(authorization: Optional[str] = Header(None)) -> str:
    """Verify bearer token (demo implementation)."""
    if not authorization:
        # For demo: allow unauthenticated requests
        return "officer-demo"
    
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    token = authorization.replace("Bearer ", "")
    
    # Demo tokens
    valid_tokens = [settings.demo_auth_token, "demo", "credit-officer-token"]
    
    if token not in valid_tokens:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    return "officer-demo"


# ─── Background Agent Task ───────────────────────────────────────────────────

async def run_agent_background(
    app_id: str,
    pdf_url: str,
    requested_limit: float,
    customer_name: str
):
    """Run credit agent in background."""
    print(f"[BACKGROUND] Starting agent for app {app_id}")
    try:
        await run_credit_agent(
            app_id=app_id,
            pdf_url=pdf_url,
            requested_limit=requested_limit,
            customer_name=customer_name
        )
        print(f"[BACKGROUND] Agent completed for {app_id}")
    except Exception as e:
        print(f"[ERROR] Agent failed for {app_id}: {e}")
        import traceback
        traceback.print_exc()
        await cosmos_service.update_application(
            app_id,
            {"status": "error", "agent_stage": "failed"}
        )


# ─── Routes ──────────────────────────────────────────────────────────────────

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    try:
        # Test Cosmos DB
        await cosmos_service.list_applications(limit=1)
        cosmos_ok = True
    except:
        cosmos_ok = False
    
    return HealthResponse(
        status="healthy" if cosmos_ok else "degraded",
        services={
            "cosmos_db": "connected" if cosmos_ok else "error",
            "blob_storage": "ready",
            "document_intelligence": "ready",
            "langgraph": "ready"
        },
        timestamp=datetime.utcnow()
    )


@app.post("/api/applications", response_model=Application)
async def create_application(
    background_tasks: BackgroundTasks,
    pdf: UploadFile = File(...),
    customer_name: str = Form(...),
    requested_limit: float = Form(...),
    salesman: str = Form(...),
    authorization: Optional[str] = Header(None)
):
    """
    Create new credit application and start agent workflow.
    
    - Upload CTOS PDF
    - Create application record
    - Start LangGraph agent in background
    """
    officer_id = verify_token(authorization)
    
    # Validate PDF
    if not pdf.content_type == "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")
    
    # Read file
    pdf_data = await pdf.read()
    
    if len(pdf_data) > 15 * 1024 * 1024:  # 15 MB limit
        raise HTTPException(status_code=400, detail="PDF file too large (max 15MB)")
    
    # Upload to blob storage
    print(f"[UPLOAD] Received file: {pdf.filename}")
    blob_result = await blob_service.upload_pdf(pdf_data, pdf.filename or "document.pdf")
    
    # Create application record
    application = await cosmos_service.create_application(
        officer_id=officer_id,
        customer_name=customer_name,
        requested_limit=requested_limit,
        salesman=salesman,
        pdf_url=blob_result['url'],
        pdf_blob_name=blob_result['blob_name'],
        original_filename=pdf.filename or "CTOS_REPORT.pdf"
    )
    print(f"[UPLOAD] Stored with filename: {application.original_filename}")
    
    # Audit log
    await cosmos_service.add_audit_log(
        app_id=application.id,
        action="application_created",
        officer_id=officer_id,
        detail=f"Application created for {customer_name}"
    )
    
    # Start agent workflow in background
    print(f"[MAIN] Scheduling agent workflow for application {application.id}")
    background_tasks.add_task(
        run_agent_background,
        application.id,
        blob_result['url'],
        requested_limit,
        customer_name
    )
    print(f"[MAIN] Agent task scheduled for {application.id}")
    
    return application


@app.get("/api/applications", response_model=list[Application])
async def list_applications(
    limit: int = 50,
    status: Optional[str] = None,
    authorization: Optional[str] = Header(None)
):
    """List all applications with optional filters."""
    verify_token(authorization)
    
    applications = await cosmos_service.list_applications(limit=limit)
    
    # Filter by status if provided
    if status:
        applications = [app for app in applications if app.status == status]
    
    return applications


@app.get("/api/applications/{app_id}", response_model=ApplicationResponse)
async def get_application(
    app_id: str,
    authorization: Optional[str] = Header(None)
):
    """Get application details with extraction, score, and decision."""
    verify_token(authorization)
    
    # Get application
    app = await cosmos_service.get_application(app_id)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Get related data
    extraction = await cosmos_service.get_extraction_by_app(app_id)
    score = await cosmos_service.get_score_by_app(app_id)
    decision = await cosmos_service.get_decision_by_app(app_id)
    audit_logs = await cosmos_service.get_audit_logs(app_id)
    
    # Return nested structure that frontend expects
    return ApplicationResponse(
        app=app,
        extraction=extraction,
        score=score,
        decision=decision,
        audit_logs=audit_logs
    )


@app.post("/api/applications/{app_id}/retry")
async def retry_agent(
    app_id: str,
    background_tasks: BackgroundTasks,
    authorization: Optional[str] = Header(None)
):
    """Retry agent workflow if it was interrupted (e.g., on free-tier server shutdown)."""
    verify_token(authorization)
    
    # Get application
    app = await cosmos_service.get_application(app_id)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Only retry if in extracted/error state
    if app.status not in ["extracted", "error", "scoring"]:
        raise HTTPException(
            status_code=400, 
            detail=f"Cannot retry application in '{app.status}' status. Only 'extracted', 'scoring', or 'error' allowed."
        )
    
    # Schedule agent workflow in background
    print(f"[RETRY] Scheduling agent retry for application {app_id}")
    background_tasks.add_task(
        run_agent_background,
        app_id,
        app.pdf_url,
        app.requested_limit,
        app.customer_name
    )
    
    return {"message": "Agent workflow restarted", "app_id": app_id, "status": app.status}


@app.post("/api/applications/{app_id}/decide")
async def make_decision(
    app_id: str,
    decision_input: DecisionInput,
    authorization: Optional[str] = Header(None)
):
    """Officer makes final credit decision (for moderate risk cases)."""
    officer_id = verify_token(authorization)
    
    # Get application
    app = await cosmos_service.get_application(app_id)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Save decision
    decision = await cosmos_service.save_decision(
        app_id=app_id,
        officer_id=officer_id,
        approved=decision_input.approved,
        final_limit=decision_input.final_limit,
        notes=decision_input.notes
    )
    
    # Update application status
    await cosmos_service.update_application(
        app_id,
        {"status": "completed" if decision_input.approved else "rejected"}
    )
    
    # Audit log
    action = "decision_approved" if decision_input.approved else "decision_rejected"
    await cosmos_service.add_audit_log(
        app_id=app_id,
        action=action,
        officer_id=officer_id,
        detail=f"Officer {'approved' if decision_input.approved else 'rejected'} RM{decision_input.final_limit:,.0f}"
    )
    
    return decision


@app.get("/api/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    authorization: Optional[str] = Header(None)
):
    """Get dashboard statistics and metrics."""
    verify_token(authorization)
    
    # Get all applications
    all_apps = await cosmos_service.list_applications(limit=1000)
    
    # Calculate stats
    total = len(all_apps)
    pending_review = sum(1 for app in all_apps if app.status in ["extracted", "scored"])
    
    # Get decisions for approval count
    approved = 0
    rejected = 0
    
    for app in all_apps:
        decision = await cosmos_service.get_decision_by_app(app.id)
        if decision:
            if decision.approved:
                approved += 1
            else:
                rejected += 1
    
    # Recent applications (last 10)
    recent = all_apps[:10]
    
    # Average processing time (placeholder)
    avg_time = 28.5  # seconds
    
    return DashboardStats(
        total_applications=total,
        pending_review=pending_review,
        approved=approved,
        rejected=rejected,
        avg_processing_time=avg_time,
        recent_applications=recent
    )


@app.get("/api/history", response_model=list[ApplicationResponse])
async def get_history(
    authorization: Optional[str] = Header(None)
):
    """Get completed applications history."""
    verify_token(authorization)
    
    applications = await cosmos_service.list_applications(limit=100)
    
    # Filter completed applications
    completed = [app for app in applications if app.status in ["completed", "rejected"]]
    
    # Build full response for each
    result = []
    for app in completed:
        extraction = await cosmos_service.get_extraction_by_app(app.id)
        score = await cosmos_service.get_score_by_app(app.id)
        decision = await cosmos_service.get_decision_by_app(app.id)
        audit_logs = await cosmos_service.get_audit_logs(app.id)
        
        result.append(ApplicationResponse(
            app=app,
            extraction=extraction,
            score=score,
            decision=decision,
            audit_logs=audit_logs
        ))
    
    return result


@app.get("/api/agent-tasks")
async def get_agent_tasks(
    authorization: Optional[str] = Header(None)
):
    """Get current agent task queue status (demo implementation)."""
    verify_token(authorization)
    
    # Get recent applications
    applications = await cosmos_service.list_applications(limit=50)
    
    # Convert to task format
    tasks = []
    for app in applications:
        if app.status in ["extracting", "scoring"]:
            tasks.append({
                "app_id": app.id,
                "status": "running",
                "current_node": app.agent_stage,
                "progress": 50 if app.status == "scoring" else 25,
                "started_at": app.created_at.isoformat() if hasattr(app.created_at, 'isoformat') else str(app.created_at)
            })
        elif app.status == "completed":
            tasks.append({
                "app_id": app.id,
                "status": "completed",
                "current_node": "decision",
                "progress": 100,
                "started_at": app.created_at.isoformat() if hasattr(app.created_at, 'isoformat') else str(app.created_at)
            })
    
    return tasks


# ─── Root Endpoint ───────────────────────────────────────────────────────────

@app.get("/")
async def root():
    """API root endpoint."""
    return {
        "name": "Credit Sentinel API",
        "version": "1.0.0",
        "description": "Autonomous Malaysian SME Credit Assessment",
        "docs": "/docs",
        "health": "/health"
    }


# ─── Run Server ──────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.port,
        reload=settings.environment == "development"
    )
