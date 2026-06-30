import requests
import sys
import uuid
import pandas as pd
import io
import urllib3
import json

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

BASE_URL = "http://localhost:8000/api"
SUPER_ADMIN_EMAIL = "admin@scalareye.com"
SUPER_ADMIN_PASSWORD = "scalareye@123"

def build_excel_file(data_list):
    df = pd.DataFrame(data_list)
    excel_buffer = io.BytesIO()
    df.to_excel(excel_buffer, index=False)
    excel_buffer.seek(0)
    return excel_buffer

def run_all_bulk_upload_smoke_tests():
    print("=" * 70)
    print("🚀 STARTING ALL BULK UPLOAD SMOKE TESTS (12 ENDPOINTS)")
    print("=" * 70)

    # 1. Login as Super Admin to setup test environment
    print("\n🔑 Logging in as Super Admin...")
    login_res = requests.post(f"{BASE_URL}/users/token/", json={
        "email": SUPER_ADMIN_EMAIL, 
        "password": SUPER_ADMIN_PASSWORD
    }, verify=False)
    
    if login_res.status_code != 200:
        print(f"❌ Super Admin login failed: {login_res.status_code}")
        print(login_res.text)
        sys.exit(1)

    super_headers = {"Authorization": f"Bearer {login_res.json()['access']}"}
    print("✅ Super Admin logged in successfully.")

    # 2. Create a Test Institution
    suffix = uuid.uuid4().hex[:4].upper()
    inst_name = f"All Bulk Upload Test Inst {suffix}"
    print(f"\n🏫 Creating test institution: {inst_name}")
    
    inst_res = requests.post(f"{BASE_URL}/academic/institutions/", json={
        "name": inst_name,
        "type": "Polytechnic",
        "location": "Harare",
        "established": 2005,
        "email": f"admin@{suffix.lower()}.test"
    }, headers=super_headers, verify=False)
    
    if inst_res.status_code != 201:
        print(f"❌ Failed to create institution: {inst_res.text}")
        sys.exit(1)
        
    inst_data = inst_res.json()
    inst_id = inst_data['id']
    admin_creds = inst_data['admin_credentials']
    print(f"✅ Institution created with ID: {inst_id}")

    try:
        # 3. Login as the newly created Institution Admin
        print(f"\n👤 Logging in as Institution Admin: {admin_creds['email']}")
        admin_login_res = requests.post(f"{BASE_URL}/users/token/", json={
            "email": admin_creds['email'], 
            "password": admin_creds['password']
        }, verify=False)
        if admin_login_res.status_code != 200:
            print(f"❌ Institution Admin login failed: {admin_login_res.status_code}")
            sys.exit(1)
        admin_headers = {"Authorization": f"Bearer {admin_login_res.json()['access']}"}
        print("✅ Institution Admin login successful.")

        # --- PREPARATION OF DATABASE ENTITIES ---
        # 4. Create Faculty, Department, and Program
        print("\n📚 Setting up initial academic entities (Faculty -> Dept -> Program)...")
        fac_res = requests.post(f"{BASE_URL}/faculties/faculties/", json={
            "name": f"Faculty of Science {suffix}", "institution": inst_id
        }, headers=admin_headers, verify=False)
        fac_id = fac_res.json()['id']

        dept_res = requests.post(f"{BASE_URL}/faculties/departments/", json={
            "name": f"Computer Science {suffix}", "code": f"CS-{suffix}", "faculty": fac_id, "institution": inst_id
        }, headers=admin_headers, verify=False)
        dept_id = dept_res.json()['id']

        prog_code = f"PROG-{suffix}"
        prog_res = requests.post(f"{BASE_URL}/faculties/programs/", json={
            "name": f"BSc CS {suffix}", 
            "code": prog_code, 
            "department": dept_id, 
            "duration": 4,
            "category": "STEM"
        }, headers=admin_headers, verify=False)
        prog_id = prog_res.json()['id']

        spec_prog_code = f"SPEC-{suffix}"
        spec_prog_res = requests.post(f"{BASE_URL}/faculties/programs/", json={
            "name": f"Specialized Skill Prog {suffix}",
            "code": spec_prog_code,
            "department": dept_id,
            "duration": 3,
            "is_specialized_skill": True
        }, headers=admin_headers, verify=False)
        spec_prog_id = spec_prog_res.json()['id']

        crit_prog_code = f"CRIT-{suffix}"
        crit_prog_res = requests.post(f"{BASE_URL}/faculties/programs/", json={
            "name": f"Critical Skill Prog {suffix}",
            "code": crit_prog_code,
            "department": dept_id,
            "duration": 4,
            "is_critical_skill": True
        }, headers=admin_headers, verify=False)
        crit_prog_id = crit_prog_res.json()['id']

        print(f"✅ Created academic programs. STEM: {prog_code}, Specialized: {spec_prog_code}, Critical: {crit_prog_code}")

        # 5. Create a Student in the database (required to link for student bulk uploads)
        student_id = f"ST-{suffix}"
        student_payload = {
            "student_id": student_id,
            "national_id": f"63-{suffix}-X",
            "first_name": "Test",
            "last_name": "Student",
            "gender": "Male",
            "enrollment_year": 2024,
            "institution": inst_id,
            "program": prog_id,
            "selected_level": "Bachelors",
            "selected_category": "STEM"
        }
        student_res = requests.post(f"{BASE_URL}/academic/students/", json=student_payload, headers=admin_headers, verify=False)
        if student_res.status_code != 201:
            print(f"❌ Failed to create student: {student_res.text}")
            sys.exit(1)
        print(f"✅ Created test student ID: {student_id}")

        # --- HELPER FUNCTION FOR INGESTION ENGINE MODULES ---
        def test_ingestion_module(module_name, row_data):
            print(f"\n📥 Testing Ingestion Module: {module_name}...")
            
            # A. Download Template
            template_res = requests.get(f"{BASE_URL}/academic/ingestion/template/{module_name}/", headers=admin_headers, verify=False)
            assert template_res.status_code == 200, f"Template download failed for {module_name}"
            
            # B. Validate
            excel_file = build_excel_file([row_data])
            files = {'file': (f'{module_name}_test.xlsx', excel_file, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')}
            validate_res = requests.post(
                f"{BASE_URL}/academic/ingestion/validate/{module_name}/", 
                files=files, 
                headers=admin_headers, 
                verify=False
            )
            if validate_res.status_code != 200:
                print(f"❌ Validation request failed for {module_name}. Status: {validate_res.status_code}, Body: {validate_res.text}")
                sys.exit(1)
            
            val_json = validate_res.json()
            print(f"Debug Validation JSON for {module_name}: {json.dumps(val_json, indent=2)}")
            
            assert val_json.get("status") == "success", f"Validation status not success: {val_json}"
            processed = val_json["processed_data"]
            assert len(processed) == 1, f"Expected 1 processed row, got {len(processed)}"
            if processed[0]["status"] != "Success":
                print(f"❌ Row validation failed for {module_name}: {processed[0]['messages']}")
                sys.exit(1)
            
            # C. Commit
            commit_res = requests.post(
                f"{BASE_URL}/academic/ingestion/commit/{module_name}/",
                json={'data': processed, 'institution_id': inst_id},
                headers=admin_headers,
                verify=False
            )
            if commit_res.status_code != 200:
                print(f"❌ Commit request failed for {module_name}. Status: {commit_res.status_code}, Body: {commit_res.text}")
                sys.exit(1)
            assert commit_res.json().get("success") is True, f"Commit not successful: {commit_res.json()}"
            print(f"✅ Ingestion module {module_name} passed: template, validation, and commit verified.")

        # --- TEST EACH INGESTION ENGINE ENDPOINT (9 ENDPOINTS) ---

        # 1. faculties
        test_ingestion_module("faculties", {
            "Faculty Name": f"Bulk Fac {suffix}",
            "Dean Name": "Dean Bulk",
            "Location": "Building A",
            "Email": f"dean_{suffix}@test.com",
            "Description": "Test dean description",
            "Status (Active/Setup/Review/Archived)": "Active"
        })

        # 2. programs
        test_ingestion_module("programs", {
            "Faculty Name": f"Faculty of Science {suffix}",
            "Department Name": f"Computer Science {suffix}",
            "Program Name": f"MSc Artificial Intelligence {suffix}",
            "Program Code": f"MSCAI-{suffix}",
            "Duration (Years)": 2,
            "Levels (Comma-separated: Bachelors, Masters, etc.)": "Masters",
            "Categories (Comma-separated: STEM, BUSINESS, etc.)": "STEM",
            "Is Critical Skill (TRUE/FALSE)": "TRUE",
            "Program Type (Degree/Diploma/Certificate/Short Course/Other)": "Degree",
            "Description": "Test program description"
        })

        # 3. stem_students
        test_ingestion_module("stem_students", {
            "Student ID": f"ST-STEM-{suffix}",
            "National ID": f"63-STEM-{suffix}",
            "First Name": "Alice",
            "Last Name": "Stem",
            "Gender (Male/Female)": "Female",
            "Date of Birth (YYYY-MM-DD)": "2001-01-01",
            "Enrollment Year": 2025,
            "Status (Active/Suspended/Graduated/Dropout)": "Active",
            "Program Code": prog_code,
            "Selected Level": "Bachelors"
        })

        # 3a. specialized_students
        test_ingestion_module("specialized_students", {
            "Student ID": f"ST-SPEC-{suffix}",
            "National ID": f"63-SPEC-{suffix}",
            "First Name": "Charlie",
            "Last Name": "Specialized",
            "Gender (Male/Female)": "Male",
            "Date of Birth (YYYY-MM-DD)": "2002-02-02",
            "Enrollment Year": 2025,
            "Status (Active/Suspended/Graduated/Dropout)": "Active",
            "Program Code": spec_prog_code,
            "Selected Level": "Diploma"
        })

        # 3b. critical_students
        test_ingestion_module("critical_students", {
            "Student ID": f"ST-CRIT-{suffix}",
            "National ID": f"63-CRIT-{suffix}",
            "First Name": "Diane",
            "Last Name": "Critical",
            "Gender (Male/Female)": "Female",
            "Date of Birth (YYYY-MM-DD)": "2003-03-03",
            "Enrollment Year": 2025,
            "Status (Active/Suspended/Graduated/Dropout)": "Active",
            "Program Code": crit_prog_code,
            "Selected Level": "Bachelors"
        })

        # 4. inclusivity
        test_ingestion_module("inclusivity", {
            "Student ID": student_id,
            "Inclusivity Category": "Physical Disability"
        })

        # 5. possible_graduates
        test_ingestion_module("possible_graduates", {
            "Student ID": student_id,
            "Expected Graduation Year": 2028
        })

        # 6. placements
        test_ingestion_module("placements", {
            "Student ID": student_id,
            "Placement Type (Attachment/Apprenticeship)": "Attachment",
            "Company Name": "Google",
            "Start Date (YYYY-MM-DD)": "2026-06-01",
            "End Date (YYYY-MM-DD)": "2026-12-01"
        })

        # 7. scholarships
        test_ingestion_module("scholarships", {
            "Student ID": student_id,
            "Provider Name": "TESC Scholarship Trust",
            "Amount": 5000.0,
            "Year Awarded": 2026
        })

        # 8. mobility
        test_ingestion_module("mobility", {
            "Student ID": student_id,
            "Direction (Inbound/Outbound)": "Outbound",
            "Country": "United Kingdom",
            "Foreign Institution": "University of Cambridge"
        })

        # 9. in_country_transfers
        test_ingestion_module("in_country_transfers", {
            "Student ID": student_id,
            "From Institution Name": "University of Zimbabwe",
            "To Institution Name": inst_name,
            "Transfer Date (YYYY-MM-DD)": "2026-05-15"
        })

        # --- TEST THE 3 CUSTOM BULK UPLOAD ENDPOINTS ---

        # 10. Custom Students Bulk Upload (/api/academic/students/bulk_upload/)
        print("\n📥 Testing Custom Students Bulk Upload...")
        cust_student_id = f"ST-CUST-{suffix}"
        cust_student_excel = build_excel_file([{
            "student_id": cust_student_id,
            "first_name": "Bob",
            "last_name": "Custom",
            "gender": "Male",
            "enrollment_year": 2025,
            "faculty": f"Faculty of Science {suffix}",
            "department": f"Computer Science {suffix}",
            "program_name": f"BSc CS {suffix}",
            "program_code": prog_code,
            "status": "Active",
            "is_work_for_fees": False
        }])
        
        student_files = {'file': ('students_custom.xlsx', cust_student_excel, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')}
        student_upload_res = requests.post(
            f"{BASE_URL}/academic/students/bulk_upload/",
            files=student_files,
            data={"institution_id": inst_id, "confirm_creation": "true"},
            headers=admin_headers,
            verify=False
        )
        assert student_upload_res.status_code == 201, f"Custom student bulk upload failed: {student_upload_res.text}"
        print("✅ Custom Students Bulk Upload passed.")

        # 11. Custom Staff Bulk Upload (/api/staff/members/bulk_upload/)
        print("\n📥 Testing Custom Staff Bulk Upload...")
        staff_excel = build_excel_file([{
            "first_name": "John",
            "last_name": "Lecturer",
            "email": f"john.lecturer_{suffix}@inst.ac.zw",
            "phone": "+26377123456",
            "employee_id": f"EMP-{suffix}",
            "position": "Lecturer",
            "qualification": "Masters",
            "faculty_name": f"Faculty of Science {suffix}",
            "department_name": f"Computer Science {suffix}",
            "specialization": "Artificial Intelligence",
            "date_joined": "2025-01-01"
        }])
        
        staff_files = {'file': ('staff.xlsx', staff_excel, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')}
        staff_upload_res = requests.post(
            f"{BASE_URL}/staff/members/bulk_upload/",
            files=staff_files,
            data={"institution_id": inst_id},
            headers=admin_headers,
            verify=False
        )
        assert staff_upload_res.status_code == 201, f"Custom staff bulk upload failed: {staff_upload_res.text}"
        print("✅ Custom Staff Bulk Upload passed.")

        # 12. Custom Graduates Bulk Upload (/api/academic/graduates-mgmt/bulk-upload/)
        print("\n📥 Testing Custom Graduates Bulk Upload...")
        grad_student_id = f"ST-GRAD-{suffix}"
        grad_excel = build_excel_file([{
            "Student ID": grad_student_id,
            "National ID": f"63-GRAD-{suffix}",
            "First Name": "Jane",
            "Last Name": "Grad",
            "Gender": "Female",
            "Program Code": prog_code,
            "Enrollment Year": 2021,
            "Graduation Year": 2025,
            "Final Grade": "Distinction"
        }])
        
        grad_files = {'file': ('graduates.xlsx', grad_excel, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')}
        grad_upload_res = requests.post(
            f"{BASE_URL}/academic/graduates-mgmt/bulk-upload/",
            files=grad_files,
            headers=admin_headers,
            verify=False
        )
        assert grad_upload_res.status_code == 201, f"Custom graduates bulk upload failed: {grad_upload_res.text}"
        print("✅ Custom Graduates Bulk Upload passed.")

        # --- VERIFY SPECIALIZED AND CRITICAL STUDENTS API ENDPOINTS ---
        print("\n🔍 Verifying Specialized Students API endpoint...")
        spec_students_res = requests.get(
            f"{BASE_URL}/academic/students/specialized-students/?institution_id={inst_id}",
            headers=admin_headers,
            verify=False
        )
        assert spec_students_res.status_code == 200, f"Specialized students request failed: {spec_students_res.text}"
        spec_data = spec_students_res.json()
        assert spec_data.get("total_students") >= 1, f"Expected at least 1 specialized student: {spec_data}"
        print(f"✅ Specialized Students API verified. Total specialized: {spec_data['total_students']}")

        print("\n🔍 Verifying Critical Students API endpoint...")
        crit_students_res = requests.get(
            f"{BASE_URL}/academic/students/critical-students/?institution_id={inst_id}",
            headers=admin_headers,
            verify=False
        )
        assert crit_students_res.status_code == 200, f"Critical students request failed: {crit_students_res.text}"
        crit_data = crit_students_res.json()
        assert crit_data.get("total_students") >= 1, f"Expected at least 1 critical student: {crit_data}"
        print(f"✅ Critical Students API verified. Total critical: {crit_data['total_students']}")

        print("\n" + "=" * 70)
        print("🎉 SUCCESS: ALL 14 BULK UPLOAD ENDPOINTS & DIRECTORIES SMOKE TESTED & PASSED!")
        print("=" * 70)

    finally:
        # Cleanup created test institution
        print(f"\n🧹 Cleaning up test institution (ID: {inst_id})...")
        requests.delete(f"{BASE_URL}/academic/institutions/{inst_id}/", headers=super_headers, verify=False)
        print("✅ Cleanup complete.")

if __name__ == "__main__":
    run_all_bulk_upload_smoke_tests()
