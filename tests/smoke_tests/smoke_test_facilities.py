import requests
import uuid
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

BASE_URL = "http://localhost:8000/api"

def get_admin_token():
    print("Logging in as System Admin...")
    try:
        response = requests.post(f"{BASE_URL}/users/token/", json={
            "email": "admin@scalareye.com",
            "password": "scalareye@123"
        }, verify=False)
        if response.status_code == 200:
            print("  ✅ Admin Login successful")
            return response.json()['access']
        else:
            print(f"  ❌ Admin Login failed: {response.status_code}")
            return None
    except Exception as e:
        print(f"  ❌ Connection Error: {str(e)}")
        return None

def test_facilities_crud(token, inst_id):
    headers = {"Authorization": f"Bearer {token}"}
    facility_id = None

    try:
        # 1. Create Facility
        print("\n1. Testing Facility Creation...")
        facility_data = {
            "name": f"Test Facility {uuid.uuid4().hex[:4]}",
            "facility_type": "Laboratory",
            "building": "Test Building",
            "capacity": 100,
            "current_usage": 10,
            "status": "Active",
            "description": "Test Description",
            "manager": "Test Manager",
            "contact_number": "00000000",
            "institution": inst_id
        }
        res = requests.post(f"{BASE_URL}/academic/facilities/", json=facility_data, headers=headers, verify=False)
        if res.status_code == 201:
            facility_id = res.json()['id']
            print(f"  ✅ Facility created (ID: {facility_id})")
        else:
            print(f"  ❌ Facility creation failed: {res.status_code} {res.text}")
            return False

        # 2. Read Facility
        print("\n2. Testing Facility Read...")
        res = requests.get(f"{BASE_URL}/academic/facilities/{facility_id}/", headers=headers, verify=False)
        if res.status_code == 200:
            print(f"  ✅ Facility read successful: {res.json()['name']}")
        else:
            print(f"  ❌ Facility read failed: {res.status_code}")
            return False

        # 3. Update Facility
        print("\n3. Testing Facility Update...")
        update_data = {"name": f"Updated {facility_data['name']}", "capacity": 150}
        res = requests.patch(f"{BASE_URL}/academic/facilities/{facility_id}/", json=update_data, headers=headers, verify=False)
        if res.status_code == 200:
            print(f"  ✅ Facility updated successfully: {res.json()['name']} (Capacity: {res.json()['capacity']})")
        else:
            print(f"  ❌ Facility update failed: {res.status_code}")
            return False

        # 4. Delete Facility
        print("\n4. Testing Facility Deletion...")
        res = requests.delete(f"{BASE_URL}/academic/facilities/{facility_id}/", headers=headers, verify=False)
        if res.status_code == 204:
            print(f"  ✅ Facility deleted successfully")
            facility_id = None # Set to None so cleanup doesn't fail
        else:
            print(f"  ❌ Facility deletion failed: {res.status_code}")
            return False

        return True

    finally:
        if facility_id:
            print(f"\n🧹 Cleaning up facility {facility_id}...")
            requests.delete(f"{BASE_URL}/academic/facilities/{facility_id}/", headers=headers, verify=False)
            print("  ✅ Cleanup complete")

if __name__ == "__main__":
    token = get_admin_token()
    if token:
        # Using Institution ID 89 (Marymount Teachers College) for testing
        success = test_facilities_crud(token, 89)
        if success:
            print("\n🌟 FACILITIES SMOKE TEST PASSED!")
        else:
            print("\n❌ FACILITIES SMOKE TEST FAILED!")
            exit(1)
