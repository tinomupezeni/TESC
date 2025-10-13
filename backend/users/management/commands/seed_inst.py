# institutions/management/commands/seed_institutions.py

from django.core.management.base import BaseCommand
from django.db import transaction
from users.models import Institution # Or from accounts.models import Institution

class Command(BaseCommand):
    help = 'Seeds the database with a list of real Zimbabwean tertiary institutions.'

    @transaction.atomic
    def handle(self, *args, **kwargs):
        # --- Clean Up First ---
        self.stdout.write(self.style.WARNING('Deleting all existing institutions...'))
        Institution.objects.all().delete()
        self.stdout.write(self.style.SUCCESS('All institutions have been deleted.'))

        # --- Define Real Institution Data ---
        institutions_data = [
            # Teachers Colleges
            ('Belvedere Technical Teachers College', Institution.InstitutionType.TEACHERS_COLLEGE),
            ('Bondolfi Teachers College', Institution.InstitutionType.TEACHERS_COLLEGE),
            ('Hillside Teachers College', Institution.InstitutionType.TEACHERS_COLLEGE),
            ('Joshua Mqabuko Nkomo Polytechnic', Institution.InstitutionType.TEACHERS_COLLEGE), # Also a Poly
            ('Madziwa Teachers College', Institution.InstitutionType.TEACHERS_COLLEGE),
            ('Marymount Teachers College', Institution.InstitutionType.TEACHERS_COLLEGE),
            ('Masvingo Teachers College', Institution.InstitutionType.TEACHERS_COLLEGE),
            ('Mkoba Teachers College', Institution.InstitutionType.TEACHERS_COLLEGE),
            ('Morgan Zintec College', Institution.InstitutionType.TEACHERS_COLLEGE),
            ('Mutare Teachers College', Institution.InstitutionType.TEACHERS_COLLEGE),
            ('Nyadire Teachers College', Institution.InstitutionType.TEACHERS_COLLEGE),
            ('Seke Teachers College', Institution.InstitutionType.TEACHERS_COLLEGE),
            ('United College of Education', Institution.InstitutionType.TEACHERS_COLLEGE),

            # Polytechnics
            ('Bulawayo Polytechnic', Institution.InstitutionType.POLYTECHNIC),
            ('Gweru Polytechnic', Institution.InstitutionType.POLYTECHNIC),
            ('Harare Polytechnic', Institution.InstitutionType.POLYTECHNIC),
            ('Kwekwe Polytechnic', Institution.InstitutionType.POLYTECHNIC),
            ('Masvingo Polytechnic', Institution.InstitutionType.POLYTECHNIC),
            ('Mutare Polytechnic', Institution.InstitutionType.POLYTECHNIC),
            ('Kushinga Phikelela Polytechnic', Institution.InstitutionType.POLYTECHNIC),

            # Industrial Training Colleges
            ('Msasa Industrial Training College', Institution.InstitutionType.INDUSTRIAL_TRAINING_COLLEGE),
            ('Westgate Industrial Training College', Institution.InstitutionType.INDUSTRIAL_TRAINING_COLLEGE),
            ('St. Peters Kubatana Vocational Training Centre', Institution.InstitutionType.INDUSTRIAL_TRAINING_COLLEGE),
        ]

        self.stdout.write("Creating new institutions from the predefined list...")
        
        created_count = 0
        for name, institution_type in institutions_data:
            # get_or_create prevents duplicates if the script is run without deleting
            institution, created = Institution.objects.get_or_create(
                name=name,
                defaults={'institution_type': institution_type}
            )
            if created:
                created_count += 1
                self.stdout.write(f'  -> Created: {institution.name}')

        self.stdout.write(self.style.SUCCESS(f'\nSuccessfully seeded {created_count} new institutions.'))