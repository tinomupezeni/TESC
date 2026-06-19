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

def get_faculty_id(faculty_name, token):
    headers = {"Authorization": f"Bearer {token}"}
    faculties_url = f"{BASE_URL}/api/faculties/faculties/?institution_id={INSTITUTION_ID}&name={faculty_name}"
    response = requests.get(faculties_url, headers=headers)
    response.raise_for_status()
    faculties = response.json()
    if faculties:
        return faculties[0]['id']
    return None

if __name__ == "__main__":
    try:
        access_token = get_jwt_token(ADMIN_EMAIL, ADMIN_PASSWORD)
        
        eng_faculty_id = get_faculty_id("Faculty of Engineering", access_token)
        bus_faculty_id = get_faculty_id("Faculty of Business", access_token)

        if eng_faculty_id:
            print(f"Faculty of Engineering ID: {eng_faculty_id}")
        else:
            print("Faculty of Engineering not found.")
            
        if bus_faculty_id:
            print(f"Faculty of Business ID: {bus_faculty_id}")
        else:
            print("Faculty of Business not found.")

    except requests.exceptions.RequestException as e:
        print(f"An error occurred: {e}")
