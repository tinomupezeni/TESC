import os
import sys
import django
import uuid
import datetime

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from academic.models import Institution
from staff.models import Staff
from django.contrib.auth import get_user_model

User = get_user_model()

def run_smoke_test():
    print("--- Starting Staff CRUD ORM Smoke Test (Custom & Optional fields) ---")
    
    institution = Institution.objects.first()
    if not institution:
        print("Error: No institution found in the database. Cannot run test.")
        sys.exit(1)
        
    print(f"Using institution: {institution.name} (ID: {institution.id})")
    
    # 1. CREATE
    first_name = "TEST_STAFF"
    last_name = uuid.uuid4().hex[:6].upper()
    email = f"{last_name.lower()}@test.ac.zw"
    
    print(f"\n1. Testing Create with Custom Position & Qualification, no Faculty/Dept: {first_name} {last_name}...")
    staff = Staff.objects.create(
        institution=institution,
        first_name=first_name,
        last_name=last_name,
        email=email,
        phone="+263 77 123 4567",
        gender="MALE",
        employee_id=f"STF{uuid.uuid4().hex[:6]}",
        position="VISITING SCHOLAR",
        qualification="HONORARY DOCTORATE",
        specialization="AI, ROBOTICS",
        date_joined=datetime.date.today().isoformat(),
        is_active=True
    )
    print(f"✅ Created staff: {staff.full_name} with Employee ID '{staff.employee_id}'")
    print(f"   Position: {staff.position}, Qualification: {staff.qualification}")
    print(f"   Gender: {staff.gender}")
    print(f"   Faculty: {staff.faculty}, Department: {staff.department}")
    
    # 2. READ
    print("\n2. Testing Read & Parse...")
    fetched = Staff.objects.get(id=staff.id)
    
    print(f"✅ Fetched staff: {fetched.first_name} {fetched.last_name}")
    assert fetched.position == "VISITING SCHOLAR", "Position mismatch"
    assert fetched.qualification == "HONORARY DOCTORATE", "Qualification mismatch"
    assert fetched.gender == "MALE", "Gender mismatch"
    assert fetched.faculty is None, "Faculty should be None"
    assert fetched.department is None, "Department should be None"
    
    # 3. UPDATE
    print("\n3. Testing Update...")
    fetched.position = "FULL PROFESSOR"
    fetched.save()
    
    updated = Staff.objects.get(id=staff.id)
    print(f"✅ Updated position: {updated.position}")
    assert updated.position == "FULL PROFESSOR", "Update failed"
    
    # 4. DELETE
    print("\n4. Testing Delete...")
    staff_id = staff.id
    staff.delete()
    
    exists = Staff.objects.filter(id=staff_id).exists()
    if not exists:
        print("✅ Successfully deleted staff member")
    else:
        print("❌ Delete failed")
        
    print("\n--- Smoke Test Completed Successfully ---")

if __name__ == "__main__":
    run_smoke_test()
