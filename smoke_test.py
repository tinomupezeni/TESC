import requests
import sys
import uuid

BASE_URL = "http://localhost:8000/api"

def smoke_test():
    print("🚀 Starting Smoke Test...")

    # 1. Register a new institution
    unique_id = uuid.uuid4().hex[:6]
    inst_name = f"Core Smoke Inst {unique_id}"
    inst_email = f"admin_{unique_id}@core.com"
    
    payload = {
        "name": inst_name,
        "type": "Polytechnic",
        "location": "HARARE",
        "address": "123 Test St",
        "capacity": 5000,
        "established": 2000,
        "email": inst_email
    }

    print(f"--- Registering Institution: {inst_name} ---")
    response = requests.post(f"{BASE_URL}/academic/institutions/", json=payload, verify=False)
    
    if response.status_code != 201:
        print(f"❌ Failed to register institution: {response.status_code}")
        print(response.text)
        sys.exit(1)
    
    data = response.json()
    inst_id = data["id"]
    print(f"✅ Institution registered successfully (ID: {inst_id}).")
    
    admin_creds = data.get("admin_credentials")
    if not admin_creds:
        print("❌ Admin credentials missing from response.")
        requests.delete(f"{BASE_URL}/academic/institutions/{inst_id}/")
        sys.exit(1)
    
    email = admin_creds["email"]
    password = admin_creds["password"]
    print(f"--- Login with: {email} / {password} ---")

    # 2. Login
    login_payload = {
        "username": email,
        "password": password
    }
    login_response = requests.post(f"{BASE_URL}/instauth/login/", json=login_payload, verify=False)
    
    if login_response.status_code != 200:
        print(f"❌ Login failed: {login_response.status_code}")
        print(login_response.text)
        requests.delete(f"{BASE_URL}/academic/institutions/{inst_id}/")
        sys.exit(1)
    
    login_data = login_response.json()
    access_token = login_data["tokens"]["access"]
    print("✅ Login successful.")

    # 3. Check Profile
    headers = {
        "Authorization": f"Bearer {access_token}"
    }
    profile_response = requests.get(f"{BASE_URL}/instauth/profile/", headers=headers, verify=False)
    
    if profile_response.status_code != 200:
        print(f"❌ Failed to fetch profile: {profile_response.status_code}")
        requests.delete(f"{BASE_URL}/academic/institutions/{inst_id}/")
        sys.exit(1)
    
    profile_data = profile_response.json()
    print("--- Verifying User Permissions ---")
    print(f"User: {profile_data['email']}")
    
    if profile_data.get("level") == "1":
        print("✅ SUCCESS: User is Super Admin with Level 1 Access!")
    else:
        print(f"❌ FAILURE: Level is {profile_data.get('level')}, expected 1.")
        requests.delete(f"{BASE_URL}/academic/institutions/{inst_id}/")
        sys.exit(1)

    # 4. Cleanup
    print(f"--- Final Cleanup: Deleting institution {inst_id} ---")
    delete_response = requests.delete(f"{BASE_URL}/academic/institutions/{inst_id}/")
    
    if delete_response.status_code == 204:
        print("✅ SUCCESS: Institution deleted successfully.")
    else:
        print(f"❌ FAILURE: Failed to delete institution: {delete_response.status_code}")
        sys.exit(1)

if __name__ == "__main__":
    smoke_test()
