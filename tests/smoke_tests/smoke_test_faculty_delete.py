import requests
import sys
import os

BASE_URL = "http://localhost:8000/api"

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
            print(f"  Response: {response.text}")
            return None
    except Exception as e:
        print(f"  ❌ Connection Error: {str(e)}")
        return None

def test_faculty_lifecycle(token):
    headers = {"Authorization": f"Bearer {token}"}
    
    # 1. Create a test faculty
    print("Creating test faculty...")
    faculty_data = {
        "name": "Smoke Test Faculty",
        "institution": 89, # Marymount
        "dean": "Test Dean",
        "location": "Test Location",
        "status": "Active"
    }
    
    response = requests.post(f"{BASE_URL}/faculties/faculties/", json=faculty_data, headers=headers, verify=False)
    if response.status_code == 201:
        faculty_id = response.json()['id']
        print(f"  ✅ Faculty created (ID: {faculty_id})")
    else:
        print(f"  ❌ Failed to create faculty: {response.status_code}")
        print(f"  Response: {response.text}")
        return

    # 2. Verify it exists
    print("Verifying faculty exists...")
    response = requests.get(f"{BASE_URL}/faculties/faculties/{faculty_id}/", headers=headers, verify=False)
    if response.status_code == 200:
        print("  ✅ Faculty verified")
    else:
        print(f"  ❌ Failed to verify faculty: {response.status_code}")

    # 3. Delete the faculty
    print(f"Deleting faculty {faculty_id}...")
    response = requests.delete(f"{BASE_URL}/faculties/faculties/{faculty_id}/", headers=headers, verify=False)
    if response.status_code == 204:
        print("  ✅ Faculty deleted successfully")
    else:
        print(f"  ❌ Failed to delete faculty: {response.status_code}")
        print(f"  Response: {response.text}")

    # 4. Final Verification
    print("Confirming faculty is gone...")
    response = requests.get(f"{BASE_URL}/faculties/faculties/{faculty_id}/", headers=headers, verify=False)
    if response.status_code == 404:
        print("  ✅ CONFIRMED: Faculty no longer exists")
    else:
        print(f"  ❌ Error: Faculty still exists or returned unexpected status: {response.status_code}")

if __name__ == "__main__":
    import urllib3
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
    
    token = get_auth_token("admin@scalareye.com", "scalareye@123")
    if token:
        test_faculty_lifecycle(token)
