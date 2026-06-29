import requests
import sys
import uuid
import urllib3
import pandas as pd
import io

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

BASE_URL = "https://localhost/api"

def smoke_test_phase5():
    print("🚀 Starting Phase 5 Smoke Test: Ingestion Engine...")
    unique_id = uuid.uuid4().hex[:6]
    
    # 1. Setup Data (Institution, Program, Student)
    inst_res = requests.post(f"{BASE_URL}/academic/institutions/", json={
        "name": f"Inst {unique_id}", "type": "Polytechnic", "location": "HRE", "established": 2000, "email": f"test{unique_id}@hpc.ac.zw"
    }, verify=False)
    if inst_res.status_code != 201:
        print(f"❌ Failed to create institution: {inst_res.status_code}")
        print(inst_res.text)
        sys.exit(1)
    inst_id = inst_res.json()['id']
    admin_creds = inst_res.json().get("admin_credentials")
    email = admin_creds["email"]
    password = admin_creds["password"]
    
    login_payload = {"username": email, "password": password}
    login_response = requests.post(f"{BASE_URL}/instauth/login/", json=login_payload, verify=False)
    if login_response.status_code != 200:
        print(f"❌ Login failed: {login_response.status_code}")
        print(login_response.text)
        sys.exit(1)
    access_token = login_response.json()["tokens"]["access"]
    headers = {"Authorization": f"Bearer {access_token}"}
    
    fac_res = requests.post(f"{BASE_URL}/faculties/faculties/", json={"name": "Fac", "institution": inst_id}, headers=headers, verify=False)
    if fac_res.status_code != 201:
        print(f"❌ Failed to create faculty: {fac_res.status_code}")
        print(fac_res.text)
        sys.exit(1)
    fac_id = fac_res.json()['id']
    dep_res = requests.post(f"{BASE_URL}/faculties/departments/", json={"name": "Dep", "faculty": fac_id, "code": "D1"}, headers=headers, verify=False)
    if dep_res.status_code != 201:
        print(f"❌ Failed to create department: {dep_res.status_code}")
        print(dep_res.text)
        sys.exit(1)
    dep_id = dep_res.json()['id']
    prog_res = requests.post(f"{BASE_URL}/faculties/programs/", json={"name": "Prog", "code": "P1", "duration": 1, "department": dep_id}, headers=headers, verify=False)
    prog_id = prog_res.json()['id']
    
    student_id = f"S{unique_id}"
    requests.post(f"{BASE_URL}/academic/students/", json={
        "student_id": student_id, "first_name": "Test", "last_name": "Student", "national_id": "123",
        "gender": "Male", "enrollment_year": 2026, "program": prog_id, "institution": inst_id
    }, headers=headers, verify=False)
    
    try:
        # 2. Download Template
        res = requests.get(f"{BASE_URL}/academic/ingestion/template/placements/", headers=headers, verify=False)
        
        # 3. Prepare Mock Excel
        df = pd.DataFrame([
            {'Student ID': student_id, 'Placement Type (Attachment/Apprenticeship)': 'Attachment', 'Company Name': 'TestCorp', 'Start Date (YYYY-MM-DD)': '2026-01-01'},
            {'Student ID': 'UNKNOWN', 'Placement Type (Attachment/Apprenticeship)': 'Attachment', 'Company Name': 'BadCorp', 'Start Date (YYYY-MM-DD)': '2026-01-01'}
        ])
        excel_buffer = io.BytesIO()
        df.to_excel(excel_buffer, index=False)
        excel_buffer.seek(0)
        
        # 4. Upload and Validate
        files = {'file': ('test.xlsx', excel_buffer)}
        res = requests.post(f"{BASE_URL}/academic/ingestion/validate/placements/", files=files, headers=headers, verify=False)
        
        if res.status_code != 200:
            print(f"❌ Failed to validate: {res.status_code}")
            print(res.text)
            raise Exception("Validation failed")
            
        results = res.json()
        assert results['status'] == 'success'
        assert len(results['processed_data']) == 2
        assert results['processed_data'][0]['status'] == 'Success'
        assert results['processed_data'][1]['status'] == 'Success'
        
        print("✅ Ingestion validation smoke test passed.")

    finally:
        requests.delete(f"{BASE_URL}/academic/institutions/{inst_id}/", verify=False)

    print("🎉 Phase 5 Smoke Test Passed!")

if __name__ == "__main__":
    smoke_test_phase5()