from faculties.models import Faculty, Department
from django.db import transaction
from academic.models import Institution

try:
    institution = Institution.objects.get(id=90)
    faculty = Faculty.objects.get(id=237) # Faculty of Engineering
    
    with transaction.atomic():
        dept = Department.objects.create(
            faculty=faculty,
            name='Robotics',
            code='ROBO',
            head_of_department='Dr. Robot',
            description='Department for Robotics engineering.'
        )
    print(f'Successfully created Department: {dept.name} (ID: {dept.id}) for Faculty {faculty.name}.')
except Faculty.DoesNotExist:
    print('Error: Faculty with ID 237 does not exist.')
except Exception as e:
    print(f'An unexpected error occurred during creation: {e}')

try:
    # Verify existence in a new query
    created_dept = Department.objects.filter(name='Robotics', faculty=faculty).first()
    if created_dept:
        print(f'Verification: Department Robotics (ID: {created_dept.id}) found.')
    else:
        print('Verification: Department Robotics NOT found after creation.')
except Exception as e:
    print(f'An unexpected error occurred during verification: {e}')
