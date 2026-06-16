import requests
import sys
import uuid

BASE_URL = "http://127.0.0.1:8081/api"

def run_test():
    print("🚀 Starting Institutional Smoke Test...")

    # 1. Register a new institution
    inst_name = f"Inst Smoke Test {uuid.uuid4().hex[:6]}"
    inst_email = f"admin_{uuid.uuid4().hex[:4]}@smoke.com"
    
    payload = {
        "name": inst_name,
        "type": "Polytechnic",
        "location": "HARARE",
        "address": "123 Test St",
        "capacity": 5000,
        "established": 2000,
        "email": inst_email,
        "status": "Active"
    }

    print(f"--- Registering Institution: {inst_name} ---")
    response = requests.post(f"{BASE_URL}/academic/institutions/", json=payload)
    
    if response.status_code != 201:
        print(f"❌ Failed to register institution: {response.status_code}")
        print(response.text)
        sys.exit(1)
    
    inst_data = response.json()
    inst_id = inst_data["id"]
    admin_creds = inst_data["admin_credentials"]
    email = admin_creds["email"]
    password = admin_creds["password"]
    print(f"✅ Institution registered (ID: {inst_id}).")

    # 2. Login
    print(f"--- Logging in as {email} ---")
    login_payload = {
        "username": email,
        "password": password
    }
    login_response = requests.post(f"{BASE_URL}/instauth/login/", json=login_payload)
    
    if login_response.status_code != 200:
        print(f"❌ Login failed: {login_response.status_code}")
        requests.delete(f"{BASE_URL}/academic/institutions/{inst_id}/")
        sys.exit(1)
    
    login_data = login_response.json()
    access_token = login_data["tokens"]["access"]
    headers = {"Authorization": f"Bearer {access_token}"}
    print("✅ Login successful.")

    # 3. Page Data Fetching (Institutional Scope)
    print("--- Testing Institutional Page Data & Analytics ---")
    page_endpoints = [
        "/instauth/profile/",
        f"/academic/students/?institution={inst_id}",
        f"/staff/members/?institution_id={inst_id}",
        f"/faculties/faculties/?institution={inst_id}",
        f"/academic/facilities/?institution_id={inst_id}",
        f"/analysis/dashboard/?institution_id={inst_id}",
        f"/analysis/student-distribution/?institution_id={inst_id}",
        f"/academic/dashboard/enrollment-trends/?institution_id={inst_id}",
        f"/analysis/student-teacher-ratio/?institution_id={inst_id}",
        f"/analysis/dropout-analysis/?institution_id={inst_id}",
        f"/academic/students/special-stats/?institution_id={inst_id}",
        f"/analysis/hubs/?institution_id={inst_id}",
        f"/analysis/startups/?institution_id={inst_id}",
        f"/analysis/industrial/?institution_id={inst_id}",
        f"/analysis/admissions-stats/?institution_id={inst_id}",
        "/v1/reports/schemas/",
        f"/instauth/roles/?institution_id={inst_id}",
        f"/instauth/users/?institution_id={inst_id}",
    ]
    
    for endpoint in page_endpoints:
        print(f"Fetching {endpoint}...")
        res = requests.get(f"{BASE_URL}{endpoint}", headers=headers)
        if res.status_code == 200:
            print(f"✅ {endpoint} OK")
        else:
            print(f"❌ {endpoint} failed: {res.status_code}")

    # 4. Institutional CRUD: Faculty & Department & Program
    print("--- Testing Faculty/Dept/Program CRUD ---")
    fac_payload = {
        "name": f"Engineering {uuid.uuid4().hex[:4]}",
        "dean": "Dr. Smoke",
        "institution": inst_id
    }
    res = requests.post(f"{BASE_URL}/faculties/faculties/", json=fac_payload, headers=headers)
    if res.status_code == 201:
        fac_id = res.json()["id"]
        print(f"✅ Faculty created (ID: {fac_id})")
        
        dept_payload = {
            "name": f"Electrical {uuid.uuid4().hex[:4]}",
            "code": f"EE{uuid.uuid4().hex[:4].upper()}",
            "faculty": fac_id,
            "institution": inst_id
        }
        d_res = requests.post(f"{BASE_URL}/faculties/departments/", json=dept_payload, headers=headers)
        if d_res.status_code == 201:
            dept_id = d_res.json()["id"]
            print(f"✅ Department created (ID: {dept_id})")
            
            prog_payload = {
                "name": f"Power Systems {uuid.uuid4().hex[:4]}",
                "code": f"PS{uuid.uuid4().hex[:4].upper()}",
                "level": "Diploma",
                "department": dept_id,
                "institution": inst_id,
                "duration": 1,
                "category": "STEM"
            }
            p_res = requests.post(f"{BASE_URL}/faculties/programs/", json=prog_payload, headers=headers)
            if p_res.status_code == 201:
                prog_id = p_res.json()["id"]
                print(f"✅ Program created (ID: {prog_id})")
                requests.delete(f"{BASE_URL}/faculties/programs/{prog_id}/", headers=headers)
            else:
                print(f"❌ Program creation failed: {p_res.status_code}")
            
            requests.delete(f"{BASE_URL}/faculties/departments/{dept_id}/", headers=headers)
        else:
            print(f"❌ Department creation failed: {d_res.status_code}")
            
        requests.delete(f"{BASE_URL}/faculties/faculties/{fac_id}/", headers=headers)
    else:
        print(f"❌ Faculty creation failed: {res.status_code}")

    # FINAL CLEANUP: Delete the institution
    print(f"--- Final Cleanup: Deleting institution {inst_id} ---")
    res = requests.delete(f"{BASE_URL}/academic/institutions/{inst_id}/", headers=headers)
    if res.status_code == 204:
        print("✅ Cleanup successful")
    else:
        print(f"❌ Cleanup failed: {res.status_code}")

    print("\n🎉 ALL INSTITUTIONAL SMOKE TESTS PASSED!")

if __name__ == "__main__":
    run_test()
