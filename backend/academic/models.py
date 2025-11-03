# academic/models.py

from django.db import models
from django.conf import settings # To link to your custom User model

# --- CHOICES ---
# For Institution Model
INSTITUTION_TYPES = [
    ('Polytechnic', 'Polytechnic'),
    ('Teachers College', 'Teachers College'),
    ('Industrial Training', 'Industrial Training'),
    ('Other', 'Other'),
]

INSTITUTION_STATUSES = [
    ('Active', 'Active'),
    ('Renovation', 'Under Renovation'),
    ('Closed', 'Closed'),
]

# For Program Model
PROGRAM_LEVELS = [
    ('NC', 'NC'),
    ('ND', 'ND'),
    ('HND', 'HND'),
    ('1.1', 'Level 1.1'),
    ('2.1', 'Level 2.1'),
    ('3.1', 'Level 3.1'),
    ('Other', 'Other'),
]

# For Student Model
STUDENT_GENDERS = [
    ('Male', 'Male'),
    ('Female', 'Female'),
    ('Other', 'Other'),
]

STUDENT_STATUSES = [
    ('Active', 'Active'),
    ('Attachment', 'On Attachment'),
    ('Graduated', 'Graduated'),
    ('Suspended', 'Suspended'),
    ('Deferred', 'Deferred'),
]

# --- MODELS ---

class Facility(models.Model):
    """
    A facility available at an institution (e.g., Library, Workshop, Hostel)
    """
    name = models.CharField(max_length=100, unique=True)
    
    class Meta:
        verbose_name_plural = "Facilities"

    def __str__(self):
        return self.name

class Institution(models.Model):
    """
    An educational institution (Polytechnic, Teachers College, etc.)
    """
    name = models.CharField(max_length=255, unique=True)
    type = models.CharField(max_length=50, choices=INSTITUTION_TYPES)
    location = models.CharField(max_length=100, help_text="e.g., Harare Province")
    address = models.TextField(blank=True)
    capacity = models.PositiveIntegerField(default=0)
    staff = models.PositiveIntegerField(default=0, help_text="Number of staff members")
    status = models.CharField(max_length=50, choices=INSTITUTION_STATUSES, default='Active')
    established = models.PositiveIntegerField(help_text="Year of establishment, e.g., 1980")
    
    facilities = models.ManyToManyField(Facility, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Program(models.Model):
    """
    An academic program offered by an institution.
    """
    institution = models.ForeignKey(Institution, on_delete=models.CASCADE, related_name='programs')
    name = models.CharField(max_length=255, help_text="e.g., Electrical Engineering")
    level = models.CharField(max_length=20, choices=PROGRAM_LEVELS, help_text="e.g., HND")
    
    class Meta:
        # Prevent duplicate program (name + level) at the same institution
        unique_together = ('institution', 'name', 'level')

    def __str__(self):
        return f"{self.name} ({self.level}) - {self.institution.name}"

class Student(models.Model):
    """
    A student enrolled at an institution.
    """
    # This links to your universal auth app's User model
    # Use settings.AUTH_USER_MODEL to be safe
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='student_profile'
    )
    
    student_id = models.CharField(max_length=50, unique=True, help_text="Internal system ID, e.g., ST001")
    national_id = models.CharField(max_length=50, unique=True, blank=True, null=True, help_text="e.g., 63-1234567A00")
    
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    
    gender = models.CharField(max_length=10, choices=STUDENT_GENDERS)
    date_of_birth = models.DateField(null=True, blank=True)
    
    enrollment_year = models.PositiveIntegerField()
    status = models.CharField(max_length=20, choices=STUDENT_STATUSES, default='Active')

    # Academic Links
    institution = models.ForeignKey(
        Institution, 
        on_delete=models.PROTECT,  # Don't delete institution if students are linked
        related_name='students'
    )
    program = models.ForeignKey(
        Program, 
        on_delete=models.PROTECT, # Don't delete program if students are linked
        related_name='students'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    def __str__(self):
        return f"{self.full_name} ({self.student_id})"