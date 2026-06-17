import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from staff.models import StaffMember
from academic.models import Institution

def list_staff():
    inst = Institution.objects.filter(name__icontains='HARARE POLYTECHNIC').first()
    if not inst:
        print("Harare Polytechnic not found.")
        return

    members = StaffMember.objects.filter(institution=inst)
    print(f"--- Staff at {inst.name} (ID: {inst.id}) ---")
    
    if not members.exists():
        print("No staff records found for this institution.")
        return

    for m in members:
        try:
            fname = m.first_name
            lname = m.last_name
            role_name = m.role.name if m.role else "N/A"
            print(f"ID: {m.staff_id} | Name: {fname} {lname} | Role: {role_name}")
        except Exception as e:
            print(f"Error reading member {m.id}: {e}")

    print(f"Total Staff: {members.count()}")

if __name__ == "__main__":
    list_staff()
