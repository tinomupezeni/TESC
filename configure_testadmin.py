from users.models import CustomUser
from academic.models import Institution

try:
    user = CustomUser.objects.get(username='testadmin')
    user.set_password('user@123') # Hash the password
    
    # Link to institution 90
    institution = Institution.objects.get(id=90)
    user.institution = institution
    user.save()
    
    print('Successfully configured testadmin: password set and linked to institution 90.')
except CustomUser.DoesNotExist:
    print('Error: User testadmin does not exist.')
except Institution.DoesNotExist:
    print('Error: Institution with ID 90 does not exist. Please ensure it is created.')
except Exception as e:
    print(f'An unexpected error occurred: {e}')
