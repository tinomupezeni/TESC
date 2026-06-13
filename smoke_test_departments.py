import requests
import sys
import uuid

BASE_URL = "http://localhost/api"

def smoke_test_departments():
    print("🚀 Starting Smoke Test for Departments & Users...")

    # 1. Login as Super Admin (from previous smoke test or fixed user)
    admin_email = "admin@hrepoly.ac.zw"
    admin_password = "tesc@123"  # or scalareye@123
    
    # Try logging in with the known super admin
    login_payload = {
        "username": admin_email,
        "password": admin_password
    }
    login_response = requests.post(f"{BASE_URL}/instauth/login/", json=login_payload)
    
    if login_response.status_code != 200:
        # Fallback to creating a new institution and admin if default login fails
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
        print("❌ Login failed entirely")
        sys.exit(1)

    login_data = login_response.json()
    access_token = login_data["tokens"]["access"]
    institution_id = login_data["institution_id"]
    headers = {"Authorization": f"Bearer {access_token}"}
    print(f"✅ Logged in as Super Admin (Inst ID: {institution_id})")

    # 2. Create a Department
    dept_name = f"Test Department {uuid.uuid4().hex[:4]}"
    dept_permissions = ["/dashboard", "/dashboard/students"] # Only allow Dashboard and Students

    dept_payload = {
        "name": dept_name,
        "description": "A restricted department for testing",
        "permissions": dept_permissions
    }
    
    print(f"--- Creating Department: {dept_name} ---")
    dept_response = requests.post(f"{BASE_URL}/users/departments/", json=dept_payload, headers=headers)
    
    if dept_response.status_code != 201:
        print(f"❌ Failed to create department: {dept_response.status_code}")
        print(dept_response.text)
        sys.exit(1)
        
    department_id = dept_response.json()["id"]
    print("✅ Department created successfully.")

    # 3. Create a User assigned to this Department
    new_user_email = f"staff_{uuid.uuid4().hex[:4]}@test.com"
    user_payload = {
        "username": new_user_email,
        "email": new_user_email,
        "first_name": "Test",
        "last_name": "Staff",
        "level": "4", # Staff level
        "department_id": department_id
    }
    
    print(f"--- Creating User assigned to {dept_name} ---")
    user_response = requests.post(f"{BASE_URL}/users/users/", json=user_payload, headers=headers)
    
    if user_response.status_code != 201:
        print(f"❌ Failed to create user: {user_response.status_code}")
        print(user_response.text)
        sys.exit(1)
        
    print("✅ User created successfully.")
    
    # 4. Login as the NEW user and verify permissions
    print(f"--- Logging in as new staff user: {new_user_email} ---")
    staff_login = requests.post(f"{BASE_URL}/instauth/login/", json={
        "username": new_user_email,
        "password": "tesc@123" # Default password from UserSerializer
    })
    
    if staff_login.status_code != 200:
        print(f"❌ Staff Login failed: {staff_login.status_code}")
        print(staff_login.text)
        sys.exit(1)
        
    staff_token = staff_login.json()["tokens"]["access"]
    staff_headers = {"Authorization": f"Bearer {staff_token}"}
    
    print("--- Verifying Permissions ---")
    # Actually checking the permissions returned in profile or department endpoint?
    # Our backend doesn't explicitly return permissions in the profile currently unless we added it...
    # But wait, we can fetch the user's department using the users endpoint!
    # Wait, the profile endpoint returns the user profile. Let's see what it returns.
    profile_res = requests.get(f"{BASE_URL}/instauth/profile/", headers=staff_headers)
    profile_data = profile_res.json()
    
    print(f"Logged in as: {profile_data['email']}")
    
    # Let's fetch the department details using the staff token to verify what we can see
    # Oh wait, the staff user might not have access to /users/departments/ if we restrict it.
    # Let's just use the super admin token to verify the user's department is correctly set
    user_check = requests.get(f"{BASE_URL}/users/users/{user_response.json()['id']}/", headers=headers)
    user_data = user_check.json()
    
    if user_data["department"]["id"] == department_id and user_data["department"]["permissions"] == dept_permissions:
        print("✅ SUCCESS: User is correctly assigned to the department with the restricted permissions!")
    else:
        print("❌ FAILURE: User permissions/department do not match!")
        print(user_data)
        sys.exit(1)

if __name__ == "__main__":
    smoke_test_departments()
