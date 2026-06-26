import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from academic.models import Student

def search_student():
    students = Student.objects.all()
    print(f"Searching {students.count()} students for 'Nyasha' or 'Mukanga'...")
    for s in students:
        try:
            fname = s.first_name.lower()
            lname = s.last_name.lower()
            if 'nyasha' in fname or 'mukanga' in lname:
                print(f"Found: {s.first_name} {s.last_name} (ID: {s.id})")
        except:
            pass

if __name__ == "__main__":
    search_student()
