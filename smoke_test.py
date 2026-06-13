import requests
import sys
import uuid

BASE_URL = "http://localhost/api"

def smoke_test():
    print("🚀 Starting Smoke Test...")

    # 1. Register a new institution
    inst_name = f"Test Institution {uuid.uuid4().hex[:6]}"
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
    
    data = response.json()
    print("✅ Institution registered successfully.")
    
    admin_creds = data.get("admin_credentials")
    if not admin_creds:
        print("❌ Admin credentials missing from response.")
        sys.exit(1)
    
    email = admin_creds["email"]
    password = admin_creds["password"]
    print(f"--- Login with: {email} / {password} ---")

    # 2. Login
    login_payload = {
        "username": email,
        "password": password
    }
    login_response = requests.post(f"{BASE_URL}/instauth/login/", json=login_payload)
    
    if login_response.status_code != 200:
        print(f"❌ Login failed: {login_response.status_code}")
        print(login_response.text)
        sys.exit(1)
    
    login_data = login_response.json()
    access_token = login_data["tokens"]["access"]
    print("✅ Login successful.")

    # 3. Check Profile for Super Admin Role and Level 1
    headers = {
        "Authorization": f"Bearer {access_token}"
    }
    profile_response = requests.get(f"{BASE_URL}/instauth/profile/", headers=headers)
    
    if profile_response.status_code != 200:
        print(f"❌ Failed to fetch profile: {profile_response.status_code}")
        print(profile_response.text)
        sys.exit(1)
    
    profile_data = profile_response.json()
    print("--- Verifying User Permissions ---")
    print(f"User: {profile_data['email']}")
    print(f"Role: {profile_data.get('role_name')}")
    print(f"Level: {profile_data.get('level')}")
    print(f"Institution: {profile_data.get('institution', {}).get('name')}")

    is_super_admin = profile_data.get("role_name") == "Super Admin"
    is_level_1 = profile_data.get("level") == "1"
    
    if is_super_admin and is_level_1:
        print("✅ SUCCESS: User is Super Admin with Level 1 Access!")
    else:
        if not is_super_admin:
            print("❌ FAILURE: Role is NOT Super Admin.")
        if not is_level_1:
            print("❌ FAILURE: Level is NOT 1.")
        sys.exit(1)

    # 4. Test Deletion (The Fix)
    print("--- Testing Institution Deletion (The Fix) ---")
    inst_id = data["id"]
    delete_response = requests.delete(f"{BASE_URL}/academic/institutions/{inst_id}/")
    
    if delete_response.status_code == 204:
        print("✅ SUCCESS: Institution deleted successfully.")
    else:
        print(f"❌ FAILURE: Failed to delete institution: {delete_response.status_code}")
        print(delete_response.text)
        sys.exit(1)

if __name__ == "__main__":
    smoke_test()
