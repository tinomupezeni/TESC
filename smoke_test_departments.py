import requests
import sys
import uuid

BASE_URL = "https://localhost/api"
ADMIN_EMAIL = "admin@scalareye.com"
ADMIN_PASSWORD = "scalareye@123"

def smoke_test_departments():
    print("🚀 Starting Smoke Test for Departments & Users...")

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

    # 2. Create a Global Department (No Institution)
    dept_name = f"Global Smoke Dept {uuid.uuid4().hex[:4]}"
    dept_permissions = ["/dashboard", "/dashboard/students"]

    dept_payload = {
        "name": dept_name,
        "description": "A global department for testing",
        "permissions": dept_permissions
    }
    
    print(f"--- Creating Department: {dept_name} ---")
    dept_response = requests.post(f"{BASE_URL}/users/departments/", json=dept_payload, headers=headers, verify=False)
    
    if dept_response.status_code != 201:
        print(f"❌ Failed to create department: {dept_response.status_code}")
        print(dept_response.text)
        sys.exit(1)
        
    department_id = dept_response.json()["id"]
    print("✅ Department created successfully.")

    # 3. Create a User assigned to this Department (No Institution)
    new_user_email = f"global_staff_{uuid.uuid4().hex[:4]}@test.com"
    user_payload = {
        "username": new_user_email,
        "email": new_user_email,
        "first_name": "Global",
        "last_name": "Staff",
        "level": "4",
        "department_id": department_id
    }
    
    print(f"--- Creating User assigned to {dept_name} ---")
    user_response = requests.post(f"{BASE_URL}/users/users/", json=user_payload, headers=headers, verify=False)
    
    if user_response.status_code != 201:
        print(f"❌ Failed to create user: {user_response.status_code}")
        print(user_response.text)
        requests.delete(f"{BASE_URL}/users/departments/{department_id}/", headers=headers, verify=False)
        sys.exit(1)
        
    user_id = user_response.json()["id"]
    print("✅ User created successfully.")
    
    # 4. Verify user exists and has department
    print("--- Verifying User detail ---")
    user_check = requests.get(f"{BASE_URL}/users/users/{user_id}/", headers=headers, verify=False)
    
    if user_check.status_code == 200:
        user_data = user_check.json()
        if user_data.get("department") and user_data["department"]["id"] == department_id:
            print("✅ SUCCESS: User is correctly assigned to the department!")
        else:
            print(f"❌ FAILURE: User department mismatch or missing: {user_data.get('department')}")
    else:
        print(f"❌ FAILURE: Could not fetch user {user_id}: {user_check.status_code}")
        print(user_check.text)

    # 5. Cleanup
    print("--- Final Cleanup ---")
    requests.delete(f"{BASE_URL}/users/users/{user_id}/", headers=headers, verify=False)
    requests.delete(f"{BASE_URL}/users/departments/{department_id}/", headers=headers, verify=False)
    print("✅ User and Department deleted successfully.")

    print("\n✨ DEPARTMENTS SMOKE TEST PASSED!")

if __name__ == "__main__":
    smoke_test_departments()
