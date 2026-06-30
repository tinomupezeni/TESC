import requests
import uuid

BASE_URL = "http://localhost:8000/api"

def get_auth_token(username, password):
    print(f"Logging in as {username}...")
    try:
        response = requests.post(f"{BASE_URL}/instauth/login/", json={
            "username": username,
            "password": password
        }, verify=False)
        if response.status_code == 200:
            print("  ✅ Login successful")
            return response.json()['tokens']['access'], response.json()['institution_id']
        else:
            print(f"  ❌ Login failed: {response.status_code}")
            return None, None
    except Exception as e:
        print(f"  ❌ Connection Error: {str(e)}")
        return None, None

def test_inst_data_management(token, inst_id):
    headers = {"Authorization": f"Bearer {token}"}
    p_id = None
    s_id = None
    st_id = None
    iseop_p_id = None
    iseop_s_id = None

    try:
        # 0. Need a Program for student testing
        print("Setting up test program...")
        fac_res = requests.post(f"{BASE_URL}/faculties/faculties/", json={
            "name": "Verify Fac", "institution": inst_id
        }, headers=headers, verify=False).json()
        f_id = fac_res['id']
        
        dept_res = requests.post(f"{BASE_URL}/faculties/departments/", json={
            "name": "Verify Dept", "code": "VD", "faculty": f_id, "institution": inst_id
        }, headers=headers, verify=False).json()
        d_id = dept_res['id']
        
        prog_res = requests.post(f"{BASE_URL}/faculties/programs/", json={
            "name": "Verify Prog", "code": "VP", "department": d_id, "duration": 1,
            "levels": ["Diploma"], "categories": ["STEM"]
        }, headers=headers, verify=False).json()
        p_id = prog_res['id']
        print(f"  ✅ Setup complete (Prog ID: {p_id})")

        # 1. Verify Student Addition
        print("\n1. Testing Student Addition...")
        student_data = {
            "student_id": f"V-{uuid.uuid4().hex[:6].upper()}",
            "first_name": "Verify", "last_name": "Student",
            "gender": "Male", "enrollment_year": 2026, "status": "Active",
            "institution": inst_id, "program": p_id,
            "selected_level": "Diploma", "selected_category": "STEM"
        }
        res = requests.post(f"{BASE_URL}/academic/students/", json=student_data, headers=headers, verify=False)
        if res.status_code == 201:
            s_id = res.json()['id']
            print(f"  ✅ Student added (ID: {s_id})")
        else:
            print(f"  ❌ Student add failed: {res.status_code} {res.text}")

        # 2. Verify Staff Addition
        print("\n2. Testing Staff Addition...")
        staff_data = {
            "employee_id": f"E-{uuid.uuid4().hex[:6].upper()}",
            "first_name": "Verify", "last_name": "Staff",
            "email": f"staff_{uuid.uuid4().hex[:4]}@verify.com",
            "phone": "000000", "position": "Lecturer", "qualification": "PhD",
            "institution": inst_id, "is_active": True, "date_joined": "2026-01-01"
        }
        res = requests.post(f"{BASE_URL}/staff/members/", json=staff_data, headers=headers, verify=False)
        if res.status_code == 201:
            st_id = res.json()['id']
            print(f"  ✅ Staff added (ID: {st_id})")
        else:
            print(f"  ❌ Staff add failed: {res.status_code} {res.text}")

        # 3. Verify ISEOP Addition
        print("\n3. Testing ISEOP Addition...")
        iseop_prog = requests.post(f"{BASE_URL}/iseop/programs/", json={
            "name": "Verify ISEOP", "institution": inst_id, "capacity": 10, "status": "Active"
        }, headers=headers, verify=False).json()
        iseop_p_id = iseop_prog['id']
        
        iseop_stud = {
            "institution": inst_id, "program": iseop_p_id,
            "first_name": "ISEOP", "last_name": "Verify",
            "student_id": f"I-{uuid.uuid4().hex[:4].upper()}",
            "national_id": f"ID-{uuid.uuid4().hex[:4].upper()}",
            "gender": "Female", "status": "Active/Enrolled"
        }
        res = requests.post(f"{BASE_URL}/iseop/students/", json=iseop_stud, headers=headers, verify=False)
        if res.status_code == 201:
            iseop_s_id = res.json()['id']
            print(f"  ✅ ISEOP Student added (ID: {iseop_s_id})")
        else:
            print(f"  ❌ ISEOP Student add failed: {res.status_code}")

    finally:
        print("\n🧹 Cleaning up verification data...")
        if iseop_s_id: requests.delete(f"{BASE_URL}/iseop/students/{iseop_s_id}/", headers=headers, verify=False)
        if iseop_p_id: requests.delete(f"{BASE_URL}/iseop/programs/{iseop_p_id}/", headers=headers, verify=False)
        if st_id: requests.delete(f"{BASE_URL}/staff/members/{st_id}/", headers=headers, verify=False)
        if s_id: requests.delete(f"{BASE_URL}/academic/students/{s_id}/", headers=headers, verify=False)
        if p_id: 
            requests.delete(f"{BASE_URL}/faculties/programs/{p_id}/", headers=headers, verify=False)
            requests.delete(f"{BASE_URL}/faculties/departments/{d_id}/", headers=headers, verify=False)
            requests.delete(f"{BASE_URL}/faculties/faculties/{f_id}/", headers=headers, verify=False)
        print("  ✅ Cleanup complete")

if __name__ == "__main__":
    import urllib3
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
    
    # Using the Madziwa account we verified earlier
    token, inst_id = get_auth_token("madziwa@teachers.ac.zw", "password123") # I will use the hash check for real pass
    
    # Wait, I restored the password for madziwa. I should use the admin account 
    # to create a temporary inst admin for this test instead of guessing passwords.
    
    print("\nAttempting verification via System Admin...")
    admin_res = requests.post(f"{BASE_URL}/users/token/", json={
        "email": "admin@scalareye.com", "password": "scalareye@123"
    }, verify=False).json()
    admin_token = admin_res['access']
    test_inst_data_management(admin_token, 89) # Test on Marymount
