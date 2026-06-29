from django.db import models
from django.contrib.auth.models import AbstractUser
from academic.models import Institution
class Role(models.Model):
    institution = models.ForeignKey(
        Institution, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='roles'
    )
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('institution', 'name')

    def __str__(self):
        return f"{self.name} ({self.institution.name if self.institution else 'Global'})"


class Department(models.Model):
    institution = models.ForeignKey(
        Institution, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='departments_users' # Avoiding name conflict with faculties.Department
    )
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    permissions = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('institution', 'name')

    def __str__(self):
        return f"{self.name} ({self.institution.name if self.institution else 'Global'})"


class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True, blank=True, related_name='users')
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='users')
    session_version = models.IntegerField(default=1)
    last_activity = models.DateTimeField(null=True, blank=True)

    # --- MFA (Email OTP) ---
    otp_code = models.CharField(max_length=6, null=True, blank=True)
    otp_created_at = models.DateTimeField(null=True, blank=True)

    LEVEL_CHOICES = [
        ('1', 'Level 1 - Full Access'),
        ('2', 'Level 2 - No Editing'),
        ('3', 'Level 3 - Department Access'),
        ('4', 'Level 4 - Staff Only'),
    ]
    level = models.CharField(max_length=1, choices=LEVEL_CHOICES, default='4')
    must_change_password = models.BooleanField(default=True)
    
    # Add this line
    institution = models.ForeignKey(
        Institution, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name="users"
    )
    # 1. This is the login field
    USERNAME_FIELD = 'email' 
    REQUIRED_FIELDS = ['username'] 
    
    def __str__(self):
        # A good representation uses the full name if available
        return f"{self.first_name} {self.last_name} ({self.username})" if self.first_name and self.last_name else self.username

class AuditTrail(models.Model):
    institution = models.ForeignKey(
        Institution, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='audit_trails'
    )
    user = models.ForeignKey(
        CustomUser, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='audit_trails'
    )
    action = models.CharField(max_length=255)
    module = models.CharField(max_length=100)
    details = models.TextField(blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user} - {self.action} on {self.created_at}"
