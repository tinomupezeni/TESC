# academic/management/commands/seed_inst.py

import logging
from django.core.management.base import BaseCommand
from django.db import transaction
from academic.models import Institution, Facility

logger = logging.getLogger(__name__)

INSTITUTIONS_DATA = [
    {
        "institution": {
            "name": "Harare Polytechnic",
            "type": "Polytechnic",
            "location": "Harare Province",
            "address": "Willowvale Road, Harare",
            "capacity": 4000,
            "staff": 145,
            "status": "Active",
            "established": 1963,
        },
        "facilities": ["Library", "Workshops", "Hostels", "Sports Complex", "IT Hub"],
    },
    {
        "institution": {
            "name": "Mkoba Teachers College",
            "type": "Teachers College",
            "location": "Midlands Province",
            "address": "Mkoba, Gweru",
            "capacity": 2200,
            "staff": 89,
            "status": "Active",
            "established": 1978,
        },
        "facilities": ["Library", "Teaching Practice Schools", "Hostels"],
    },
    {
        "institution": {
            "name": "Bulawayo Industrial Training Centre",
            "type": "Industrial Training",
            "location": "Bulawayo Province",
            "address": "Kelvin Industrial Area",
            "capacity": 1200,
            "staff": 67,
            "status": "Active",
            "established": 1985,
        },
        "facilities": ["Workshops", "Equipment Labs", "Canteen"],
    },
    {
        "institution": {
            "name": "Mutare Polytechnic",
            "type": "Polytechnic",
            "location": "Manicaland Province",
            "address": "Dangamvura, Mutare",
            "capacity": 2800,
            "staff": 112,
            "status": "Renovation",
            "established": 1971,
        },
        "facilities": ["Library", "Labs", "Farm", "Hostels", "Innovation Hub"],
    },
]


class Command(BaseCommand):
    help = 'Seeds the database with initial institutions and facilities.'

    @transaction.atomic
    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.NOTICE('Starting database seeding...'))

        # --- Create Institutions and Facilities ---
        self.stdout.write('Creating institutions and facilities...')
        for data in INSTITUTIONS_DATA:
            institution_data = data["institution"]
            
            institution, created = Institution.objects.get_or_create(
                name=institution_data["name"],
                defaults=institution_data
            )

            if created:
                self.stdout.write(f'  Created institution: {institution.name}')
            else:
                self.stdout.write(f'  Institution {institution.name} already exists. Skipping creation.')

            # --- Create Facilities tied to this institution ---
            for facility_name in data["facilities"]:
                facility, f_created = Facility.objects.get_or_create(
                    institution=institution,
                    name=facility_name,
                    defaults={"facility_type": "Other"}
                )
                if f_created:
                    self.stdout.write(f'    Created facility: {facility_name}')

        self.stdout.write(self.style.SUCCESS('Successfully seeded the database.'))
