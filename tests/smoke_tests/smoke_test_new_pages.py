import requests
import sys

BASE_URL = "https://127.0.0.1/api"  # nginx routes this to the active backend (tesc-backend-1)

def run_smoke_test():
    global BASE_URL
    print("🚀 Starting Smoke Test for New Analytics & Placements Pages...")
    requests.packages.urllib3.disable_warnings()

    # 1. Login to get JWT Token
    login_url = f"{BASE_URL}/users/token/"
    payload = {
        "email": "admin@scalareye.com",
        "password": "Admin123!"
    }
    
    print(f"Authenticating as admin@scalareye.com...")
    try:
        response = requests.post(login_url, json=payload, verify=False, timeout=10)
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        print("Retrying with http://127.0.0.1/api...")
        try:
            response = requests.post("http://127.0.0.1/api/users/token/", json=payload, timeout=10)
            BASE_URL = "http://127.0.0.1/api"
        except Exception as e2:
            print(f"❌ Fallback failed: {e2}")
            sys.exit(1)

    if response.status_code != 200:
        print(f"❌ Authentication failed with status {response.status_code}")
        print(response.text)
        sys.exit(1)
        
    tokens = response.json()
    access_token = tokens.get("access")
    if not access_token:
        print("❌ Access token missing in response")
        sys.exit(1)
    
    print("✅ Authenticated successfully.")
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    # Endpoints to test (GET requests)
    get_endpoints = [
        ("STEM Students", "/academic/students/stem-students/"),
        ("Specialized Students", "/academic/students/specialized-students/"),
        ("Critical Students", "/academic/students/critical-students/"),
        ("Inclusivity Report", "/academic/students/inclusivity-report/"),
        ("Possible Graduates", "/academic/students/possible-graduates/"),
        ("In-Country Transfers", "/academic/students/in-country-transfers/"),
    ]
    
    success = True
    
    print("\n--- Testing GET Endpoints for New Pages ---")
    for name, path in get_endpoints:
        url = f"{BASE_URL}{path}"
        print(f"Testing {name} ({url})...")
        try:
            res = requests.get(url, headers=headers, verify=False, timeout=10)
            if res.status_code == 200:
                print(f"  ✅ {name}: 200 OK (returned {len(res.json().get('results', []))} records)")
            else:
                print(f"  ❌ {name}: Failed with status {res.status_code}")
                print(f"     Response: {res.text[:200]}")
                success = False
        except Exception as e:
            print(f"  ❌ {name}: Connection error: {e}")
            success = False
            
    # Test Placement Dynamic Preview Endpoint (POST request)
    print("\n--- Testing POST Placements Preview Endpoint ---")
    placements_url = f"{BASE_URL}/v1/reports/dynamic/preview/"
    placements_payload = {
        "report_type": "placements",
        "filters": {},
        "columns": ["student_id_number", "student_name", "placement_type", "company_name", "gender"]
    }
    print(f"Testing Placements Preview ({placements_url}) with schema-compliant columns...")
    try:
        res = requests.post(placements_url, json=placements_payload, headers=headers, verify=False, timeout=10)
        if res.status_code == 200:
            print("  ✅ Placements Preview: 200 OK")
            print(f"     Metrics: {res.json().get('metrics')}")
        else:
            print(f"  ❌ Placements Preview: Failed with status {res.status_code}")
            print(f"     Response: {res.text[:200]}")
            success = False
    except Exception as e:
        print(f"  ❌ Placements Preview: Connection error: {e}")
        success = False
        
    if success:
        print("\n🎉 ALL SMOKE TESTS PASSED SUCCESSFULLY!")
    else:
        print("\n🚨 SOME SMOKE TESTS FAILED!")
        sys.exit(1)

if __name__ == "__main__":
    run_smoke_test()
