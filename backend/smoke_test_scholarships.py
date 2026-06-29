import os
import sys
import django
from decimal import Decimal

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from academic.models import Student, StudentScholarship

def run_smoke_test():
    print("--- Starting Scholarship CRUD Smoke Test ---")
    
    # Get a student to attach the scholarship to
    student = Student.objects.first()
    if not student:
        print("Error: No student found in the database. Cannot run test.")
        sys.exit(1)
        
    print(f"Using student: {student.full_name} ({student.student_id})")
    
    # 1. CREATE
    print("\n1. Testing Create...")
    scholarship = StudentScholarship.objects.create(
        student=student,
        provider_name="Test Scholarship Foundation",
        amount=Decimal('5000.00'),
        year_awarded=2024,
        duration="2 Years"
    )
    print(f"✅ Created scholarship: {scholarship}")
    
    # 2. READ
    print("\n2. Testing Read...")
    fetched = StudentScholarship.objects.get(id=scholarship.id)
    print(f"✅ Fetched scholarship: Provider='{fetched.provider_name}', Duration='{fetched.duration}'")
    
    # 3. UPDATE
    print("\n3. Testing Update...")
    fetched.duration = "4 Years"
    fetched.amount = Decimal('10000.00')
    fetched.save()
    
    updated = StudentScholarship.objects.get(id=scholarship.id)
    if updated.duration == "4 Years" and updated.amount == Decimal('10000.00'):
        print(f"✅ Successfully updated scholarship! New Duration='{updated.duration}', Amount='{updated.amount}'")
    else:
        print("❌ Update failed!")
        sys.exit(1)
        
    # 4. DELETE
    print("\n4. Testing Delete...")
    scholarship_id = updated.id
    updated.delete()
    
    exists = StudentScholarship.objects.filter(id=scholarship_id).exists()
    if not exists:
        print(f"✅ Successfully deleted scholarship (ID: {scholarship_id})")
    else:
        print("❌ Delete failed!")
        sys.exit(1)
        
    print("\n🎉 Scholarship CRUD Smoke Test Passed Successfully!")

if __name__ == "__main__":
    run_smoke_test()
