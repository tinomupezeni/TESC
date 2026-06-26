from django.db import models

# --- CHOICES ---
FACULTY_STATUSES = [
    ('Active', 'Active'),
    ('Setup', 'In Setup'),
    ('Review', 'Under Review'),
    ('Archived', 'Archived'),
]

PROGRAM_LEVELS = [
    ('Class 4', 'Class 4'),
    ('Class 3', 'Class 3'),
    ('Class 2', 'Class 2'),
    ('Class 1', 'Class 1'),
    ('National Certificate', 'National Certificate'),
    ('National Foundation Certificate', 'National Foundation Certificate'),
    ('Certificate', 'Certificate'),
    ('Diploma', 'Diploma'),
    ('Bachelors', 'Bachelors'),
    ('Masters', 'Masters'),
    ('PhD', 'PhD'),
    ('Other', 'Other'),
]

# --- FIX: Structured as (actual_value, human_readable_name) ---
PROGRAM_CATEGORIES = [
  ("STEM", "STEM (Science, Tech, Engineering, Math)"),
  ("HEALTH", "Health Sciences & Medicine"),
  ("BUSINESS", "Business & Management"),
  ("SOCIAL", "Social Sciences"),
  ("HUMANITIES", "Humanities & Arts"),
  ("EDUCATION", "Education & Teaching"),
  ("LAW", "Law & Legal Studies"),
  ("VOCATIONAL", "Vocational & Technical Training"),
  ("INTERDISCIPLINARY", "Interdisciplinary Studies"),
]

class Faculty(models.Model):
    institution = models.ForeignKey(
        'academic.Institution', 
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
        return f"{self.name}" 

class Department(models.Model):
    """
    Represents a specific department within a Faculty.
    e.g., Faculty of Engineering -> Department of Computer Science
    """
    faculty = models.ForeignKey(
        Faculty, 
        on_delete=models.CASCADE, 
        related_name='departments'
    )
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, blank=True, help_text="e.g. CS")
    head_of_department = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.faculty.name})"


PROGRAM_TYPES = [
    ('Degree', 'Degree'),
    ('Diploma', 'Diploma'),
    ('Certificate', 'Certificate'),
    ('Short Course', 'Short Course'),
    ('Other', 'Other'),
]

class Program(models.Model):
    # Changed from Faculty to Department (relaxed to optional)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='programs')
    institution = models.ForeignKey('academic.Institution', on_delete=models.CASCADE, null=True, blank=True, related_name='programs')
    
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, help_text="e.g., BSCS")
    duration = models.DecimalField(max_digits=6, decimal_places=3, default=0.000, help_text="Duration in years")
    duration_years = models.PositiveIntegerField(default=0)
    duration_months = models.PositiveIntegerField(default=0)
    duration_weeks = models.PositiveIntegerField(default=0)
    duration_days = models.PositiveIntegerField(default=0)
    
    # --- Refactored to support multiple selections ---
    levels = models.JSONField(default=list, help_text="List of levels applicable to this program (e.g. ['Class 4', 'Class 3'])")
    categories = models.JSONField(default=list, help_text="List of categories (e.g. ['STEM', 'VOCATIONAL'])")
    
    # Keep old fields for a moment to prevent immediate crash if any logic relies on them, 
    # but marked as deprecated/optional. We'll migrate data in a separate step.
    level = models.CharField(max_length=50, choices=PROGRAM_LEVELS, null=True, blank=True)
    category = models.CharField(max_length=100, choices=PROGRAM_CATEGORIES, null=True, blank=True)
    
    # --- NEW PHASE 1 FIELDS ---
    is_critical_skill = models.BooleanField(default=False, help_text="Flags this program as a critical national skill")
    is_specialized_skill = models.BooleanField(default=False, help_text="Flags this program as a specialized skill")
    program_type = models.CharField(max_length=50, choices=PROGRAM_TYPES, default='Degree')
    
    description = models.TextField(blank=True)
    coordinator = models.CharField(max_length=100, blank=True, help_text="Program Coordinator Name")
    student_capacity = models.PositiveIntegerField(default=0)
    
    semester_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, help_text="Standard annual fee for this program")
    
    modules = models.TextField(blank=True, help_text="Comma-separated list of core modules")
    entry_requirements = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        unique_together = ('department', 'code') 

    def save(self, *args, **kwargs):
        if self.department and not self.institution:
            self.institution = self.department.faculty.institution
        if self.duration_years > 0 or self.duration_months > 0 or self.duration_weeks > 0 or self.duration_days > 0:
            from decimal import Decimal
            self.duration = Decimal(str(
                float(self.duration_years) + 
                (float(self.duration_months) / 12.0) + 
                (float(self.duration_weeks) / 52.0) + 
                (float(self.duration_days) / 365.0)
            ))
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.code})"