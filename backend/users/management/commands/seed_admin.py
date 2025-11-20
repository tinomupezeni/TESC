import os
import django
from django.conf import settings


from ...models import CustomUser, Role, Department

# --- Configuration ---
ADMIN_USERNAME = 'superuser_admin'
ADMIN_EMAIL = 'admin@tesc.com'
ADMIN_PASSWORD = 'admin@123'
ADMIN_FIRST_NAME = 'System'
ADMIN_LAST_NAME = 'Admin'
# ---------------------

print("--- Starting Admin User Seeding ---")

# 1. Create default Role and Department if they don't exist
# We'll assign the admin to a 'Superuser' Role and 'IT' Department
# This step is crucial if the Foreign Keys are required.

# Create 'Superuser' Role
try:
    superuser_role, created = Role.objects.get_or_create(
        name='Superuser',
        defaults={'description': 'System-wide administrator with all permissions.'}
    )
    if created:
        print(f"Created new Role: {superuser_role.name}")
except Exception as e:
    print(f"Error creating Role: {e}")
    superuser_role = None

# Create 'IT' Department
try:
    it_department, created = Department.objects.get_or_create(
        name='IT',
        defaults={'description': 'Information Technology and System Management.'}
    )
    if created:
        print(f"Created new Department: {it_department.name}")
except Exception as e:
    print(f"Error creating Department: {e}")
    it_department = None


# 2. Check and Create the Admin User
if not CustomUser.objects.filter(username=ADMIN_USERNAME).exists():
    print(f"Creating Superuser: {ADMIN_USERNAME}...")
    try:
        # Create the user instance
        admin_user = CustomUser.objects.create_user(
            username=ADMIN_USERNAME,
            email=ADMIN_EMAIL,
            password=ADMIN_PASSWORD,
            first_name=ADMIN_FIRST_NAME,
            last_name=ADMIN_LAST_NAME,
            role=superuser_role,       # Assign the Role
            department=it_department,  # Assign the Department
            level='1',                 # Assign the highest access level

            # Set essential admin flags
            is_staff=True,
            is_superuser=True,
            is_active=True,
        )

        print("✅ Superuser created successfully!")
        print(f"   Username: {ADMIN_USERNAME}")
        print(f"   Email: {ADMIN_EMAIL}")
        print(f"   Password: {ADMIN_PASSWORD} (HASHED)") # Note: The password is HASHED
        print(f"   Role: {admin_user.role.name if admin_user.role else 'N/A'}")
        print(f"   Level: {admin_user.get_level_display()}")

    except Exception as e:
        print(f"❌ Failed to create Superuser: {e}")
        print("Please check your model fields and `AUTH_USER_MODEL` setting.")
else:
    print(f"ℹ️ Superuser with username '{ADMIN_USERNAME}' already exists. Skipping creation.")

print("--- Admin User Seeding Complete ---")