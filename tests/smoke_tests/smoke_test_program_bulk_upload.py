import requests
import openpyxl
import io
import os
import json

BASE_URL = os.getenv("BASE_URL", "http://localhost:8000")
INSTITUTION_ID = 90
ADMIN_EMAIL = "testadmin@example.com"
ADMIN_PASSWORD = "user@123" 

def get_jwt_token(email, password):
    login_url = f"{BASE_URL}/api/token/"
    payload = {"email": email, "password": password}
    response = requests.post(login_url, json=payload)
    response.raise_for_status()
    return response.json()['access']

def create_sample_program_excel(filename="sample_programs.xlsx"):
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Programs"

    headers = [
        "Faculty Name", 
        "Department Name", 
        "Program Name", 
        "Program Code", 
        "Duration (Years)", 
        "Levels (Comma-separated: Bachelors, Masters, etc.)", 
        "Categories (Comma-separated: STEM, BUSINESS, etc.)", 
        "Is Critical Skill (TRUE/FALSE)", 
        "Program Type (Degree/Diploma/Certificate/Short Course/Other)", 
        "Description", 
        "Coordinator", 
        "Student Capacity", 
        "Semester Fee", 
        "Modules (Comma-separated)", 
        "Entry Requirements"
    ]
    ws.append(headers)

    # Sample Data - Using existing 'Faculty of Engineering' and 'Computer Science' department for INST_ID 90
    ws.append([
        "Faculty of Engineering", 
        "Computer Science", 
        "Bachelor of Computer Science", 
        "BCS", 
        4, 
        "Bachelors", 
        "STEM", 
        "TRUE", 
        "Degree", 
        "Comprehensive program in computer science.", 
        "Dr. Alice Smith", 
        100, 
        1500.00, 
        "Programming,Algorithms,Databases", 
        "5 O Levels including Math"
    ])
    ws.append([
        "Faculty of Business", 
        "Marketing", 
        "Diploma in Marketing", 
        "DIM", 
        2, 
        "Diploma", 
        "BUSINESS", 
        "FALSE", 
        "Diploma", 
        "Focus on modern marketing strategies.", 
        "Mr. Bob Johnson", 
        50, 
        800.00, 
        "Marketing Principles,Digital Marketing", 
        "5 O Levels"
    ])
    
    buffer = io.BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    
    with open(filename, 'wb') as f:
        f.write(buffer.getvalue())
    return filename

