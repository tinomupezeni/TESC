import requests
import sys

BASE_URL = "https://tesc.zchpc.ac.zw/api"
ADMIN_EMAIL = "admin@scalareye.com"
ADMIN_PASSWORD = "admin@123"

def run_test():
    print("🚀 Starting Validation (Negative) Smoke Test...")

    # 1. Login
    login_payload = {"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
    res = requests.post(f"{BASE_URL}/users/token/", json=login_payload)
    if res.status_code != 200:
        print("❌ Login failed")
        sys.exit(1)
    
    headers = {"Authorization": f"Bearer {res.json()['access']}"}
    print("✅ Login successful.")

    # 2. Test Missing Required Fields
    print("\n--- Testing Missing Required Fields Validation ---")
    bad_inst_payload = {
        "name": "Validation Test Inst",
        "type": "Polytechnic",
        # Intentionally missing the required 'email' field
    }
    print("Attempting to create institution without an email...")
    res = requests.post(f"{BASE_URL}/academic/institutions/", json=bad_inst_payload, headers=headers)
    
    # We EXPECT a 400 status code here
    if res.status_code == 400:
        print(f"✅ Correctly rejected: 400 Bad Request")
        print(f"   Server responded with: {res.text}")
    else:
        print(f"❌ Failed! Expected 400, but got {res.status_code}")
        sys.exit(1)

    # 3. Test Invalid Enum/Choice Fields
    print("\n--- Testing Invalid Choices Validation ---")
    bad_proj_payload = {
        "institution": 1,
        "hub": 1,
        "name": "Invalid Proj",
        "team_name": "Test",
        "sector": "InvalidSectorType", # Not a valid sector choice
        "stage": "InvalidStageType"    # Not a valid stage choice
    }
    print("Attempting to create project with invalid sector/stage...")
    res = requests.post(f"{BASE_URL}/innovation/projects/", json=bad_proj_payload, headers=headers)
    
    if res.status_code == 400:
        print(f"✅ Correctly rejected: 400 Bad Request")
        print(f"   Server responded with: {res.text}")
    else:
        print(f"❌ Failed! Expected 400, but got {res.status_code}")
        sys.exit(1)

    # 4. Test Missing Foreign Keys
    print("\n--- Testing Missing Relational Data Validation ---")
    bad_staff_payload = {
        "first_name": "Ghost",
        "last_name": "Staff",
        "email": "ghost@test.com",
        "phone": "123456"
        # Missing required foreign keys: institution, faculty, department
    }
    print("Attempting to create staff member without institution/faculty/dept...")
    res = requests.post(f"{BASE_URL}/staff/members/", json=bad_staff_payload, headers=headers)
    
    if res.status_code == 400:
        print(f"✅ Correctly rejected: 400 Bad Request")
        print(f"   Server responded with: {res.text}")
    else:
        print(f"❌ Failed! Expected 400, but got {res.status_code}")
        sys.exit(1)

    print("\n🎉 ALL VALIDATION (NEGATIVE) TESTS PASSED!")

if __name__ == "__main__":
    run_test()
