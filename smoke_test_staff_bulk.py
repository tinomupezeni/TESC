import requests
import sys
import uuid

# Disable insecure request warnings for verify=False
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

BASE_URL = "http://localhost:8000/api"
ADMIN_EMAIL = "admin@scalareye.com"
ADMIN_PASSWORD = "scalareye@123"

def smoke_test_staff_bulk():
    print("🚀 Starting Smoke Test for Staff Bulk Delete...")

    # 1. Login
    print(f"--- Logging in as {ADMIN_EMAIL} ---")
    login_payload = {
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    }
    
    # Try different login endpoints
    try:
        login_response = requests.post(f"{BASE_URL}/users/token/", json=login_payload, verify=False)
        if login_response.status_code != 200:
            # Try instauth login if users/token fails
            login_response = requests.post(f"{BASE_URL}/instauth/login/", json={"username": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, verify=False)
    except Exception as e:
        print(f"❌ Login connection failed: {e}")
        sys.exit(1)
    
    if login_response.status_code != 200:
        print(f"❌ Login failed: {login_response.status_code}")
        print(login_response.text)
        sys.exit(1)

    login_data = login_response.json()
    # Handle different response formats
    access_token = login_data.get("access") or login_data.get("tokens", {}).get("access")
    if not access_token:
        print("❌ Access token not found in login response.")
        sys.exit(1)
        
    headers = {"Authorization": f"Bearer {access_token}"}
    print(f"✅ Logged in successfully.")

    # Get institution
    inst_res = requests.get(f"{BASE_URL}/academic/institutions/", headers=headers, verify=False)
    inst_data = inst_res.json()
    
    # Handle both list and paginated response
    if isinstance(inst_data, dict) and 'results' in inst_data:
        institutions = inst_data['results']
    else:
        institutions = inst_data
        
    if not institutions:
        print("❌ No institutions found.")
        sys.exit(1)
        
    institution_id = institutions[0]["id"]
    print(f"Using Institution ID: {institution_id}")

    # 2. Create multiple staff members
    staff_ids = []
    for i in range(3):
        emp_id = f"EMP{uuid.uuid4().hex[:6].upper()}"
        payload = {
            "first_name": f"BulkTest{i}",
            "last_name": "Staff",
            "email": f"bulk_{uuid.uuid4().hex[:4]}@test.com",
            "phone": "0771234567",
            "employee_id": emp_id,
            "position": "Lecturer",
            "qualification": "PhD",
            "institution": institution_id,
            "date_joined": "2024-01-01"
        }
        res = requests.post(f"{BASE_URL}/staff/members/", json=payload, headers=headers, verify=False)
        if res.status_code == 201:
            staff_ids.append(res.json()["id"])
            print(f"✅ Created staff {i+1}: {emp_id}")
        else:
            print(f"❌ Failed to create staff {i+1}: {res.status_code}")
            print(res.text)

    if len(staff_ids) < 3:
        print("❌ Not enough staff created to test bulk delete.")
        # Cleanup
        for sid in staff_ids: requests.delete(f"{BASE_URL}/staff/members/{sid}/", headers=headers, verify=False)
        sys.exit(1)

    # 3. Verify they exist
    print("--- Verifying staff exist ---")
    for sid in staff_ids:
        res = requests.get(f"{BASE_URL}/staff/members/{sid}/", headers=headers, verify=False)
        if res.status_code != 200:
            print(f"❌ Staff {sid} not found")
            sys.exit(1)
    print("✅ All staff verified.")

    # 4. Perform Bulk Delete
    print(f"--- Performing Bulk Delete for IDs: {staff_ids} ---")
    # Explicitly add trailing slash to avoid 301 redirects
    bulk_res = requests.post(f"{BASE_URL}/staff/members/bulk-delete/", json={"ids": staff_ids}, headers=headers, verify=False)
    
    if bulk_res.status_code == 200:
        print(f"✅ Bulk delete successful: {bulk_res.json().get('message')}")
    else:
        print(f"❌ Bulk delete failed: {bulk_res.status_code}")
        print(bulk_res.text)
        sys.exit(1)

    # 5. Verify they are gone
    print("--- Verifying staff are deleted ---")
    for sid in staff_ids:
        res = requests.get(f"{BASE_URL}/staff/members/{sid}/", headers=headers, verify=False)
        if res.status_code == 404:
            print(f"✅ Staff {sid} is gone")
        else:
            print(f"❌ Staff {sid} still exists (Status: {res.status_code})")
            sys.exit(1)

    print("\n✨ STAFF BULK DELETE SMOKE TEST PASSED!")

if __name__ == "__main__":
    smoke_test_staff_bulk()
