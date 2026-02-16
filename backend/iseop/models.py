# app/iseop/models.py
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
    activity_level = models.CharField(max_length=100, blank=True, null=True)  # UI: Duration
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "ISEOP Program"
        verbose_name_plural = "ISEOP Programs"

    def __str__(self):
        return f"{self.name} - {self.institution.name}"

class IseopStudent(models.Model):
    ISEOP_STATUS_CHOICES = [
        ('Active/Enrolled', 'Active/Enrolled'),
        ('Deferred', 'Deferred'),
        ('Completed', 'Completed'),
    ]
    DISABILITY_TYPES = [
    ('None', 'None'),

    # Physical / Mobility
    ('Physical', 'Physical / Mobility Impairment'),
    ('Amputation', 'Amputation'),
    ('Paralysis', 'Paralysis'),
    ('CerebralPalsy', 'Cerebral Palsy'),
    ('SpinalCord', 'Spinal Cord Injury'),

    # Sensory
    ('Visual', 'Visual Impairment'),
    ('Hearing', 'Hearing Impairment'),
    ('Speech', 'Speech Impairment'),
    ('DeafBlind', 'Deaf-Blindness'),

    # Neurological / Cognitive
    ('Intellectual', 'Intellectual Disability'),
    ('Learning', 'Learning Disability'),
    ('Autism', 'Autism Spectrum Disorder'),
    ('ADHD', 'Attention Deficit Hyperactivity Disorder'),
    ('Epilepsy', 'Epilepsy'),

    # Mental / Psychosocial
    ('MentalHealth', 'Mental / Psychosocial Disability'),

    # Genetic / Chronic
    ('Albino', 'Albinism'),
    ('DownSyndrome', 'Down Syndrome'),
    ('SickleCell', 'Sickle Cell Disease'),
    ('ChronicIllness', 'Chronic Illness'),

    # Multiple / Other
    ('Multiple', 'Multiple Disabilities'),
    ('Other', 'Other (Specify)'),
]

    disability_type = models.CharField(max_length=50, choices=DISABILITY_TYPES, default='None')
    disability_other = models.CharField(max_length=255, blank=True, null=True)
    institution = models.ForeignKey(Institution, on_delete=models.CASCADE, related_name='iseop_students')
    program = models.ForeignKey(IseopProgram, on_delete=models.SET_NULL, null=True, blank=True, related_name='students')
    gender = models.CharField(max_length=20, blank=True, null=True)
    enrollment_year = models.PositiveIntegerField(null=True, blank=True)

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    student_id = models.CharField(max_length=50, unique=True)
    email = models.EmailField(blank=True, null=True)
    status = models.CharField(max_length=100, choices=ISEOP_STATUS_CHOICES, default='Active/Enrolled')

    # ✅ National ID
    national_id = models.CharField(max_length=20, unique=True, null=False, blank=False)


    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.student_id})"
