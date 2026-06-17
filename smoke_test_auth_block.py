import requests
import sys
import os

BASE_URL = "https://localhost/api"

def test_login(email, password, expected_status, description):
    print(f"Testing: {description} ({email})")
    try:
        response = requests.post(f"{BASE_URL}/users/token/", json={
            "email": email,
            "password": password
        })
        if response.status_code == expected_status:
            print(f"  ✅ SUCCESS: Received status {response.status_code}")
            return response.json()
        else:
            print(f"  ❌ FAILED: Expected {expected_status}, got {response.status_code}")
            print(f"  Response: {response.text}")
            return None
    except Exception as e:
        print(f"  ❌ ERROR: {str(e)}")
        return None

def create_inst_user(email, password, institution_id):
    print(f"Creating test institution user: {email}")
    cmd = f"docker exec tesc-v5-backend-1 python3 manage.py shell -c \"from users.models import CustomUser; from academic.models import Institution; inst = Institution.objects.get(id={institution_id}); user = CustomUser.objects.create_user(username='{email}', email='{email}', password='{password}', institution=inst); print('USER_CREATED')\""
    os.system(cmd)

def delete_inst_user(email):
    print(f"Deleting test institution user: {email}")
    cmd = f"docker exec tesc-v5-backend-1 python3 manage.py shell -c \"from users.models import CustomUser; CustomUser.objects.filter(email='{email}').delete(); print('USER_DELETED')\""
    os.system(cmd)

if __name__ == "__main__":
    # 1. Test ScalarEye (Global Admin - No Institution)
    test_login("admin@scalareye.com", "scalareye@123", 200, "Global Admin Login")

    # 2. Test Institution User
    test_email = "test_inst_user@tesc.ac.zw"
    test_pass = "testpass123"
    inst_id = 89
    
    create_inst_user(test_email, test_pass, inst_id)
    
    # The API should still allow login (200), but the frontend will block based on the payload
    # We check if institution info is present in the response
    data = test_login(test_email, test_pass, 200, "Institution User API Login")
    
    if data and 'user' in data and data['user'].get('institution'):
        print(f"  ✅ SUCCESS: Institution info found in response: {data['user']['institution']['name']}")
    else:
        print(f"  ❌ FAILED: Institution info NOT found in response or login failed")

    delete_inst_user(test_email)
