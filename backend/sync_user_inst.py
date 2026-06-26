import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import CustomUser
from instauth.models import InstitutionAdmin

def sync_users():
    count = 0
    for admin in InstitutionAdmin.objects.all():
        u = admin.user
        if not u.institution:
            u.institution = admin.institution
            u.save()
            count += 1
            print(f"Synced user: {u.email} to {u.institution.name}")
    print(f"Finished. Synced {count} users.")

if __name__ == "__main__":
    sync_users()
