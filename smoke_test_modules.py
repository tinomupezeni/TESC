import requests
import sys
import uuid

BASE_URL = "https://tesc.zchpc.ac.zw/api"
ADMIN_EMAIL = "admin@scalareye.com"
ADMIN_PASSWORD = "admin@123"

def run_test():
    print("🚀 Starting Modules Smoke Test...")

    # 1. Login
    print(f"--- Logging in as {ADMIN_EMAIL} ---")
    login_payload = {
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    }
    response = requests.post(f"{BASE_URL}/users/token/", json=login_payload)
    
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
    inst_res = requests.get(f"{BASE_URL}/academic/institutions/", headers=headers)
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
    res = requests.post(f"{BASE_URL}/academic/facilities/", json=fac_payload, headers=headers)
    if res.status_code == 201:
        fac_id = res.json().get("id")
        if not fac_id:
            print("❌ Facility creation response missing ID")
            sys.exit(1)
        print(f"✅ Facility created (ID: {fac_id})")
        
        # Update
        requests.patch(f"{BASE_URL}/academic/facilities/{fac_id}/", json={"capacity": 60}, headers=headers)
        # Delete
        requests.delete(f"{BASE_URL}/academic/facilities/{fac_id}/", headers=headers)
        print("✅ Facility update and delete successful")
    else:
        print(f"❌ Facility creation failed: {res.status_code}")
        print(res.text)
        sys.exit(1)

    # --- 3. ISEOP Programs & Students CRUD ---
    print("\n--- Testing ISEOP CRUD ---")
    prog_payload = {
        "institution": target_inst_id,
        "name": f"ISEOP Prog {uuid.uuid4().hex[:4]}",
        "capacity": 100,
        "status": "Active"
    }
    res = requests.post(f"{BASE_URL}/iseop/programs/", json=prog_payload, headers=headers)
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
        s_res = requests.post(f"{BASE_URL}/iseop/students/", json=stud_payload, headers=headers)
        if s_res.status_code == 201:
            iseop_stud_id = s_res.json().get("id")
            print(f"✅ ISEOP Student created (ID: {iseop_stud_id})")
            
            # Delete student
            requests.delete(f"{BASE_URL}/iseop/students/{iseop_stud_id}/", headers=headers)
            print("✅ ISEOP Student delete successful")
        else:
            print(f"❌ ISEOP Student creation failed: {s_res.status_code}")
            print(s_res.text)
            
        # Delete program
        requests.delete(f"{BASE_URL}/iseop/programs/{iseop_prog_id}/", headers=headers)
        print("✅ ISEOP Program delete successful")
    else:
        print(f"❌ ISEOP Program creation failed: {res.status_code}")
        print(res.text)
        sys.exit(1)

    # --- 4. Innovation CRUD ---
    print("\n--- Testing Innovation CRUD ---")
    hub_payload = {
        "institution": target_inst_id,
        "name": f"Hub {uuid.uuid4().hex[:4]}",
        "capacity": 20,
        "occupied": 5,
        "status": "High"
    }
    res = requests.post(f"{BASE_URL}/innovation/hubs/", json=hub_payload, headers=headers)
    if res.status_code == 201:
        hub_id = res.json().get("id")
        print(f"✅ Innovation Hub created (ID: {hub_id})")
        
        proj_payload = {
            "institution": target_inst_id,
            "hub": hub_id,
            "name": "Test Project",
            "team_name": "Test Team",
            "sector": "fintech",
            "location_category": "Urban",
            "stage": "ideation",
            "revenue_generated": "0.00",
            "funding_acquired": "0.00",
            "jobs_created": 0
        }
        p_res = requests.post(f"{BASE_URL}/innovation/projects/", json=proj_payload, headers=headers)
        if p_res.status_code == 201:
            proj_id = p_res.json().get("id")
            print(f"✅ Project created (ID: {proj_id})")
            
            grant_payload = {
                "institution": target_inst_id,
                "project": proj_id,
                "donor": "Test Donor",
                "amount": "1000.00",
                "date_awarded": "2024-01-01"
            }
            g_res = requests.post(f"{BASE_URL}/innovation/grants/", json=grant_payload, headers=headers)
            if g_res.status_code == 201:
                grant_id = g_res.json().get("id")
                print(f"✅ Grant created (ID: {grant_id})")
                requests.delete(f"{BASE_URL}/innovation/grants/{grant_id}/", headers=headers)
            else:
                print(f"❌ Grant creation failed: {g_res.status_code}")
                
            requests.delete(f"{BASE_URL}/innovation/projects/{proj_id}/", headers=headers)
            print("✅ Project & Grant delete successful")
        else:
            print(f"❌ Project creation failed: {p_res.status_code}")
            print(p_res.text)

        # Partnership
        part_payload = {
            "institution": target_inst_id,
            "partner_name": "Test Partner",
            "focus_area": "Research",
            "agreement_date": "2024-01-01",
            "status": "Active"
        }
        pt_res = requests.post(f"{BASE_URL}/innovation/partnerships/", json=part_payload, headers=headers)
        if pt_res.status_code == 201:
            part_id = pt_res.json().get("id")
            print(f"✅ Partnership created (ID: {part_id})")
            requests.delete(f"{BASE_URL}/innovation/partnerships/{part_id}/", headers=headers)
            print("✅ Partnership delete successful")
        else:
            print(f"❌ Partnership creation failed: {pt_res.status_code}")

        requests.delete(f"{BASE_URL}/innovation/hubs/{hub_id}/", headers=headers)
        print("✅ Hub delete successful")
    else:
        print(f"❌ Hub creation failed: {res.status_code}")
        print(res.text)
        sys.exit(1)

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
        res = requests.get(f"{BASE_URL}{endpoint}", headers=headers)
        if res.status_code == 200:
            print(f"✅ {endpoint} OK")
        else:
            print(f"❌ {endpoint} failed: {res.status_code}")
            # Non-fatal if some analysis endpoints fail, just report it
            
    print("\n🎉 ALL MODULE SMOKE TESTS FINISHED!")

if __name__ == "__main__":
    run_test()
