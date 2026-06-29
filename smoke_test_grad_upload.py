import requests
import sys
import uuid
import pandas as pd
import io
import urllib3

# Disable insecure request warnings for local testing
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

BASE_URL = "https://localhost/api"  # Use HTTPS and Nginx proxy as per other smoke tests
SUPER_ADMIN_EMAIL = "admin@scalareye.com"
SUPER_ADMIN_PASSWORD = "scalareye@123"

def run_grad_upload_smoke_test():
    print("\n" + "="*60)
    print("🎓 GRADUATE BULK UPLOAD SMOKE TEST")
    print("="*60)

    # 1. Login as Super Admin to setup test environment
    print("\n🔑 Logging in as Super Admin...")
    login_res = requests.post(f"{BASE_URL}/users/token/", json={
        "email": SUPER_ADMIN_EMAIL, 
        "password": SUPER_ADMIN_PASSWORD
    }, verify=False)
    
    if login_res.status_code != 200:
        print(f"❌ Login failed: {login_res.status_code}")
        print(login_res.text)
        return

    super_headers = {"Authorization": f"Bearer {login_res.json()['access']}"}
    print("✅ Login successful.")

    # 2. Create a Test Institution and Program
    suffix = uuid.uuid4().hex[:4]
    inst_name = f"Smoke Test University {suffix}"
    print(f"\n🏫 Creating test institution: {inst_name}")
    
    inst_res = requests.post(f"{BASE_URL}/academic/institutions/", json={
        "name": inst_name,
        "type": "Polytechnic",
        "location": "Harare",
        "established": 1995,
        "email": f"admin@{suffix}.test"
    }, headers=super_headers, verify=False)
    
    if inst_res.status_code != 201:
        print(f"❌ Failed to create institution: {inst_res.text}")
        return
        
    inst_data = inst_res.json()
    inst_id = inst_data['id']
    admin_creds = inst_data['admin_credentials']
    print(f"✅ Institution created with ID: {inst_id}")

    # Create Faculty, Department, and Program
    print("📚 Setting up academic structure (Faculty -> Dept -> Program)...")
    fac_res = requests.post(f"{BASE_URL}/faculties/faculties/", json={
        "name": "Faculty of Engineering", "institution": inst_id
    }, headers=super_headers, verify=False)
    fac_id = fac_res.json()['id']

    dept_res = requests.post(f"{BASE_URL}/faculties/departments/", json={
        "name": "Computer Science", "code": "CS", "faculty": fac_id, "institution": inst_id
    }, headers=super_headers, verify=False)
    dept_id = dept_res.json()['id']

    prog_code = f"BSCS-{suffix}"
    prog_res = requests.post(f"{BASE_URL}/faculties/programs/", json={
        "name": "BSc Computer Science", 
        "code": prog_code, 
        "department": dept_id, 
        "duration": 4,
        "category": "STEM"
    }, headers=super_headers, verify=False)
    print(f"✅ Program setup complete. Code: {prog_code}")

    # 3. Login as the newly created Institution Admin
    print(f"\n👤 Logging in as Institution Admin: {admin_creds['email']}")
    admin_login_res = requests.post(f"{BASE_URL}/users/token/", json={
        "email": admin_creds['email'], 
        "password": admin_creds['password']
    }, verify=False)
    admin_headers = {"Authorization": f"Bearer {admin_login_res.json()['access']}"}
    print("✅ Admin login successful.")

    # 4. Simulate Template Download
    print("\n📥 Testing template download...")
    template_res = requests.get(f"{BASE_URL}/academic/graduates-mgmt/template/", headers=admin_headers, verify=False)
    if template_res.status_code == 200:
        print("✅ Template download endpoint is working.")
    else:
        print(f"❌ Template download failed: {template_res.status_code}")

    # 5. Prepare Excel File (Entering details)
    print("\n📝 Preparing bulk upload data (Excel)...")
    student_ids = [f"STU-001-{suffix}", f"STU-002-{suffix}"]
    data = [
        {
            "Student ID": student_ids[0], 
            "National ID": f"63-123456-X-{suffix[:2]}", 
            "First Name": "John", 
            "Last Name": "Doe", 
            "Gender": "Male", 
            "Program Code": prog_code, 
            "Enrollment Year": 2020, 
            "Graduation Year": 2024, 
            "Final Grade": "Distinction"
        },
        {
            "Student ID": student_ids[1], 
            "National ID": f"63-654321-Y-{suffix[:2]}", 
            "First Name": "Jane", 
            "Last Name": "Smith", 
            "Gender": "Female", 
            "Program Code": prog_code, 
            "Enrollment Year": 2020, 
            "Graduation Year": 2024, 
            "Final Grade": "Credit"
        }
    ]
    
    df = pd.DataFrame(data)
    excel_buffer = io.BytesIO()
    df.to_excel(excel_buffer, index=False)
    excel_buffer.seek(0)
    print(f"✅ Prepared {len(data)} graduate records.")

    # 6. Upload the Excel File
    print("\n📤 Uploading Excel file...")
    upload_res = requests.post(
        f"{BASE_URL}/academic/graduates-mgmt/bulk-upload/",
        headers=admin_headers,
        files={'file': ('graduates.xlsx', excel_buffer, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')},
        verify=False
    )
    
    if upload_res.status_code == 201:
        print(f"✅ Upload successful! Response: {upload_res.json()}")
    else:
        print(f"❌ Upload failed: {upload_res.status_code}")
        print(upload_res.text)
        return

    # 7. Verify Data Persistence
    print("\n🔍 Verifying stored data...")
    # Fetch all students for this institution
    students_res = requests.get(f"{BASE_URL}/academic/students/", headers=admin_headers, verify=False)
    all_students = students_res.json()
    
    found_count = 0
    for sid in student_ids:
        match = next((s for s in all_students if s['student_id'].upper() == sid.upper()), None)
        if match:
            print(f"   Found Student {sid}: {match['first_name']} {match['last_name']}")
            print(f"   - Status: {match['status']}")
            print(f"   - Graduation Year: {match['graduation_year']}")
            print(f"   - Final Grade: {match['final_grade']}")
            
            if match['status'] == 'Graduated' and match['graduation_year'] == 2024:
                found_count += 1
            else:
                print(f"   ❌ Data mismatch for {sid}!")
        else:
            print(f"   ❌ Student {sid} not found in database!")

    if found_count == len(student_ids):
        print("\n✨ SUCCESS: All graduates were processed and stored correctly!")
    else:
        print(f"\n⚠️ WARNING: Only {found_count}/{len(student_ids)} graduates were verified.")

    # Optional Cleanup - uncomment if you want to keep the data for UI inspection
    # print(f"\n🧹 Cleaning up test data (ID: {inst_id})...")
    # requests.delete(f"{BASE_URL}/academic/institutions/{inst_id}/", headers=super_headers)
    print("\nℹ️ Note: Test data remains in the database. You can inspect it for 'Smoke Test University' in the UI.")
    print("="*60 + "\n")

if __name__ == "__main__":
    run_grad_upload_smoke_test()
