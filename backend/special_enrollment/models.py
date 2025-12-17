from django.db import models

# Create your models here.
class SpecialStudent(models.Model):
    CATEGORY_CHOICES = [
        ('Physically Disabled', 'Physically Disabled'),
        ('Albino Students', 'Albino Students'),
        ('Hearing Impaired', 'Hearing Impaired'),
        ('Visually Impaired', 'Visually Impaired'),
    ]
    name = models.CharField(max_length=100, choices=CATEGORY_CHOICES, unique=True)
    count = models.IntegerField(default=0)
    color_variable = models.CharField(max_length=50, default='hsl(var(--primary))')

    def __clstr__(self):
        return self.name

class WorkForFeesTask(models.Model):
    name = models.CharField(max_length=100) # e.g., Library Assistant
    students_count = models.IntegerField(default=0)
    total_hours = models.IntegerField(default=0)

    def __str__(self):
        return self.name
    
    # Add this to your existing models.py
class ProgramMetric(models.Model):
    name = models.CharField(max_length=100, unique=True) # e.g., "ISEOP Total"
    value = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.name}: {self.value}"