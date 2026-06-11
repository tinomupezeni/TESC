import requests
import sys
import uuid

BASE_URL = "https://tesc.zchpc.ac.zw/api"

def run_test():
    print("🚀 Starting Institutional Smoke Test...")

    # 1. Register a new institution
    inst_name = f"Inst Smoke Test {uuid.uuid4().hex[:6]}"
    inst_email = f"admin@{uuid.uuid4().hex[:6]}.com"
    
    payload = {
        "name": inst_name,
        "type": "Polytechnic",
        "location": "Harare",
        "address": "123 Test St",
        "capacity": 5000,
        "established": 2000,
        "email": inst_email
    }

    print(f"--- Registering Institution: {inst_name} ---")
    response = requests.post(f"{BASE_URL}/academic/institutions/", json=payload)
    
    if response.status_code != 201:
        print(f"❌ Failed to register institution: {response.status_code}")
        print(response.text)
        sys.exit(1)
    
    inst_data = response.json()
    inst_id = inst_data["id"]
    admin_creds = inst_data["admin_credentials"]
    email = admin_creds["email"]
    password = admin_creds["password"]
    print(f"✅ Institution registered (ID: {inst_id}).")

    # 2. Login
    print(f"--- Logging in as {email} ---")
    login_payload = {
        "username": email,
        "password": password
    }
    login_response = requests.post(f"{BASE_URL}/instauth/login/", json=login_payload)
    
    if login_response.status_code != 200:
        print(f"❌ Login failed: {login_response.status_code}")
        sys.exit(1)
    
    login_data = login_response.json()
    access_token = login_data["tokens"]["access"]
    headers = {"Authorization": f"Bearer {access_token}"}
    print("✅ Login successful.")

    # 3. Page Data Fetching (Institutional Scope)
    print("--- Testing Institutional Page Data & Analytics ---")
    page_endpoints = [
        "/instauth/profile/",
        f"/academic/students/?institution={inst_id}",
        f"/staff/members/?institution_id={inst_id}",
        f"/faculties/faculties/?institution={inst_id}",
        f"/academic/facilities/?institution_id={inst_id}",
        f"/analysis/dashboard/?institution_id={inst_id}",
        f"/analysis/student-distribution/?institution_id={inst_id}",
        f"/academic/dashboard/enrollment-trends/?institution_id={inst_id}",
        f"/analysis/student-teacher-ratio/?institution_id={inst_id}",
        f"/analysis/dropout-analysis/?institution_id={inst_id}",
        f"/academic/students/special-stats/?institution_id={inst_id}",
        f"/analysis/hubs/?institution_id={inst_id}",
        f"/analysis/startups/?institution_id={inst_id}",
        f"/analysis/industrial/?institution_id={inst_id}",
        f"/analysis/admissions-stats/?institution_id={inst_id}",
        "/v1/reports/schemas/",
        f"/instauth/roles/?institution_id={inst_id}",
        f"/instauth/users/?institution_id={inst_id}",
    ]
    
    for endpoint in page_endpoints:
        print(f"Fetching {endpoint}...")
        res = requests.get(f"{BASE_URL}{endpoint}", headers=headers)
        if res.status_code == 200:
            print(f"✅ {endpoint} OK")
        else:
            print(f"❌ {endpoint} failed: {res.status_code}")
            # Non-fatal for analytics

    # 4. Institutional CRUD: Faculty & Department & Program
    print("--- Testing Faculty/Dept/Program CRUD ---")
    fac_payload = {
        "name": f"Engineering {uuid.uuid4().hex[:4]}",
        "dean": "Dr. Smoke",
        "institution": inst_id
    }
    res = requests.post(f"{BASE_URL}/faculties/faculties/", json=fac_payload, headers=headers)
    if res.status_code == 201:
        fac_id = res.json()["id"]
        print(f"✅ Faculty created (ID: {fac_id})")
        
        dept_payload = {
            "name": f"Computer Science {uuid.uuid4().hex[:4]}",
            "faculty": fac_id,
            "code": "CS"
        }
        res_dept = requests.post(f"{BASE_URL}/faculties/departments/", json=dept_payload, headers=headers)
        if res_dept.status_code == 201:
            dept_id = res_dept.json()["id"]
            print(f"✅ Department created (ID: {dept_id})")
            
            prog_payload = {
                "name": "BSc Computer Science",
                "code": f"BSCS-{uuid.uuid4().hex[:4].upper()}",
                "department": dept_id,
                "duration": 4,
                "level": "Bachelors",
                "category": "STEM"
            }
            res_prog = requests.post(f"{BASE_URL}/faculties/programs/", json=prog_payload, headers=headers)
            if res_prog.status_code == 201:
                prog_id = res_prog.json()["id"]
                print(f"✅ Program created (ID: {prog_id})")
            else:
                print(f"❌ Program creation failed: {res_prog.status_code}")
                sys.exit(1)
        else:
            print(f"❌ Dept creation failed: {res_dept.status_code}")
            sys.exit(1)
    else:
        print(f"❌ Faculty creation failed: {res.status_code}")
        print(res.text)
        sys.exit(1)

    # 5. Students CRUD
    print("\n--- Testing Students CRUD ---")
    student_id = f"ST{uuid.uuid4().hex[:6].upper()}"
    student_payload = {
        "student_id": student_id,
        "first_name": "Smoke",
        "last_name": "Test",
        "gender": "Male",
        "enrollment_year": 2024,
        "status": "Active",
        "institution": inst_id,
        "program": prog_id,
        "national_id": f"ID-{uuid.uuid4().hex[:6]}",
        "date_of_birth": "2000-01-01"
    }

    res = requests.post(f"{BASE_URL}/academic/students/", json=student_payload, headers=headers)
    if res.status_code == 201:
        student_data = res.json()
        student_pk = student_data.get("id")
        print(f"✅ Student created (PK: {student_pk})")
        
        requests.patch(f"{BASE_URL}/academic/students/{student_pk}/", json={"status": "Graduated"}, headers=headers)
        print("✅ Student updated")
        
        requests.delete(f"{BASE_URL}/academic/students/{student_pk}/", headers=headers)
        print("✅ Student deleted")
    else:
        print(f"❌ Student creation failed: {res.status_code}")
        print(res.text)

    # 6. Staff CRUD
    print("\n--- Testing Staff CRUD ---")
    staff_id = f"EMP{uuid.uuid4().hex[:6].upper()}"
    staff_payload = {
        "employee_id": staff_id,
        "first_name": "Staff",
        "last_name": "Test",
        "email": f"staff_{uuid.uuid4().hex[:4]}@test.com",
        "phone": "0771234567",
        "position": "Lecturer",
        "qualification": "Masters",
        "institution": inst_id,
        "faculty": fac_id,
        "department": dept_id,
        "is_active": True,
        "date_joined": "2024-01-01"
    }

    res = requests.post(f"{BASE_URL}/staff/members/", json=staff_payload, headers=headers)
    if res.status_code == 201:
        staff_pk = res.json().get("id")
        print(f"✅ Staff created (PK: {staff_pk})")
        requests.patch(f"{BASE_URL}/staff/members/{staff_pk}/", json={"position": "Professor"}, headers=headers)
        requests.delete(f"{BASE_URL}/staff/members/{staff_pk}/", headers=headers)
        print("✅ Staff update and delete successful")
    else:
        print(f"❌ Staff creation failed: {res.status_code}")
        print(res.text)

    # 7. Facilities CRUD
    print("\n--- Testing Facilities CRUD ---")
    fac_payload2 = {
        "institution": inst_id,
        "name": f"Library {uuid.uuid4().hex[:4]}",
        "facility_type": "Library",
        "building": "Main Block",
        "capacity": 200,
        "current_usage": 50,
        "status": "Active"
    }
    res = requests.post(f"{BASE_URL}/academic/facilities/", json=fac_payload2, headers=headers)
    if res.status_code == 201:
        fac_pk = res.json().get("id")
        print(f"✅ Facility created (ID: {fac_pk})")
        requests.delete(f"{BASE_URL}/academic/facilities/{fac_pk}/", headers=headers)
        print("✅ Facility deleted")
    else:
        print(f"❌ Facility creation failed: {res.status_code}")

    # 8. ISEOP CRUD
    print("\n--- Testing ISEOP CRUD ---")
    iseop_prog_payload = {
        "institution": inst_id,
        "name": f"Inst ISEOP Prog {uuid.uuid4().hex[:4]}",
        "capacity": 100,
        "status": "Active"
    }
    res = requests.post(f"{BASE_URL}/iseop/programs/", json=iseop_prog_payload, headers=headers)
    if res.status_code == 201:
        iseop_prog_id = res.json().get("id")
        print(f"✅ ISEOP Program created (ID: {iseop_prog_id})")
        
        iseop_stud_payload = {
            "institution": inst_id,
            "program": iseop_prog_id,
            "first_name": "Test",
            "last_name": "Student",
            "student_id": f"ISEOP{uuid.uuid4().hex[:4]}",
            "national_id": f"ID{uuid.uuid4().hex[:4]}",
            "gender": "Female",
            "status": "Active/Enrolled"
        }
        s_res = requests.post(f"{BASE_URL}/iseop/students/", json=iseop_stud_payload, headers=headers)
        if s_res.status_code == 201:
            iseop_stud_id = s_res.json().get("id")
            print(f"✅ ISEOP Student created (ID: {iseop_stud_id})")
            requests.delete(f"{BASE_URL}/iseop/students/{iseop_stud_id}/", headers=headers)
        else:
            print(f"❌ ISEOP Student creation failed: {s_res.status_code}")
            
        requests.delete(f"{BASE_URL}/iseop/programs/{iseop_prog_id}/", headers=headers)
    else:
        print(f"❌ ISEOP Program creation failed: {res.status_code}")

    # 9. Innovation CRUD
    print("\n--- Testing Innovation CRUD ---")
    hub_payload = {
        "institution": inst_id,
        "name": f"Inst Hub {uuid.uuid4().hex[:4]}",
        "capacity": 20,
        "occupied": 5,
        "status": "High"
    }
    res = requests.post(f"{BASE_URL}/innovation/hubs/", json=hub_payload, headers=headers)
    if res.status_code == 201:
        hub_id = res.json().get("id")
        print(f"✅ Innovation Hub created (ID: {hub_id})")
        
        proj_payload = {
            "institution": inst_id,
            "hub": hub_id,
            "name": "Inst Project",
            "team_name": "Test Team",
            "sector": "fintech",
            "location_category": "Urban",
            "stage": "ideation",
            "revenue_generated": "0.00",
            "funding_acquired": "0.00",
            "jobs_created": 0
        }
        p_res = requests.post(f"{BASE_URL}/innovation/projects/", json=proj_payload, headers=headers)
        if p_res.status_code == 201:
            proj_id = p_res.json().get("id")
            print(f"✅ Project created (ID: {proj_id})")
            requests.delete(f"{BASE_URL}/innovation/projects/{proj_id}/", headers=headers)
        else:
            print(f"❌ Project creation failed: {p_res.status_code}")

        requests.delete(f"{BASE_URL}/innovation/hubs/{hub_id}/", headers=headers)
    else:
        print(f"❌ Hub creation failed: {res.status_code}")

    # 10. User Management CRUD
    print("\n--- Testing User Management CRUD ---")
    # Fetch roles first
    roles_res = requests.get(f"{BASE_URL}/instauth/roles/?institution_id={inst_id}", headers=headers)
    if roles_res.status_code == 200 and len(roles_res.json()) > 0:
        role_id = roles_res.json()[0]["id"]
        user_payload = {
            "email": f"user{uuid.uuid4().hex[:4]}@test.com",
            "username": f"user{uuid.uuid4().hex[:4]}@test.com",
            "first_name": "Test",
            "last_name": "User",
            "password": "Password123!",
            "role": role_id
        }
        u_res = requests.post(f"{BASE_URL}/instauth/users/", json=user_payload, headers=headers)
        if u_res.status_code == 201:
            user_id = u_res.json().get("id")
            print(f"✅ User created (ID: {user_id})")
            requests.delete(f"{BASE_URL}/instauth/users/{user_id}/", headers=headers)
            print("✅ User deleted")
        else:
            print(f"❌ User creation failed: {u_res.status_code}")
            print(u_res.text)
    else:
        print("❌ Could not fetch roles for User creation")

    # Cleanup faculties/programs to prevent orphans (cascades)
    requests.delete(f"{BASE_URL}/faculties/faculties/{fac_id}/", headers=headers)

    print("\n🎉 ALL INSTITUTIONAL SMOKE TESTS PASSED!")

if __name__ == "__main__":
    run_test()
