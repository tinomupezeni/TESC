import requests
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

def run_stem_students_smoke_test():
    print("--- Starting STEM Students API Smoke Test ---")
    
    try:
        access_token = get_jwt_token(ADMIN_EMAIL, ADMIN_PASSWORD)
        headers = {"Authorization": f"Bearer {access_token}"}
        print("Successfully obtained JWT token.")
    except requests.exceptions.RequestException as e:
        print(f"Error obtaining JWT token: {e}. Test Failed.")
        return False

    # 1. Ensure an institution exists
    try:
        response = requests.get(f"{BASE_URL}/api/academic/institutions/{INSTITUTION_ID}/", headers=headers)
        response.raise_for_status()
        print(f"Institution ID {INSTITUTION_ID} exists.")
    except requests.exceptions.RequestException as e:
        print(f"Error checking Institution ID {INSTITUTION_ID}: {e}. Test Failed.")
        return False

    # 2. Call the stem-students API endpoint
    try:
        stem_students_url = f"{BASE_URL}/api/academic/students/stem-students/?institution_id={INSTITUTION_ID}"
        print(f"Calling API: {stem_students_url}")
        response = requests.get(stem_students_url, headers=headers)
        response.raise_for_status()
        data = response.json()
        
        print("API Response for STEM Students:")
        print(json.dumps(data, indent=2))

        # Basic verification
        if 'results' in data and isinstance(data['results'], list):
            print(f"Total STEM students: {data.get('total_students')}")
            print(f"Male STEM students: {data.get('male_students')}")
            print(f"Female STEM students: {data.get('female_students')}")
            print(f"Number of students in results list: {len(data['results'])}")
            print("STEM Students API Smoke Test PASSED.")
            return True
        else:
            print("ERROR: API response structure is unexpected. Test Failed.")
            return False

    except requests.exceptions.RequestException as e:
        print(f"Error calling STEM Students API: {e}. Test Failed.")
        return False

if __name__ == "__main__":
    if run_stem_students_smoke_test():
        print("STEM Students API Smoke Test PASSED.")
    else:
        print("STEM Students API Smoke Test FAILED.")
