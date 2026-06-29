import os
import sys
import django
import uuid

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from academic.models import Facility, Institution

def run_smoke_test():
    print("--- Starting Facilities CRUD ORM Smoke Test (Equipment & Uppercase Focus) ---")
    
    institution = Institution.objects.first()
    if not institution:
        print("Error: No institution found in the database. Cannot run test.")
        sys.exit(1)
        
    print(f"Using institution: {institution.name} (ID: {institution.id})")
    
    # 1. CREATE
    facility_name = f"ADVANCED DRONE TEST CENTER {uuid.uuid4().hex[:6]}".upper()
    equipment_str = "PROJECTOR, DRONES, WHITEBOARD" # Simulating the .join(", ") from frontend
    
    print(f"\n1. Testing Create with Custom Category & Equipment: {facility_name}...")
    facility = Facility.objects.create(
        institution=institution,
        name=facility_name,
        facility_type="AEROSPACE FACILITY", 
        building="ENGINEERING BLOCK C",
        capacity=50,
        current_usage=10,
        status="Active",
        equipment=equipment_str
    )
    print(f"✅ Created facility: {facility.name} with type '{facility.facility_type}'")
    print(f"   Equipment stored as: {facility.equipment}")
    
    # 2. READ
    print("\n2. Testing Read & Parse...")
    fetched = Facility.objects.get(id=facility.id)
    
    # Simulate frontend parsing: facility.equipment.split(',').map(e => e.trim())
    parsed_equipment = [e.strip() for e in fetched.equipment.split(',') if e.strip()]
    print(f"✅ Fetched facility equipment: {fetched.equipment}")
    print(f"   Frontend would parse this as: {parsed_equipment}")
    
    if len(parsed_equipment) != 3 or parsed_equipment[1] != "DRONES":
        print("❌ Read failed: Equipment parsing mismatch")
        sys.exit(1)
        
    # 3. UPDATE
    print("\n3. Testing Update with new Equipment...")
    # Simulating user adding a new equipment tag
    parsed_equipment.append("3D PRINTER")
    new_equipment_str = ", ".join(parsed_equipment)
    
    fetched.facility_type = "AEROSPACE & ROBOTICS CENTER"
    fetched.equipment = new_equipment_str
    fetched.capacity = 75
    fetched.save()
    
    updated = Facility.objects.get(id=facility.id)
    if updated.facility_type == "AEROSPACE & ROBOTICS CENTER" and "3D PRINTER" in updated.equipment:
        print(f"✅ Successfully updated facility!")
        print(f"   New Equipment string: {updated.equipment}")
    else:
        print("❌ Update failed!")
        sys.exit(1)
        
    # 4. DELETE
    print("\n4. Testing Delete...")
    facility_id = facility.id
    updated.delete()
    
    if not Facility.objects.filter(id=facility_id).exists():
        print("✅ Successfully deleted facility!")
    else:
        print("❌ Delete failed: facility still exists.")
        sys.exit(1)
        
    print("\n🎉 Facilities ORM CRUD Smoke Test (Equipment Layout) Passed Successfully!")

if __name__ == "__main__":
    run_smoke_test()
