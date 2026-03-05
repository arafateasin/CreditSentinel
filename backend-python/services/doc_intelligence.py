"""Azure Document Intelligence service for PDF extraction."""
import re
import json
from typing import Dict, Any, List
from azure.ai.formrecognizer import DocumentAnalysisClient
from azure.core.credentials import AzureKeyCredential
from langchain_openai import AzureChatOpenAI
from langchain_core.messages import HumanMessage
from utils.config import settings
from models.schemas import ExtractedField, ExtractionFields, ExtractionDirector, ExtractionBankingFacility


class DocumentIntelligenceService:
    """Handles PDF extraction using Azure Document Intelligence."""
    
    def __init__(self):
        self.endpoint = settings.doc_intel_endpoint
        self.key = settings.doc_intel_key
        
        # Initialize Document Intelligence client
        self.client = DocumentAnalysisClient(
            endpoint=self.endpoint,
            credential=AzureKeyCredential(self.key)
        )
        
        # Initialize Azure OpenAI for intelligent extraction
        self.llm = AzureChatOpenAI(
            azure_endpoint=settings.azure_openai_endpoint,
            api_key=settings.azure_openai_key,
            api_version=settings.azure_openai_api_version,
            deployment_name=settings.azure_openai_deployment,
            temperature=0.1,
        )
    
    def _confidence_level(self, score: float) -> str:
        """Convert confidence score to level."""
        if score >= 0.8:
            return "high"
        elif score >= 0.5:
            return "medium"
        return "low"
    
    def _extract_field(self, text: str, pattern: str, default: str = "Not Found") -> ExtractedField:
        """Extract field using regex pattern."""
        match = re.search(pattern, text, re.IGNORECASE)
        value = match.group(1).strip() if match else default
        confidence = "high" if match else "low"
        
        return ExtractedField(value=value, confidence=confidence)
    
    def _parse_directors(self, text: str) -> List[ExtractionDirector]:
        """Extract director information from text."""
        directors = []
        
        # Pattern: Name | IC | Age | Share%
        director_pattern = r"([A-Z\s]+)\s*\|\s*(\d{6}-\d{2}-\d{4})\s*\|\s*(\d+)\s*\|\s*([\d.]+%)"
        matches = re.findall(director_pattern, text)
        
        for match in matches:
            directors.append(ExtractionDirector(
                name=match[0].strip(),
                id=match[1].strip(),
                age=int(match[2]),
                share=match[3].strip()
            ))
        
        return directors
    
    def _parse_banking_facilities(self, text: str) -> List[ExtractionBankingFacility]:
        """Extract banking facility information."""
        facilities = []
        
        # Pattern: Bank | Facility | Limit | Outstanding | Status
        facility_pattern = r"([A-Z\s&]+)\s*\|\s*([A-Z\s]+)\s*\|\s*(RM[\d,]+)\s*\|\s*(RM[\d,]+)\s*\|\s*([A-Z]+)"
        matches = re.findall(facility_pattern, text)
        
        for match in matches:
            facilities.append(ExtractionBankingFacility(
                bank=match[0].strip(),
                facility=match[1].strip(),
                limit=match[2].strip(),
                outstanding=match[3].strip(),
                status=match[4].strip()
            ))
        
        return facilities
    
    async def _extract_fields_with_llm(self, raw_text: str) -> ExtractionFields:
        """Use GPT-4 to intelligently extract fields from CTOS report."""
        prompt = f"""You are analyzing a Malaysian CTOS credit report. Extract the following fields from the text.
Return ONLY a valid JSON object with these exact keys (use "Not Found" if data is missing):

{{
  "company_name": {{"value": "...", "confidence": "high|medium|low"}},
  "reg_no": {{"value": "...", "confidence": "high|medium|low"}},
  "inc_date": {{"value": "...", "confidence": "high|medium|low"}},
  "address": {{"value": "...", "confidence": "high|medium|low"}},
  "nature_of_business": {{"value": "...", "confidence": "high|medium|low"}},
  "paid_up_capital": {{"value": "RM ...", "confidence": "high|medium|low"}},
  "net_worth": {{"value": "RM ...", "confidence": "high|medium|low"}},
  "litigation": {{"value": "0", "confidence": "high|medium|low"}},
  "litigation_amount": {{"value": "RM 0", "confidence": "high|medium|low"}},
  "special_attention": {{"value": "0", "confidence": "high|medium|low"}},
  "bankruptcy": {{"value": "0", "confidence": "high|medium|low"}},
  "num_directors": {{"value": "0", "confidence": "high|medium|low"}},
  "directors": [
    {{"name": "DIRECTOR NAME", "id": "IC_NUMBER", "age": 45, "share": "50%"}}
  ],
  "banking_facilities": [
    {{"bank": "BANK NAME", "facility": "TYPE", "limit": "RM 0", "outstanding": "RM 0", "status": "Active"}}
  ]
}}

IMPORTANT: 
- For directors array, each object MUST have: name (string), id (IC number), age (number), share (percentage string)
- For banking_facilities array, each object MUST have: bank (string), facility (string), limit (string), outstanding (string), status (string)
- If no directors or banking facilities found, return empty arrays []

CTOS Report Text:
{raw_text[:8000]}

Return only the JSON object, no other text."""

        try:
            response = self.llm.invoke([HumanMessage(content=prompt)])
            result_text = response.content.strip()
            
            # Remove markdown code blocks if present
            if result_text.startswith("```"):
                result_text = result_text.split("```")[1]
                if result_text.startswith("json"):
                    result_text = result_text[4:]
                result_text = result_text.strip()
            
            data = json.loads(result_text)
            
            # Convert to ExtractedField objects
            return ExtractionFields(
                company_name=ExtractedField(**data.get("company_name", {"value": "Not Found", "confidence": "low"})),
                reg_no=ExtractedField(**data.get("reg_no", {"value": "Not Found", "confidence": "low"})),
                inc_date=ExtractedField(**data.get("inc_date", {"value": "Not Found", "confidence": "low"})),
                address=ExtractedField(**data.get("address", {"value": "Not Found", "confidence": "low"})),
                nature_of_business=ExtractedField(**data.get("nature_of_business", {"value": "Not Found", "confidence": "low"})),
                paid_up_capital=ExtractedField(**data.get("paid_up_capital", {"value": "Not Found", "confidence": "low"})),
                net_worth=ExtractedField(**data.get("net_worth", {"value": "Not Found", "confidence": "low"})),
                litigation=ExtractedField(**data.get("litigation", {"value": "0", "confidence": "low"})),
                litigation_amount=ExtractedField(**data.get("litigation_amount", {"value": "RM 0", "confidence": "low"})),
                special_attention=ExtractedField(**data.get("special_attention", {"value": "0", "confidence": "low"})),
                bankruptcy=ExtractedField(**data.get("bankruptcy", {"value": "0", "confidence": "low"})),
                num_directors=ExtractedField(**data.get("num_directors", {"value": "0", "confidence": "low"})),
                directors=data.get("directors", []),
                banking_facilities=data.get("banking_facilities", [])
            )
        except Exception as e:
            print(f"[DOC_INTEL] LLM extraction error: {e}")
            # Return empty fields on error
            return ExtractionFields(
                company_name=ExtractedField(value="Not Found", confidence="low"),
                reg_no=ExtractedField(value="Not Found", confidence="low"),
                inc_date=ExtractedField(value="Not Found", confidence="low"),
                address=ExtractedField(value="Not Found", confidence="low"),
                nature_of_business=ExtractedField(value="Not Found", confidence="low"),
                paid_up_capital=ExtractedField(value="Not Found", confidence="low"),
                net_worth=ExtractedField(value="Not Found", confidence="low"),
                litigation=ExtractedField(value="0", confidence="low"),
                litigation_amount=ExtractedField(value="RM 0", confidence="low"),
                special_attention=ExtractedField(value="0", confidence="low"),
                bankruptcy=ExtractedField(value="0", confidence="low"),
                num_directors=ExtractedField(value="0", confidence="low"),
                directors=[],
                banking_facilities=[]
            )

    
    async def extract_ctos_pdf(self, pdf_url: str) -> Dict[str, Any]:
        """
        Extract CTOS report data from PDF URL.
        
        Args:
            pdf_url: Public URL to PDF file
        
        Returns:
            dict with raw_text, fields, mandatory_filled, mandatory_total
        """
        print(f"[DOC_INTEL] Starting analysis of PDF: {pdf_url[:80]}...{pdf_url[-40:]}")
        
        # Start analysis
        poller = self.client.begin_analyze_document_from_url(
            "prebuilt-document",  # Use prebuilt model for general documents
            pdf_url
        )
        
        print(f"[DOC_INTEL] Waiting for analysis to complete...")
        result = poller.result()
        print(f"[DOC_INTEL] Analysis complete. Pages: {len(result.pages)}")
        
        # Extract full text
        raw_text = ""
        for page in result.pages:
            for line in page.lines:
                raw_text += line.content + "\n"
        
        print(f"[DOC_INTEL] Extracted {len(raw_text)} characters of text")
        print(f"[DOC_INTEL] Using GPT-4 to extract fields intelligently...")
        
        # Use LLM to extract fields intelligently
        fields = await self._extract_fields_with_llm(raw_text)
        
        # Count mandatory fields filled
        mandatory_fields = [
            fields.company_name,
            fields.reg_no,
            fields.inc_date,
            fields.address,
            fields.nature_of_business,
            fields.paid_up_capital,
            fields.net_worth,
            fields.litigation,
            fields.litigation_amount,
            fields.special_attention,
            fields.bankruptcy,
            fields.num_directors,
        ]
        
        mandatory_filled = sum(
            1 for field in mandatory_fields
            if field.value != "Not Found" and field.confidence != "low"
        )
        mandatory_total = len(mandatory_fields)
        
        return {
            "raw_text": raw_text,
            "fields": fields.dict(),
            "mandatory_filled": mandatory_filled,
            "mandatory_total": mandatory_total,
        }


# Global instance
doc_intel_service = DocumentIntelligenceService()
