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