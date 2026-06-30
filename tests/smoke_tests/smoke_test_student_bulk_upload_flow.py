import requests
import sys
import uuid
import pandas as pd
import io
import urllib3

# Suppress insecure connection warnings for localhost testing
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

BASE_URL = "http://localhost:8000/api"
ADMIN_EMAIL = "admin@scalareye.com"
ADMIN_PASSWORD = "scalareye@123"

def smoke_test_bulk_upload_flow():
    print("🚀 Starting Smoke Test for Student Bulk Upload Flow with Auto-Creation & Approval...")

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
    print("✅ Logged in successfully.")

    # 2. Get Institution for context
    print("Fetching institution for context...")
    inst_res = requests.get(f"{BASE_URL}/academic/institutions/", headers=headers, verify=False)
    if inst_res.status_code != 200 or not inst_res.json():
        print("❌ No institutions found. Creating one...")
        create_inst_res = requests.post(f"{BASE_URL}/academic/institutions/", json={
            "name": f"Bulk Test Inst {uuid.uuid4().hex[:4]}",
            "type": "Polytechnic",
            "location": "HARARE",
            "established": 2020,
            "email": f"inst_{uuid.uuid4().hex[:4]}@test.com"
        }, headers=headers, verify=False)
        if create_inst_res.status_code != 201:
            print("❌ Failed to create institution")
            sys.exit(1)
        institution_id = create_inst_res.json()["id"]
        delete_inst_at_end = True
    else:
        institution_id = inst_res.json()[0]["id"]
        delete_inst_at_end = False
    
    print(f"Using Institution ID: {institution_id}")

    # 3. Download template from backend
    print("--- Verifying Dynamic Template Download Endpoint ---")
    template_res = requests.get(f"{BASE_URL}/academic/students/bulk_upload_template/", headers=headers, verify=False)
    if template_res.status_code != 200:
        print(f"❌ Template download failed with status {template_res.status_code}")
        sys.exit(1)
    
    content_disposition = template_res.headers.get('Content-Disposition', '')
    if 'Student_Upload_Template.xlsx' not in content_disposition:
        print(f"❌ Unexpected template filename in Content-Disposition: {content_disposition}")
        sys.exit(1)
    print("✅ Template download verified successfully.")

    # 4. Generate custom Excel data with a new Program Code
    new_prog_code = f"SMK{uuid.uuid4().hex[:3].upper()}"
    new_prog_name = f"Smoke Test Program {new_prog_code}"
    new_faculty = f"Faculty of Smoke Testing {uuid.uuid4().hex[:2]}"
    new_department = f"Dept of Smoke Testing {uuid.uuid4().hex[:2]}"
    student_id = f"ST{uuid.uuid4().hex[:6].upper()}"
    
    print(f"Creating test upload with program code: {new_prog_code}")

    test_data = {
        "student_id": [student_id],
        "first_name": ["Alice"],
        "last_name": ["Moyo"],
        "gender": ["Female"],
        "enrollment_year": [2025],
        "faculty": [new_faculty],
        "department": [new_department],
        "program_name": [new_prog_name],
        "program_code": [new_prog_code],
        "status": ["Active"],
        "is_work_for_fees": [False]
    }

    df = pd.DataFrame(test_data)
    excel_file = io.BytesIO()
    df.to_excel(excel_file, index=False)
    excel_file.seek(0)

    # 5. Run dry-run upload (confirm_creation=false)
    print("--- Testing Upload Dry-Run (confirm_creation=false) ---")
    files = {
        'file': ('test_enrollment.xlsx', excel_file, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    }
    data = {
        'institution_id': institution_id
    }
    
    upload_res = requests.post(f"{BASE_URL}/academic/students/bulk_upload/", files=files, data=data, headers=headers, verify=False)
    
    if upload_res.status_code != 200:
        print(f"❌ Dry-run upload failed: {upload_res.status_code}")
        print(upload_res.text)
        sys.exit(1)
    
    res_json = upload_res.json()
    if not res_json.get("requires_approval") or not res_json.get("new_programs"):
        print("❌ Expected requires_approval: True and a list of new programs.")
        print(res_json)
        sys.exit(1)
    
    detected_prog = res_json["new_programs"][0]
    if detected_prog["code"] != new_prog_code:
        print(f"❌ Expected program code '{new_prog_code}', got '{detected_prog['code']}'")
        sys.exit(1)
        
    print("✅ Dry-run warning and require_approval returned correctly:")
    print(f"   Detected program: {detected_prog['name']} ({detected_prog['code']})")

    # Reset file pointer for re-sending
    excel_file.seek(0)

    # 6. Run confirmed upload (confirm_creation=true)
    print("--- Testing Confirmed Upload (confirm_creation=true) ---")
    files = {
        'file': ('test_enrollment.xlsx', excel_file, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    }
    data = {
        'institution_id': institution_id,
        'confirm_creation': 'true'
    }
    
    confirm_res = requests.post(f"{BASE_URL}/academic/students/bulk_upload/", files=files, data=data, headers=headers, verify=False)
    
    if confirm_res.status_code != 201:
        print(f"❌ Confirmed upload failed with status {confirm_res.status_code}")
        print(confirm_res.text)
        sys.exit(1)
        
    print("✅ Confirmed upload completed successfully.")
    print(confirm_res.json())

    # 7. Verify program & student details
    print("--- Verifying creation in the database ---")
    # Search student details
    student_search_res = requests.get(f"{BASE_URL}/academic/students/?search={student_id}", headers=headers, verify=False)
    if student_search_res.status_code != 200:
        print(f"❌ Failed to search for student: {student_search_res.status_code}")
        sys.exit(1)
    
    results = student_search_res.json()
    student_record = None
    for s in results:
        if s["student_id"] == student_id:
            student_record = s
            break
            
    if not student_record:
        print(f"❌ Student record '{student_id}' not found in database search results.")
        sys.exit(1)
        
    print("✅ Student verified in database.")
    print(f"   Name: {student_record['first_name']} {student_record['last_name']}")
    print(f"   Program: {student_record['program_name']}")

    # 8. Clean up
    print("--- Cleaning up created test entities ---")
    student_db_id = student_record["id"]
    requests.delete(f"{BASE_URL}/academic/students/{student_db_id}/", headers=headers, verify=False)
    
    program_id = student_record["program"]
    requests.delete(f"{BASE_URL}/faculties/programs/{program_id}/", headers=headers, verify=False)
    
    department_id = student_record["department"]
    requests.delete(f"{BASE_URL}/faculties/departments/{department_id}/", headers=headers, verify=False)
    
    faculty_id = student_record["faculty"]
    requests.delete(f"{BASE_URL}/faculties/faculties/{faculty_id}/", headers=headers, verify=False)
    
    if delete_inst_at_end:
        requests.delete(f"{BASE_URL}/academic/institutions/{institution_id}/", headers=headers, verify=False)
        
    print("✅ Cleanup complete.")
    print("\n✨ STUDENT BULK UPLOAD FLOW SMOKE TEST PASSED!")

if __name__ == "__main__":
    smoke_test_bulk_upload_flow()
