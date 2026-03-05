"""Quick test to verify GPT-4 extraction is working."""
import asyncio
from services.doc_intelligence import doc_intel_service

# Sample CTOS text (truncated for testing)
sample_text = """
CTOS DATA SYSTEMS SDN BHD
COMPANY CREDIT REPORT

Company Name: ABC TRADING SDN BHD
Registration No: 201501012345
Incorporation Date: 15/01/2015
Registered Address: No. 123, Jalan Merdeka, 50100 Kuala Lumpur
Nature of Business: Wholesale Trading

FINANCIAL INFORMATION
Paid-Up Capital: RM500,000
Net Worth: RM1,200,000

RISK INDICATORS
Active Litigation: 0
Litigation Amount: RM0
Special Attention Accounts: 0
Bankruptcy: 0

DIRECTORS
Number of Directors: 2
"""

async def test_extraction():
    """Test the LLM extraction function."""
    print("🧪 Testing GPT-4 Field Extraction\n")
    print("=" * 60)
    
    try:
        # Test the new LLM extraction method
        fields = await doc_intel_service._extract_fields_with_llm(sample_text)
        
        print(f"\n✅ Extraction Successful!\n")
        print(f"Company Name: {fields.company_name.value} ({fields.company_name.confidence})")
        print(f"Reg No: {fields.reg_no.value} ({fields.reg_no.confidence})")
        print(f"Inc Date: {fields.inc_date.value} ({fields.inc_date.confidence})")
        print(f"Address: {fields.address.value[:50]}... ({fields.address.confidence})")
        print(f"Business: {fields.nature_of_business.value} ({fields.nature_of_business.confidence})")
        print(f"Paid-up Capital: {fields.paid_up_capital.value} ({fields.paid_up_capital.confidence})")
        print(f"Net Worth: {fields.net_worth.value} ({fields.net_worth.confidence})")
        print(f"Litigation: {fields.litigation.value} ({fields.litigation.confidence})")
        print(f"Directors: {fields.num_directors.value} ({fields.num_directors.confidence})")
        
        # Count high confidence fields
        high_conf = sum(1 for f in [
            fields.company_name, fields.reg_no, fields.inc_date, fields.address,
            fields.nature_of_business, fields.paid_up_capital, fields.net_worth,
            fields.litigation, fields.num_directors
        ] if f.confidence == "high")
        
        print(f"\n📊 High Confidence Fields: {high_conf}/9")
        
        if high_conf >= 7:
            print("✅ GPT-4 extraction is working well!")
        else:
            print("⚠️  Extraction working but confidence is low")
            
    except Exception as e:
        print(f"❌ Extraction Failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_extraction())
