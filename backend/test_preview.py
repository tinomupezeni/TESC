import os
import sys
import django

sys.path.append('/home/tino/Projects/TESC/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tesc.settings')
django.setup()

from reports.dynamic_views import DynamicReportPreviewView
from rest_framework.test import APIRequestFactory, force_authenticate
from users.models import CustomUser
from reports.dynamic_serializers import ReportGenerateSerializer

# Get first user
user = CustomUser.objects.first()
if not user:
    print("No user found")
    sys.exit(1)

print(f"Testing with user: {user.email}, institution: {user.institution}")

factory = APIRequestFactory()
request = factory.post('/api/reports/dynamic/preview/', {
    'report_type': 'students',
    'filters': {},
    'columns': ['student_id', 'first_name', 'last_name'],
    'format': 'preview'
}, format='json')

force_authenticate(request, user=user)

view = DynamicReportPreviewView.as_view()
response = view(request)

print(f"Status: {response.status_code}")
if response.status_code == 200:
    print(f"Data: {response.data}")
else:
    print(f"Error: {response.data}")
