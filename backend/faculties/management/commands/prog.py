from django.core.management.base import BaseCommand
from ...models import Program, PROGRAM_CATEGORIES

class Command(BaseCommand):
    help = 'Assigns categories to existing programs in the database'

    def handle(self, *args, **options):
        programs = Program.objects.filter(category__in=['', None])
        
        if not programs.exists():
            self.stdout.write(self.style.SUCCESS('All programs already have categories!'))
            return

        self.stdout.write(f"Found {programs.count()} programs without a category.\n")

        # Create a mapping for easy display
        category_map = {str(i+1): cat[0] for i, cat in enumerate(PROGRAM_CATEGORIES)}
        
        for program in programs:
            self.stdout.write(self.style.WARNING(f"\nProgram: {program.name} ({program.code})"))
            self.stdout.write(f"Department: {program.department.name}")
            
            # Display Options
            for i, cat in enumerate(PROGRAM_CATEGORIES):
                self.stdout.write(f"{i+1}) {cat[1]}")
            
            choice = input(f"\nSelect a category number for '{program.name}' (or 's' to skip): ").strip()

            if choice.lower() == 's':
                continue
            
            if choice in category_map:
                selected_value = category_map[choice]
                program.category = selected_value
                program.save()
                self.stdout.write(self.style.SUCCESS(f"Successfully assigned {selected_value}"))
            else:
                self.stdout.write(self.style.ERROR("Invalid selection. Skipping..."))

        self.stdout.write(self.style.SUCCESS('\nTask complete!'))