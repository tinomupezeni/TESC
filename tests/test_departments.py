import pytest
from rest_framework.test import APITestCase
from rest_framework import status
from users.models import CustomUser, Department

class DepartmentAPITests(APITestCase):
    
    def setUp(self):
        """
        setUp runs before every test. We use it to create an admin user
        and authenticate the test client, simulating a logged-in session.
        """
        # Create a superuser/admin to authenticate with
        self.admin_user = CustomUser.objects.create_superuser(
            username='admin@scalareye.com',
            email='admin@scalareye.com',
            password='testpassword123'
        )
        # Authenticate the test client (bypasses the need to request a token)
        self.client.force_authenticate(user=self.admin_user)
        
        # API Endpoints
        self.departments_url = '/api/users/departments/'
        self.users_url = '/api/users/users/'

    def test_create_department_and_assign_user(self):
        """
        Test that we can create a global department and assign a new user to it.
        This completely replaces `smoke_test_departments.py`.
        """
        # 1. Create a Global Department
        dept_payload = {
            "name": "Global Test Dept",
            "description": "A global department for testing",
            "permissions": ["/dashboard", "/dashboard/students"]
        }
        
        response = self.client.post(self.departments_url, data=dept_payload, format='json')
        
        # Assertions replace the old `if status_code != 201: sys.exit(1)` logic
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        department_id = response.data['id']
        
        # Verify it actually hit the database
        self.assertTrue(Department.objects.filter(id=department_id).exists())
        
        # 2. Create a User assigned to this Department
        user_payload = {
            "username": "global_staff@test.com",
            "email": "global_staff@test.com",
            "first_name": "Global",
            "last_name": "Staff",
            "level": "4",
            "department_id": department_id
        }
        
        response = self.client.post(self.users_url, data=user_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        user_id = response.data['id']
        
        # 3. Verify user exists and has the correct department assigned
        # We query the DB directly to ensure the API created the record properly
        user = CustomUser.objects.get(id=user_id)
        self.assertEqual(user.department_id, department_id)
        self.assertEqual(user.email, "global_staff@test.com")

    # The old smoke test had a "Cleanup" phase. 
    # With Django APITestCase, cleanup is automatic! The database rolls back 
    # after every test, so we never leave garbage test data behind.
