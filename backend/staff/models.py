from django.db import models
from django.conf import settings

# --- CHOICES ---
STAFF_POSITIONS = [
    ('Professor', 'Professor'),
    ('Lecturer', 'Lecturer'),
    ('Assistant', 'Assistant Lecturer'),
    ('Admin', 'Administrative Staff'),
    ('Other', 'Other'),
]

QUALIFICATIONS = [
    ('PhD', 'PhD'),
    ('Masters', 'Masters'),
    ('Bachelors', 'Bachelors'),
    ('Diploma', 'Diploma'),
    ('Certificate', 'Certificate'),
    ('Other', 'Other'),
]

class Staff(models.Model):
    """
    Represents a staff member working at an Institution.
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='staff_profile'
    )
    
    # Relationships
    institution = models.ForeignKey(
        'academic.Institution', 
        on_delete=models.CASCADE, 
        related_name='staff_members'
    )
    # Optional: Link to a specific faculty if they are academic staff
    faculty = models.ForeignKey(
        'faculties.Faculty', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='staff_members'
    )

    # Personal Details
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=50)
    
    # Employment Details
    employee_id = models.CharField(max_length=50, unique=True)
    position = models.CharField(max_length=50, choices=STAFF_POSITIONS)
    department = models.CharField(max_length=100, help_text="Department name (e.g. Computer Science)")
    
    # Academic/Professional Details
    qualification = models.CharField(max_length=50, choices=QUALIFICATIONS)
    specialization = models.TextField(blank=True, help_text="Area of Specialization")
    
    date_joined = models.DateField()
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Staff Members"
        ordering = ['last_name', 'first_name']

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    def __str__(self):
        return f"{self.full_name} ({self.position})"