import requests
import sys
import uuid
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

BASE_URL = "https://localhost/api"
SUPER_ADMIN_EMAIL = "admin@scalareye.com"
SUPER_ADMIN_PASSWORD = "scalareye@123"

def run_test():
    print("🚀 Starting Program Duration & Optional Placement Smoke Test...")

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
    inst_email = f"admin_duration_{suffix}@test.com"
    
    res_inst = requests.post(f"{BASE_URL}/academic/institutions/", json={
        "name": f"Duration Smoke Inst {suffix}", "type": "Polytechnic", "location": "HARARE", "established": 2020, "email": inst_email
    }, headers=super_headers, verify=False)

    if res_inst.status_code != 201:
        print(f"❌ Failed to create institution: {res_inst.status_code}")
        sys.exit(1)

    inst_id = res_inst.json()['id']
    inst_admin_creds = res_inst.json()['admin_credentials']
    print(f"✅ Created Inst (ID: {inst_id})")

    # 3. Login as Inst Admin
    print(f"--- Logging in as Inst Admin ({inst_email}) ---")
    login_inst_res = requests.post(f"{BASE_URL}/users/token/", json={
        "email": inst_admin_creds['email'], "password": inst_admin_creds['password']
    }, verify=False)
    if login_inst_res.status_code != 200:
        print(f"❌ Inst Admin login failed: {login_inst_res.status_code}")
        sys.exit(1)
    
    headers_inst = {"Authorization": f"Bearer {login_inst_res.json()['access']}"}
    print("✅ Inst Admin logged in.")

    # 4. Create Program with NO department/faculty and flexible duration (1 Year, 6 Months)
    print("--- Creating Program with Optional Placement and 1 Year 6 Months Duration ---")
    prog_payload = {
        "department": None,
        "name": f"Flexible Program {suffix}",
        "code": f"FLEX-{suffix}",
        "duration_years": 1,
        "duration_months": 6,
        "duration_weeks": 0,
        "duration_days": 0,
        "levels": ["Degree"],
        "categories": ["STEM"],
        "program_type": "Degree",
        "description": "Test program with flexible duration and optional placement"
    }

    prog_res = requests.post(
        f"{BASE_URL}/faculties/programs/",
        json=prog_payload,
        headers=headers_inst,
        verify=False
    )

    if prog_res.status_code != 201:
        print(f"❌ Failed to create program: {prog_res.status_code}")
        print(prog_res.text)
        sys.exit(1)

    prog_data = prog_res.json()
    prog_id = prog_data["id"]
    print(f"✅ Program created successfully (ID: {prog_id})")

    # Check computed duration
    duration = float(prog_data["duration"])
    expected_duration = 1.5
    print(f"Computed duration float: {duration}")
    if abs(duration - expected_duration) < 0.001:
        print("✅ Computed duration matches expected 1.5 Years.")
    else:
        print(f"❌ Computed duration mismatch! Expected: {expected_duration}, Got: {duration}")
        sys.exit(1)

    # 5. Create student using this Program
    print("--- Creating Student with newly created program ---")
    student_payload = {
        "student_id": f"ST-{suffix}",
        "national_id": f"NAT-{suffix}",
        "first_name": "JOHN",
        "last_name": "DOE",
        "gender": "Male",
        "date_of_birth": "2000-01-01",
        "enrollment_year": 2026,
        "status": "Active",
        "institution": inst_id,
        "faculty": None,
        "department": None,
        "program": prog_id,
        "selected_level": "Degree",
        "selected_category": "STEM"
    }

    student_res = requests.post(
        f"{BASE_URL}/academic/students/",
        json=student_payload,
        headers=headers_inst,
        verify=False
    )

    if student_res.status_code != 201:
        print(f"❌ Student creation failed: {student_res.status_code}")
        print(student_res.text)
        sys.exit(1)

    student_data = student_res.json()
    print(f"✅ Student created successfully (ID: {student_data['id']})")
    
    # 6. Test Auto-Creation of a Program without department when adding a Student
    print("--- Test Program Auto-Creation without department via student add ---")
    student_auto_payload = {
        "student_id": f"STAUTO-{suffix}",
        "national_id": f"NATAUTO-{suffix}",
        "first_name": "JANE",
        "last_name": "DOE",
        "gender": "Female",
        "date_of_birth": "2001-01-01",
        "enrollment_year": 2026,
        "status": "Active",
        "institution": inst_id,
        "faculty": None,
        "department": None,
        "new_program_code": f"AUTOP-{suffix}",
        "new_program_name": f"Auto Program {suffix}",
        "new_program_level": "Degree",
        "new_program_category": "STEM",
        "selected_level": "Degree",
        "selected_category": "STEM"
      }

    student_auto_res = requests.post(
        f"{BASE_URL}/academic/students/",
        json=student_auto_payload,
        headers=headers_inst,
        verify=False
    )

    if student_auto_res.status_code != 201:
        print(f"❌ Student creation with program auto-create failed: {student_auto_res.status_code}")
        print(student_auto_res.text)
        sys.exit(1)

    student_auto_data = student_auto_res.json()
    print(f"✅ Student with auto-created program created successfully (ID: {student_auto_data['id']})")
    print(f"✅ Program name returned: {student_auto_data['program_name']}")

    # 7. Cleanup
    print("--- Cleanup ---")
    requests.delete(f"{BASE_URL}/academic/institutions/{inst_id}/", headers=super_headers, verify=False)
    print("✅ Cleanup complete.")

    print("\n✨ DURATION AND PLACEMENT SMOKE TEST PASSED!")

if __name__ == "__main__":
    run_test()
