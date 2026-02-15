from django.db import models
from academic.models import Institution

class IseopProgram(models.Model):
    STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Full', 'Full'),
        ('Closed', 'Closed'),
    ]

    institution = models.ForeignKey(Institution, on_delete=models.CASCADE, related_name='iseop_programs')
    name = models.CharField(max_length=255)
    capacity = models.PositiveIntegerField(default=0)
    occupied = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active')
    activity_level = models.CharField(max_length=100, blank=True, null=True) # UI: Duration
    description = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "ISEOP Program"
        verbose_name_plural = "ISEOP Programs"

    def __str__(self):
        return f"{self.name} - {self.institution.name}"

# --- NEW MODEL: IseopStudent ---
class IseopStudent(models.Model):
    ISEOP_STATUS_CHOICES = [
        ('Active/Enrolled', 'Active/Enrolled'),
        ('Deferred', 'Deferred'),
        ('Completed', 'Completed'),
    ]
    # Linked to Institution, but not to the Django User model
    institution = models.ForeignKey(Institution, on_delete=models.CASCADE, related_name='iseop_students')
    
    #program_name = models.ForeignKey(IseopProgram,on_delete=models.PROTECT,related_name='iseop_students')
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    student_id = models.CharField(max_length=50, unique=True)
    
    # Add other necessary fields (email, phone, etc.)
    email = models.EmailField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=ISEOP_STATUS_CHOICES, default='Active/Enrolled')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.student_id})"