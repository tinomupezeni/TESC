# accounts/models.py
from django.contrib.auth.models import AbstractUser
# institutions/models.py (or accounts/models.py)
from django.db import models

class Institution(models.Model):
    """
    Represents an educational institution in the TESC system.
    """

    class InstitutionType(models.TextChoices):
        # Explicitly listed categories from the TESC document
        TEACHERS_COLLEGE = "TEACHERS_COLLEGE", "Teachers College"
        INDUSTRIAL_TRAINING_COLLEGE = "INDUSTRIAL_TRAINING_COLLEGE", "Industrial Training College"
        POLYTECHNIC = "POLYTECHNIC", "Polytechnic"
        OTHER = "OTHER", "Other"

    # --- Basic Information ---
    name = models.CharField(max_length=255, unique=True, help_text="The official name of the institution.")
    institution_type = models.CharField(max_length=50, choices=InstitutionType.choices, default=InstitutionType.OTHER)
    address = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    province = models.CharField(max_length=100, blank=True)
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=20, blank=True)
    year_established = models.PositiveIntegerField(null=True, blank=True, help_text="The year the institution was established.")

    # --- Capacity and Infrastructure ---
    student_capacity = models.PositiveIntegerField(default=0, help_text="Total number of students the institution can accommodate.")
    has_backup_power = models.BooleanField(default=False)
    has_water_supply = models.BooleanField(default=False)
    expansion_land_available = models.BooleanField(default=False)

    # --- Facilities (Grouped into text fields for flexibility) ---
    facilities_details = models.TextField(
        blank=True,
        help_text="Describe the conditions of sporting facilities, classrooms, hostels, arts/culture facilities, and medical services."
    )
    infrastructure_details = models.TextField(
        blank=True,
        help_text="Describe the state of the library, workshops, labs, and canteen."
    )

    # --- Student Support Services ---
    student_support_details = models.TextField(
        blank=True,
        help_text="Detail available student support: counseling, drug section, financial aid, scholarships, loans, etc."
    )

    # --- Academic and Partnerships ---
    partnerships_details = models.TextField(
        blank=True,
        help_text="List any partnerships with other organizations or industries."
    )

    # --- Metadata ---
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        verbose_name = "Institution"
        verbose_name_plural = "Institutions"

    def __str__(self):
        return self.name

class CustomUser(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        DATA_CLERK = "DATA_CLERK", "Data Clerk"
        VIEWER = "VIEWER", "Viewer"

    role = models.CharField(max_length=50, choices=Role.choices, default=Role.VIEWER)
    institution = models.ForeignKey(Institution, on_delete=models.SET_NULL, null=True, blank=True)
    # Add any extra fields here in the future.
    # For now, we'll just use the default fields.
    # Example: age = models.PositiveIntegerField(null=True, blank=True)
    pass