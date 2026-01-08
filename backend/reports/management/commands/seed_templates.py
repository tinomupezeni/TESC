# reports/management/commands/seed_templates.py
from django.core.management.base import BaseCommand
from django.utils import timezone

class Command(BaseCommand):
    help = 'Seed the database with report templates'
    
    def handle(self, *args, **options):
        # Import here to avoid circular imports
        from reports.models import ReportTemplate
        
        templates = [
            {
                'name': 'Enrollment Statistics Report',
                'description': 'Student enrollment trends and demographics',
                'category': 'enrollment',
                'default_format': 'pdf',
                'is_active': True,
            },
            {
                'name': 'Academic Performance Report',
                'description': 'Results analysis and performance metrics',
                'category': 'academic',
                'default_format': 'pdf',
                'is_active': True,
            },
            {
                'name': 'Staff Analytics Report',
                'description': 'Staff distribution and workload reports',
                'category': 'staff',
                'default_format': 'pdf',
                'is_active': True,
            },
            {
                'name': 'Financial Overview Report',
                'description': 'Fee collection and financial summaries',
                'category': 'financial',
                'default_format': 'pdf',
                'is_active': True,
            },
        ]
        
        created_count = 0
        for template_data in templates:
            # Check if template already exists
            if not ReportTemplate.objects.filter(name=template_data['name']).exists():
                ReportTemplate.objects.create(
                    **template_data,
                    created_at=timezone.now()
                )
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'Created template: {template_data["name"]}'))
            else:
                self.stdout.write(self.style.WARNING(f'Template already exists: {template_data["name"]}'))
        
        self.stdout.write(self.style.SUCCESS(f'Successfully created {created_count} new report templates'))