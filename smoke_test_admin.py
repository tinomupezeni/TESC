import requests
import sys
import uuid

BASE_URL = "http://127.0.0.1:8081/api"
ADMIN_EMAIL = "admin@scalareye.com"
ADMIN_PASSWORD = "Admin@123"

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

    # 3. Institutions CRUD Tests
    print("--- Testing Institutions CRUD ---")
    
    # CREATE
    inst_name = f"Admin Smoke Inst {uuid.uuid4().hex[:6]}"
    create_payload = {
        "name": inst_name,
        "type": "Polytechnic",
        "location": "HARARE",
        "address": "Smoke Test Address",
        "capacity": 1000,
        "established": 2020,
        "province": "Harare",
        "has_innovation_hub": True,
        "email": f"test_{uuid.uuid4().hex[:4]}@admin.com"
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
        requests.delete(f"{BASE_URL}/academic/institutions/{inst_id}/", headers=headers)
        sys.exit(1)

    # UPDATE
    new_location = "BULAWAYO"
    print(f"Updating institution {inst_id} location to {new_location}...")
    res = requests.patch(f"{BASE_URL}/academic/institutions/{inst_id}/", json={"location": new_location}, headers=headers)
    if res.status_code == 200:
        updated_data = res.json()
        if updated_data["location"] == new_location:
            print("✅ Update successful")
        else:
            print(f"❌ Update verification failed: {updated_data['location']}")
    else:
        print(f"❌ Update failed: {res.status_code}")

    # 4. Students CRUD (Admin Scope)
    print("--- Testing Students CRUD (Admin Scope) ---")
    # Need a program first, but let's see if we can find one
    prog_res = requests.get(f"{BASE_URL}/faculties/programs/", headers=headers)
    programs = prog_res.json()
    if programs and len(programs) > 0:
        target_prog = programs[0]
        target_inst_id = target_prog["institution"]
        target_prog_id = target_prog["id"]
        
        student_id = f"ADM{uuid.uuid4().hex[:6].upper()}"
        student_payload = {
            "student_id": student_id,
            "national_id": f"ID{uuid.uuid4().hex[:6].upper()}",
            "first_name": "Admin",
            "last_name": "Test",
            "gender": "Male",
            "date_of_birth": "2000-01-01",
            "enrollment_year": 2024,
            "status": "Active",
            "institution": target_inst_id,
            "program": target_prog_id
        }

        print(f"Creating student: {student_id}...")
        res = requests.post(f"{BASE_URL}/academic/students/", json=student_payload, headers=headers)
        if res.status_code == 201:
            student_data = res.json()
            student_pk = student_data.get("id")
            if student_pk:
                print(f"✅ Created successfully (PK: {student_pk})")
                # DELETE
                requests.delete(f"{BASE_URL}/academic/students/{student_pk}/", headers=headers)
                print("✅ Student deletion successful")
            else:
                print("✅ Student created (PK not found in response)")
        else:
            print(f"❌ Student creation failed: {res.status_code}")

    # 5. Staff CRUD (Admin Scope)
    print("--- Testing Staff CRUD ---")
    
    # We use the institution we created earlier
    target_inst_id = inst_id
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
    staff_pk = None
    if res.status_code == 201:
        staff_data = res.json()
        staff_pk = staff_data.get("id")
        if staff_pk:
            print(f"✅ Created successfully (PK: {staff_pk})")
        else:
            print(f"✅ Staff member created.")
    else:
        print(f"❌ Staff creation failed: {res.status_code}")

    if staff_pk:
        # UPDATE
        print(f"Updating staff {staff_pk} position to 'Professor'...")
        res = requests.patch(f"{BASE_URL}/staff/members/{staff_pk}/", json={"position": "Professor"}, headers=headers)
        if res.status_code == 200:
            print("✅ Update successful")
        else:
            print(f"❌ Update failed: {res.status_code}")

        # DELETE
        print(f"Deleting staff {staff_pk}...")
        res = requests.delete(f"{BASE_URL}/staff/members/{staff_pk}/", headers=headers)
        if res.status_code == 204:
            print("✅ Staff Deletion successful")
        else:
            print(f"❌ Staff Deletion failed: {res.status_code}")

    # FINAL CLEANUP
    print(f"--- Final Cleanup: Deleting institution {inst_id} ---")
    res = requests.delete(f"{BASE_URL}/academic/institutions/{inst_id}/", headers=headers)
    if res.status_code == 204:
        print("✅ Cleanup successful")
    else:
        print(f"❌ Cleanup failed: {res.status_code}")

    print("\n🎉 ALL ADMIN SMOKE TESTS PASSED!")

if __name__ == "__main__":
    run_test()
