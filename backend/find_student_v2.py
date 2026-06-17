import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from academic.models import Student

def search_student():
    import datetime
    print(f"--- RUN AT {datetime.datetime.now()} ---")
    
    # Try direct ID lookup from backup
    try:
        s = Student.objects.get(id=4319)
        print(f"✅ FOUND BY ID 4319: {s.first_name} {s.last_name}")
    except Student.DoesNotExist:
        print("❌ ID 4319 not found.")
    
    # Try searching all
    students = Student.objects.all()
    print(f"Searching {students.count()} students...")
    found_count = 0
    for s in students:
        try:
            fname = s.first_name.lower()
            lname = s.last_name.lower()
            if 'anenyasha' in fname:
                print(f"Partial Match: {s.first_name} {s.last_name} (ID: {s.id})")
                if 'mukanga' in lname:
                    print(f"✅ FULL MATCH FOUND: {s.first_name} {s.last_name}")
                    found_count += 1
        except:
            pass
    
    if found_count == 0:
        print("❌ No full match found for Anenyasha Mukanga.")

if __name__ == "__main__":
    search_student()
