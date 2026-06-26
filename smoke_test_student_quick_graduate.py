import requests
import sys
import uuid
import time

BASE_URL = "https://localhost/api"
SUPER_ADMIN_EMAIL = "admin@scalareye.com"
SUPER_ADMIN_PASSWORD = "scalareye@123"

def smoke_test_quick_graduate():
    print("🚀 Starting Smoke Test for Quick Mark Graduated...")

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
        "name": f"Quick Grad Inst {suffix}", "type": "Polytechnic", "location": "HARARE", "established": 2020, "email": f"qgrad_{suffix}@test.com"
    }, headers=super_headers, verify=False)
    
    if inst_res.status_code != 201:
        print(f"❌ Failed to create institution: {inst_res.text}")
        sys.exit(1)
        
    inst_id = inst_res.json()['id']
    admin_creds = inst_res.json()['admin_credentials']

    fac_res = requests.post(f"{BASE_URL}/faculties/faculties/", json={
        "name": f"Q Fac {suffix}", "institution": inst_id, "description": "Test", "location": "Test"
    }, headers=super_headers, verify=False)
    fac_id = fac_res.json()["id"]

    dept_res = requests.post(f"{BASE_URL}/faculties/departments/", json={
        "name": f"Q Dept {suffix}", "code": f"QD{suffix}", "faculty": fac_id, "institution": inst_id
    }, headers=super_headers, verify=False)
    dept_id = dept_res.json()["id"]

    prog_res = requests.post(f"{BASE_URL}/faculties/programs/", json={
        "name": f"Q Prog {suffix}", "code": f"QP{suffix}", "level": "Diploma", "department": dept_id, "duration": 2, "category": "STEM"
    }, headers=super_headers, verify=False)
    prog_id = prog_res.json()["id"]

    # 3. Create a student
    student_payload = {
        "student_id": f"Q-{uuid.uuid4().hex[:6].upper()}", "national_id": f"N-{uuid.uuid4().hex[:6].upper()}",
        "first_name": "Quick", "last_name": "Test", "gender": "Female", "date_of_birth": "2000-01-01",
        "enrollment_year": 2024, "status": "Active", "institution": inst_id, "program": prog_id
    }
    s_res = requests.post(f"{BASE_URL}/academic/students/", json=student_payload, headers=super_headers, verify=False)
    if s_res.status_code != 201:
        print(f"❌ Failed to create student: {s_res.text}")
        sys.exit(1)
    student_id = s_res.json()['id']

    # 4. Login as Inst Admin
    admin_login_res = requests.post(f"{BASE_URL}/users/token/", json={
        "email": admin_creds['email'], "password": admin_creds['password']
    }, verify=False)
    headers = {"Authorization": f"Bearer {admin_login_res.json()['access']}"}
    
    # 5. Quick Mark Graduated (PATCH)
    print("\n--- Testing Quick Mark Graduated ---")
    patch_payload = {
        "status": "Graduated",
        "graduation_year": 2026,
        "final_grade": "Distinction"
    }
    patch_res = requests.patch(f"{BASE_URL}/academic/students/{student_id}/", json=patch_payload, headers=headers, verify=False)
    
    if patch_res.status_code == 200:
        updated_student = patch_res.json()
        if updated_student['status'] == 'Graduated' and updated_student['final_grade'] == 'Distinction':
            print("✅ Quick Mark Graduated successful.")
        else:
            print("❌ Status updated but fields incorrect.")
            sys.exit(1)
    else:
        print(f"❌ Quick Mark Graduated failed: {patch_res.status_code} - {patch_res.text}")
        sys.exit(1)

    # 6. Revert to Active (Bulk Actions Endpoint)
    print("\n--- Testing Revert to Active from Graduates Page ---")
    revert_payload = {
        "student_ids": [student_id],
        "action": "revert"
    }
    revert_res = requests.post(f"{BASE_URL}/academic/graduates-mgmt/bulk-actions/", json=revert_payload, headers=headers, verify=False)
    
    if revert_res.status_code == 200:
        # Verify it went back to Active
        verify_res = requests.get(f"{BASE_URL}/academic/students/{student_id}/", headers=headers, verify=False).json()
        if verify_res['status'] == 'Active' and verify_res.get('final_grade') is None:
            print("✅ Revert to Active successful (student still exists).")
        else:
            print("❌ Revert failed to reset fields.")
            sys.exit(1)
    else:
        print(f"❌ Revert to Active failed: {revert_res.text}")
        sys.exit(1)

    # Cleanup
    requests.delete(f"{BASE_URL}/academic/institutions/{inst_id}/", headers=super_headers, verify=False)
    print("\n✨ QUICK GRADUATE & REVERT SMOKE TEST PASSED!")

if __name__ == "__main__":
    import urllib3
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
    smoke_test_quick_graduate()
