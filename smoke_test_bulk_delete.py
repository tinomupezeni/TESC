import requests
import sys
import uuid
import time

BASE_URL = "https://localhost/api"
ADMIN_EMAIL = "admin@scalareye.com"
ADMIN_PASSWORD = "Admin123!"

def smoke_test_bulk_delete():
    print("🚀 Starting Smoke Test for Bulk Delete Functionality...")

    # 1. Login
    login_payload = {"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
    login_response = requests.post(f"{BASE_URL}/users/token/", json=login_payload, verify=False)
    
    if login_response.status_code != 200:
        print(f"❌ Login failed: {login_response.status_code}")
        sys.exit(1)

    access_token = login_response.json()["access"]
    headers = {"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"}
    print(f"✅ Logged in successfully.")

    # 2. Get Institutions
    inst_res = requests.get(f"{BASE_URL}/academic/institutions/", headers=headers, verify=False)
    institutions = inst_res.json()
    target_inst = institutions[0]
    institution_id = target_inst["id"]
    print(f"Using institution: {target_inst['name']} (ID: {institution_id})")
    
    # 3. Use a confirmed valid program ID (963 exists in the list)
    program_id = 963 
    print(f"Using program ID: {program_id}")

    # 4. Create Students for Testing
    print("Creating temporary students...")
    student_ids = []
    for i in range(3):
        res = requests.post(f"{BASE_URL}/academic/students/", headers=headers, verify=False, json={
            "student_id": f"TEST{uuid.uuid4().hex[:4]}",
            "first_name": f"Test{i}",
            "last_name": "Student",
            "gender": "Male",
            "enrollment_year": 2025,
            "institution": institution_id,
            "program": program_id
        })
        if res.status_code == 201:
            student_ids.append(res.json()["id"])
        else:
            print(f"⚠️ Failed to create student: {res.status_code}, {res.text}")
    
    if not student_ids:
        print("❌ Could not create any test students.")
        sys.exit(1)
        
    print(f"✅ Created {len(student_ids)} test students.")

    # 5. Bulk Delete (With Trailing Slash)
    print("Executing Bulk Delete...")
    delete_res = requests.delete(f"{BASE_URL}/academic/students/bulk-delete/", headers=headers, verify=False, json={
        "student_ids": student_ids
    })

    if delete_res.status_code != 204 and delete_res.status_code != 200:
        print(f"❌ Bulk delete failed: {delete_res.status_code}, {delete_res.text}")
        sys.exit(1)
    print("✅ Bulk delete request successful.")

    # 6. Verify Deletion
    for s_id in student_ids:
        check_res = requests.get(f"{BASE_URL}/academic/students/{s_id}/", headers=headers, verify=False)
        if check_res.status_code != 404:
            print(f"❌ Student {s_id} was not deleted!")
            sys.exit(1)
            
    print("✅ Bulk deletion verified: students no longer exist.")

if __name__ == "__main__":
    smoke_test_bulk_delete()
