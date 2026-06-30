import requests
import sys
import uuid
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

BASE_URL = "http://localhost:8000/api"
SUPER_ADMIN_EMAIL = "admin@scalareye.com"
SUPER_ADMIN_PASSWORD = "scalareye@123"

def run_test():
    print("🚀 Starting Student Directory Refactoring Smoke Test...")

    # 1. Login as Super Admin
    print("--- Logging in as Super Admin ---")
    login_payload = {"email": SUPER_ADMIN_EMAIL, "password": SUPER_ADMIN_PASSWORD}
    login_res = requests.post(f"{BASE_URL}/users/token/", json=login_payload, verify=False)
    if login_res.status_code != 200:
        print(f"❌ Super Admin login failed: {login_res.status_code}")
        sys.exit(1)
    
    super_headers = {"Authorization": f"Bearer {login_res.json()['access']}"}
    print("✅ Super Admin logged in.")

    # 2. Create test institution
    print("--- Creating test institution ---")
    suffix = uuid.uuid4().hex[:6].upper()
    inst_email = f"admin_refactor_{suffix}@test.com"
    
    res_inst = requests.post(f"{BASE_URL}/academic/institutions/", json={
        "name": f"Refactor Smoke Inst {suffix}", "type": "Polytechnic", "location": "HARARE", "established": 2020, "email": inst_email
    }, headers=super_headers, verify=False)

    if res_inst.status_code != 201:
        print(f"❌ Failed to create institution: {res_inst.status_code}")
        sys.exit(1)

    inst_id = res_inst.json()['id']
    inst_admin_creds = res_inst.json()['admin_credentials']
    print(f"✅ Created Inst (ID: {inst_id})")

    # 3. Create Faculty structure only (no departments or programs)
    print("--- Creating Faculty only ---")
    fac_res = requests.post(f"{BASE_URL}/faculties/faculties/", json={
        "name": f"Refactor Fac {suffix}", "institution": inst_id, "description": "Test", "location": "Test"
    }, headers=super_headers, verify=False)
    
    if fac_res.status_code != 201:
        print(f"❌ Failed to create faculty: {fac_res.status_code}")
        sys.exit(1)
        
    fac_id = fac_res.json()["id"]
    print(f"✅ Created Faculty (ID: {fac_id})")

    # 4. Login as Inst Admin
    print(f"--- Logging in as Inst Admin ({inst_email}) ---")
    login_inst_res = requests.post(f"{BASE_URL}/users/token/", json={
        "email": inst_admin_creds['email'], "password": inst_admin_creds['password']
    }, verify=False)
    if login_inst_res.status_code != 200:
        print(f"❌ Inst Admin login failed: {login_inst_res.status_code}")
        sys.exit(1)
    
    headers_inst = {"Authorization": f"Bearer {login_inst_res.json()['access']}"}
    print("✅ Inst Admin logged in.")

    # 5. Create student with ONLY Faculty selected (no department, no program)
    print("--- Test Student Creation with Optional Cascades & Capitalization ---")
    student_payload = {
        "student_id": "reg-123-abc",          # lowercase
        "national_id": "nat-123-xyz",          # lowercase
        "first_name": "johnny",                # lowercase
        "last_name": "doe",                    # lowercase
        "gender": "Male",
        "date_of_birth": "2000-01-01",
        "enrollment_year": 2026,
        "status": "Active",
        "institution": inst_id,
        "faculty": fac_id,                     # Faculty selected
        "department": None,                    # No department
        "program": None,                       # No program
        "selected_level": "Diploma",
        "selected_category": "STEM"
    }

    student_res = requests.post(
        f"{BASE_URL}/academic/students/",
        json=student_payload,
        headers=headers_inst,
        verify=False
    )

    if student_res.status_code != 201:
        print(f"❌ Student creation failed (expected optional cascade success): {student_res.status_code}")
        print(student_res.text)
        sys.exit(1)

    student_data = student_res.json()
    student_db_id = student_data["id"]
    print("✅ Student created successfully.")

    # Verify capitalization lock
    if (student_data["student_id"] == "REG-123-ABC" and
        student_data["first_name"] == "JOHNNY" and
        student_data["last_name"] == "DOE" and
        student_data["national_id"] == "NAT-123-XYZ"):
        print("✅ Capitalization Lock Success: All text values capitalized in database.")
    else:
        print(f"❌ Capitalization Lock Failure! Returned values: {student_data}")
        sys.exit(1)

    # Verify nullable cascading values
    if student_data["faculty"] == fac_id and student_data["department"] is None and student_data["program"] is None:
        print("✅ Optional cascading placement constraints check PASSED.")
    else:
        print(f"❌ Optional cascading placement constraints check FAILED: {student_data}")
        sys.exit(1)

    # 6. Verify gender validation: 'Other' gender must be rejected
    print("--- Test Gender Constraints Check ---")
    other_gender_payload = {
        **student_payload,
        "student_id": "other-gen-test",
        "gender": "Other"                       # 'Other' is removed
    }

    other_gender_res = requests.post(
        f"{BASE_URL}/academic/students/",
        json=other_gender_payload,
        headers=headers_inst,
        verify=False
    )

    if other_gender_res.status_code == 400:
        print("✅ Gender Check Success: 'Other' gender option was successfully rejected.")
    else:
        print(f"❌ Gender Check Failure! 'Other' was accepted or gave unexpected status: {other_gender_res.status_code}")
        sys.exit(1)

    # 7. Test Autocomplete Select (Update/Save on existing student)
    print("--- Test Autocomplete Selection and Updating Existing Student ---")
    update_payload = {
        "student_id": "REG-123-ABC",
        "first_name": "johnny-updated",        # lowercase
        "last_name": "DOE",
        "national_id": "NAT-123-XYZ",
        "gender": "Male",
        "date_of_birth": "2000-01-01",
        "enrollment_year": 2026,
        "status": "Active",
        "institution": inst_id,
        "faculty": fac_id,
        "department": None,
        "program": None,
        "selected_level": "Degree",            # Update from Diploma to Degree
        "selected_category": "STEM"
    }

    update_res = requests.patch(
        f"{BASE_URL}/academic/students/{student_db_id}/",
        json=update_payload,
        headers=headers_inst,
        verify=False
    )

    if update_res.status_code != 200:
        print(f"❌ Failed to update existing student: {update_res.status_code}")
        print(update_res.text)
        sys.exit(1)

    updated_data = update_res.json()
    if updated_data["id"] == student_db_id and updated_data["selected_level"] == "Degree" and updated_data["first_name"] == "JOHNNY-UPDATED":
        print("✅ Autocomplete Select & Update Existing Student PASSED (No duplicate records created, name capitalized).")
    else:
        print(f"❌ Autocomplete Select & Update Existing Student FAILED: {updated_data}")
        sys.exit(1)

    # 8. Cleanup
    print("--- Cleanup ---")
    requests.delete(f"{BASE_URL}/academic/institutions/{inst_id}/", headers=super_headers, verify=False)
    print("✅ Cleanup complete.")

    print("\n✨ STUDENT DIRECTORY REFACTORING SMOKE TEST PASSED!")

if __name__ == "__main__":
    run_test()
