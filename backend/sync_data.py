import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import CustomUser
from academic.models import Institution
from instauth.models import InstitutionAdmin

def link_all_institutions():
    print("🚀 Starting Data Synchronization...")
    
    # Mapping of user email to Institution ID based on my previous analysis
    link_map = {
        'admin@mtre.ac.zw': 1,
        'admin@hre.ac.zw': 2,
        'kushina@poly.ac.zw': 5,
        'joshua@plo.ac.zw': 6,
        'bulawayo@poly.ac.zw': 7,
        'masvingo@poly.ac.zw': 8,
        'madziwa@teachers.ac.zw': 9,
        'morgan@teachers.ac.zw': 10,
        'marymount@teachers.ac.zw': 11,
        'mutare@poly.ac.zw': 12,
        'mkoba@poly.ac.zw': 13,
        'nyadire@poly.ac.zw': 14,
        'morgenster@poly.ac.zw': 16,
        'seke@poly.ac.zw': 17,
        'danhiko@poly.ac.zw': 18,
        'admin@msasa.ac.zw': 20,
        'raymondzenda14@gmail.com': 21,
    }

    for email, inst_id in link_map.items():
        try:
            user = CustomUser.objects.get(email=email)
            inst = Institution.objects.get(id=inst_id)
            
            # 1. Link User to Institution
            user.institution = inst
            user.save()
            
            # 2. Sync Official Email to Institution
            inst.email = email
            inst.save()
            
            # 3. Ensure InstitutionAdmin link exists for proper portal access
            InstitutionAdmin.objects.get_or_create(
                user=user,
                institution=inst
            )
            
            print(f"✅ Linked: {email} -> {inst.name}")
            
        except CustomUser.DoesNotExist:
            print(f"⚠️ User not found: {email}")
        except Institution.DoesNotExist:
            print(f"⚠️ Institution ID not found: {inst_id}")
        except Exception as e:
            print(f"❌ Error linking {email}: {str(e)}")

    print("\n✨ Data Synchronization Complete!")

if __name__ == "__main__":
    link_all_institutions()
