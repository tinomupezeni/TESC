# reports/models.py - USE THIS EXACT VERSION
from django.db import models
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()

class ReportTemplate(models.Model):
    CATEGORY_CHOICES = [
        ('enrollment', 'Enrollment'),
        ('academic', 'Academic Performance'),
        ('staff', 'Staff Analytics'),
        ('financial', 'Financial Overview'),
    ]
    
    FORMAT_CHOICES = [
        ('pdf', 'PDF'),
        ('excel', 'Excel'),
        ('csv', 'CSV'),
    ]
    
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    default_format = models.CharField(max_length=10, choices=FORMAT_CHOICES, default='pdf')
    is_active = models.BooleanField(default=True)
    
    # Remove auto_now_add for now to avoid migration issues
    created_at = models.DateTimeField(auto_now_add=False, null=True, blank=True)
    
    class Meta:
        db_table = 'reports_reporttemplate'
    
    def save(self, *args, **kwargs):
        if not self.created_at:
            from django.utils import timezone
            self.created_at = timezone.now()
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.name


class GeneratedReport(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('generating', 'Generating'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255, default='Untitled Report')
    
    template = models.ForeignKey(
        ReportTemplate, 
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    
    generated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    
    format = models.CharField(max_length=10, choices=ReportTemplate.FORMAT_CHOICES, default='pdf')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # NEW: add this field
    file = models.FileField(upload_to='reports/', null=True, blank=True)

    requested_at = models.DateTimeField(auto_now_add=False, null=True, blank=True)
    
    class Meta:
        db_table = 'reports_generatedreport'
    
    def save(self, *args, **kwargs):
        if not self.requested_at:
            from django.utils import timezone
            self.requested_at = timezone.now()
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.title
