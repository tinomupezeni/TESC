import requests
import json

BASE_URL = "http://127.0.0.1:8000/api/auth"

class AuthTester:
    def __init__(self):
        self.session = requests.Session()
        self.base_url = BASE_URL
        self.test_user = {
            "username": "test_user_001",
            "email": "test001@example.com",
            "password": "testpass123",
            "password2": "testpass123"
        }
        self.current_user = None

    def print_response(self, endpoint, response):
        print(f"\n{'='*50}")
        print(f"Testing: {endpoint}")
        print(f"Status Code: {response.status_code}")
        print("Response:")
        print(json.dumps(response.json(), indent=2))
        print(f"{'='*50}")

    def test_registration(self):
        print("🔐 TESTING REGISTRATION")
        url = f"{self.base_url}/register/"
        response = self.session.post(url, json=self.test_user)
        self.print_response("REGISTRATION", response)
        
        if response.status_code == 201:
            self.current_user = response.json().get('user')
            print("✅ Registration successful!")
        return response

    def test_login(self):
        print("\n🔐 TESTING LOGIN")
        url = f"{self.base_url}/login/"
        login_data = {
            "username": self.test_user["username"],
            "password": self.test_user["password"]
        }
        response = self.session.post(url, json=login_data)
        self.print_response("LOGIN", response)
        
        if response.status_code == 200:
            print("✅ Login successful!")
        return response

    def test_check_auth(self):
        print("\n🔐 TESTING CHECK AUTH")
        url = f"{self.base_url}/check-auth/"
        response = self.session.get(url)
        self.print_response("CHECK AUTH", response)
        
        if response.status_code == 200:
            auth_status = response.json().get('isAuthenticated', False)
            if auth_status:
                print("✅ User is authenticated!")
            else:
                print("❌ User is NOT authenticated!")
        return response

    def test_profile(self):
        print("\n🔐 TESTING PROFILE")
        url = f"{self.base_url}/profile/"
        response = self.session.get(url)
        self.print_response("PROFILE", response)
        
        if response.status_code == 200:
            print("✅ Profile retrieved successfully!")
        return response

    def test_logout(self):
        print("\n🔐 TESTING LOGOUT")
        url = f"{self.base_url}/logout/"
        response = self.session.post(url)
        self.print_response("LOGOUT", response)
        
        if response.status_code == 200:
            print("✅ Logout successful!")
        return response

    def test_after_logout(self):
        print("\n🔐 TESTING AUTH STATUS AFTER LOGOUT")
        # Test check-auth after logout
        self.test_check_auth()
        
        # Try to access profile after logout (should fail)
        print("\n🔐 TESTING PROFILE ACCESS AFTER LOGOUT")
        url = f"{self.base_url}/profile/"
        response = self.session.get(url)
        self.print_response("PROFILE AFTER LOGOUT", response)
        
        if response.status_code == 403:
            print("✅ Correctly denied access after logout!")
        else:
            print("❌ Unexpected response after logout")

    def run_all_tests(self):
        print("🚀 STARTING COMPREHENSIVE AUTH API TESTS")
        print("="*60)
        
        # Test registration
        self.test_registration()
        
        # Test login
        self.test_login()
        
        # Test authenticated endpoints
        self.test_check_auth()
        self.test_profile()
        
        # Test logout
        self.test_logout()
        
        # Test endpoints after logout
        self.test_after_logout()
        
        print("\n🎉 ALL TESTS COMPLETED!")

if __name__ == "__main__":
    tester = AuthTester()
    tester.run_all_tests()