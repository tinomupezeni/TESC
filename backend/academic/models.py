# academic/models.py

from django.db import models
from django.conf import settings 

# --- REMOVED THE IMPORT FROM FACULTIES TO FIX CIRCULAR ERROR ---
# from faculties.models import Program  <-- DELETE THIS LINE

# --- CHOICES ---
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

FACILITY_TYPES = [
    ('Accommodation', 'Accommodation'),
    ('Laboratory', 'Laboratory'),
    ('Library', 'Library'),
    ('Sports', 'Sports Facility'),
    ('Innovation', 'Innovation Center'),
    ('Other', 'Other'),
]

FACILITY_STATUSES = [
    ('Active', 'Active'),
    ('Maintenance', 'Under Maintenance'),
    ('Inactive', 'Inactive'),
]

INNOVATION_CATEGORIES = [
    ('agritech', 'Agriculture Tech'),
    ('edtech', 'EdTech'),
    ('healthtech', 'HealthTech'),
    ('fintech', 'FinTech'),
    ('greentech', 'Green Energy'),
    ('other', 'Other'),
]

INNOVATION_STAGES = [
    ('idea', 'Idea Phase'),
    ('incubation', 'Incubation'),
    ('prototype', 'Prototyping'),
    ('market', 'Market Ready'),
]

INNOVATION_STATUSES = [
    ('pending', 'Pending Review'),
    ('approved', 'Approved'),
    ('rejected', 'Rejected'),
]


# --- MODELS ---

class Institution(models.Model):
    PROVINCES = [
        ('Harare', 'Harare'),
        ('Bulawayo', 'Bulawayo'),
        ('Midlands', 'Midlands'),
        ('Manicaland', 'Manicaland'),
        ('Masvingo', 'Masvingo'),
        ('Mashonaland East', 'Mashonaland East'),
        ('Mashonaland West', 'Mashonaland West'),
        ('Mashonaland Central', 'Mashonaland Central'),
        ('Matabeleland North', 'Matabeleland North'),
        ('Matabeleland South', 'Matabeleland South'),
    ]

    province = models.CharField(max_length=50, choices=PROVINCES, default='Harare')
   
    has_innovation_hub = models.BooleanField(default=False)
    name = models.CharField(max_length=255, unique=True)
    type = models.CharField(max_length=50, choices=INSTITUTION_TYPES)
    location = models.CharField(max_length=100, help_text="e.g., Harare Province")
    address = models.TextField(blank=True)
    capacity = models.PositiveIntegerField(default=0)
    staff = models.PositiveIntegerField(default=0, help_text="Number of staff members")
    status = models.CharField(max_length=50, choices=INSTITUTION_STATUSES, default='Active')
    established = models.PositiveIntegerField(help_text="Year of establishment, e.g., 1980")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class Facility(models.Model):
    """
    Physical infrastructure belonging to an institution.
    """
    institution = models.ForeignKey(
        Institution, 
        on_delete=models.CASCADE, 
        related_name='facilities'
    )
    name = models.CharField(max_length=100)
    
    facility_type = models.CharField(max_length=50, choices=FACILITY_TYPES, default='Other')
    building = models.CharField(max_length=100, default="Main Building", help_text="Building name or number")
    capacity = models.PositiveIntegerField(default=0)
    current_usage = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=20, choices=FACILITY_STATUSES, default='Active')
    
    description = models.TextField(blank=True)
    equipment = models.TextField(blank=True, help_text="Comma-separated list of equipment")
    
    manager = models.CharField(max_length=100, default="Pending", help_text="Name of facility manager")
    contact_number = models.CharField(max_length=50, default="N/A")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Facilities"
        unique_together = ('institution', 'name') # Prevent duplicate names in same uni

    def __str__(self):
        return f"{self.name} ({self.institution.name})"

class Student(models.Model):
    DROPOUT_REASONS = [
        ('Financial', 'Financial Hardship'),
        ('Academic', 'Academic Failure'),
        ('Medical', 'Health/Medical'),
        ('Personal', 'Personal/Family Issues'),
        ('Transfer', 'Transfer to other Institution'),
        ('Other', 'Other'),
    ]
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
    
    dropout_reason = models.CharField(
        max_length=50, 
        choices=DROPOUT_REASONS, 
        null=True, 
        blank=True,
        help_text="Reason for dropout (only if status is Dropout)"
    )

    # Academic Links
    institution = models.ForeignKey(
        Institution, 
        on_delete=models.PROTECT,
        related_name='students'
    )
    
    # --- CHANGED TO STRING REFERENCE ---
    program = models.ForeignKey(
        'faculties.Program',  # Use 'app_name.ModelName' string
        on_delete=models.PROTECT, 
        related_name='students'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    graduation_year = models.IntegerField(null=True, blank=True)
    final_grade = models.CharField(
        max_length=20, 
        choices=[('Distinction', 'Distinction'), ('Credit', 'Credit'), ('Pass', 'Pass'), ('Fail', 'Fail')],
        null=True, blank=True
    )

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    def __str__(self):
        return f"{self.full_name} ({self.student_id})"
    

class Payment(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date_paid = models.DateField()
    reference = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.student_id} - {self.amount}"
