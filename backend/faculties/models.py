# faculties/models.py

from django.db import models
# --- REMOVED THE IMPORT FROM ACADEMIC TO FIX CIRCULAR ERROR ---
# from academic.models import Institution <-- DELETE THIS LINE

# --- CHOICES ---
FACULTY_STATUSES = [
    ('Active', 'Active'),
    ('Setup', 'In Setup'),
    ('Review', 'Under Review'),
    ('Archived', 'Archived'),
]

PROGRAM_LEVELS = [
    ('Certificate', 'Certificate'),
    ('Diploma', 'Diploma'),
    ('Bachelors', 'Bachelors'),
    ('Masters', 'Masters'),
    ('PhD', 'PhD'),
    ('Other', 'Other'),
]

class Faculty(models.Model):
    # --- CHANGED TO STRING REFERENCE ---
    institution = models.ForeignKey(
        'academic.Institution', # Use 'app_name.ModelName' string
        on_delete=models.CASCADE, 
        related_name='faculties'
    )
    name = models.CharField(max_length=255)
    dean = models.CharField(max_length=100, blank=True)
    location = models.CharField(max_length=100, blank=True)
    email = models.EmailField(blank=True)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=FACULTY_STATUSES, default='Active')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Faculties"
        ordering = ['name']

    def __str__(self):
        # Note: We cannot access self.institution.name easily in __str__ 
        # if using lazy loading during migrations sometimes, but usually it works fine.
        # If it errors, just return self.name
        return f"{self.name}" 


class Program(models.Model):
    faculty = models.ForeignKey(Faculty, on_delete=models.CASCADE, related_name='programs')
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, help_text="e.g., BSCS")
    duration = models.PositiveIntegerField(help_text="Duration in years")
    level = models.CharField(max_length=50, choices=PROGRAM_LEVELS)
    description = models.TextField(blank=True)
    coordinator = models.CharField(max_length=100, blank=True, help_text="Program Coordinator Name")
    student_capacity = models.PositiveIntegerField(default=0)
    
    modules = models.TextField(blank=True, help_text="Comma-separated list of core modules")
    entry_requirements = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        unique_together = ('faculty', 'code')

    def __str__(self):
        return f"{self.name} ({self.code})"