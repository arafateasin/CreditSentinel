"""LangGraph workflow for credit assessment."""
from typing import TypedDict, Annotated
from langgraph.graph import StateGraph, END
from agents.nodes import extract_node, risk_node, decision_node


# ─── State Definition ────────────────────────────────────────────────────────

class CreditAgentState(TypedDict):
    """State passed through the agent graph."""
    # Inputs
    app_id: str
    pdf_url: str
    requested_limit: float
    customer_name: str
    
    # Extraction outputs
    fields: dict
    raw_text: str
    mandatory_filled: int
    mandatory_total: int
    
    # Risk outputs
    rules: list
    total_score: float
    risk_category: str
    recommended_limit: float
    
    # Decision outputs
    rationale: str
    rationale_english: str
    approved: bool
    final_limit: float
    
    # Error handling
    error: str | None


# ─── Build Graph ─────────────────────────────────────────────────────────────

def create_credit_graph():
    """
    Build the LangGraph workflow:
    
    START → extract → risk → decision → END
    """
    workflow = StateGraph(CreditAgentState)
    
    # Add nodes
    workflow.add_node("extract", extract_node)
    workflow.add_node("risk", risk_node)
    workflow.add_node("decision", decision_node)
    
    # Add edges (sequential flow)
    workflow.set_entry_point("extract")
    workflow.add_edge("extract", "risk")
    workflow.add_edge("risk", "decision")
    workflow.add_edge("decision", END)
    
    # Compile graph
    return workflow.compile()


# Global compiled graph
credit_graph = create_credit_graph()


# ─── Run Agent ───────────────────────────────────────────────────────────────

async def run_credit_agent(
    app_id: str,
    pdf_url: str,
    requested_limit: float,
    customer_name: str
) -> dict:
    """
    Run the credit assessment agent workflow.
    
    Args:
        app_id: Application ID
        pdf_url: PDF URL from blob storage
        requested_limit: Customer's requested credit limit
        customer_name: Customer name
    
    Returns:
        Final agent state with all results
    """
    print(f"[AGENT] Starting workflow for {app_id}")
    
    # Initialize state
    initial_state = {
        "app_id": app_id,
        "pdf_url": pdf_url,
        "requested_limit": requested_limit,
        "customer_name": customer_name,
        "fields": {},
        "raw_text": "",
        "mandatory_filled": 0,
        "mandatory_total": 14,
        "rules": [],
        "total_score": 0.0,
        "risk_category": "High",
        "recommended_limit": 0.0,
        "rationale": "",
        "rationale_english": "",
        "approved": False,
        "final_limit": 0.0,
        "error": None,
    }
    
    # Run graph (async)
    final_state = await credit_graph.ainvoke(initial_state)
    
    print(f"[AGENT] Workflow completed for {app_id}")
    
    return final_state
