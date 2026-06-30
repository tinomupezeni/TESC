import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import CustomUser

user = CustomUser.objects.get(email="admin@scalareye.com")
user.set_password("scalareye@123")
user.save()
print("Admin password reset to scalareye@123")