def run_program_bulk_upload_smoke_test():
    print("--- Starting Program Bulk Upload Smoke Test ---")
    
    try:
        access_token = get_jwt_token(ADMIN_EMAIL, ADMIN_PASSWORD)
        headers = {"Authorization": f"Bearer {access_token}"}
        print("Successfully obtained JWT token.")
    except requests.exceptions.RequestException as e:
        print(f"Error obtaining JWT token: {e}. Test Failed.")
        return False

    # Check if Institution ID exists (already done in faculty test, but good to ensure)
    try:
        response = requests.get(f"{BASE_URL}/api/academic/institutions/{INSTITUTION_ID}/", headers=headers)
        response.raise_for_status()
        print(f"Institution ID {INSTITUTION_ID} exists.")
    except requests.exceptions.RequestException as e:
        print(f"Error checking Institution ID {INSTITUTION_ID}: {e}. Test Failed.")
        return False

    # Check if sample Faculty and Department exist (for linking programs)
    # This is critical for program creation
    try:
        faculty_name_eng = "Faculty of Engineering"
        dept_name_cs = "Computer Science"
        faculty_name_bus = "Faculty of Business"
        dept_name_mkt = "Marketing"

        response_faculty_eng = requests.get(f"{BASE_URL}/api/academic/faculties/?institution_id={INSTITUTION_ID}&name={faculty_name_eng}", headers=headers)
        response_faculty_eng.raise_for_status()
        faculties_eng = response_faculty_eng.json()
        if not faculties_eng:
            print(f"ERROR: Faculty '{faculty_name_eng}' not found for institution {INSTITUTION_ID}. Please create it. Test Failed.")
            return False
        faculty_id_eng = faculties_eng[0]['id']

        response_dept_cs = requests.get(f"{BASE_URL}/api/faculties/departments/?faculty={faculty_id_eng}&name={dept_name_cs}", headers=headers)
        response_dept_cs.raise_for_status()
        depts_cs = response_dept_cs.json()
        if not depts_cs:
            print(f"ERROR: Department '{dept_name_cs}' not found in Faculty '{faculty_name_eng}'. Please create it. Test Failed.")
            return False
        print(f"Faculty '{faculty_name_eng}' and Department '{dept_name_cs}' exist.")

        response_faculty_bus = requests.get(f"{BASE_URL}/api/academic/faculties/?institution_id={INSTITUTION_ID}&name={faculty_name_bus}", headers=headers)
        response_faculty_bus.raise_for_status()
        faculties_bus = response_faculty_bus.json()
        if not faculties_bus:
            print(f"ERROR: Faculty '{faculty_name_bus}' not found for institution {INSTITUTION_ID}. Please create it. Test Failed.")
            return False
        faculty_id_bus = faculties_bus[0]['id']

        response_dept_mkt = requests.get(f"{BASE_URL}/api/faculties/departments/?faculty={faculty_id_bus}&name={dept_name_mkt}", headers=headers)
        response_dept_mkt.raise_for_status()
        depts_mkt = response_dept_mkt.json()
        if not depts_mkt:
            print(f"ERROR: Department '{dept_name_mkt}' not found in Faculty '{faculty_name_bus}'. Please create it. Test Failed.")
            return False
        print(f"Faculty '{faculty_name_bus}' and Department '{dept_name_mkt}' exist.")


    except requests.exceptions.RequestException as e:
        print(f"Error checking Faculty/Department existence: {e}. Test Failed.")
        return False
        
    # Create sample Excel file
    excel_file_path = create_sample_program_excel()
    print(f"Created sample Excel file: {excel_file_path}")

    # Upload and Validate
    try:
        with open(excel_file_path, 'rb') as f:
            files = {'file': (excel_file_path, f, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')}
            validate_url = f"{BASE_URL}/api/academic/ingestion/validate/programs/"
            response = requests.post(validate_url, files=files, headers=headers)
            response.raise_for_status()
            validation_results = response.json()
            print("Validation Results:")
            print(json.dumps(validation_results, indent=2))

            if not validation_results.get('processed_data'):
                print("ERROR: No data processed in validation. Test Failed.")
                os.remove(excel_file_path)
                return False
            
            for item in validation_results['processed_data']:
                item['institution_id'] = INSTITUTION_ID
                
    except requests.exceptions.RequestException as e:
        print(f"Error during validation: {e}. Test Failed.")
        os.remove(excel_file_path)
        return False
    
    # Commit the validated data
    try:
        commit_url = f"{BASE_URL}/api/academic/ingestion/commit/programs/"
        response = requests.post(commit_url, json={'data': validation_results['processed_data'], 'institution_id': INSTITUTION_ID}, headers=headers)
        response.raise_for_status()
        commit_results = response.json()
        print("Commit Results:")
        print(json.dumps(commit_results, indent=2))

        if commit_results.get('success') and commit_results.get('imported', 0) > 0:
            print(f"SUCCESS: Successfully imported {commit_results['imported']} programs.")
            
            # Verify database count
            try:
                count_response = requests.get(f"{BASE_URL}/api/faculties/programs/?institution_id={INSTITUTION_ID}", headers=headers)
                count_response.raise_for_status()
                current_programs = count_response.json()
                print(f"Current number of programs in DB: {len(current_programs)}")
                if len(current_programs) >= commit_results['imported']:
                    print("Database verification successful.")
                    return True
                else:
                    print("Database verification failed: count mismatch. Test Failed.")
                    return False
            except requests.exceptions.RequestException as e:
                print(f"Error verifying database count: {e}. Test Failed.")
                return False
        else:
            print("ERROR: Program commit failed or no programs imported. Test Failed.")
            return False

    except requests.exceptions.RequestException as e:
        print(f"Error during commit: {e}. Test Failed.")
        return False
    finally:
        if os.path.exists(excel_file_path):
            os.remove(excel_file_path)


if __name__ == "__main__":
    if run_program_bulk_upload_smoke_test():
        print("Program Bulk Upload Smoke Test PASSED.")
    else:
        print("Program Bulk Upload Smoke Test FAILED.")
