import requests
import sys
import uuid
import time
import pandas as pd
import io

BASE_URL = "http://localhost:8000/api"
SUPER_ADMIN_EMAIL = "admin@scalareye.com"
SUPER_ADMIN_PASSWORD = "scalareye@123"

def smoke_test_graduates():
    print("🚀 Starting Smoke Test for Graduation Management...")

    # 1. Login as Super Admin
    login_payload = {"email": SUPER_ADMIN_EMAIL, "password": SUPER_ADMIN_PASSWORD}
    login_res = requests.post(f"{BASE_URL}/users/token/", json=login_payload, verify=False)
    if login_res.status_code != 200:
        print(f"❌ Super Admin login failed: {login_res.status_code}")
        sys.exit(1)
    
    super_headers = {"Authorization": f"Bearer {login_res.json()['access']}"}
    
    # 2. Setup Institution and Program
    suffix = uuid.uuid4().hex[:4]
    inst_res = requests.post(f"{BASE_URL}/academic/institutions/", json={
        "name": f"Grad Test Inst {suffix}", "type": "Polytechnic", "location": "HARARE", "established": 2020, "email": f"grad_admin_{suffix}@test.com"
    }, headers=super_headers, verify=False)
    
    if inst_res.status_code != 201:
        print(f"❌ Failed to create institution: {inst_res.text}")
        sys.exit(1)
        
    inst_id = inst_res.json()['id']
    admin_creds = inst_res.json()['admin_credentials']
    print(f"✅ Created Institution (ID: {inst_id})")

    fac_res = requests.post(f"{BASE_URL}/faculties/faculties/", json={
        "name": f"Grad Fac {suffix}", "institution": inst_id, "description": "Test", "location": "Test"
    }, headers=super_headers, verify=False)
    fac_id = fac_res.json()["id"]

    dept_res = requests.post(f"{BASE_URL}/faculties/departments/", json={
        "name": f"Grad Dept {suffix}", "code": f"GD{suffix}", "faculty": fac_id, "institution": inst_id
    }, headers=super_headers, verify=False)
    dept_id = dept_res.json()["id"]

    # Create a 2-year program
    prog_res = requests.post(f"{BASE_URL}/faculties/programs/", json={
        "name": f"Grad Prog {suffix}", "code": f"GP{suffix}", "level": "Diploma", "department": dept_id, "duration": 2, "category": "STEM"
    }, headers=super_headers, verify=False)
    prog_id = prog_res.json()["id"]
    prog_code = prog_res.json()["code"]

    # 3. Login as Inst Admin
    admin_login_res = requests.post(f"{BASE_URL}/users/token/", json={
        "email": admin_creds['email'], "password": admin_creds['password']
    }, verify=False)
    headers = {"Authorization": f"Bearer {admin_login_res.json()['access']}"}
    
    # 4. Test Template Download
    print("\n--- Testing Template Download ---")
    template_res = requests.get(f"{BASE_URL}/academic/graduates-mgmt/template/", headers=headers, verify=False)
    if template_res.status_code == 200 and 'spreadsheetml' in template_res.headers.get('Content-Type', ''):
        print("✅ Template downloaded successfully.")
    else:
        print(f"❌ Template download failed: {template_res.status_code}")
        sys.exit(1)

    # 5. Test Bulk Upload (Creating new historical graduates)
    print("\n--- Testing Bulk Upload ---")
    df = pd.DataFrame([
        {"student_id": f"H1-{suffix}", "national_id": f"N1-{suffix}", "first_name": "Hist", "last_name": "One", "gender": "Male", "program_code": prog_code, "enrollment_year": 2020, "graduation_year": 2022, "final_grade": "Pass"},
        {"student_id": f"H2-{suffix}", "national_id": f"N2-{suffix}", "first_name": "Hist", "last_name": "Two", "gender": "Female", "program_code": prog_code, "enrollment_year": 2020, "graduation_year": 2022, "final_grade": "Distinction"}
    ])
    
    excel_buffer = io.BytesIO()
    df.to_excel(excel_buffer, index=False)
    excel_buffer.seek(0)
    
    upload_res = requests.post(
        f"{BASE_URL}/academic/graduates-mgmt/bulk-upload/",
        headers=headers,
        files={'file': ('graduates.xlsx', excel_buffer, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')},
        verify=False
    )
    
    if upload_res.status_code == 201:
        print(f"✅ Bulk upload successful: {upload_res.json()}")
    else:
        print(f"❌ Bulk upload failed: {upload_res.status_code} - {upload_res.text}")
        sys.exit(1)

    # 6. Test Bulk Actions (Revert)
    print("\n--- Testing Bulk Revert ---")
    # First, get the IDs of the newly uploaded students
    students_res = requests.get(f"{BASE_URL}/academic/students/", headers=headers, verify=False)
    students = students_res.json()
    student_ids = [s['id'] for s in students if s['status'] == 'Graduated']
    
    revert_res = requests.post(
        f"{BASE_URL}/academic/graduates-mgmt/bulk-actions/",
        headers=headers,
        json={"student_ids": student_ids, "action": "revert"},
        verify=False
    )
    
    if revert_res.status_code == 200:
        print(f"✅ Bulk revert successful: {revert_res.json()}")
        # Verify status is Active
        s_res = requests.get(f"{BASE_URL}/academic/students/{student_ids[0]}/", headers=headers, verify=False)
        if s_res.json()['status'] == 'Active':
            print("✅ Verified status is now Active.")
        else:
            print("❌ Status did not change to Active.")
            sys.exit(1)
    else:
        print(f"❌ Bulk revert failed: {revert_res.text}")
        sys.exit(1)

    # 7. Test Bulk Actions (Delete)
    print("\n--- Testing Bulk Delete ---")
    # Need to mark them graduated again first for the query to work, or just change the queryset logic to not strictly enforce status='Graduated' for delete?
    # Ah, my endpoint enforces `status='Graduated'` for safety. Let's re-graduate them.
    for sid in student_ids:
        requests.patch(f"{BASE_URL}/academic/students/{sid}/", json={"status": "Graduated", "graduation_year": 2022, "final_grade": "Pass"}, headers=headers, verify=False)
    
    delete_res = requests.post(
        f"{BASE_URL}/academic/graduates-mgmt/bulk-actions/",
        headers=headers,
        json={"student_ids": [student_ids[0]], "action": "delete"},
        verify=False
    )
    
    if delete_res.status_code == 200:
        print(f"✅ Bulk delete successful: {delete_res.json()}")
    else:
        print(f"❌ Bulk delete failed: {delete_res.text}")
        sys.exit(1)

    # 8. Test Auto-Graduation Eligibility
    print("\n--- Testing Auto-Graduation Eligibility ---")
    # Create active students enrolled 2 years ago (2022), they should be eligible in 2024. But wait, it's 2026.
    # So enrollment_year = 2024 (2024 + 2 = 2026 <= 2026 -> Eligible!)
    e1_resp = requests.post(f"{BASE_URL}/academic/students/", json={
        "student_id": f"E1-{suffix}", "national_id": f"NE1-{suffix}", "first_name": "Eligible", "last_name": "One",
        "gender": "Male", "enrollment_year": 2024, "status": "Active", "institution": inst_id, "program": prog_id,
        "selected_level": "Diploma", "selected_category": "STEM"
    }, headers=super_headers, verify=False)
    e1_id = e1_resp.json().get("id")
    
    e2_resp = requests.post(f"{BASE_URL}/academic/students/", json={
        "student_id": f"E2-{suffix}", "national_id": f"NE2-{suffix}", "first_name": "Eligible", "last_name": "Two",
        "gender": "Female", "enrollment_year": 2024, "status": "Active", "institution": inst_id, "program": prog_id,
        "selected_level": "Diploma", "selected_category": "STEM"
    }, headers=super_headers, verify=False)
    e2_id = e2_resp.json().get("id")

    elig_res = requests.get(f"{BASE_URL}/academic/graduates-mgmt/eligible/", headers=headers, verify=False)
    if elig_res.status_code == 200:
        elig_data = elig_res.json()
        print(f"✅ Found {len(elig_data)} eligible cohorts.")
        if len(elig_data) > 0 and elig_data[0]['student_count'] >= 2:
            print("✅ Verified eligible students count.")
            expected_year = elig_data[0]['expected_year']
        else:
            print(f"❌ Eligible count is incorrect: {elig_data}")
            sys.exit(1)
    else:
        print(f"❌ Eligible fetch failed: {elig_res.text}")
        sys.exit(1)

    # 9. Test Auto-Graduation Confirm
    print("\n--- Testing Auto-Graduation Confirm ---")
    # Let's exclude E2 (we'll fetch its ID first)


    confirm_res = requests.post(
        f"{BASE_URL}/academic/graduates-mgmt/confirm-auto/",
        headers=headers,
        json={"program_id": prog_id, "expected_year": expected_year, "excluded_student_ids": [e2_id], "default_grade": "Credit"},
        verify=False
    )

    if confirm_res.status_code == 200:
        print(f"✅ Auto-graduation confirm successful: {confirm_res.json()}")
        # Verify E1 is graduated, E2 is still active
        e1_res = requests.get(f"{BASE_URL}/academic/students/{e1_id}/", headers=headers, verify=False).json()
        e2_res = requests.get(f"{BASE_URL}/academic/students/{e2_id}/", headers=headers, verify=False).json()
        
        if e1_res['status'] == 'Graduated' and e2_res['status'] == 'Active':
            print("✅ Verified statuses correctly updated with exclusions.")
        else:
            print(f"❌ Status mismatch. E1: {e1_res['status']}, E2: {e2_res['status']}")
            sys.exit(1)
    else:
        print(f"❌ Auto-graduation confirm failed: {confirm_res.text}")
        sys.exit(1)

    # 10. Cleanup
    requests.delete(f"{BASE_URL}/academic/institutions/{inst_id}/", headers=super_headers, verify=False)
    print("\n✨ ALL GRADUATION ENDPOINTS VERIFIED!")

if __name__ == "__main__":
    import urllib3
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
    smoke_test_graduates()
