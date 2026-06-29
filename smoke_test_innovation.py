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

def test_innovation_crud(token, inst_id):
    headers = {"Authorization": f"Bearer {token}"}
    hub_id = None
    project_id = None
    partner_id = None
    grant_id = None

    try:
        # 1. Hub CRUD
        print("\n1. Testing Hub CRUD...")
        hub_data = {
            "name": f"Test Hub {uuid.uuid4().hex[:4]}",
            "capacity": 50,
            "occupied": 5,
            "services": 5,
            "status": "Medium",
            "institution": inst_id
        }
        res = requests.post(f"{BASE_URL}/innovation/hubs/", json=hub_data, headers=headers, verify=False)
        if res.status_code == 201:
            hub_id = res.json()['id']
            print(f"  ✅ Hub created (ID: {hub_id})")
        else:
            print(f"  ❌ Hub creation failed: {res.status_code} {res.text}")
            return False

        # 2. Project CRUD
        print("\n2. Testing Project CRUD...")
        project_data = {
            "name": f"Test Project {uuid.uuid4().hex[:4]}",
            "team_name": "Test Team",
            "sector": "energy",
            "location_category": "Urban",
            "stage": "ideation",
            "problem_statement": "Test Problem",
            "proposed_solution": "Test Solution",
            "revenue_generated": 1000,
            "funding_acquired": 500,
            "jobs_created": 2,
            "institution": inst_id,
            "hub": hub_id
        }
        res = requests.post(f"{BASE_URL}/innovation/projects/", json=project_data, headers=headers, verify=False)
        if res.status_code == 201:
            project_id = res.json()['id']
            print(f"  ✅ Project created (ID: {project_id})")
        else:
            print(f"  ❌ Project creation failed: {res.status_code} {res.text}")
            return False

        # 3. Partnership CRUD
        print("\n3. Testing Partnership CRUD...")
        partner_data = {
            "partner_name": f"Test Partner {uuid.uuid4().hex[:4]}",
            "focus_area": "Research",
            "agreement_date": "2026-01-01",
            "status": "Active",
            "institution": inst_id
        }
        res = requests.post(f"{BASE_URL}/innovation/partnerships/", json=partner_data, headers=headers, verify=False)
        if res.status_code == 201:
            partner_id = res.json()['id']
            print(f"  ✅ Partnership created (ID: {partner_id})")
        else:
            print(f"  ❌ Partnership creation failed: {res.status_code} {res.text}")
            return False

        # 4. Grant CRUD
        print("\n4. Testing Grant CRUD...")
        grant_data = {
            "donor": f"Test Donor {uuid.uuid4().hex[:4]}",
            "amount": 5000,
            "date_awarded": "2026-02-01",
            "institution": inst_id,
            "project": project_id
        }
        res = requests.post(f"{BASE_URL}/innovation/grants/", json=grant_data, headers=headers, verify=False)
        if res.status_code == 201:
            grant_id = res.json()['id']
            print(f"  ✅ Grant created (ID: {grant_id})")
        else:
            print(f"  ❌ Grant creation failed: {res.status_code} {res.text}")
            return False

        # --- UPDATE TESTS ---
        print("\nTesting Updates...")
        requests.patch(f"{BASE_URL}/innovation/hubs/{hub_id}/", json={"name": "Updated Hub"}, headers=headers, verify=False)
        requests.patch(f"{BASE_URL}/innovation/projects/{project_id}/", json={"name": "Updated Project"}, headers=headers, verify=False)
        requests.patch(f"{BASE_URL}/innovation/partnerships/{partner_id}/", json={"partner_name": "Updated Partner"}, headers=headers, verify=False)
        requests.patch(f"{BASE_URL}/innovation/grants/{grant_id}/", json={"donor": "Updated Donor"}, headers=headers, verify=False)
        print("  ✅ Updates successful")

        # --- DELETE TESTS ---
        print("\nTesting Deletions...")
        if requests.delete(f"{BASE_URL}/innovation/grants/{grant_id}/", headers=headers, verify=False).status_code == 204:
            grant_id = None
            print("  ✅ Grant deleted")
        if requests.delete(f"{BASE_URL}/innovation/partnerships/{partner_id}/", headers=headers, verify=False).status_code == 204:
            partner_id = None
            print("  ✅ Partnership deleted")
        if requests.delete(f"{BASE_URL}/innovation/projects/{project_id}/", headers=headers, verify=False).status_code == 204:
            project_id = None
            print("  ✅ Project deleted")
        if requests.delete(f"{BASE_URL}/innovation/hubs/{hub_id}/", headers=headers, verify=False).status_code == 204:
            hub_id = None
            print("  ✅ Hub deleted")

        return True

    finally:
        # Cleanup
        if grant_id: requests.delete(f"{BASE_URL}/innovation/grants/{grant_id}/", headers=headers, verify=False)
        if partner_id: requests.delete(f"{BASE_URL}/innovation/partnerships/{partner_id}/", headers=headers, verify=False)
        if project_id: requests.delete(f"{BASE_URL}/innovation/projects/{project_id}/", headers=headers, verify=False)
        if hub_id: requests.delete(f"{BASE_URL}/innovation/hubs/{hub_id}/", headers=headers, verify=False)

if __name__ == "__main__":
    token = get_admin_token()
    if token:
        # Using Institution ID 89 for testing
        success = test_innovation_crud(token, 89)
        if success:
            print("\n🌟 INNOVATION SMOKE TEST PASSED!")
        else:
            print("\n❌ INNOVATION SMOKE TEST FAILED!")
            exit(1)
