import requests
import sys
import uuid

BASE_URL = "https://localhost/api"
SUPER_ADMIN_EMAIL = "admin@scalareye.com"
SUPER_ADMIN_PASSWORD = "scalareye@123"

def smoke_test_endpoint_isolation():
    print("🚀 Starting Smoke Test for Endpoint Institutional Isolation...")

    # 1. Login as Super Admin
    print("--- Logging in as Super Admin ---")
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
        "name": f"Endpoint Isolation Inst A {suffix}", "type": "Polytechnic", "location": "HARARE", "established": 2020, "email": inst_a_email
    }, headers=super_headers, verify=False)
    
    res_b = requests.post(f"{BASE_URL}/academic/institutions/", json={
        "name": f"Endpoint Isolation Inst B {suffix}", "type": "Polytechnic", "location": "BULAWAYO", "established": 2020, "email": inst_b_email
    }, headers=super_headers, verify=False)

    if res_a.status_code != 201 or res_b.status_code != 201:
        print(f"❌ Failed to create institutions: A={res_a.status_code}, B={res_b.status_code}")
        sys.exit(1)

    inst_a_id = res_a.json()['id']
    inst_b_id = res_b.json()['id']
    inst_a_admin_creds = res_a.json()['admin_credentials']
    inst_b_admin_creds = res_b.json()['admin_credentials']
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
    s_a_res = requests.post(f"{BASE_URL}/academic/students/", json={
        "student_id": f"SA-{suffix}", "national_id": f"ID-A-{suffix}",
        "first_name": "Alice", "last_name": "A-Inst", "gender": "Female", "date_of_birth": "2000-01-01",
        "enrollment_year": 2024, "status": "Active", "institution": inst_a_id, "program": prog_a_id,
        "selected_level": "Diploma", "selected_category": "STEM"
    }, headers=super_headers, verify=False)
    
    s_b_res = requests.post(f"{BASE_URL}/academic/students/", json={
        "student_id": f"SB-{suffix}", "national_id": f"ID-B-{suffix}",
        "first_name": "Bob", "last_name": "B-Inst", "gender": "Male", "date_of_birth": "2000-01-01",
        "enrollment_year": 2024, "status": "Active", "institution": inst_b_id, "program": prog_b_id,
        "selected_level": "Diploma", "selected_category": "STEM"
    }, headers=super_headers, verify=False)
    
    if s_a_res.status_code != 201 or s_b_res.status_code != 201:
        print(f"❌ Student creation failed: A={s_a_res.status_code}, B={s_b_res.status_code}")
        sys.exit(1)

    s_a_id = s_a_res.json()['id']
    s_b_id = s_b_res.json()['id']
    print("✅ Students created.")

    # 4. Create in-country transfer records
    print("--- Creating in-country transfer records ---")
    t_a_res = requests.post(f"{BASE_URL}/academic/transfers/", json={
        "student": s_a_id, "from_institution": "High School A", "to_institution": f"Inst A {suffix}", "transfer_date": "2026-06-19"
    }, headers=super_headers, verify=False)
    
    t_b_res = requests.post(f"{BASE_URL}/academic/transfers/", json={
        "student": s_b_id, "from_institution": "High School B", "to_institution": f"Inst B {suffix}", "transfer_date": "2026-06-19"
    }, headers=super_headers, verify=False)

    if t_a_res.status_code != 201 or t_b_res.status_code != 201:
        print(f"❌ Transfer creation failed: A={t_a_res.status_code}, B={t_b_res.status_code}")
        sys.exit(1)
    
    print("✅ Transfer records created.")

    # 5. Login as Inst A Admin
    print(f"--- Logging in as Inst A Admin ({inst_a_email}) ---")
    login_a_res = requests.post(f"{BASE_URL}/users/token/", json={
        "email": inst_a_admin_creds['email'], "password": inst_a_admin_creds['password']
    }, verify=False)
    
    if login_a_res.status_code != 200:
        print(f"❌ Inst A Admin login failed: {login_a_res.status_code}")
        sys.exit(1)
    
    headers_a = {"Authorization": f"Bearer {login_a_res.json()['access']}"}
    print("✅ Inst A Admin logged in.")

    # 6. Verify Isolation on Students endpoint
    print("--- Verifying Isolation on Students API ---")
    students_res = requests.get(f"{BASE_URL}/academic/students/", headers=headers_a, verify=False)
    if students_res.status_code != 200:
        print(f"❌ Failed to fetch students: {students_res.status_code}")
        sys.exit(1)
    
    student_records = students_res.json()
    student_ids = [s['student_id'] for s in student_records]
    print(f"Inst A sees student IDs: {student_ids}")
    
    if f"SA-{suffix}" in student_ids and f"SB-{suffix}" not in student_ids:
        print("✅ Student Isolation Success: Student A is visible, Student B is NOT.")
    else:
        print("❌ Student Isolation Failure!")
        sys.exit(1)

    # 7. Attempt to leak Student B by querying directly by ID or querying with institution_id parameter
    print("--- Checking Student Leak Protection ---")
    leak_students_res = requests.get(f"{BASE_URL}/academic/students/?institution={inst_b_id}", headers=headers_a, verify=False)
    leak_student_records = leak_students_res.json()
    leak_student_ids = [s['student_id'] for s in leak_student_records]
    if f"SB-{suffix}" not in leak_student_ids:
        print("✅ Leak Protection Success: Cannot request student from Institution B.")
    else:
        print("❌ Leak Protection Failure: Student B was returned!")
        sys.exit(1)

    # 8. Verify Isolation on Transfers endpoint
    print("--- Verifying Isolation on Transfers API ---")
    transfers_res = requests.get(f"{BASE_URL}/academic/transfers/", headers=headers_a, verify=False)
    if transfers_res.status_code != 200:
        print(f"❌ Failed to fetch transfers: {transfers_res.status_code}")
        sys.exit(1)
    
    res_data = transfers_res.json()
    transfer_records = res_data['results'] if isinstance(res_data, dict) and 'results' in res_data else res_data
    transfer_names = [t['student_name'] for t in transfer_records]
    print(f"Inst A sees transfers for: {transfer_names}")

    has_alice = any("Alice" in name for name in transfer_names)
    has_bob = any("Bob" in name for name in transfer_names)
    if has_alice and not has_bob:
        print("✅ Transfer Isolation Success: Transfer A is visible, Transfer B is NOT.")
    else:
        print("❌ Transfer Isolation Failure!")
        sys.exit(1)

    # 9. Cleanup
    print("--- Cleanup ---")
    requests.delete(f"{BASE_URL}/academic/institutions/{inst_a_id}/", headers=super_headers, verify=False)
    requests.delete(f"{BASE_URL}/academic/institutions/{inst_b_id}/", headers=super_headers, verify=False)
    print("✅ Cleanup complete.")

    print("\n✨ ENDPOINT ISOLATION SMOKE TEST PASSED!")

if __name__ == "__main__":
    import urllib3
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
    smoke_test_endpoint_isolation()
