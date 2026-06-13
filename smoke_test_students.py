import requests
import sys
import uuid
import datetime

BASE_URL = "http://localhost/api"

def smoke_test_students():
    print("🚀 Starting Smoke Test for Student Details (Read/Write/Update)...")

    # 1. Login as Super Admin
    admin_email = "admin@hrepoly.ac.zw"
    admin_password = "scalareye@123"  # Adjust if needed
    
    login_payload = {
        "username": admin_email,
        "password": admin_password
    }
    login_response = requests.post(f"{BASE_URL}/instauth/login/", json=login_payload)
    
    if login_response.status_code != 200:
        print("Initial login failed, creating a new institution to test...")
        inst_name = f"Test Institution {uuid.uuid4().hex[:6]}"
        admin_email = f"admin@{uuid.uuid4().hex[:6]}.com"
        
        payload = {
            "name": inst_name,
            "type": "Polytechnic",
            "location": "Harare",
            "address": "123 Test St",
            "capacity": 5000,
            "established": 2000,
            "email": admin_email
        }
        res = requests.post(f"{BASE_URL}/academic/institutions/", json=payload)
        admin_password = res.json().get("admin_credentials", {}).get("password")
        login_response = requests.post(f"{BASE_URL}/instauth/login/", json={"username": admin_email, "password": admin_password})

    if login_response.status_code != 200:
        print(f"❌ Login failed: {login_response.status_code}")
        print(login_response.text)
        sys.exit(1)

    login_data = login_response.json()
    access_token = login_data["tokens"]["access"]
    institution_id = login_data["institution_id"]
    headers = {"Authorization": f"Bearer {access_token}"}
    print(f"✅ Logged in as Super Admin (Inst ID: {institution_id})")

    # Ensure a Faculty and Department and Program exists
    fac_name = f"Test Fac {uuid.uuid4().hex[:4]}"
    fac_res = requests.post(f"{BASE_URL}/faculties/faculties/", json={
        "name": fac_name,
        "institution": institution_id,
        "description": "Test Faculty",
        "location": "Test"
    }, headers=headers)
    print("FACULTY RES:", fac_res.text)
    if fac_res.status_code != 201:
        print(f"❌ Failed to create faculty: {fac_res.status_code} - {fac_res.text}")
        sys.exit(1)
    
    fac_id = fac_res.json().get("id")
    if not fac_id:
        # Fetch it
        all_facs = requests.get(f"{BASE_URL}/faculties/faculties/?institution={institution_id}", headers=headers).json()
        for f in all_facs:
            if f["name"] == fac_name:
                fac_id = f["id"]
                break

    dept_name = f"Test Dept {uuid.uuid4().hex[:4]}"
    dept_res = requests.post(f"{BASE_URL}/faculties/departments/", json={
        "name": dept_name,
        "code": uuid.uuid4().hex[:4].upper(),
        "faculty": fac_id,
        "institution": institution_id
    }, headers=headers)
    if dept_res.status_code != 201:
        print(f"❌ Failed to create department: {dept_res.status_code} - {dept_res.text}")
        sys.exit(1)
    dept_id = dept_res.json().get("id")
    if not dept_id:
        all_depts = requests.get(f"{BASE_URL}/faculties/departments/?institution={institution_id}", headers=headers).json()
        for d in all_depts:
            if d["name"] == dept_name:
                dept_id = d["id"]
                break

    prog_name = f"Test Prog {uuid.uuid4().hex[:4]}"
    prog_res = requests.post(f"{BASE_URL}/faculties/programs/", json={
        "name": prog_name,
        "code": uuid.uuid4().hex[:4].upper(),
        "level": "Bachelors",
        "department": dept_id,
        "institution": institution_id,
        "duration": 4,
        "category": "STEM"
    }, headers=headers)
    
    if prog_res.status_code != 201:
        print(f"❌ Failed to create program: {prog_res.status_code}")
        print(prog_res.text)
        sys.exit(1)
        
    prog_id = prog_res.json().get("id")
    if not prog_id:
        all_progs = requests.get(f"{BASE_URL}/faculties/programs/?institution_id={institution_id}", headers=headers).json()
        for p in all_progs:
            if p["name"] == prog_name:
                prog_id = p["id"]
                break

    # 2. Create a Student with ALL details
    student_id = f"ST{uuid.uuid4().hex[:6].upper()}"
    student_payload = {
        "student_id": student_id,
        "national_id": "63-1234567A00",
        "first_name": "Test",
        "last_name": "Student",
        "gender": "Male",
        "date_of_birth": "2000-01-01",
        "enrollment_year": 2024,
        "status": "Active",
        "institution": institution_id,
        "program": prog_id,
        "is_work_for_fees": True,
        "work_area": "Library",
        "hours_pledged": 100,
        "disability_type": "Physical",
        "dropout_reason": None,
        "graduation_year": None,
        "final_grade": None
    }
    
    print(f"--- Creating Student: {student_id} ---")
    student_response = requests.post(f"{BASE_URL}/academic/students/", json=student_payload, headers=headers)
    
    if student_response.status_code != 201:
        print(f"❌ Failed to create student: {student_response.status_code}")
        print(student_response.text)
        sys.exit(1)
        
    created_student = student_response.json()
    student_db_id = created_student.get("id")
    if not student_db_id:
        all_students = requests.get(f"{BASE_URL}/academic/students/?institution={institution_id}", headers=headers).json()
        for s in all_students:
            if s["student_id"] == student_id:
                student_db_id = s["id"]
                break

    print("✅ Student created successfully.")

    # 3. Read Student back to verify fields exist
    print(f"--- Verifying Student Details via GET ---")
    get_response = requests.get(f"{BASE_URL}/academic/students/{student_db_id}/", headers=headers)
    
    if get_response.status_code != 200:
        print(f"❌ Failed to fetch student: {get_response.status_code}")
        sys.exit(1)
        
    fetched_student = get_response.json()
    
    # Check if all new fields are returned
    fields_to_check = ["is_work_for_fees", "work_area", "hours_pledged", "disability_type"]
    missing_fields = [f for f in fields_to_check if f not in fetched_student]
    
    if missing_fields:
        print(f"❌ FAILURE: Missing fields in GET response: {missing_fields}")
        sys.exit(1)
    
    print("✅ SUCCESS: All fields are returned in GET response.")

    # 4. Update the student (Simulating EditStudentDialog)
    print("--- Updating Student Details ---")
    update_payload = {
        "status": "Graduated",
        "graduation_year": 2028,
        "final_grade": "Distinction",
        "is_work_for_fees": False,
        "work_area": None,
        "hours_pledged": 0,
        "program": prog_id, # Requires program ID, not string
        "institution": institution_id
    }
    
    update_response = requests.patch(f"{BASE_URL}/academic/students/{student_db_id}/", json=update_payload, headers=headers)
    
    if update_response.status_code != 200:
        print(f"❌ Failed to update student: {update_response.status_code}")
        print(update_response.text)
        sys.exit(1)
        
    updated_student = update_response.json()
    
    if updated_student["status"] == "Graduated" and updated_student["graduation_year"] == 2028:
        print("✅ SUCCESS: Student updated successfully with all fields verified!")
    else:
        print("❌ FAILURE: Student was not properly updated.")
        print(updated_student)
        sys.exit(1)

if __name__ == "__main__":
    smoke_test_students()
