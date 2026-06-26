import requests
import uuid
import urllib3
import json

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

BASE_URL = "https://localhost/api"

def get_admin_token():
    print("Logging in as System Admin...")
    try:
        response = requests.post(f"{BASE_URL}/users/token/", json={
            "email": "admin@scalareye.com",
            "password": "Admin123!"
        }, verify=False)
        if response.status_code == 200:
            print("  ✅ Admin Login successful")
            return response.json()['access']
        else:
            print(f"  ❌ Admin Login failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"  ❌ Connection Error: {str(e)}")
        return None

def create_test_faculty(token, inst_id):
    headers = {"Authorization": f"Bearer {token}"}
    faculty_data = {
        "name": f"Test Faculty {uuid.uuid4().hex[:6].upper()}",
        "description": "Faculty for testing purposes.",
        "dean": "Test Dean",
        "status": "Active",
        "institution": inst_id
    }
    try:
        res = requests.post(f"{BASE_URL}/faculties/faculties/", json=faculty_data, headers=headers, verify=False)
        if res.status_code == 201:
            print(f"  ✅ Test Faculty created (ID: {res.json()['id']})")
            return res.json()['id']
        else:
            print(f"  ❌ Failed to create test faculty: {res.status_code} - {res.text}")
            return None
    except Exception as e:
        print(f"  ❌ Error creating test faculty: {str(e)}")
        return None

def delete_test_faculty(token, faculty_id):
    headers = {"Authorization": f"Bearer {token}"}
    try:
        requests.delete(f"{BASE_URL}/faculties/faculties/{faculty_id}/", headers=headers, verify=False)
        print(f"  🧹 Cleaned up test faculty {faculty_id}")
    except Exception as e:
        print(f"  ❌ Error cleaning up test faculty {faculty_id}: {str(e)}")

def create_test_department(token, faculty_id, inst_id):
    headers = {"Authorization": f"Bearer {token}"}
    department_data = {
        "name": f"Test Dept {uuid.uuid4().hex[:6].upper()}",
        "description": "Department for testing purposes.",
        "faculty": faculty_id,
        "hod": "Test HoD",
        "status": "Active",
        "institution": inst_id 
    }
    try:
        res = requests.post(f"{BASE_URL}/faculties/departments/", json=department_data, headers=headers, verify=False)
        if res.status_code == 201:
            print(f"  ✅ Test Department created (ID: {res.json()['id']})")
            return res.json()['id']
        else:
            print(f"  ❌ Failed to create test department: {res.status_code} - {res.text}")
            return None
    except Exception as e:
        print(f"  ❌ Error creating test department: {str(e)}")
        return None

def delete_test_department(token, department_id):
    headers = {"Authorization": f"Bearer {token}"}
    try:
        requests.delete(f"{BASE_URL}/faculties/departments/{department_id}/", headers=headers, verify=False)
        print(f"  🧹 Cleaned up test department {department_id}")
    except Exception as e:
        print(f"  ❌ Error cleaning up test department {department_id}: {str(e)}")

def create_test_program(token, department_id):
    headers = {"Authorization": f"Bearer {token}"}
    program_data = {
        "name": f"Test Program {uuid.uuid4().hex[:6].upper()}",
        "code": f"TP{uuid.uuid4().hex[:4].upper()}",
        "description": "Program for bulk delete student testing.",
        "level": "Diploma",
        "category": "STEM",
        "duration": 2, 
        "semester_fee": 1500.00,
        "department": department_id
    }
    try:
        res = requests.post(f"{BASE_URL}/faculties/programs/", json=program_data, headers=headers, verify=False)
        if res.status_code == 201:
            print(f"  ✅ Test Program created (ID: {res.json()['id']})")
            return res.json()['id']
        else:
            print(f"  ❌ Failed to create test program: {res.status_code} - {res.text}")
            return None
    except Exception as e:
        print(f"  ❌ Error creating test program: {str(e)}")
        return None

def delete_test_program(token, program_id):
    headers = {"Authorization": f"Bearer {token}"}
    try:
        requests.delete(f"{BASE_URL}/faculties/programs/{program_id}/", headers=headers, verify=False)
        print(f"  🧹 Cleaned up test program {program_id}")
    except Exception as e:
        print(f"  ❌ Error cleaning up test program {program_id}: {str(e)}")


def test_student_bulk_delete(token, inst_id):
    headers = {"Authorization": f"Bearer {token}"}
    created_student_ids = []
    test_faculty_id = None
    test_department_id = None
    test_program_id = None 

    try:
        print("""
--- Testing Student Bulk Delete ---""")

        test_faculty_id = create_test_faculty(token, inst_id)
        if not test_faculty_id:
            print("  ❌ Skipping bulk delete test: Failed to create test faculty.")
            return False
        
        test_department_id = create_test_department(token, test_faculty_id, inst_id)
        if not test_department_id:
            print("  ❌ Skipping bulk delete test: Failed to create test department.")
            return False

        test_program_id = create_test_program(token, test_department_id)
        if not test_program_id:
            print("  ❌ Skipping bulk delete test: Failed to create a test program.")
            return False

        # --- TEST 1: DELETE /bulk-delete/ with student_ids ---
        print("\n[Test 1] DELETE /students/bulk-delete/ with 'student_ids' key...")
        ids_t1 = []
        for i in range(2):
            res = requests.post(f"{BASE_URL}/academic/students/", json={
                "student_id": f"BT1{uuid.uuid4().hex[:5].upper()}",
                "first_name": f"BulkT1_{i}",
                "last_name": "Student",
                "gender": "Male",
                "enrollment_year": 2023,
                "status": "Active",
                "institution": inst_id,
                "program": test_program_id
            }, headers=headers, verify=False)
            if res.status_code == 201:
                ids_t1.append(res.json()['id'])
                created_student_ids.append(res.json()['id'])
        
        res1 = requests.delete(f"{BASE_URL}/academic/students/bulk-delete/", json={"student_ids": ids_t1}, headers=headers, verify=False)
        if res1.status_code in [200, 204]:
            print("  ✅ DELETE bulk-delete response successful.")
            for s_id in ids_t1:
                if requests.get(f"{BASE_URL}/academic/students/{s_id}/", headers=headers, verify=False).status_code == 200:
                    print(f"  ❌ Student {s_id} was not deleted!")
                    return False
                created_student_ids.remove(s_id)
            print("  ✅ Verified all Test 1 students were deleted.")
        else:
            print(f"  ❌ Test 1 failed: {res1.status_code} {res1.text}")
            return False

        # --- TEST 2: POST /bulk_delete/ with student_ids (Frontend Style) ---
        print("\n[Test 2] POST /students/bulk_delete/ with 'student_ids' key...")
        ids_t2 = []
        for i in range(2):
            res = requests.post(f"{BASE_URL}/academic/students/", json={
                "student_id": f"BT2{uuid.uuid4().hex[:5].upper()}",
                "first_name": f"BulkT2_{i}",
                "last_name": "Student",
                "gender": "Male",
                "enrollment_year": 2023,
                "status": "Active",
                "institution": inst_id,
                "program": test_program_id
            }, headers=headers, verify=False)
            if res.status_code == 201:
                ids_t2.append(res.json()['id'])
                created_student_ids.append(res.json()['id'])
        
        res2 = requests.post(f"{BASE_URL}/academic/students/bulk_delete/", json={"student_ids": ids_t2}, headers=headers, verify=False)
        if res2.status_code in [200, 204]:
            print("  ✅ POST bulk_delete response successful.")
            for s_id in ids_t2:
                if requests.get(f"{BASE_URL}/academic/students/{s_id}/", headers=headers, verify=False).status_code == 200:
                    print(f"  ❌ Student {s_id} was not deleted!")
                    return False
                created_student_ids.remove(s_id)
            print("  ✅ Verified all Test 2 students were deleted.")
        else:
            print(f"  ❌ Test 2 failed: {res2.status_code} {res2.text}")
            return False

        # --- TEST 3: POST /bulk-delete/ with ids (Alternate Style) ---
        print("\n[Test 3] POST /students/bulk-delete/ with 'ids' key...")
        ids_t3 = []
        for i in range(2):
            res = requests.post(f"{BASE_URL}/academic/students/", json={
                "student_id": f"BT3{uuid.uuid4().hex[:5].upper()}",
                "first_name": f"BulkT3_{i}",
                "last_name": "Student",
                "gender": "Male",
                "enrollment_year": 2023,
                "status": "Active",
                "institution": inst_id,
                "program": test_program_id
            }, headers=headers, verify=False)
            if res.status_code == 201:
                ids_t3.append(res.json()['id'])
                created_student_ids.append(res.json()['id'])
        
        res3 = requests.post(f"{BASE_URL}/academic/students/bulk-delete/", json={"ids": ids_t3}, headers=headers, verify=False)
        if res3.status_code in [200, 204]:
            print("  ✅ POST bulk-delete response successful.")
            for s_id in ids_t3:
                if requests.get(f"{BASE_URL}/academic/students/{s_id}/", headers=headers, verify=False).status_code == 200:
                    print(f"  ❌ Student {s_id} was not deleted!")
                    return False
                created_student_ids.remove(s_id)
            print("  ✅ Verified all Test 3 students were deleted.")
            return True
        else:
            print(f"  ❌ Test 3 failed: {res3.status_code} {res3.text}")
            return False

    except Exception as e:
        print(f"  ❌ An error occurred during bulk delete test: {str(e)}")
        return False
    finally:
        print("""
Cleaning up any remaining students...""")
        for student_id in created_student_ids:
            try:
                check_res = requests.get(f"{BASE_URL}/academic/students/{student_id}/", headers=headers, verify=False)
                if check_res.status_code == 200:
                    requests.delete(f"{BASE_URL}/academic/students/{student_id}/", headers=headers, verify=False)
                    print(f"  🧹 Cleaned up student {student_id}")
            except Exception as e:
                print(f"  ❌ Error during cleanup of student {student_id}: {str(e)}")
        
        if test_program_id:
            delete_test_program(token, test_program_id)
        if test_department_id:
            delete_test_department(token, test_department_id)
        if test_faculty_id:
            delete_test_faculty(token, test_faculty_id)


if __name__ == "__main__":
    token = get_admin_token()
    if token:
        success = test_student_bulk_delete(token, 89)
        if success:
            print("""
🌟 STUDENT BULK DELETE SMOKE TEST PASSED!""")
        else:
            print("""
❌ STUDENT BULK DELETE SMOKE TEST FAILED!""")
            exit(1)
