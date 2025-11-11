from django.db import models
from django.contrib.auth.models import AbstractUser

class Role(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


class Department(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True, blank=True, related_name='users')
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='users')

    LEVEL_CHOICES = [
        ('1', 'Level 1 - Full Access'),
        ('2', 'Level 2 - No Editing'),
        ('3', 'Level 3 - Department Access'),
        ('4', 'Level 4 - Staff Only'),
    ]
    level = models.CharField(max_length=1, choices=LEVEL_CHOICES, default='4')

    REQUIRED_FIELDS = ['email']

    def __str__(self):
        return self.username
