from django.core.management.base import BaseCommand
from users.models import CustomUser
from academic.models import Institution
from instauth.models import InstitutionAdmin

class Command(BaseCommand):
    def handle(self, *args, **kwargs):
        # 1. Create user
        user, created = CustomUser.objects.get_or_create(
            email="instadmin@example.com",
            defaults={
                "username": "instadmin1",
            }
        )

        if created:
            user.set_password("password123")
            user.save()

        # 2. Pick Institution
        inst = Institution.objects.first()

        # 3. Link Institution to admin safely
        inst_admin, created = InstitutionAdmin.objects.get_or_create(
            institution=inst,
            defaults={"user": user}
        )

        # 4. If admin existed but user is incorrect, fix it
        if inst_admin.user != user:
            inst_admin.user = user
            inst_admin.save()

        print("Institution admin linked successfully!")
