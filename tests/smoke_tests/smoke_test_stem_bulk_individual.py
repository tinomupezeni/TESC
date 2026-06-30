import requests
import sys
import uuid
import io
import pandas as pd
import urllib3
import json

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

BASE_URL = "http://localhost:8000/api"
SUPER_ADMIN_EMAIL = "admin@scalareye.com"
SUPER_ADMIN_PASSWORD = "scalareye@123"

def run_test():
    print("🚀 Starting Comprehensive Bulk Upload and Individual STEM Smoke Test...")

    # 1. Login as Super Admin
    print("--- Logging in as Super Admin ---")
    login_payload = {"email": SUPER_ADMIN_EMAIL, "password": SUPER_ADMIN_PASSWORD}
    login_res = requests.post(f"{BASE_URL}/users/token/", json=login_payload, verify=False)
    if login_res.status_code != 200:
        print(f"❌ Super Admin login failed: {login_res.status_code}")
        print(login_res.text)
        sys.exit(1)
    
    super_headers = {"Authorization": f"Bearer {login_res.json()['access']}"}
    print("✅ Super Admin logged in.")

    # 2. Create two test institutions
    print("--- Creating test institutions ---")
    suffix = uuid.uuid4().hex[:6].upper()
    inst_a_email = f"admin_a_{suffix}@test.com"
    inst_b_email = f"admin_b_{suffix}@test.com"
    
    res_a = requests.post(f"{BASE_URL}/academic/institutions/", json={
        "name": f"STEM Smoke Inst A {suffix}", "type": "Polytechnic", "location": "HARARE", "established": 2020, "email": inst_a_email
    }, headers=super_headers, verify=False)
    
    res_b = requests.post(f"{BASE_URL}/academic/institutions/", json={
        "name": f"STEM Smoke Inst B {suffix}", "type": "Polytechnic", "location": "BULAWAYO", "established": 2020, "email": inst_b_email
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
    def setup_program(inst_id, prefix, prog_code):
        fac_res = requests.post(f"{BASE_URL}/faculties/faculties/", json={
            "name": f"{prefix} Fac {suffix}", "institution": inst_id, "description": "Test", "location": "Test"
        }, headers=super_headers, verify=False)
        fac_id = fac_res.json()["id"]

        dept_res = requests.post(f"{BASE_URL}/faculties/departments/", json={
            "name": f"{prefix} Dept {suffix}", "code": f"D-{prefix}-{suffix}", "faculty": fac_id, "institution": inst_id
        }, headers=super_headers, verify=False)
        dept_id = dept_res.json()["id"]

        prog_res = requests.post(f"{BASE_URL}/faculties/programs/", json={
            "name": f"{prefix} Prog STEM {suffix}", "code": prog_code, "level": "Diploma", "department": dept_id, "duration": 1, "category": "STEM"
        }, headers=super_headers, verify=False)
        return prog_res.json()["id"]

    print("--- Setting up academic structures ---")
    prog_a_code = f"PA-{suffix}"
    prog_b_code = f"PB-{suffix}"
    prog_a_id = setup_program(inst_a_id, "A", prog_a_code)
    prog_b_id = setup_program(inst_b_id, "B", prog_b_code)
    print(f"✅ Set up programs: Inst A={prog_a_code}, Inst B={prog_b_code}")

    # 3. Login as Inst A Admin
    print(f"--- Logging in as Inst A Admin ({inst_a_email}) ---")
    login_a_res = requests.post(f"{BASE_URL}/users/token/", json={
        "email": inst_a_admin_creds['email'], "password": inst_a_admin_creds['password']
    }, verify=False)
    if login_a_res.status_code != 200:
        print(f"❌ Inst A Admin login failed: {login_a_res.status_code}")
        sys.exit(1)
    
    headers_a = {"Authorization": f"Bearer {login_a_res.json()['access']}"}
    print("✅ Inst A Admin logged in.")

    # 4. Login as Inst B Admin
    print(f"--- Logging in as Inst B Admin ({inst_b_email}) ---")
    login_b_res = requests.post(f"{BASE_URL}/users/token/", json={
        "email": inst_b_admin_creds['email'], "password": inst_b_admin_creds['password']
    }, verify=False)
    if login_b_res.status_code != 200:
        print(f"❌ Inst B Admin login failed: {login_b_res.status_code}")
        sys.exit(1)
    
    headers_b = {"Authorization": f"Bearer {login_b_res.json()['access']}"}
    print("✅ Inst B Admin logged in.")

    # 5. Download Excel template dynamically
    print("--- Test Dynamic Excel Template Generation (stem_students) ---")
    template_res = requests.get(f"{BASE_URL}/academic/ingestion/template/stem_students/", headers=headers_a, verify=False)
    if template_res.status_code != 200:
        print(f"❌ Failed to download stem_students Excel template: {template_res.status_code}")
        sys.exit(1)
    
    content_type = template_res.headers.get('Content-Type', '')
    if 'spreadsheetml' not in content_type:
        print(f"❌ Template has incorrect Content-Type: {content_type}")
        sys.exit(1)
    print("✅ Excel template downloaded successfully.")

    # 6. Validate bulk upload using the template
    print("--- Test Ingestion Validation: Valid STEM Student ---")
    df_valid = pd.DataFrame([
        {
            "Student ID": f"SA-BULK-{suffix}",
            "National ID": f"ID-ABULK-{suffix}",
            "First Name": "Alice",
            "Last Name": "Bulk",
            "Gender (Male/Female)": "Female",
            "Date of Birth (YYYY-MM-DD)": "2002-02-02",
            "Enrollment Year": 2025,
            "Status (Active/Suspended/Graduated/Dropout)": "Active",
            "Program Code": prog_a_code,
            "Selected Level": "Diploma"
        }
    ])
    
    excel_valid = io.BytesIO()
    df_valid.to_excel(excel_valid, index=False)
    excel_valid.seek(0)
    
    validate_res = requests.post(
        f"{BASE_URL}/academic/ingestion/validate/stem_students/",
        files={"file": ("stem_students_valid.xlsx", excel_valid)},
        headers=headers_a,
        verify=False
    )
    
    if validate_res.status_code != 200:
        print(f"❌ Validation request failed: {validate_res.status_code}")
        print(validate_res.text)
        sys.exit(1)
        
    validation_data = validate_res.json()
    if validation_data.get("status") != "success":
        print(f"❌ Validation failed: {validation_data}")
        sys.exit(1)
        
    processed_rows = validation_data["processed_data"]
    if len(processed_rows) != 1 or processed_rows[0]["status"] != "Success":
        print(f"❌ Validation item status error: {processed_rows}")
        sys.exit(1)
        
    print("✅ Ingestion Validation for valid row passed.")

    # 7. Test Isolation in Ingestion: Program code belonging to Inst B uploaded by Inst A
    print("--- Test Ingestion Validation: Cross-Institution Leak Protection (Prog Code Inst B) ---")
    df_invalid = pd.DataFrame([
        {
            "Student ID": f"SA-BULK-LEAK-{suffix}",
            "National ID": f"ID-ALEAK-{suffix}",
            "First Name": "Alice",
            "Last Name": "Leak",
            "Gender (Male/Female)": "Female",
            "Date of Birth (YYYY-MM-DD)": "2002-02-02",
            "Enrollment Year": 2025,
            "Status (Active/Suspended/Graduated/Dropout)": "Active",
            "Program Code": prog_b_code,  # Program Code of Inst B!
            "Selected Level": "Diploma"
        }
    ])
    
    excel_invalid = io.BytesIO()
    df_invalid.to_excel(excel_invalid, index=False)
    excel_invalid.seek(0)
    
    validate_leak_res = requests.post(
        f"{BASE_URL}/academic/ingestion/validate/stem_students/",
        files={"file": ("stem_students_invalid.xlsx", excel_invalid)},
        headers=headers_a,
        verify=False
    )
    
    leak_data = validate_leak_res.json()
    leak_rows = leak_data.get("processed_data", [])
    if len(leak_rows) > 0 and leak_rows[0]["status"] == "Error":
        print("✅ Program Leak Protection Success: Program belonging to Inst B was rejected for Inst A.")
    else:
        print(f"❌ Program Leak Protection Failure! Uploaded Inst B program but response: {leak_data}")
        sys.exit(1)

    # 8. Commit the valid upload
    print("--- Test Ingestion Commit: Valid STEM Student ---")
    commit_res = requests.post(
        f"{BASE_URL}/academic/ingestion/commit/stem_students/",
        json={"data": processed_rows, "institution_id": inst_a_id},
        headers=headers_a,
        verify=False
    )
    
    if commit_res.status_code != 200 or commit_res.json().get("imported") != 1:
        print(f"❌ Ingestion commit failed: {commit_res.status_code}, Response: {commit_res.text}")
        sys.exit(1)
    print("✅ Ingestion commit completed successfully.")

    # 9. Individual Record Addition (STEM Student)
    print("--- Test Individual Student Creation ---")
    indiv_student_payload = {
        "student_id": f"SA-INDIV-{suffix}",
        "national_id": f"ID-AINDIV-{suffix}",
        "first_name": "AliceIndividual",
        "last_name": "A",
        "gender": "Female",
        "date_of_birth": "2000-01-01",
        "enrollment_year": 2025,
        "status": "Active",
        "institution": inst_a_id,
        "program": prog_a_id,
        "selected_level": "Diploma",
        "selected_category": "STEM"
    }
    
    student_res = requests.post(
        f"{BASE_URL}/academic/students/",
        json=indiv_student_payload,
        headers=headers_a,
        verify=False
    )
    
    if student_res.status_code != 201:
        print(f"❌ Failed to create individual student: {student_res.status_code}")
        print(student_res.text)
        sys.exit(1)
        
    student_a_db_id = student_res.json()["id"]
    print(f"✅ Created student individually: ID={student_a_db_id}")

    # 10. Add Individual In-Country Transfer Record
    print("--- Test Individual Transfer Record Creation ---")
    transfer_payload = {
        "student": student_a_db_id,
        "from_institution": "High School A",
        "to_institution": f"STEM Smoke Inst A {suffix}",
        "transfer_date": "2026-06-19"
    }
    
    transfer_res = requests.post(
        f"{BASE_URL}/academic/transfers/",
        json=transfer_payload,
        headers=headers_a,
        verify=False
    )
    
    if transfer_res.status_code != 201:
        print(f"❌ Failed to create transfer record: {transfer_res.status_code}")
        print(transfer_res.text)
        sys.exit(1)
        
    transfer_a_db_id = transfer_res.json()["id"]
    print(f"✅ Created transfer record individually: ID={transfer_a_db_id}")

    # 11. Strict Institutional Isolation Checks
    print("--- Verifying Isolation ---")
    
    # Check 1: Inst B Admin should not see Inst A students in students list
    students_b_res = requests.get(f"{BASE_URL}/academic/students/", headers=headers_b, verify=False)
    students_b = students_b_res.json()
    student_ids_b = [s["student_id"] for s in students_b]
    
    if f"SA-BULK-{suffix}" in student_ids_b or f"SA-INDIV-{suffix}" in student_ids_b:
        print("❌ Data Isolation Failure: Inst B sees Inst A students!")
        sys.exit(1)
    else:
        print("✅ Student List Isolation Success: Inst B cannot see Inst A's students.")

    # Check 2: Inst B Admin trying to access Inst A student directly by ID should fail / be filtered out
    direct_student_leak_res = requests.get(f"{BASE_URL}/academic/students/{student_a_db_id}/", headers=headers_b, verify=False)
    if direct_student_leak_res.status_code in [404, 403]:
        print("✅ Direct Student Isolation Success: Inst B cannot access Inst A student details.")
    else:
        print(f"❌ Direct Student Isolation Failure! Status code: {direct_student_leak_res.status_code}")
        sys.exit(1)

    # Check 3: Inst B Admin should not see Inst A transfers in transfers list
    transfers_b_res = requests.get(f"{BASE_URL}/academic/transfers/", headers=headers_b, verify=False)
    transfers_b_data = transfers_b_res.json()
    transfers_b = transfers_b_data['results'] if isinstance(transfers_b_data, dict) and 'results' in transfers_b_data else transfers_b_data
    transfer_ids_b = [t["id"] for t in transfers_b]
    
    if transfer_a_db_id in transfer_ids_b:
        print("❌ Data Isolation Failure: Inst B sees Inst A's transfer record!")
        sys.exit(1)
    else:
        print("✅ Transfer List Isolation Success: Inst B cannot see Inst A's transfer records.")

    # Check 4: Inst B Admin trying to access Inst A transfer directly by ID should fail / be filtered out
    direct_transfer_leak_res = requests.get(f"{BASE_URL}/academic/transfers/{transfer_a_db_id}/", headers=headers_b, verify=False)
    if direct_transfer_leak_res.status_code in [404, 403]:
        print("✅ Direct Transfer Isolation Success: Inst B cannot access Inst A transfer details.")
    else:
        print(f"❌ Direct Transfer Isolation Failure! Status code: {direct_transfer_leak_res.status_code}")
        sys.exit(1)

    # 12. Cleanup
    print("--- Cleanup ---")
    requests.delete(f"{BASE_URL}/academic/institutions/{inst_a_id}/", headers=super_headers, verify=False)
    requests.delete(f"{BASE_URL}/academic/institutions/{inst_b_id}/", headers=super_headers, verify=False)
    print("✅ Cleanup complete.")

    print("\n✨ ALL COMPREHENSIVE BULK UPLOAD AND INDIVIDUAL SMOKE TESTS PASSED!")

if __name__ == "__main__":
    run_test()
