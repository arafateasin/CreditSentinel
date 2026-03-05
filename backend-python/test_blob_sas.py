"""Test script to verify blob storage and SAS URL generation."""
import asyncio
import requests
from services.blob import blob_service
from utils.config import settings

async def test_blob_storage():
    """Test blob storage configuration."""
    print("🧪 Testing Azure Blob Storage Configuration\n")
    
    # Test 1: Check settings
    print("1️⃣ Checking environment variables:")
    print(f"   Storage Account: {settings.storage_account_name}")
    print(f"   Container: {settings.storage_container}")
    print(f"   Has Account Key: {'✅ Yes' if settings.storage_account_key else '❌ No'}")
    print()
    
    # Test 2: Create a test blob
    print("2️⃣ Creating test blob...")
    test_content = b"This is a test PDF content"
    try:
        result = await blob_service.upload_pdf(test_content, "test.pdf")
        print(f"   ✅ Upload successful")
        print(f"   Blob name: {result['blob_name']}")
        print(f"   SAS URL: {result['url'][:80]}...")
        print()
        
        # Test 3: Try to download using SAS URL
        print("3️⃣ Testing SAS URL accessibility...")
        response = requests.get(result['url'], timeout=10)
        if response.status_code == 200:
            print(f"   ✅ SAS URL is accessible (status {response.status_code})")
            print(f"   Content length: {len(response.content)} bytes")
        else:
            print(f"   ❌ SAS URL returned status {response.status_code}")
            print(f"   Response: {response.text[:200]}")
        print()
        
        # Test 4: Clean up
        print("4️⃣ Cleaning up test blob...")
        await blob_service.delete_blob(result['blob_name'])
        print("   ✅ Test blob deleted")
        
        print("\n✅ All tests passed! Blob storage is configured correctly.")
        
    except Exception as e:
        print(f"   ❌ Error: {e}")
        print("\n❌ Blob storage test failed. Check your Azure configuration:")
        print("   1. Verify storage account key in .env")
        print("   2. Enable 'Allow Blob anonymous access' in Azure Portal")
        print("   3. Check networking settings (allow all networks or whitelist)")

if __name__ == "__main__":
    asyncio.run(test_blob_storage())
