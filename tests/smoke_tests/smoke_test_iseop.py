import requests
import sys
import uuid
import time

BASE_URL = "http://localhost:8000/api"
SUPER_ADMIN_EMAIL = "admin@scalareye.com"
SUPER_ADMIN_PASSWORD = "scalareye@123"

def smoke_test_iseop():
    print("🚀 Starting Smoke Test for ISEOP Workflows...")

    # 1. Login as Super Admin
    login_payload = {"email": SUPER_ADMIN_EMAIL, "password": SUPER_ADMIN_PASSWORD}
    login_res = requests.post(f"{BASE_URL}/users/token/", json=login_payload, verify=False)
    if login_res.status_code != 200:
        print(f"❌ Super Admin login failed: {login_res.status_code}")
        sys.exit(1)
    
    super_headers = {"Authorization": f"Bearer {login_res.json()['access']}"}
    
    # 2. Setup Institution
    suffix = uuid.uuid4().hex[:4]
    inst_res = requests.post(f"{BASE_URL}/academic/institutions/", json={
        "name": f"ISEOP Test Inst {suffix}", "type": "Polytechnic", "location": "HARARE", "established": 2020, "email": f"iseop_{suffix}@test.com"
    }, headers=super_headers, verify=False)
    
    if inst_res.status_code != 201:
        print(f"❌ Failed to create institution: {inst_res.text}")
        sys.exit(1)
        
    inst_id = inst_res.json()['id']
    admin_creds = inst_res.json()['admin_credentials']
    print(f"✅ Created Institution (ID: {inst_id})")

    # 3. Login as Inst Admin
    admin_login_res = requests.post(f"{BASE_URL}/users/token/", json={
        "email": admin_creds['email'], "password": admin_creds['password']
    }, verify=False)
    headers = {"Authorization": f"Bearer {admin_login_res.json()['access']}"}
    print("✅ Inst Admin logged in.")

    # 4. Create an ISEOP Program
    print("\n--- Testing ISEOP Program Creation ---")
    prog_payload = {
        "name": f"ISEOP Carpentry {suffix}",
        "capacity": 50,
        "status": "Active",
        "description": "Basic carpentry skills.",
        "institution": inst_id
    }
    prog_res = requests.post(f"{BASE_URL}/iseop/programs/", json=prog_payload, headers=headers, verify=False)
    
    if prog_res.status_code == 201:
        prog_id = prog_res.json()['id']
        print(f"✅ ISEOP Program created successfully (ID: {prog_id}).")
    else:
        print(f"❌ ISEOP Program creation failed: {prog_res.status_code} - {prog_res.text}")
        sys.exit(1)

    # 5. Create an ISEOP Student
    print("\n--- Testing ISEOP Student Creation ---")
    student_payload = {
        "student_id": f"IS-{uuid.uuid4().hex[:6].upper()}",
        "national_id": f"NID-{uuid.uuid4().hex[:6].upper()}",
        "first_name": "John",
        "last_name": "Iseop",
        "gender": "Male",
        "status": "Active/Enrolled",
        "disability_type": "None",
        "program": prog_id,
        "institution": inst_id,
        "enrollment_year": 2024
    }
    stu_res = requests.post(f"{BASE_URL}/iseop/students/", json=student_payload, headers=headers, verify=False)
    
    if stu_res.status_code == 201:
        stu_id = stu_res.json()['id']
        print(f"✅ ISEOP Student created successfully (ID: {stu_id}).")
    else:
        print(f"❌ ISEOP Student creation failed: {stu_res.status_code} - {stu_res.text}")
        sys.exit(1)

    # 6. Fetch ISEOP Students List
    print("\n--- Testing ISEOP Student Fetching (List) ---")
    fetch_res = requests.get(f"{BASE_URL}/iseop/students/", headers=headers, verify=False)
    
    if fetch_res.status_code == 200:
        data = fetch_res.json()
        if len(data) > 0 and data[0]['first_name'] == "John":
            print(f"✅ ISEOP Student list fetched successfully. Found {len(data)} students.")
        else:
            print("❌ Fetched list but student data is missing or incorrect.")
            sys.exit(1)
    else:
        print(f"❌ ISEOP Student list fetch failed: {fetch_res.status_code} - {fetch_res.text}")
        sys.exit(1)
        
    # 7. Test Stats Endpoint
    print("\n--- Testing ISEOP Stats Fetching ---")
    stats_res = requests.get(f"{BASE_URL}/iseop/students/stats/", headers=headers, verify=False)
    if stats_res.status_code == 200:
        stats_data = stats_res.json()
        if stats_data['total_students'] >= 1:
            print(f"✅ ISEOP Stats fetched successfully. Total students: {stats_data['total_students']}")
        else:
            print("❌ ISEOP Stats returned zero students.")
            sys.exit(1)
    else:
         print(f"❌ ISEOP Stats fetch failed: {stats_res.status_code} - {stats_res.text}")
         sys.exit(1)


    # Cleanup
    print("\n--- Cleaning up ---")
    requests.delete(f"{BASE_URL}/academic/institutions/{inst_id}/", headers=super_headers, verify=False)
    print("✅ Cleanup complete.")

    print("\n✨ ISEOP ENDPOINTS SMOKE TEST PASSED!")

if __name__ == "__main__":
    import urllib3
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
    smoke_test_iseop()
