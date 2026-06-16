import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import CustomUser

def reset_all_passwords():
    print("🚀 Starting Batch Password Reset...")
    
    users = CustomUser.objects.all()
    count_inst = 0
    count_main = 0

    for user in users:
        # Determine default password
        if user.institution_id:
            password = "scalareye@123"
            count_inst += 1
        else:
            password = "tesc@123"
            count_main += 1
        
        # Reset password and enforce change
        user.set_password(password)
        user.must_change_password = True
        user.save()
        
        # print(f"✅ Reset: {user.email} (Type: {'Inst' if user.institution_id else 'Main'})")

    print(f"\n✨ Password Reset Complete!")
    print(f"📊 Summary:")
    print(f"   - Institutional Users Reset: {count_inst} (Password: scalareye@123)")
    print(f"   - Main System Users Reset: {count_main} (Password: tesc@123)")
    print(f"   - Total Users: {count_inst + count_main}")
    print("   - All users will be prompted to change their password on first login.")

if __name__ == "__main__":
    reset_all_passwords()
