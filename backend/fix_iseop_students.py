import os
import django
import random
import string

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from iseop.models import IseopStudent

GENDERS = ["Male", "Female", "Other"]

def generate_national_id():
    return "63" + "".join(random.choices(string.digits, k=8))

updated = 0

for student in IseopStudent.objects.all():
    changed = False

    if not student.national_id:
        new_id = generate_national_id()
        while IseopStudent.objects.filter(national_id=new_id).exists():
            new_id = generate_national_id()
        student.national_id = new_id
        changed = True

    if not student.gender:
        student.gender = random.choice(GENDERS)
        changed = True

    if changed:
        student.save()
        updated += 1

print(f"✅ Fixed {updated} student records")
