import requests
import sys
import uuid
import urllib3

# Disable insecure request warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

BASE_URL = "http://localhost:8000/api"
SUPER_ADMIN_EMAIL = "admin@scalareye.com"
SUPER_ADMIN_PASSWORD = "scalareye@123"

def run_grad_update_smoke_test():
    print("\n" + "="*60)
    print("🎓 GRADUATE STATUS UPDATE SMOKE TEST")
    print("="*60)

    # 1. Login
    print("\n🔑 Logging in as Super Admin...")
    login_res = requests.post(f"{BASE_URL}/users/token/", json={
        "email": SUPER_ADMIN_EMAIL, 
        "password": SUPER_ADMIN_PASSWORD
    }, verify=False)
    
    if login_res.status_code != 200:
        print(f"❌ Login failed: {login_res.status_code}")
        return

    headers = {"Authorization": f"Bearer {login_res.json()['access']}"}
    print("✅ Login successful.")

    # 2. Setup Test Environment
    suffix = uuid.uuid4().hex[:4]
    print(f"\n🏫 Setting up test institution...")
    inst_res = requests.post(f"{BASE_URL}/academic/institutions/", json={
        "name": f"Grad Update Test {suffix}", "type": "Polytechnic", "location": "Harare", "established": 2000, "email": f"test@{suffix}.com"
    }, headers=headers, verify=False)
    inst_id = inst_res.json()['id']
    admin_creds = inst_res.json()['admin_credentials']

    # Create Faculty, Dept, Program
    fac_res = requests.post(f"{BASE_URL}/faculties/faculties/", json={"name": "Fac", "institution": inst_id}, headers=headers, verify=False)
    fac_id = fac_res.json()['id']
    dept_res = requests.post(f"{BASE_URL}/faculties/departments/", json={"name": "Dept", "code": f"D{suffix}", "faculty": fac_id, "institution": inst_id}, headers=headers, verify=False)
    dept_id = dept_res.json()['id']
    prog_res = requests.post(f"{BASE_URL}/faculties/programs/", json={"name": "Prog", "code": f"P{suffix}", "department": dept_id, "duration": 3, "category": "STEM"}, headers=headers, verify=False)
    prog_id = prog_res.json()['id']

    # 3. Create Active Students
    print("👥 Creating active students...")
    student_ids = []
    for i in range(3):
        res = requests.post(f"{BASE_URL}/academic/students/", json={
            "student_id": f"S{i}-{suffix}", "national_id": f"N{i}-{suffix}", "first_name": f"Student{i}", "last_name": "Test",
            "gender": "Male" if i % 2 == 0 else "Female", "enrollment_year": 2021, "status": "Active", "institution": inst_id, "program": prog_id
        }, headers=headers, verify=False)
        student_ids.append(res.json()['id'])
    print(f"✅ Created {len(student_ids)} active students.")

    # 4. Login as Inst Admin
    admin_login = requests.post(f"{BASE_URL}/users/token/", json={"email": admin_creds['email'], "password": admin_creds['password']}, verify=False)
    admin_headers = {"Authorization": f"Bearer {admin_login.json()['access']}"}

    # 5. Test Individual Update (via PATCH)
    print("\n📝 Testing individual update to Graduated...")
    patch_res = requests.patch(f"{BASE_URL}/academic/students/{student_ids[0]}/", json={
        "status": "Graduated", "graduation_year": 2024, "final_grade": "Distinction"
    }, headers=admin_headers, verify=False)
    
    if patch_res.status_code == 200:
        print("✅ Individual update successful.")
    else:
        print(f"❌ Individual update failed: {patch_res.status_code} - {patch_res.text}")

    # 6. Test Bulk Update (via bulk-actions)
    print("\n📤 Testing bulk update to Graduated...")
    bulk_res = requests.post(f"{BASE_URL}/academic/graduates-mgmt/bulk-actions/", json={
        "student_ids": [student_ids[1], student_ids[2]],
        "action": "graduate",
        "graduation_year": 2024,
        "final_grade": "Credit"
    }, headers=admin_headers, verify=False)

    if bulk_res.status_code == 200:
        print(f"✅ Bulk update successful: {bulk_res.json()['message']}")
    else:
        print(f"❌ Bulk update failed: {bulk_res.status_code} - {bulk_res.text}")

    # 7. Verify All are Graduated
    print("\n🔍 Verifying all students are now 'Graduated'...")
    all_graduated = True
    for sid in student_ids:
        s_res = requests.get(f"{BASE_URL}/academic/students/{sid}/", headers=admin_headers, verify=False)
        if s_res.json()['status'] != 'Graduated':
            print(f"   ❌ Student {sid} is NOT graduated (Status: {s_res.json()['status']})")
            all_graduated = False
        else:
            print(f"   ✅ Student {sid} is Graduated.")

    if all_graduated:
        print("\n✨ SUCCESS: All status updates verified!")
    else:
        print("\n⚠️ FAILURE: Some status updates did not stick.")

    # 8. Test Revert (Bulk)
    print("\n🔄 Testing bulk revert to Active...")
    revert_res = requests.post(f"{BASE_URL}/academic/graduates-mgmt/bulk-actions/", json={
        "student_ids": student_ids,
        "action": "revert"
    }, headers=admin_headers, verify=False)
    
    if revert_res.status_code == 200:
        print(f"✅ Bulk revert successful: {revert_res.json()['message']}")
    else:
        print(f"❌ Bulk revert failed: {revert_res.text}")

    # Cleanup
    # requests.delete(f"{BASE_URL}/academic/institutions/{inst_id}/", headers=headers, verify=False)
    print("\nℹ️ Note: Test data remains in the database.")
    print("="*60 + "\n")

if __name__ == "__main__":
    run_grad_update_smoke_test()
