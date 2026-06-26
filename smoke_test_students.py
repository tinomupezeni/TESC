import requests
import sys
import uuid
import datetime

BASE_URL = "https://localhost/api"
ADMIN_EMAIL = "admin@scalareye.com"
ADMIN_PASSWORD = "scalareye@123"

def smoke_test_students():
    print("🚀 Starting Smoke Test for Student Details (Read/Write/Update)...")

    # 1. Login
    print(f"--- Logging in as {ADMIN_EMAIL} ---")
    login_payload = {
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    }
    login_response = requests.post(f"{BASE_URL}/users/token/", json=login_payload, verify=False)
    
    if login_response.status_code != 200:
        print(f"❌ Login failed: {login_response.status_code}")
        sys.exit(1)

    login_data = login_response.json()
    access_token = login_data["access"]
    headers = {"Authorization": f"Bearer {access_token}"}
    print(f"✅ Logged in successfully.")

    # We need a target institution
    print("Fetching institution for context...")
    inst_res = requests.get(f"{BASE_URL}/academic/institutions/", headers=headers, verify=False)
    if inst_res.status_code != 200 or not inst_res.json():
        print("❌ No institutions found. Creating one...")
        create_inst_res = requests.post(f"{BASE_URL}/academic/institutions/", json={
            "name": f"Student Test Inst {uuid.uuid4().hex[:4]}",
            "type": "Polytechnic",
            "location": "HARARE",
            "established": 2020,
            "email": f"inst_{uuid.uuid4().hex[:4]}@test.com"
        }, headers=headers, verify=False)
        if create_inst_res.status_code != 201:
            print("❌ Failed to create institution")
            sys.exit(1)
        institution_id = create_inst_res.json()["id"]
        delete_inst_at_end = True
    else:
        institution_id = inst_res.json()[0]["id"]
        delete_inst_at_end = False

    # Ensure a Faculty and Department and Program exists
    fac_name = f"Smoke Fac {uuid.uuid4().hex[:4]}"
    fac_res = requests.post(f"{BASE_URL}/faculties/faculties/", json={
        "name": fac_name,
        "institution": institution_id,
        "description": "Smoke Faculty",
        "location": "Test"
    }, headers=headers, verify=False)
    
    if fac_res.status_code != 201:
        print(f"❌ Failed to create faculty: {fac_res.status_code}")
        print(fac_res.text)
        if delete_inst_at_end: requests.delete(f"{BASE_URL}/academic/institutions/{institution_id}/", headers=headers, verify=False)
        sys.exit(1)
    
    fac_id = fac_res.json()["id"]

    dept_name = f"Smoke Dept {uuid.uuid4().hex[:4]}"
    dept_res = requests.post(f"{BASE_URL}/faculties/departments/", json={
        "name": dept_name,
        "code": uuid.uuid4().hex[:4].upper(),
        "faculty": fac_id,
        "institution": institution_id
    }, headers=headers, verify=False)
    
    if dept_res.status_code != 201:
        print(f"❌ Failed to create department: {dept_res.status_code}")
        print(dept_res.text)
        requests.delete(f"{BASE_URL}/faculties/faculties/{fac_id}/", headers=headers, verify=False)
        if delete_inst_at_end: requests.delete(f"{BASE_URL}/academic/institutions/{institution_id}/", headers=headers, verify=False)
        sys.exit(1)
    
    dept_id = dept_res.json()["id"]

    prog_name = f"Smoke Prog {uuid.uuid4().hex[:4]}"
    prog_res = requests.post(f"{BASE_URL}/faculties/programs/", json={
        "name": prog_name,
        "code": uuid.uuid4().hex[:4].upper(),
        "level": "Diploma",
        "department": dept_id,
        "duration": 1,
        "category": "STEM"
    }, headers=headers, verify=False)
    
    if prog_res.status_code != 201:
        print(f"❌ Failed to create program: {prog_res.status_code}")
        print(prog_res.text)
        requests.delete(f"{BASE_URL}/faculties/departments/{dept_id}/", headers=headers, verify=False)
        requests.delete(f"{BASE_URL}/faculties/faculties/{fac_id}/", headers=headers, verify=False)
        if delete_inst_at_end: requests.delete(f"{BASE_URL}/academic/institutions/{institution_id}/", headers=headers, verify=False)
        sys.exit(1)
        
    prog_id = prog_res.json()["id"]

    # 2. Create a Student
    student_id = f"ST{uuid.uuid4().hex[:6].upper()}"
    student_payload = {
        "student_id": student_id,
        "national_id": f"ID{uuid.uuid4().hex[:6].upper()}",
        "first_name": "Smoke",
        "last_name": "Student",
        "gender": "Male",
        "date_of_birth": "2000-01-01",
        "enrollment_year": 2024,
        "status": "Active",
        "institution": institution_id,
        "program": prog_id
    }
    
    print(f"--- Creating Student: {student_id} ---")
    student_response = requests.post(f"{BASE_URL}/academic/students/", json=student_payload, headers=headers, verify=False)
    
    student_db_id = None
    if student_response.status_code == 201:
        student_db_id = student_response.json().get("id")
        print(f"✅ Student created successfully (ID: {student_db_id}).")
    else:
        print(f"❌ Failed to create student: {student_response.status_code}")
        print(student_response.text)

    # 3. Read Student back
    if student_db_id:
        print(f"--- Verifying Student Details via GET ---")
        get_response = requests.get(f"{BASE_URL}/academic/students/{student_db_id}/", headers=headers, verify=False)
        if get_response.status_code == 200:
            print("✅ GET successful")
        else:
            print(f"❌ GET failed: {get_response.status_code}")

    # 4. Cleanup
    print("--- Final Cleanup ---")
    if student_db_id:
        requests.delete(f"{BASE_URL}/academic/students/{student_db_id}/", headers=headers, verify=False)
    requests.delete(f"{BASE_URL}/faculties/programs/{prog_id}/", headers=headers, verify=False)
    requests.delete(f"{BASE_URL}/faculties/departments/{dept_id}/", headers=headers, verify=False)
    requests.delete(f"{BASE_URL}/faculties/faculties/{fac_id}/", headers=headers, verify=False)
    if delete_inst_at_end:
        requests.delete(f"{BASE_URL}/academic/institutions/{institution_id}/", headers=headers, verify=False)
    print("✅ All test data deleted successfully.")

    print("\n✨ STUDENTS SMOKE TEST PASSED!")

if __name__ == "__main__":
    smoke_test_students()
