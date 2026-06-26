import requests
import openpyxl
import io
import os
import json

BASE_URL = os.getenv("BASE_URL", "http://localhost:8000")
INSTITUTION_ID = 90
ADMIN_EMAIL = "testadmin@example.com"
ADMIN_PASSWORD = "user@123" # Temporary password provided by the user

def get_jwt_token(email, password):
    login_url = f"{BASE_URL}/api/token/"
    payload = {"email": email, "password": password}
    response = requests.post(login_url, json=payload)
    response.raise_for_status() # Raise HTTPError for bad responses (4xx or 5xx)
    return response.json()['access']

def create_sample_faculty_excel(filename="sample_faculties.xlsx"):
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Faculties"

    headers = [
        "Faculty Name", 
        "Dean Name", 
        "Location", 
        "Email", 
        "Description", 
        "Status (Active/Setup/Review/Archived)"
    ]
    ws.append(headers)

    # Sample Data
    ws.append(["Faculty of Engineering", "Dr. Jane Doe", "North Campus", "eng@example.com", "Focuses on applied sciences and engineering.", "Active"])
    ws.append(["Faculty of Business", "Prof. John Smith", "Main Campus", "bus@example.com", "Specializes in business administration.", "Setup"])
    ws.append(["Faculty of Arts", "Dr. Emily White", "South Campus", "arts@example.com", "Humanities and creative arts.", "Active"])

    buffer = io.BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    
    with open(filename, 'wb') as f:
        f.write(buffer.getvalue())
    return filename

def run_faculty_bulk_upload_smoke_test():
    print("--- Starting Faculty Bulk Upload Smoke Test ---")
    
    # Get JWT Token
    try:
        access_token = get_jwt_token(ADMIN_EMAIL, ADMIN_PASSWORD)
        headers = {"Authorization": f"Bearer {access_token}"}
        print("Successfully obtained JWT token.")
    except requests.exceptions.RequestException as e:
        print(f"Error obtaining JWT token: {e}")
        return False

    # 1. Ensure an institution exists (for linking faculties)
    try:
        response = requests.get(f"{BASE_URL}/api/academic/institutions/{INSTITUTION_ID}/", headers=headers)
        response.raise_for_status()
        print(f"Institution ID {INSTITUTION_ID} exists.")
    except requests.exceptions.RequestException as e:
        print(f"Error checking Institution ID {INSTITUTION_ID}: {e}. Please ensure it exists.")
        return False

    # 2. Create a sample Excel file
    excel_file_path = create_sample_faculty_excel()
    print(f"Created sample Excel file: {excel_file_path}")

    # 3. Upload and Validate
    try:
        with open(excel_file_path, 'rb') as f:
            files = {'file': (excel_file_path, f, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')}
            validate_url = f"{BASE_URL}/api/academic/ingestion/validate/faculties/"
            response = requests.post(validate_url, files=files, headers=headers)
            response.raise_for_status()
            validation_results = response.json()
            print("Validation Results:")
            print(json.dumps(validation_results, indent=2))

            if not validation_results.get('processed_data'):
                print("ERROR: No data processed in validation. Test Failed.")
                os.remove(excel_file_path)
                return False
            
            # Extract institution_id from the user context or pass it
            # For simplicity, we add it to each item in processed_data for commit
            for item in validation_results['processed_data']:
                item['institution_id'] = INSTITUTION_ID
                
    except requests.exceptions.RequestException as e:
        print(f"Error during validation: {e}")
        os.remove(excel_file_path)
        return False
    
    # 4. Commit the validated data
    try:
        commit_url = f"{BASE_URL}/api/academic/ingestion/commit/faculties/"
        # The CommitUploadView expects 'data' key in request.data
        response = requests.post(commit_url, json={'data': validation_results['processed_data'], 'institution_id': INSTITUTION_ID}, headers=headers)
        response.raise_for_status()
        commit_results = response.json()
        print("Commit Results:")
        print(json.dumps(commit_results, indent=2))

        if commit_results.get('success') and commit_results.get('imported', 0) > 0:
            print(f"SUCCESS: Successfully imported {commit_results['imported']} faculties.")
            os.remove(excel_file_path)
            # 5. Verify database count (basic check)
            try:
                # Assuming /api/academic/faculties/ returns a list of faculties
                # In a real scenario, you'd filter by institution_id or get a specific faculty
                count_response = requests.get(f"{BASE_URL}/api/academic/faculties/?institution_id={INSTITUTION_ID}", headers=headers)
                count_response.raise_for_status()
                current_faculties = count_response.json()
                print(f"Current number of faculties in DB: {len(current_faculties)}")
                # A more robust check would involve checking names, etc.
                if len(current_faculties) >= commit_results['imported']: # Should be +3 from previous count
                    print("Database verification successful.")
                    return True
                else:
                    print("Database verification failed: count mismatch.")
                    return False
            except requests.exceptions.RequestException as e:
                print(f"Error verifying database count: {e}")
                return False
        else:
            print("ERROR: Faculty commit failed or no faculties imported. Test Failed.")
            os.remove(excel_file_path)
            return False

    except requests.exceptions.RequestException as e:
        print(f"Error during commit: {e}")
        os.remove(excel_file_path)
        return False
    finally:
        if os.path.exists(excel_file_path):
            os.remove(excel_file_path)


if __name__ == "__main__":
    if run_faculty_bulk_upload_smoke_test():
        print("Faculty Bulk Upload Smoke Test PASSED.")
    else:
        print("Faculty Bulk Upload Smoke Test FAILED.")
