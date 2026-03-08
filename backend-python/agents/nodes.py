"""LangGraph agent nodes for credit assessment workflow."""
import re
from typing import Dict, Any
from langchain_openai import AzureChatOpenAI
from langchain_core.messages import HumanMessage
from services.doc_intelligence import doc_intel_service
from services.cosmos import cosmos_service
from utils.config import settings


# Initialize Azure OpenAI
llm = AzureChatOpenAI(
    azure_endpoint=settings.azure_openai_endpoint,
    api_key=settings.azure_openai_key,
    api_version=settings.azure_openai_api_version,
    deployment_name=settings.azure_openai_deployment,
    temperature=0.3,
)


def mask_pii(text: str) -> str:
    """Mask personally identifiable information."""
    # Mask IC numbers (12-digit YYMMDD-PB-XXXX)
    text = re.sub(r'\b\d{6}-\d{2}-\d{4}\b', '██████-██-████', text)
    text = re.sub(r'\b\d{12}\b', '████████████', text)
    
    # Mask phone numbers
    text = re.sub(r'(\+60|0)\d[-\s]?\d{7,8}', lambda m: m.group(0)[:4] + 'XXXXX', text)
    
    # Mask email addresses
    text = re.sub(r'[\w.-]+@[\w.-]+\.\w{2,}', '█████@█████.com', text)
    
    return text


# ─── Node 1: Extract ─────────────────────────────────────────────────────────

