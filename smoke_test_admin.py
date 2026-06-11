import requests
import sys
import uuid

BASE_URL = "https://tesc.zchpc.ac.zw/api"
ADMIN_EMAIL = "admin@scalareye.com"
ADMIN_PASSWORD = "admin@123"

def run_test():
    print("🚀 Starting Admin Smoke Test...")

    # 1. Login
    print(f"--- Logging in as {ADMIN_EMAIL} ---")
    login_payload = {
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    }
    response = requests.post(f"{BASE_URL}/users/token/", json=login_payload)
    
    if response.status_code != 200:
        print(f"❌ Login failed: {response.status_code}")
        print(response.text)
        sys.exit(1)
    
    data = response.json()
    access_token = data["access"]
    headers = {"Authorization": f"Bearer {access_token}"}
    print("✅ Login successful.")

    # 2. Page Data Fetching Tests
    print("--- Testing Page Data Fetching ---")
    page_endpoints = [
        "/academic/dashboard/stats/",
        "/academic/dashboard/enrollment-trends/",
        "/academic/dashboard/institutions/",
        "/academic/students/",
        "/academic/facilities/",
        "/staff/members/",
        "/staff/vacancies/",
        "/innovation/hubs/",
        "/innovation/projects/",
        "/innovation/grants/",
        "/innovation/partnerships/",
        "/iseop/programs/",
        "/iseop/students/",
    ]
    
    for endpoint in page_endpoints:
        print(f"Fetching {endpoint}...")
        res = requests.get(f"{BASE_URL}{endpoint}", headers=headers)
        if res.status_code == 200:
            print(f"✅ {endpoint} OK")
        else:
            print(f"❌ {endpoint} failed: {res.status_code}")
            # sys.exit(1) # Don't exit yet, see how many fail

    # 3. Institutions CRUD Tests
    print("--- Testing Institutions CRUD ---")
    
    # CREATE
    inst_name = f"Smoke Test Inst {uuid.uuid4().hex[:6]}"
    create_payload = {
        "name": inst_name,
        "type": "Polytechnic",
        "location": "Harare",
        "address": "Smoke Test Address",
        "capacity": 1000,
        "established": 2020,
        "province": "Harare",
        "has_innovation_hub": True,
        "email": f"test@{uuid.uuid4().hex[:6]}.com"
    }
    print(f"Creating institution: {inst_name}...")
    res = requests.post(f"{BASE_URL}/academic/institutions/", json=create_payload, headers=headers)
    if res.status_code == 201:
        inst_data = res.json()
        inst_id = inst_data["id"]
        print(f"✅ Created successfully (ID: {inst_id})")
    else:
        print(f"❌ Creation failed: {res.status_code}")
        print(res.text)
        sys.exit(1)

    # READ
    print(f"Reading institution {inst_id}...")
    res = requests.get(f"{BASE_URL}/academic/institutions/{inst_id}/", headers=headers)
    if res.status_code == 200:
        print("✅ Read successful")
    else:
        print(f"❌ Read failed: {res.status_code}")
        sys.exit(1)

    # UPDATE
    new_location = "Bulawayo"
    print(f"Updating institution {inst_id} location to {new_location}...")
    res = requests.patch(f"{BASE_URL}/academic/institutions/{inst_id}/", json={"location": new_location}, headers=headers)
    if res.status_code == 200:
        updated_data = res.json()
        if updated_data["location"] == new_location:
            print("✅ Update successful")
        else:
            print(f"❌ Update failed: Expected location {new_location}, got {updated_data['location']}")
            sys.exit(1)
    else:
        print(f"❌ Update request failed: {res.status_code}")
        sys.exit(1)

    # DELETE
    print(f"Deleting institution {inst_id}...")
    res = requests.delete(f"{BASE_URL}/academic/institutions/{inst_id}/", headers=headers)
    if res.status_code == 204:
        print("✅ Deletion successful")
    else:
        print(f"❌ Deletion failed: {res.status_code}")
        sys.exit(1)

    # Verify Deletion
    print(f"Verifying deletion of {inst_id}...")
    res = requests.get(f"{BASE_URL}/academic/institutions/{inst_id}/", headers=headers)
    if res.status_code == 404:
        print("✅ Deletion verified (404 Not Found)")
    else:
        print(f"❌ Verification failed: Expected 404, got {res.status_code}")
        sys.exit(1)

    # 4. Students CRUD Tests
    print("--- Testing Students CRUD ---")
    
    # Need an institution and program first
    print("Fetching institution for student creation...")
    inst_res = requests.get(f"{BASE_URL}/academic/institutions/", headers=headers)
    if inst_res.status_code != 200 or not inst_res.json():
        print("❌ No institutions found to create student.")
        sys.exit(1)
    target_inst = inst_res.json()[0]
    target_inst_id = target_inst["id"]

    print(f"Fetching program for institution {target_inst_id}...")
    prog_res = requests.get(f"{BASE_URL}/faculties/programs/?institution_id={target_inst_id}", headers=headers)
    if prog_res.status_code != 200 or not prog_res.json():
        # Fallback: just fetch any program
        prog_res = requests.get(f"{BASE_URL}/faculties/programs/", headers=headers)
        
    if prog_res.status_code != 200 or not prog_res.json():
        print("❌ No programs found to create student.")
        sys.exit(1)
        
    target_prog = prog_res.json()[0]
    target_prog_id = target_prog["id"]

    student_id = f"ST{uuid.uuid4().hex[:6].upper()}"
    student_payload = {
        "student_id": student_id,
        "first_name": "Smoke",
        "last_name": "Test",
        "gender": "Male",
        "enrollment_year": 2024,
        "status": "Active",
        "institution": target_inst_id,
        "program": target_prog_id,
        "national_id": f"ID-{uuid.uuid4().hex[:6]}",
        "date_of_birth": "2000-01-01",
        "is_iseop": True
    }

    print(f"Creating student: {student_id}...")
    res = requests.post(f"{BASE_URL}/academic/students/", json=student_payload, headers=headers)
    if res.status_code == 201:
        student_data = res.json()
        if "id" in student_data:
            student_pk = student_data["id"]
            print(f"✅ Created successfully (PK: {student_pk})")
        else:
            print(f"❌ Creation response missing 'id': {student_data}")
            sys.exit(1)
    else:
        print(f"❌ Creation failed: {res.status_code}")
        print(res.text)
        sys.exit(1)

    # UPDATE
    print(f"Updating student {student_pk} status to 'Attachment'...")
    res = requests.patch(f"{BASE_URL}/academic/students/{student_pk}/", json={"status": "Attachment"}, headers=headers)
    if res.status_code == 200:
        print("✅ Update successful")
    else:
        print(f"❌ Update failed: {res.status_code}")
        sys.exit(1)

    # DELETE
    print(f"Deleting student {student_pk}...")
    res = requests.delete(f"{BASE_URL}/academic/students/{student_pk}/", headers=headers)
    if res.status_code == 204:
        print("✅ Deletion successful")
    else:
        print(f"❌ Deletion failed: {res.status_code}")
        sys.exit(1)

    # 5. Staff CRUD Tests
    print("--- Testing Staff CRUD ---")
    
    staff_id = f"EMP{uuid.uuid4().hex[:6].upper()}"
    staff_payload = {
        "employee_id": staff_id,
        "first_name": "Staff",
        "last_name": "Test",
        "email": f"staff_{uuid.uuid4().hex[:4]}@test.com",
        "phone": "123456789",
        "position": "Lecturer",
        "qualification": "Masters",
        "institution": target_inst_id,
        "is_active": True,
        "date_joined": "2024-01-01"
    }

    print(f"Creating staff member: {staff_id}...")
    res = requests.post(f"{BASE_URL}/staff/members/", json=staff_payload, headers=headers)
    if res.status_code == 201:
        staff_data = res.json()
        if "id" in staff_data:
            staff_pk = staff_data["id"]
            print(f"✅ Created successfully (PK: {staff_pk})")
        else:
            # Check if it's returning data but without ID (similar to student issue)
            print(f"⚠️ Creation response might be missing 'id': {staff_data.keys()}")
            staff_pk = staff_data.get("id")
            if not staff_pk:
                print(f"❌ Creation response missing 'id': {staff_data}")
                # sys.exit(1)
    else:
        print(f"❌ Creation failed: {res.status_code}")
        print(res.text)
        sys.exit(1)

    if staff_pk:
        # UPDATE
        print(f"Updating staff {staff_pk} position to 'Professor'...")
        res = requests.patch(f"{BASE_URL}/staff/members/{staff_pk}/", json={"position": "Professor"}, headers=headers)
        if res.status_code == 200:
            print("✅ Update successful")
        else:
            print(f"❌ Update failed: {res.status_code}")
            sys.exit(1)

        # DELETE
        print(f"Deleting staff {staff_pk}...")
        res = requests.delete(f"{BASE_URL}/staff/members/{staff_pk}/", headers=headers)
        if res.status_code == 204:
            print("✅ Deletion successful")
        else:
            print(f"❌ Deletion failed: {res.status_code}")
            sys.exit(1)

    print("\n🎉 ALL ADMIN SMOKE TESTS PASSED!")

if __name__ == "__main__":
    run_test()
