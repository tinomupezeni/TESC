# accounts/models.py
from django.contrib.auth.models import AbstractUser
# institutions/models.py (or accounts/models.py)
from django.db import models

class CustomUser(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        DATA_CLERK = "DATA_CLERK", "Data Clerk"
        VIEWER = "VIEWER", "Viewer"

    role = models.CharField(max_length=50, choices=Role.choices, default=Role.VIEWER)
    institution = models.ForeignKey(
        'academic.Institution', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True
    )

    pass