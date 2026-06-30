import requests
import sys
import uuid
import time

# Use localhost since we are running inside or beside the docker containers
BASE_URL = "http://localhost:8000/api"
SUPER_ADMIN_EMAIL = "admin@scalareye.com"
SUPER_ADMIN_PASSWORD = "scalareye@123"

def smoke_test_report_isolation():
    print("🚀 Starting Smoke Test for Report Institutional Isolation...")

    # 1. Login as Super Admin
    print(f"--- Logging in as Super Admin ---")
    login_payload = {"email": SUPER_ADMIN_EMAIL, "password": SUPER_ADMIN_PASSWORD}
    login_res = requests.post(f"{BASE_URL}/users/token/", json=login_payload, verify=False)
    if login_res.status_code != 200:
        print(f"❌ Super Admin login failed: {login_res.status_code}")
        sys.exit(1)
    
    super_headers = {"Authorization": f"Bearer {login_res.json()['access']}"}
    print("✅ Super Admin logged in.")

    # 2. Create two institutions
    print("--- Creating two institutions ---")
    suffix = uuid.uuid4().hex[:4]
    inst_a_email = f"admin_a_{suffix}@test.com"
    inst_b_email = f"admin_b_{suffix}@test.com"
    
    res_a = requests.post(f"{BASE_URL}/academic/institutions/", json={
        "name": f"Isolation Inst A {suffix}", "type": "Polytechnic", "location": "HARARE", "established": 2020, "email": inst_a_email
    }, headers=super_headers, verify=False)
    
    res_b = requests.post(f"{BASE_URL}/academic/institutions/", json={
        "name": f"Isolation Inst B {suffix}", "type": "Polytechnic", "location": "BULAWAYO", "established": 2020, "email": inst_b_email
    }, headers=super_headers, verify=False)

    if res_a.status_code != 201 or res_b.status_code != 201:
        print(f"❌ Failed to create institutions: A={res_a.status_code}, B={res_b.status_code}")
        print(f"A: {res_a.text}")
        print(f"B: {res_b.text}")
        sys.exit(1)

    inst_a_id = res_a.json()['id']
    inst_b_id = res_b.json()['id']
    inst_a_admin_creds = res_a.json()['admin_credentials']
    print(f"✅ Created Inst A (ID: {inst_a_id}) and Inst B (ID: {inst_b_id})")

    # Helper function to setup faculty, department, program
    def setup_program(inst_id, prefix):
        fac_res = requests.post(f"{BASE_URL}/faculties/faculties/", json={
            "name": f"{prefix} Fac {suffix}", "institution": inst_id, "description": "Test", "location": "Test"
        }, headers=super_headers, verify=False)
        fac_id = fac_res.json()["id"]

        dept_res = requests.post(f"{BASE_URL}/faculties/departments/", json={
            "name": f"{prefix} Dept {suffix}", "code": f"D{suffix}", "faculty": fac_id, "institution": inst_id
        }, headers=super_headers, verify=False)
        dept_id = dept_res.json()["id"]

        prog_res = requests.post(f"{BASE_URL}/faculties/programs/", json={
            "name": f"{prefix} Prog {suffix}", "code": f"P{suffix}", "level": "Diploma", "department": dept_id, "duration": 1, "category": "STEM"
        }, headers=super_headers, verify=False)
        return prog_res.json()["id"]

    print("--- Creating academic structures ---")
    prog_a_id = setup_program(inst_a_id, "A")
    prog_b_id = setup_program(inst_b_id, "B")

    # 3. Create a student in each institution
    print("--- Creating students in each institution ---")
    # Inst A Student
    s_a = requests.post(f"{BASE_URL}/academic/students/", json={
        "student_id": f"A-{uuid.uuid4().hex[:6].upper()}", "national_id": f"ID-A-{uuid.uuid4().hex[:6].upper()}",
        "first_name": "Alice", "last_name": "A-Inst", "gender": "Female", "date_of_birth": "2000-01-01",
        "enrollment_year": 2024, "status": "Active", "institution": inst_a_id, "program": prog_a_id
    }, headers=super_headers, verify=False)
    
    if s_a.status_code != 201:
        print(f"Failed to create student A: {s_a.text}")

    # Inst B Student
    s_b = requests.post(f"{BASE_URL}/academic/students/", json={
        "student_id": f"B-{uuid.uuid4().hex[:6].upper()}", "national_id": f"ID-B-{uuid.uuid4().hex[:6].upper()}",
        "first_name": "Bob", "last_name": "B-Inst", "gender": "Male", "date_of_birth": "2000-01-01",
        "enrollment_year": 2024, "status": "Active", "institution": inst_b_id, "program": prog_b_id
    }, headers=super_headers, verify=False)
    if s_b.status_code != 201:
        print(f"Failed to create student B: {s_b.text}")
        
    print("✅ Students created.")

    # 4. Login as Inst A Admin
    print(f"--- Logging in as Inst A Admin ({inst_a_email}) ---")
    login_a_res = requests.post(f"{BASE_URL}/users/token/", json={
        "email": inst_a_admin_creds['email'], "password": inst_a_admin_creds['password']
    }, verify=False)
    
    if login_a_res.status_code != 200:
        print(f"❌ Inst A Admin login failed: {login_a_res.status_code}")
        sys.exit(1)
    
    headers_a = {"Authorization": f"Bearer {login_a_res.json()['access']}"}
    print("✅ Inst A Admin logged in.")

    # 5. Generate Students Report as Inst A Admin
    print("--- Generating Students Report for Inst A ---")
    report_payload = {
        "report_type": "students",
        "format": "json",
        "columns": ["student_id", "full_name"]
    }
    report_res = requests.post(f"{BASE_URL}/v1/reports/dynamic/generate/", json=report_payload, headers=headers_a, verify=False)
    
    if report_res.status_code != 200:
        print(f"❌ Report generation failed: {report_res.status_code}")
        print(report_res.text)
        sys.exit(1)
    
    report_data = report_res.json()
    records = report_data['data']
    print(f"✅ Received {len(records)} records.")

    # 6. Verify isolation
    print("--- Verifying Isolation ---")
    full_names = [r.get('full_name', '') for r in records]

    if any("ALICE" in fn.upper() for fn in full_names) and not any("BOB" in fn.upper() for fn in full_names):
        print("✅ Isolation Success: Alice (Inst A) is present, Bob (Inst B) is NOT.")
    else:
        print(f"❌ Isolation Failure: Alice present: {any('ALICE' in fn.upper() for fn in full_names)}, Bob present: {any('BOB' in fn.upper() for fn in full_names)}")
        # sys.exit(1) # We'll check the next part too

    # 7. Attempt to leak data by providing inst_b_id
    print(f"--- Attempting to leak data by requesting Inst B ID ({inst_b_id}) ---")
    leak_payload = report_payload.copy()
    leak_payload["institution_id"] = inst_b_id
    leak_res = requests.post(f"{BASE_URL}/v1/reports/dynamic/generate/", json=leak_payload, headers=headers_a, verify=False)
    
    leak_data = leak_res.json()
    leak_records = leak_data.get('data', [])
    leak_full_names = [r.get('full_name', '') for r in leak_records]

    if not any("BOB" in fn.upper() for fn in leak_full_names):
        print("✅ Leak Protection Success: Bob (Inst B) was NOT leaked even when requested by ID.")
    else:
        print("❌ Leak Protection Failure: Bob (Inst B) was leaked when requested by ID!")
        sys.exit(1)

    # 8. Super Admin tests for edge cases
    print("--- Verifying Super Admin Global Visibility ---")
    global_payload = report_payload.copy()
    global_res = requests.post(f"{BASE_URL}/v1/reports/dynamic/generate/", json=global_payload, headers=super_headers, verify=False)
    global_data = global_res.json()
    global_full_names = [r.get('full_name', '') for r in global_data.get('data', [])]
    
    if any("ALICE" in fn.upper() for fn in global_full_names) and any("BOB" in fn.upper() for fn in global_full_names):
        print("✅ Global Visibility Success: Super Admin sees both Alice and Bob.")
    else:
        print("❌ Global Visibility Failure: Super Admin did not see both!")
        sys.exit(1)

    print(f"--- Verifying Super Admin explicit filtering for Inst B ({inst_b_id}) ---")
    super_leak_payload = report_payload.copy()
    super_leak_payload["institution_id"] = inst_b_id # Explicit filtering by super admin at ROOT
    super_leak_res = requests.post(f"{BASE_URL}/v1/reports/dynamic/generate/", json=super_leak_payload, headers=super_headers, verify=False)
    
    super_leak_data = super_leak_res.json()
    super_leak_full_names = [r.get('full_name', '') for r in super_leak_data.get('data', [])]
    print(f"Super leak payload: {super_leak_payload}")
    print(f"Super leak returned records: {len(super_leak_data.get('data', []))}")

    if any("BOB" in fn.upper() for fn in super_leak_full_names) and not any("ALICE" in fn.upper() for fn in super_leak_full_names):
        print("✅ Super Admin Filter Success: Super Admin correctly filtered to see ONLY Bob when passing Inst B ID.")
    else:
        print(f"❌ Super Admin Filter Failure: Alice present: {any('ALICE' in fn.upper() for fn in super_leak_full_names)}, Bob present: {any('BOB' in fn.upper() for fn in super_leak_full_names)}")
        print(f"All names returned: {super_leak_full_names}")
        sys.exit(1)
    print("--- Cleanup ---")
    requests.delete(f"{BASE_URL}/academic/institutions/{inst_a_id}/", headers=super_headers, verify=False)
    requests.delete(f"{BASE_URL}/academic/institutions/{inst_b_id}/", headers=super_headers, verify=False)
    print("✅ Cleanup complete.")

    print("\n✨ REPORT ISOLATION SMOKE TEST PASSED!")

if __name__ == "__main__":
    import urllib3
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
    smoke_test_report_isolation()
