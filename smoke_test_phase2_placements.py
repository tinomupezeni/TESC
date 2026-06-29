import requests
import sys
import uuid
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

BASE_URL = "https://localhost/api"

def smoke_test_phase2():
    print("🚀 Starting Phase 2 Smoke Test: Industry Placements...")

    unique_id = uuid.uuid4().hex[:6]
    inst_name = f"Phase2 Smoke Inst {unique_id}"
    inst_email = f"admin_p2_{unique_id}@core.com"
    
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

        # Create Placement
        print("--- Testing Industry Placement Creation ---")
        placement_payload = {
            "student": stud_id,
            "placement_type": "Attachment",
            "company_name": "Tech Corp",
            "start_date": "2026-01-01"
        }
        place_res = requests.post(f"{BASE_URL}/academic/placements/", json=placement_payload, headers=headers)
        if place_res.status_code != 201:
            print(f"❌ Failed to create placement: {place_res.status_code}")
            print(place_res.text)
            raise Exception("Placement creation failed")
        
        print("✅ Placement created successfully.")

        # Test Dynamic Report for Placements
        print("--- Testing Placements Report Metrics Payload ---")
        report_payload = {
            "report_type": "placements",
            "filters": {"institution_name": inst_id},
            "columns": ["student_id_number", "company_name", "gender"]
        }
        report_res = requests.post(f"{BASE_URL}/v1/reports/dynamic/preview/", json=report_payload, headers=headers)
        if report_res.status_code != 200:
            print(f"❌ Failed to generate report: {report_res.status_code}")
            print(report_res.text)
            raise Exception("Report generation failed")
            
        report_data = report_res.json()
        metrics = report_data.get('metrics', {})
        assert metrics.get('total') >= 1, "Total should be at least 1"
        print("✅ Metrics payload successfully calculated for placements.")

    finally:
        print(f"--- Cleaning up Institution {inst_id} ---")
        requests.delete(f"{BASE_URL}/academic/institutions/{inst_id}/")

    print("🎉 Phase 2 Smoke Test Passed!")

if __name__ == "__main__":
    smoke_test_phase2()