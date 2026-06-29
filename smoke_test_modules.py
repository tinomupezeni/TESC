import requests
import sys
import uuid

BASE_URL = "http://localhost:8000/api"
ADMIN_EMAIL = "admin@scalareye.com"
ADMIN_PASSWORD = "scalareye@123"

def run_test():
    print("🚀 Starting Modules Smoke Test...")

    # 1. Login
    print(f"--- Logging in as {ADMIN_EMAIL} ---")
    login_payload = {
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    }
    response = requests.post(f"{BASE_URL}/users/token/", json=login_payload, verify=False)
    
    if response.status_code != 200:
        print(f"❌ Login failed: {response.status_code}")
        print(response.text)
        sys.exit(1)
    
    data = response.json()
    access_token = data["access"]
    headers = {"Authorization": f"Bearer {access_token}"}
    print("✅ Login successful.")

    # Get a target institution
    print("Fetching institution for context...")
    inst_res = requests.get(f"{BASE_URL}/academic/institutions/", headers=headers, verify=False)
    if inst_res.status_code != 200 or not inst_res.json():
        print("❌ No institutions found. Please run admin smoke test first to create one.")
        sys.exit(1)
    target_inst_id = inst_res.json()[0]["id"]

    # --- 2. Facilities CRUD ---
    print("\n--- Testing Facilities CRUD ---")
    facility_name = f"Lab {uuid.uuid4().hex[:4]}"
    fac_payload = {
        "institution": target_inst_id,
        "name": facility_name,
        "facility_type": "Laboratory",
        "building": "Science Block",
        "capacity": 50,
        "current_usage": 10,
        "status": "Active"
    }
    res = requests.post(f"{BASE_URL}/academic/facilities/", json=fac_payload, headers=headers, verify=False)
    if res.status_code == 201:
        fac_id = res.json().get("id")
        if not fac_id:
            print("❌ Facility creation response missing ID")
            sys.exit(1)
        print(f"✅ Facility created (ID: {fac_id})")
        
        # Update
        requests.patch(f"{BASE_URL}/academic/facilities/{fac_id}/", json={"capacity": 60}, headers=headers, verify=False)
        # Delete
        requests.delete(f"{BASE_URL}/academic/facilities/{fac_id}/", headers=headers, verify=False)
        print("✅ Facility update and delete successful")
    else:
        print(f"❌ Facility creation failed: {res.status_code}")
        print(res.text)

    # --- 3. ISEOP Programs & Students CRUD ---
    print("\n--- Testing ISEOP CRUD ---")
    prog_payload = {
        "institution": target_inst_id,
        "name": f"ISEOP Prog {uuid.uuid4().hex[:4]}",
        "capacity": 100,
        "status": "Active"
    }
    res = requests.post(f"{BASE_URL}/iseop/programs/", json=prog_payload, headers=headers, verify=False)
    if res.status_code == 201:
        iseop_prog_id = res.json().get("id")
        print(f"✅ ISEOP Program created (ID: {iseop_prog_id})")
        
        stud_payload = {
            "institution": target_inst_id,
            "program": iseop_prog_id,
            "first_name": "Test",
            "last_name": "Student",
            "student_id": f"ISEOP{uuid.uuid4().hex[:4]}",
            "national_id": f"ID{uuid.uuid4().hex[:4]}",
            "gender": "Female",
            "status": "Active/Enrolled"
        }
        s_res = requests.post(f"{BASE_URL}/iseop/students/", json=stud_payload, headers=headers, verify=False)
        if s_res.status_code == 201:
            iseop_stud_id = s_res.json().get("id")
            print(f"✅ ISEOP Student created (ID: {iseop_stud_id})")
            
            # Delete student
            requests.delete(f"{BASE_URL}/iseop/students/{iseop_stud_id}/", headers=headers, verify=False)
            print("✅ ISEOP Student delete successful")
        else:
            print(f"❌ ISEOP Student creation failed: {s_res.status_code}")

        # Delete program
        requests.delete(f"{BASE_URL}/iseop/programs/{iseop_prog_id}/", headers=headers, verify=False)
        print("✅ ISEOP Program delete successful")
    else:
        print(f"❌ ISEOP Program creation failed: {res.status_code}")

    # --- 4. Innovation Hubs & Projects CRUD ---
    print("\n--- Testing Innovation CRUD ---")
    hub_payload = {
        "institution": target_inst_id,
        "name": f"Hub {uuid.uuid4().hex[:4]}",
        "location": "Main Campus",
        "capacity": 20,
        "occupied": 5,
        "status": "High"
    }
    res = requests.post(f"{BASE_URL}/innovation/hubs/", json=hub_payload, headers=headers, verify=False)
    if res.status_code == 201:
        hub_id = res.json().get("id")
        print(f"✅ Innovation Hub created (ID: {hub_id})")
        
        # Update
        requests.patch(f"{BASE_URL}/innovation/hubs/{hub_id}/", json={"capacity": 25}, headers=headers, verify=False)
        # Delete
        requests.delete(f"{BASE_URL}/innovation/hubs/{hub_id}/", headers=headers, verify=False)
        print("✅ Hub delete successful")
    else:
        print(f"❌ Hub creation failed: {res.status_code}")
        print(res.text)

    # --- 5. Analysis Endpoints (GET) ---
    print("\n--- Testing Analysis GET Endpoints ---")
    analysis_endpoints = [
        "/analysis/dropout-analysis/",
        "/analysis/regional-stats/",
        "/analysis/hubs/",
        "/analysis/startups/",
        "/analysis/industrial/",
        "/analysis/innovation-overview/",
        "/analysis/admissions-stats/",
        "/analysis/dashboard/",
        "/analysis/student-distribution/",
        "/analysis/student-teacher-ratio/"
    ]
    
    for endpoint in analysis_endpoints:
        print(f"Fetching {endpoint}...")
        res = requests.get(f"{BASE_URL}{endpoint}", headers=headers, verify=False)
        if res.status_code == 200:
            print(f"✅ {endpoint} OK")
        else:
            print(f"❌ {endpoint} failed: {res.status_code}")
            
    print("\n🎉 ALL MODULE SMOKE TESTS FINISHED!")

if __name__ == "__main__":
    run_test()
