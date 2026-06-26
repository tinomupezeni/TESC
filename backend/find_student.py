import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from academic.models import Student

def search_student():
    students = Student.objects.all()
    import datetime
    print(f"Searching {students.count()} students at {datetime.datetime.now()}...")
    found_count = 0
    for i, s in enumerate(students):
        try:
            fname = s.first_name
            lname = s.last_name
            if i < 5:
                print(f"Debug: {fname} {lname}")
            
            if 'anenyasha' in fname.lower() and 'mukanga' in lname.lower():
                print(f"✅ FOUND: {fname} {lname}")
                print(f"   Student ID: {s.student_id}")
                print(f"   Institution: {s.institution.name}")
                found_count += 1
        except Exception as e:
            if i < 5:
                print(f"Debug Error: {e}")
            pass
    
    if found_count == 0:
        print("❌ No student matching that name was found.")

if __name__ == "__main__":
    search_student()
