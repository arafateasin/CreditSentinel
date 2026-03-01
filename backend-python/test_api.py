"""Test script for Credit Sentinel API."""
import asyncio
import httpx
from pathlib import Path

BASE_URL = "http://localhost:8000"
AUTH_TOKEN = "credit-officer-token"


async def test_health():
    """Test health endpoint."""
    print("🏥 Testing /health endpoint...")
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{BASE_URL}/health")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        print()


async def test_create_application():
    """Test application creation (requires PDF file)."""
    print("📄 Testing POST /api/applications...")
    
    # You need to provide a test PDF file
    pdf_path = Path("test-ctos.pdf")
    
    if not pdf_path.exists():
        print("❌ test-ctos.pdf not found. Skipping...")
        print()
        return None
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        with open(pdf_path, "rb") as pdf_file:
            files = {"pdf": ("test-ctos.pdf", pdf_file, "application/pdf")}
            data = {
                "customer_name": "AHMAD BIN ALI",
                "requested_limit": "100000",
                "salesman": "John Doe"
            }
            headers = {"Authorization": f"Bearer {AUTH_TOKEN}"}
            
            response = await client.post(
                f"{BASE_URL}/api/applications",
                files=files,
                data=data,
                headers=headers
            )
            
            print(f"Status: {response.status_code}")
            if response.status_code == 200:
                result = response.json()
                print(f"Created application: {result['id']}")
                print(f"Customer: {result['customer_name']}")
                print(f"Status: {result['status']}")
                print()
                return result['id']
            else:
                print(f"Error: {response.text}")
                print()
                return None


async def test_list_applications():
    """Test listing applications."""
    print("📋 Testing GET /api/applications...")
    async with httpx.AsyncClient() as client:
        headers = {"Authorization": f"Bearer {AUTH_TOKEN}"}
        response = await client.get(
            f"{BASE_URL}/api/applications",
            headers=headers
        )
        
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            apps = response.json()
            print(f"Found {len(apps)} applications")
            if apps:
                print(f"Latest: {apps[0]['customer_name']} - {apps[0]['status']}")
        print()


async def test_get_application(app_id: str):
    """Test getting application details."""
    print(f"🔍 Testing GET /api/applications/{app_id}...")
    async with httpx.AsyncClient() as client:
        headers = {"Authorization": f"Bearer {AUTH_TOKEN}"}
        response = await client.get(
            f"{BASE_URL}/api/applications/{app_id}",
            headers=headers
        )
        
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            app = response.json()
            print(f"Customer: {app['customer_name']}")
            print(f"Status: {app['status']}")
            print(f"Agent Stage: {app['agent_stage']}")
            if app.get('score'):
                print(f"Score: {app['score']['total_score']:.2f}")
                print(f"Risk: {app['score']['risk_category']}")
                print(f"Limit: RM{app['score']['recommended_limit']:,.0f}")
        print()


async def test_dashboard_stats():
    """Test dashboard statistics."""
    print("📊 Testing GET /api/dashboard/stats...")
    async with httpx.AsyncClient() as client:
        headers = {"Authorization": f"Bearer {AUTH_TOKEN}"}
        response = await client.get(
            f"{BASE_URL}/api/dashboard/stats",
            headers=headers
        )
        
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            stats = response.json()
            print(f"Total Applications: {stats['total_applications']}")
            print(f"Pending Review: {stats['pending_review']}")
            print(f"Approved: {stats['approved']}")
            print(f"Rejected: {stats['rejected']}")
            print(f"Avg Processing Time: {stats['avg_processing_time']}s")
        print()


async def main():
    """Run all tests."""
    print("🧪 Starting Credit Sentinel API Tests\n")
    print(f"Base URL: {BASE_URL}\n")
    print("=" * 50)
    print()
    
    # Test health
    await test_health()
    
    # Test list applications
    await test_list_applications()
    
    # Test create application (optional, requires PDF)
    app_id = await test_create_application()
    
    # Wait a bit for agent to process
    if app_id:
        print("⏳ Waiting 10 seconds for agent to process...")
        await asyncio.sleep(10)
        
        # Test get application details
        await test_get_application(app_id)
    
    # Test dashboard stats
    await test_dashboard_stats()
    
    print("=" * 50)
    print("✅ Tests completed!")


if __name__ == "__main__":
    asyncio.run(main())
