import requests
import sys
import uuid
import urllib3

# Suppress insecure request warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

BASE_URL = "http://localhost:8000/api"

def smoke_test_phase1():
    print("🚀 Starting Phase 1 Smoke Test...")

    # 1. Register a test institution
    unique_id = uuid.uuid4().hex[:6]
    inst_name = f"Phase1 Smoke Inst {unique_id}"
    inst_email = f"admin_p1_{unique_id}@core.com"
    
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
        sys.exit(1)
    
    data = response.json()
    inst_id = data["id"]
    admin_creds = data.get("admin_credentials")
    email = admin_creds["email"]
    password = admin_creds["password"]

    # 2. Login to get token
    login_payload = {"username": email, "password": password}
    login_response = requests.post(f"{BASE_URL}/instauth/login/", json=login_payload, verify=False)
    
    if login_response.status_code != 200:
        print(f"❌ Login failed: {login_response.status_code}")
        requests.delete(f"{BASE_URL}/academic/institutions/{inst_id}/")
        sys.exit(1)
    
    access_token = login_response.json()["tokens"]["access"]
    headers = {"Authorization": f"Bearer {access_token}"}

    try:
        # 3. Create a Faculty
        fac_payload = {"name": f"Faculty of Tech {unique_id}", "institution": inst_id}
        fac_res = requests.post(f"{BASE_URL}/faculties/faculties/", json=fac_payload, headers=headers)
        fac_id = fac_res.json().get('id')

        # 4. Create a Department
        dep_payload = {"name": f"Dept of CS {unique_id}", "faculty": fac_id, "code": f"CS{unique_id}"}
        dep_res = requests.post(f"{BASE_URL}/faculties/departments/", json=dep_payload, headers=headers)
        dep_id = dep_res.json().get('id')

        # 5. Create a Program with NEW fields
        print("--- Testing Program Creation (with critical skill and type) ---")
        prog_payload = {
            "name": f"Short Course in AI {unique_id}",
            "code": f"SCAI{unique_id}",
            "duration": 1,
            "department": dep_id,
            "is_critical_skill": True,         # NEW FIELD
            "program_type": "Short Course",    # NEW FIELD
        }
        prog_res = requests.post(f"{BASE_URL}/faculties/programs/", json=prog_payload, headers=headers)
        if prog_res.status_code != 201:
            print(f"❌ Failed to create program: {prog_res.status_code}")
            print(prog_res.text)
            raise Exception("Program creation failed")
        
        prog_data = prog_res.json()
        prog_id = prog_data['id']
        assert prog_data['is_critical_skill'] is True
        assert prog_data['program_type'] == "Short Course"
        print("✅ Program created successfully with new fields.")

        # 6. Create a Student with NEW field (inclusivity_category instead of disability_type)
        print("--- Testing Student Creation (with inclusivity_category) ---")
        student_payload = {
            "first_name": "Test",
            "last_name": "Student",
            "national_id": f"00-000000{unique_id}",
            "student_id": f"S{unique_id}",
            "gender": "Female",
            "enrollment_year": 2026,
            "program": prog_id,
            "institution": inst_id,
            "inclusivity_category": "Visual",  # NEW FIELD
        }
        # In case the API is using form data or specific fields
        stud_res = requests.post(f"{BASE_URL}/academic/students/", json=student_payload, headers=headers)
        if stud_res.status_code != 201:
            print(f"❌ Failed to create student: {stud_res.status_code}")
            print(stud_res.text)
            raise Exception("Student creation failed")
            
        stud_data = stud_res.json()
        assert stud_data.get('inclusivity_category', stud_data.get('disability_type')) == "Visual"
        print("✅ Student created successfully with new inclusivity field.")

        # 7. Test Metrics Payload via Dynamic Report Service
        print("--- Testing Report Metrics Payload ---")
        report_payload = {
            "report_type": "students",
            "filters": {"institution_id": inst_id},
            "columns": ["student_id", "gender"]
        }
        report_res = requests.post(f"{BASE_URL}/v1/reports/dynamic/preview/", json=report_payload, headers=headers)
        if report_res.status_code != 200:
            print(f"❌ Failed to generate report: {report_res.status_code}")
            print(report_res.text)
            raise Exception("Report generation failed")
            
        report_data = report_res.json()
        metrics = report_data.get('metrics', {})
        assert 'total' in metrics, "Missing 'total' in metrics"
        assert 'female_pct' in metrics, "Missing 'female_pct' in metrics"
        assert 'male_pct' in metrics, "Missing 'male_pct' in metrics"
        assert metrics['total'] >= 1, "Total should be at least 1"
        assert metrics['female_count'] >= 1, "Female count should be at least 1"
        print("✅ Metrics payload successfully calculated.")

    finally:
        # Cleanup
        print(f"--- Cleaning up Institution {inst_id} ---")
        requests.delete(f"{BASE_URL}/academic/institutions/{inst_id}/")

    print("🎉 Phase 1 Smoke Test Passed!")

if __name__ == "__main__":
    smoke_test_phase1()