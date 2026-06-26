import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import CustomUser

def reset_passwords_corrected():
    print("🚀 Starting Corrected Password Reset...")
    
    users = CustomUser.objects.all()
    count_inst = 0
    count_main = 0
    count_specific = 0

    for user in users:
        if user.email == "admin@scalareye.com":
            password = "Admin@123"
            count_specific += 1
        elif user.institution_id:
            password = "scalareye@123"
            count_inst += 1
        else:
            password = "tesc@123"
            count_main += 1
        
        user.set_password(password)
        user.must_change_password = True
        user.save()

    print(f"\n✨ Password Reset Complete!")
    print(f"📊 Summary:")
    print(f"   - Institutional Users: {count_inst} (Reset to scalareye@123)")
    print(f"   - Main System Users: {count_main} (Reset to tesc@123)")
    print(f"   - Primary Admin: {count_specific} (Reset to Admin@123)")
    print(f"   - Total Accounts: {len(users)}")
    print("\nAll users will be prompted to change their password on next login.")

if __name__ == "__main__":
    reset_passwords_corrected()
