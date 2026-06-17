import requests
import sys
import os

BASE_URL = "https://localhost/api"

def get_auth_token(email, password):
    print(f"Logging in as {email}...")
    try:
        response = requests.post(f"{BASE_URL}/users/token/", json={
            "email": email,
            "password": password
        }, verify=False)
        if response.status_code == 200:
            print("  ✅ Login successful")
            return response.json()['access']
        else:
            print(f"  ❌ Login failed: {response.status_code}")
            return None
    except Exception as e:
        print(f"  ❌ Connection Error: {str(e)}")
        return None

def test_multi_select_logic(token):
    headers = {"Authorization": f"Bearer {token}"}
    
    # 1. Create a test program with multiple categories and levels
    print("Creating test program with multiple levels/categories...")
    program_data = {
        "name": "Multi-Select Smoke Test",
        "code": "MSST001",
        "department": 154, # Engineering (Verified for Marymount)
        "duration": 4,
        "levels": ["Class 4", "National Certificate"],
        "categories": ["STEM", "VOCATIONAL"],
        "description": "Testing multi-select engineering"
    }
    
    response = requests.post(f"{BASE_URL}/faculties/programs/", json=program_data, headers=headers, verify=False)
    if response.status_code == 201:
        program_id = response.json()['id']
        print(f"  ✅ Program created (ID: {program_id})")
        print(f"     Levels: {response.json()['levels']}")
        print(f"     Categories: {response.json()['categories']}")
    else:
        print(f"  ❌ Failed to create program: {response.status_code}")
        print(f"  Response: {response.text}")
        return

    # 2. Add a student selecting ONE of the specific options
    print("Adding student with specific level and category selection...")
    student_data = {
        "student_id": "SMOKE_STUDENT_001",
        "first_name": "Multi",
        "last_name": "Tester",
        "gender": "Other",
        "enrollment_year": 2026,
        "status": "Active",
        "institution": 89,
        "program": program_id,
        "selected_level": "Class 4",
        "selected_category": "STEM"
    }
    
    response = requests.post(f"{BASE_URL}/academic/students/", json=student_data, headers=headers, verify=False)
    if response.status_code == 201:
        student_pk = response.json()['id']
        print(f"  ✅ Student added successfully")
        print(f"     Selected Level: {response.json().get('selected_level')}")
        print(f"     Selected Category: {response.json().get('selected_category')}")
        
        # 3. Verify record
        if response.json().get('selected_level') == "Class 4" and response.json().get('selected_category') == "STEM":
            print("  ✅ VERIFICATION SUCCESS: Student record correctly reflects specific selections.")
        else:
            print("  ❌ VERIFICATION FAILED: Selections did not match.")
    else:
        print(f"  ❌ Failed to add student: {response.status_code}")
        print(f"  Response: {response.text}")

    # 4. Cleanup
    print("Cleaning up test data...")
    if 'student_pk' in locals():
        requests.delete(f"{BASE_URL}/academic/students/{student_pk}/", headers=headers, verify=False)
    requests.delete(f"{BASE_URL}/faculties/programs/{program_id}/", headers=headers, verify=False)
    print("  ✅ Cleanup complete")

if __name__ == "__main__":
    import urllib3
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
    
    token = get_auth_token("admin@scalareye.com", "scalareye@123")
    if token:
        test_multi_select_logic(token)
