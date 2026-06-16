import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import CustomUser

def reset_specific_password():
    email = "admin@scalareye.com"
    password = "Admin@123"
    
    try:
        user = CustomUser.objects.get(email=email)
        user.set_password(password)
        user.must_change_password = True
        user.save()
        print(f"✅ Password for {email} has been reset to: {password}")
        print(f"✅ 'must_change_password' flag set to True for {email}")
    except CustomUser.DoesNotExist:
        print(f"❌ User with email {email} not found.")

if __name__ == "__main__":
    reset_specific_password()
