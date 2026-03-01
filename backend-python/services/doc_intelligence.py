"""Azure Document Intelligence service for PDF extraction."""
import re
from typing import Dict, Any, List
from azure.ai.formrecognizer import DocumentAnalysisClient
from azure.core.credentials import AzureKeyCredential
from utils.config import settings
from models.schemas import ExtractedField, ExtractionFields, ExtractionDirector, ExtractionBankingFacility


class DocumentIntelligenceService:
    """Handles PDF extraction using Azure Document Intelligence."""
    
    def __init__(self):
        self.endpoint = settings.doc_intel_endpoint
        self.key = settings.doc_intel_key
        
        # Initialize client
        self.client = DocumentAnalysisClient(
            endpoint=self.endpoint,
            credential=AzureKeyCredential(self.key)
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
    
    async def extract_ctos_pdf(self, pdf_url: str) -> Dict[str, Any]:
        """
        Extract CTOS report data from PDF URL.
        
        Args:
            pdf_url: Public URL to PDF file
        
        Returns:
            dict with raw_text, fields, mandatory_filled, mandatory_total
        """
        # Start analysis
        poller = self.client.begin_analyze_document_from_url(
            "prebuilt-document",  # Use prebuilt model for general documents
            pdf_url
        )
        
        result = poller.result()
        
        # Extract full text
        raw_text = ""
        for page in result.pages:
            for line in page.lines:
                raw_text += line.content + "\n"
        
        # Extract mandatory fields using patterns
        fields = ExtractionFields(
            company_name=self._extract_field(
                raw_text,
                r"(?:Company Name|COMPANY NAME|Nama Syarikat):\s*(.+)"
            ),
            reg_no=self._extract_field(
                raw_text,
                r"(?:Registration No|REG NO|No Pendaftaran):\s*([\dA-Z-]+)"
            ),
            inc_date=self._extract_field(
                raw_text,
                r"(?:Incorporation Date|Date of Incorporation|Tarikh Penubuhan):\s*([\d/-]+)"
            ),
            address=self._extract_field(
                raw_text,
                r"(?:Registered Address|ADDRESS|Alamat Berdaftar):\s*(.+?)(?:\n|$)"
            ),
            nature_of_business=self._extract_field(
                raw_text,
                r"(?:Nature of Business|Business Activity|Jenis Perniagaan):\s*(.+)"
            ),
            paid_up_capital=self._extract_field(
                raw_text,
                r"(?:Paid[- ]Up Capital|PAID UP CAPITAL|Modal Berbayar):\s*(RM[\d,]+)"
            ),
            net_worth=self._extract_field(
                raw_text,
                r"(?:Net Worth|NET WORTH|Nilai Bersih):\s*(RM[\d,]+)"
            ),
            litigation=self._extract_field(
                raw_text,
                r"(?:Litigation|LITIGATION|Litigasi):\s*(\d+)"
            ),
            litigation_amount=self._extract_field(
                raw_text,
                r"(?:Litigation Amount|Total Litigation|Jumlah Litigasi):\s*(RM[\d,]+)"
            ),
            special_attention=self._extract_field(
                raw_text,
                r"(?:Special Attention|SA Account|Akaun SA):\s*(\d+)"
            ),
            bankruptcy=self._extract_field(
                raw_text,
                r"(?:Bankruptcy|BANKRUPTCY|Kebankrapan):\s*(\d+)"
            ),
            num_directors=self._extract_field(
                raw_text,
                r"(?:Number of Directors|Total Directors|Bilangan Pengarah):\s*(\d+)"
            ),
            directors=self._parse_directors(raw_text),
            banking_facilities=self._parse_banking_facilities(raw_text)
        )
        
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
