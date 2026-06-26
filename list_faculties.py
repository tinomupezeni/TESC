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

def list_faculties_for_institution(institution_id, token):
    headers = {"Authorization": f"Bearer {token}"}
    faculties_url = f"{BASE_URL}/api/faculties/faculties/?institution_id={institution_id}"
    response = requests.get(faculties_url, headers=headers)
    response.raise_for_status()
    return response.json()

if __name__ == "__main__":
    try:
        access_token = get_jwt_token(ADMIN_EMAIL, ADMIN_PASSWORD)
        
        faculties = list_faculties_for_institution(INSTITUTION_ID, access_token)

        if faculties:
            print(f"Faculties for Institution ID {INSTITUTION_ID}:")
            for f in faculties:
                print(f"  - Name: {f['name']}, ID: {f['id']}, Dean: {f['dean']}")
        else:
            print(f"No faculties found for Institution ID {INSTITUTION_ID}.")

    except requests.exceptions.RequestException as e:
        print(f"An error occurred: {e}")