async def extract_node(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Extract CTOS data from PDF using Document Intelligence.
    
    Updates: fields, raw_text, mandatory_filled, mandatory_total
    """
    print(f"[EXTRACT] Starting extraction for app {state['app_id']}")
    
    try:
        # Check if extraction already exists (for retry scenarios)
        existing_extraction = await cosmos_service.get_extraction_by_app(state['app_id'])
        
        if existing_extraction:
            print(f"[EXTRACT] Found existing extraction, reusing data")
            return {
                **state,
                "fields": existing_extraction.fields,
                "raw_text": existing_extraction.rawText,
                "mandatory_filled": existing_extraction.mandatoryFilled,
                "mandatory_total": existing_extraction.mandatoryTotal,
            }
        
        # Update status
        await cosmos_service.update_application(
            state['app_id'],
            {"status": "extracting", "agent_stage": "extract"}
        )
        
        # Extract from PDF
        result = await doc_intel_service.extract_ctos_pdf(state['pdf_url'])
        
        # Save extraction to database
        await cosmos_service.save_extraction(
            app_id=state['app_id'],
            raw_text=result['raw_text'],
            fields=result['fields'],
            mandatory_filled=result['mandatory_filled'],
            mandatory_total=result['mandatory_total']
        )
        
        # Update application status
        await cosmos_service.update_application(
            state['app_id'],
            {"status": "extracted", "agent_stage": "extract"}
        )
        
        # Audit log
        await cosmos_service.add_audit_log(
            app_id=state['app_id'],
            action="extraction_completed",
            officer_id="system",
            detail=f"Extracted {result['mandatory_filled']}/{result['mandatory_total']} mandatory fields"
        )
        
        print(f"[EXTRACT] Completed: {result['mandatory_filled']}/{result['mandatory_total']} fields")
        
        return {
            **state,
            "fields": result['fields'],
            "raw_text": result['raw_text'],
            "mandatory_filled": result['mandatory_filled'],
            "mandatory_total": result['mandatory_total'],
        }
    
    except Exception as e:
        print(f"[EXTRACT] Error: {e}")
        await cosmos_service.update_application(
            state['app_id'],
            {"status": "error", "agent_stage": "extract"}
        )
        return {**state, "error": str(e)}


# ─── Node 2: Risk Assessment ─────────────────────────────────────────────────

async def risk_node(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calculate risk score using 8 Malaysian SME rules.
    
    Updates: rules, total_score, risk_category, recommended_limit
    """
    print(f"[RISK] Starting risk assessment for app {state['app_id']}")
    
    if state.get('error'):
        return state
    
    try:
        # Update status
        await cosmos_service.update_application(
            state['app_id'],
            {"status": "scoring", "agent_stage": "risk"}
        )
        
        fields = state['fields']
        rules = []
        
        # Parse numeric values
        def parse_rm(value: str) -> float:
            """Parse RM values."""
            try:
                return float(re.sub(r'[RM,\s]', '', value))
            except:
                return 0.0
        
        net_worth = parse_rm(fields.get('net_worth', {}).get('value', '0'))
        paid_up = parse_rm(fields.get('paid_up_capital', {}).get('value', '0'))
        litigation_amt = parse_rm(fields.get('litigation_amount', {}).get('value', '0'))
        sa_accounts = int(fields.get('special_attention', {}).get('value', '0') or 0)
        bankruptcy = int(fields.get('bankruptcy', {}).get('value', '0') or 0)
        num_directors = int(fields.get('num_directors', {}).get('value', '1') or 1)
        
        # Rule 1: Net Worth (20%)
        if net_worth > 500000:
            r1_score = 10
            detail = f"Net worth RM{net_worth:,.0f} > RM500k"
        elif net_worth >= 100000:
            r1_score = 6
            detail = f"Net worth RM{net_worth:,.0f} between RM100k-500k"
        else:
            r1_score = 2
            detail = f"Net worth RM{net_worth:,.0f} < RM100k"
        
        rules.append({
            "rule": "Net Worth",
            "weight": 0.20,
            "score": r1_score,
            "detail": detail
        })
        
        # Rule 2: Banking Conduct (20%)
        if sa_accounts == 0:
            r2_score = 10
            detail = "No Special Attention accounts"
        elif sa_accounts <= 2:
            r2_score = 5
            detail = f"{sa_accounts} SA accounts (moderate risk)"
        else:
            r2_score = 0
            detail = f"{sa_accounts} SA accounts (high risk)"
        
        rules.append({
            "rule": "Banking Conduct",
            "weight": 0.20,
            "score": r2_score,
            "detail": detail
        })
        
        # Rule 3: Litigation (15%)
        if litigation_amt == 0:
            r3_score = 10
            detail = "No litigation"
        elif litigation_amt < 50000:
            r3_score = 5
            detail = f"Minor litigation RM{litigation_amt:,.0f}"
        else:
            r3_score = 0
            detail = f"Major litigation RM{litigation_amt:,.0f}"
        
        rules.append({
            "rule": "Litigation",
            "weight": 0.15,
            "score": r3_score,
            "detail": detail
        })
        
        # Rule 4: Director Age (10%)
        directors = fields.get('directors', [])
        if directors:
            avg_age = sum(d.get('age', 40) for d in directors) / len(directors)
            if 40 <= avg_age <= 60:
                r4_score = 10
                detail = f"Avg director age {avg_age:.0f} (optimal)"
            elif (30 <= avg_age < 40) or (60 < avg_age <= 70):
                r4_score = 5
                detail = f"Avg director age {avg_age:.0f} (moderate)"
            else:
                r4_score = 3
                detail = f"Avg director age {avg_age:.0f} (suboptimal)"
        else:
            r4_score = 5
            detail = "Director age unknown"
        
        rules.append({
            "rule": "Director Age",
            "weight": 0.10,
            "score": r4_score,
            "detail": detail
        })
        
        # Rule 5: Company Age (10%)
        inc_date = fields.get('inc_date', {}).get('value', '')
        # Simplified: assume if date exists, company is established
        if inc_date and inc_date != "Not Found":
            r5_score = 8
            detail = f"Incorporated {inc_date}"
        else:
            r5_score = 5
            detail = "Incorporation date unclear"
        
        rules.append({
            "rule": "Company Age",
            "weight": 0.10,
            "score": r5_score,
            "detail": detail
        })
        
        # Rule 6: Paid-Up Capital (10%)
        if paid_up > 1000000:
            r6_score = 10
            detail = f"Paid-up RM{paid_up:,.0f} > RM1M"
        elif paid_up >= 500000:
            r6_score = 6
            detail = f"Paid-up RM{paid_up:,.0f} between RM500k-1M"
        else:
            r6_score = 3
            detail = f"Paid-up RM{paid_up:,.0f} < RM500k"
        
        rules.append({
            "rule": "Paid-Up Capital",
            "weight": 0.10,
            "score": r6_score,
            "detail": detail
        })
        
        # Rule 7: Director Shareholding (8%)
        if directors:
            max_share = max(
                float(re.sub(r'[%\s]', '', d.get('share', '0'))) 
                for d in directors
            )
            if max_share > 50:
                r7_score = 10
                detail = f"Majority stake {max_share}%"
            elif max_share >= 25:
                r7_score = 6
                detail = f"Significant stake {max_share}%"
            else:
                r7_score = 3
                detail = f"Minor stake {max_share}%"
        else:
            r7_score = 5
            detail = "Shareholding unknown"
        
        rules.append({
            "rule": "Director Shareholding",
            "weight": 0.08,
            "score": r7_score,
            "detail": detail
        })
        
        # Rule 8: Bankruptcy (7%)
        if bankruptcy == 0:
            r8_score = 10
            detail = "No bankruptcy records"
        else:
            r8_score = 0
            detail = f"{bankruptcy} bankruptcy record(s)"
        
        rules.append({
            "rule": "Bankruptcy",
            "weight": 0.07,
            "score": r8_score,
            "detail": detail
        })
        
        # Calculate weighted score (0-1 scale)
        total_score = sum(rule['score'] * rule['weight'] for rule in rules) / 10.0
        
        # Determine risk category
        if total_score >= 0.7:
            risk_category = "Low"
            recommended_limit = min(net_worth * 0.5, 250000)
        elif total_score >= 0.4:
            risk_category = "Moderate"
            recommended_limit = net_worth * 0.3
        else:
            risk_category = "High"
            recommended_limit = 0
        
        # Update status
        await cosmos_service.update_application(
            state['app_id'],
            {"status": "scored", "agent_stage": "risk"}
        )
        
        print(f"[RISK] Score: {total_score:.2f}, Category: {risk_category}, Limit: RM{recommended_limit:,.0f}")
        
        return {
            **state,
            "rules": rules,
            "total_score": total_score,
            "risk_category": risk_category,
            "recommended_limit": recommended_limit,
        }
    
    except Exception as e:
        print(f"[RISK] Error: {e}")
        return {**state, "error": str(e)}


# ─── Node 3: Decision ────────────────────────────────────────────────────────

async def decision_node(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generate bilingual decision rationale using GPT-4o.
    
    Updates: rationale, rationale_english, approved, final_limit
    """
    print(f"[DECISION] Generating rationale for app {state['app_id']}")
    
    if state.get('error'):
        return state
    
    try:
        score = state['total_score']
        category = state['risk_category']
        limit = state['recommended_limit']
        rules = state['rules']
        customer = state['customer_name']
        
        # Build rules summary
        rules_text = "\n".join([
            f"- {r['rule']}: {r['score']}/10 ({r['detail']})"
            for r in rules
        ])
        
        # Generate bilingual rationale
        prompt = f"""Anda adalah pegawai kredit bank Malaysia. Buat keputusan kredit untuk:

Pelanggan: {customer}
Skor Risiko: {score:.2f} ({category})
Had Cadangan: RM{limit:,.0f}

Peraturan Penilaian:
{rules_text}

TUGAS:
1. Tulis rasional keputusan dalam Bahasa Malaysia (2-3 ayat)
2. Tulis rasional yang sama dalam English (2-3 sentences)
3. Nyatakan keputusan: Lulus/Tolak

Format:
[BM] <rasional dalam BM>
[EN] <rationale in English>
[DECISION] Approve/Reject
"""
        
        response = llm.invoke([HumanMessage(content=prompt)])
        output = response.content
        
        # Parse response
        bm_match = re.search(r'\[BM\](.*?)\[EN\]', output, re.DOTALL)
        en_match = re.search(r'\[EN\](.*?)\[DECISION\]', output, re.DOTALL)
        decision_match = re.search(r'\[DECISION\]\s*(Approve|Reject)', output, re.IGNORECASE)
        
        rationale_bm = mask_pii(bm_match.group(1).strip() if bm_match else "Keputusan tertunda")
        rationale_en = mask_pii(en_match.group(1).strip() if en_match else "Decision pending")
        approved = decision_match and decision_match.group(1).lower() == "approve"
        
        # Auto-approve/reject based on score
        if score >= 0.7:
            approved = True
            final_limit = limit
        elif score < 0.4:
            approved = False
            final_limit = 0
        else:
            # Moderate: requires officer review
            approved = False  # Pending
            final_limit = limit
        
        # Save score to database
        await cosmos_service.save_score(
            app_id=state['app_id'],
            total_score=score,
            risk_category=category,
            recommended_limit=limit,
            rules_fired=rules,
            rationale=rationale_bm,
            rationale_english=rationale_en
        )
        
        # Update application status
        await cosmos_service.update_application(
            state['app_id'],
            {"status": "completed", "agent_stage": "decision"}
        )
        
        # Audit log
        await cosmos_service.add_audit_log(
            app_id=state['app_id'],
            action="decision_generated",
            officer_id="system",
            detail=f"Score {score:.2f}, {'Approved' if approved else 'Pending Review'} RM{final_limit:,.0f}"
        )
        
        print(f"[DECISION] {'Approved' if approved else 'Pending'} RM{final_limit:,.0f}")
        
        return {
            **state,
            "rationale": rationale_bm,
            "rationale_english": rationale_en,
            "approved": approved,
            "final_limit": final_limit,
        }
    
    except Exception as e:
        print(f"[DECISION] Error: {e}")
        return {**state, "error": str(e)}
