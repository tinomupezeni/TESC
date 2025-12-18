# reports/management/commands/seed_reports.py
from django.core.management.base import BaseCommand
from reports.models import ReportTemplate, GeneratedReport
from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
from django.utils import timezone
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Seed initial report templates and generated reports'

    def handle(self, *args, **options):
        # --- 1. Seed ReportTemplates ---
        templates_data = [
            ('Enrollment by Program', 'Student enrollment statistics by program', 'enrollment', 'pdf'),
            ('Gender Distribution', 'Gender demographics across programs', 'enrollment', 'excel'),
            ('Year-on-Year Comparison', 'Year over year enrollment comparison', 'enrollment', 'pdf'),
            ('Pass Rate Analysis', 'Academic performance and pass rates', 'academic', 'pdf'),
            ('GPA Distribution', 'Grade Point Average distribution analysis', 'academic', 'excel'),
            ('Top Performing Students', 'Analysis of top performing students', 'academic', 'pdf'),
            ('Staff-to-Student Ratio', 'Staff to student ratio analysis', 'staff', 'pdf'),
            ('Department Distribution', 'Staff distribution across departments', 'staff', 'excel'),
            ('Qualification Analysis', 'Analysis of staff qualifications', 'staff', 'pdf'),
            ('Fee Collection Status', 'Fee collection and outstanding balances', 'financial', 'pdf'),
            ('Outstanding Balances', 'Detailed outstanding fee balances', 'financial', 'excel'),
            ('Revenue by Program', 'Revenue analysis by academic program', 'financial', 'pdf'),
        ]

        templates = []
        for name, desc, category, fmt in templates_data:
            template, created = ReportTemplate.objects.get_or_create(
                name=name,
                defaults={
                    'description': desc,
                    'category': category,
                    'default_format': fmt,
                    'created_at': timezone.now(),
                }
            )
            templates.append(template)
            if created:
                self.stdout.write(self.style.SUCCESS(f'✅ Created template: {name}'))
            else:
                self.stdout.write(self.style.WARNING(f'⚠️ Template exists: {name}'))

        # --- 2. Seed a demo user ---
        user, created = User.objects.get_or_create(username='demo_user')
        if created:
            user.set_password('password')
            user.save()
            self.stdout.write(self.style.SUCCESS('✅ Created demo user "demo_user"'))

        # --- 3. Seed GeneratedReports ---
        for template in templates:
            for i in range(2):  # 2 reports per template
                report_title = f"{template.name} - {timezone.now().strftime('%Y-%m-%d %H:%M')}"
                report, created = GeneratedReport.objects.get_or_create(
                    title=report_title,
                    template=template,
                    defaults={
                        'generated_by': user,
                        'format': template.default_format,
                        'status': 'completed',
                        'requested_at': timezone.now(),
                    }
                )
                if created:
                    # Add dummy PDF file
                    report.file.save(
                        f"{template.name.replace(' ', '_')}_{i+1}.pdf",
                        ContentFile(b"%PDF-1.4\n%Dummy PDF content for testing\n")
                    )
                    report.save()
                    self.stdout.write(self.style.SUCCESS(f'✅ Created report: {report.title}'))

        self.stdout.write(self.style.SUCCESS('✅ Seeding complete!'))
