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

def get_faculty_id_by_name(faculty_name, token):
    headers = {"Authorization": f"Bearer {token}"}
    faculties_url = f"{BASE_URL}/api/faculties/faculties/?institution_id={INSTITUTION_ID}&name={faculty_name}"
    response = requests.get(faculties_url, headers=headers)
    response.raise_for_status()
    faculties = response.json()
    if faculties:
        return faculties[0]['id']
    return None

def create_department(faculty_id, department_name, token):
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    department_url = f"{BASE_URL}/api/faculties/departments/"
    payload = {
        "faculty": faculty_id,
        "name": department_name,
        "code": department_name[:4].upper(), # Simple code generation
        "head_of_department": f"HoD {department_name}",
        "description": f"Department of {department_name}."
    }
    response = requests.post(department_url, headers=headers, json=payload)
    print(f"DEBUG: Department create API response status: {response.status_code}")
    print(f"DEBUG: Department create API response content: {response.json()}")
    response.raise_for_status()
    return response.json()

def get_department_id_by_name(department_name, faculty_id, token):
    headers = {"Authorization": f"Bearer {token}"}
    departments_url = f"{BASE_URL}/api/faculties/departments/?faculty={faculty_id}&name={department_name}"
    response = requests.get(departments_url, headers=headers)
    response.raise_for_status()
    departments = response.json()
    if departments:
        return departments[0]['id']
    return None

if __name__ == "__main__":
    try:
        access_token = get_jwt_token(ADMIN_EMAIL, ADMIN_PASSWORD)
        
        # Get Faculty IDs
        eng_faculty_id = get_faculty_id_by_name("Faculty of Engineering", access_token)
        bus_faculty_id = get_faculty_id_by_name("Faculty of Business", access_token)

        if not eng_faculty_id:
            print("ERROR: Faculty of Engineering not found. Cannot create department.")
            exit(1)
        if not bus_faculty_id:
            print("ERROR: Faculty of Business not found. Cannot create department.")
            exit(1)

        # Create Computer Science Department
        print("\nCreating Computer Science Department...")
        cs_dept_response = create_department(eng_faculty_id, "Computer Science", access_token)
        cs_dept_name = cs_dept_response['name']
        cs_dept_id = cs_dept_response['id']
        print(f"Created: {cs_dept_name} (ID: {cs_dept_id}) in Faculty of Engineering.")

        # Verify CS Department via API
        verify_cs_dept = get_department_id_by_name(cs_dept_name, eng_faculty_id, access_token)
        if verify_cs_dept:
            print(f"Verification (API): Computer Science department found with ID: {verify_cs_dept}")
        else:
            print("Verification (API): Computer Science department NOT found after creation.")

        # Create Marketing Department
        print("\nCreating Marketing Department...")
        mkt_dept_response = create_department(bus_faculty_id, "Marketing", access_token)
        mkt_dept_name = mkt_dept_response['name']
        mkt_dept_id = mkt_dept_response['id']
        print(f"Created: {mkt_dept_name} (ID: {mkt_dept_id}) in Faculty of Business.")

        # Verify Marketing Department via API
        verify_mkt_dept = get_department_id_by_name(mkt_dept_name, bus_faculty_id, access_token)
        if verify_mkt_dept:
            print(f"Verification (API): Marketing department found with ID: {verify_mkt_dept}")
        else:
            print("Verification (API): Marketing department NOT found after creation.")
        
        print("\nDepartments created successfully.")

    except requests.exceptions.RequestException as e:
        print(f"An error occurred: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
