from django.db import models
from academic.models import Institution


class IseopProgram(models.Model):
    """
    ISEOP Programs - Community outreach training programs.
    Examples: Garment Sewing, Poultry Rearing, Carpentry, etc.
    """
    STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Full', 'Full'),
        ('Closed', 'Closed'),
    ]

    DURATION_CHOICES = [
        ('1 Month', '1 Month'),
        ('3 Months', '3 Months'),
        ('6 Months', '6 Months'),
        ('1 Year', '1 Year'),
    ]

    institution = models.ForeignKey(Institution, on_delete=models.CASCADE, related_name='iseop_programs')
    name = models.CharField(max_length=255)
    capacity = models.PositiveIntegerField(default=0)
    occupied = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active')
    duration = models.CharField(max_length=50, choices=DURATION_CHOICES, default='3 Months')
    activity_level = models.CharField(max_length=100, blank=True, null=True)
    description = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "ISEOP Program"
        verbose_name_plural = "ISEOP Programs"

    def __str__(self):
        return f"{self.name} - {self.institution.name}"


class IseopStudent(models.Model):
    """
    ISEOP Students - Community members enrolled in ISEOP programs.
    These are NOT formal institutional students - they are community beneficiaries
    learning vocational skills through the institution's outreach programs.
    """
    GENDER_CHOICES = [
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Other', 'Other'),
    ]

    STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Completed', 'Completed'),
        ('Dropped', 'Dropped'),
        ('Deferred', 'Deferred'),
    ]

    institution = models.ForeignKey(Institution, on_delete=models.CASCADE, related_name='iseop_students')
    program = models.ForeignKey(IseopProgram, on_delete=models.CASCADE, related_name='students')

    # Personal Information
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    national_id = models.CharField(max_length=50, blank=True, null=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    date_of_birth = models.DateField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)

    # Enrollment Information
    enrollment_date = models.DateField(auto_now_add=True)
    expected_completion = models.DateField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active')

    # Work-for-Fees specific fields (if applicable)
    is_work_for_fees = models.BooleanField(default=False)
    work_area = models.CharField(max_length=50, blank=True, null=True)
    hours_pledged = models.PositiveIntegerField(default=0)
    hours_completed = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "ISEOP Student"
        verbose_name_plural = "ISEOP Students"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.program.name}"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"