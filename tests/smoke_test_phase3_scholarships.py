import requests
import sys
import uuid
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

BASE_URL = "http://localhost:8000/api"

def smoke_test_phase3():
    print("🚀 Starting Phase 3 Smoke Test: Scholarships...")

    unique_id = uuid.uuid4().hex[:6]
    inst_name = f"Phase3 Smoke Inst {unique_id}"
    inst_email = f"admin_p3_{unique_id}@core.com"
    
    payload = {
        "name": inst_name,
        "type": "Polytechnic",
        "location": "HARARE",
        "address": "123 Test St",
        "capacity": 5000,
        "established": 2000,
        "email": inst_email
    }

    response = requests.post(f"{BASE_URL}/academic/institutions/", json=payload, verify=False)
    data = response.json()
    inst_id = data["id"]
    admin_creds = data.get("admin_credentials")
    email = admin_creds["email"]
    password = admin_creds["password"]

    login_payload = {"username": email, "password": password}
    login_response = requests.post(f"{BASE_URL}/instauth/login/", json=login_payload, verify=False)
    access_token = login_response.json()["tokens"]["access"]
    headers = {"Authorization": f"Bearer {access_token}"}

    try:
        # Create dependencies
        fac_res = requests.post(f"{BASE_URL}/faculties/faculties/", json={"name": f"Fac {unique_id}", "institution": inst_id}, headers=headers)
        fac_id = fac_res.json().get('id')

        dep_res = requests.post(f"{BASE_URL}/faculties/departments/", json={"name": f"Dept {unique_id}", "faculty": fac_id, "code": f"D{unique_id}"}, headers=headers)
        dep_id = dep_res.json().get('id')

        prog_res = requests.post(f"{BASE_URL}/faculties/programs/", json={"name": f"Prog {unique_id}", "code": f"P{unique_id}", "duration": 1, "department": dep_id}, headers=headers)
        prog_id = prog_res.json().get('id')

        stud_res = requests.post(f"{BASE_URL}/academic/students/", json={
            "first_name": "Test", "last_name": "Student", "national_id": f"00-{unique_id}", "student_id": f"S{unique_id}",
            "gender": "Female", "enrollment_year": 2026, "program": prog_id, "institution": inst_id
        }, headers=headers)
        stud_id = stud_res.json().get('id')

        # Create Scholarship
        print("--- Testing Scholarship Creation ---")
        sch_payload = {
            "student": stud_id,
            "provider_name": "Ministry of Education",
            "amount": 500.00,
            "year_awarded": 2026
        }
        sch_res = requests.post(f"{BASE_URL}/academic/scholarships/", json=sch_payload, headers=headers)
        if sch_res.status_code != 201:
            print(f"❌ Failed to create scholarship: {sch_res.status_code}")
            print(sch_res.text)
            raise Exception("Scholarship creation failed")
        
        print("✅ Scholarship created successfully.")

        # Test Dynamic Report for Scholarships
        print("--- Testing Scholarships Report Metrics Payload ---")
        report_payload = {
            "report_type": "scholarships",
            "filters": {"institution_name": inst_id},
            "columns": ["student_id_number", "provider_name", "amount", "year_awarded"]
        }
        report_res = requests.post(f"{BASE_URL}/v1/reports/dynamic/preview/", json=report_payload, headers=headers)
        if report_res.status_code != 200:
            print(f"❌ Failed to generate report: {report_res.status_code}")
            print(report_res.text)
            raise Exception("Report generation failed")
            
        report_data = report_res.json()
        metrics = report_data.get('metrics', {})
        assert metrics.get('total') >= 1, "Total should be at least 1"
        print("✅ Metrics payload successfully calculated for scholarships.")

    finally:
        requests.delete(f"{BASE_URL}/academic/institutions/{inst_id}/")

    print("🎉 Phase 3 Smoke Test Passed!")

if __name__ == "__main__":
    smoke_test_phase3()