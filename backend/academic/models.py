from django.db import models
from django.conf import settings
from core.fields import EncryptedTextField   # 🔐 Custom AES-256 encrypted field


# --- CHOICES ---

INSTITUTION_TYPES = [
    ('Polytechnic', 'Polytechnic'),
    ('Teachers College', 'Teachers College'),
    ('Industrial Training', 'Industrial Training'),
    ('Other', 'Other'),
]

INSTITUTION_STATUSES = [
    ('Active', 'Active'),
    ('Renovation', 'Under Renovation'),
    ('Closed', 'Closed'),
]

STUDENT_GENDERS = [
    ('Male', 'Male'),
    ('Female', 'Female'),
    ('Other', 'Other'),
]

STUDENT_STATUSES = [
    ('Active', 'Active'),
    ('Attachment', 'On Attachment'),
    ('Graduated', 'Graduated'),
    ('Suspended', 'Suspended'),
    ('Deferred', 'Deferred'),
    ('Dropout', 'Dropout'),
]

FACILITY_TYPES = [
    ('Accommodation', 'Accommodation'),
    ('Laboratory', 'Laboratory'),
    ('Library', 'Library'),
    ('Sports', 'Sports Facility'),
    ('Innovation', 'Innovation Center'),
    ('Other', 'Other'),
]

FACILITY_STATUSES = [
    ('Active', 'Active'),
    ('Maintenance', 'Under Maintenance'),
    ('Inactive', 'Inactive'),
]


# --- MODELS ---

class Institution(models.Model):
    PROVINCES = [
        ('Harare', 'Harare'),
        ('Bulawayo', 'Bulawayo'),
        ('Midlands', 'Midlands'),
        ('Manicaland', 'Manicaland'),
        ('Masvingo', 'Masvingo'),
        ('Mashonaland East', 'Mashonaland East'),
        ('Mashonaland West', 'Mashonaland West'),
        ('Mashonaland Central', 'Mashonaland Central'),
        ('Matabeleland North', 'Matabeleland North'),
        ('Matabeleland South', 'Matabeleland South'),
    ]

    province = models.CharField(max_length=50, choices=PROVINCES, default='Harare')
    has_innovation_hub = models.BooleanField(default=False)
    name = models.CharField(max_length=255, unique=True)
    type = models.CharField(max_length=50, choices=INSTITUTION_TYPES)
    location = models.CharField(max_length=100)
    address = models.TextField(blank=True)
    capacity = models.PositiveIntegerField(default=5000)
    staff = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=50, choices=INSTITUTION_STATUSES, default='Active')
    established = models.PositiveIntegerField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class Facility(models.Model):
    institution = models.ForeignKey(Institution, on_delete=models.CASCADE, related_name='facilities')
    name = models.CharField(max_length=100)
    facility_type = models.CharField(max_length=50, choices=FACILITY_TYPES, default='Other')
    building = models.CharField(max_length=100, default="Main Building")
    capacity = models.PositiveIntegerField(default=0)
    current_usage = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=20, choices=FACILITY_STATUSES, default='Active')
    description = models.TextField(blank=True)
    equipment = models.TextField(blank=True)
    manager = models.CharField(max_length=100, default="Pending")
    contact_number = models.CharField(max_length=50, default="N/A")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('institution', 'name')

    def __str__(self):
        return f"{self.name} ({self.institution.name})"


# ============================
# 🔐 ENCRYPTED STUDENT MODEL
# ============================

class Student(models.Model):

    DROPOUT_REASONS = [
        ('Financial', 'Financial Hardship'),
        ('Academic', 'Academic Failure'),
        ('Medical', 'Health/Medical'),
        ('Personal', 'Personal/Family Issues'),
        ('Transfer', 'Transfer'),
        ('Other', 'Other'),
        ('Unspecified','Unspecified'),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='student_profile'
    )

    student_id = models.CharField(max_length=50, unique=True)

    # 🔐 ENCRYPTED FIELDS
    national_id = EncryptedTextField(unique=True, null=True, blank=True)
    first_name = EncryptedTextField()
    last_name = EncryptedTextField()
    date_of_birth = EncryptedTextField(null=True, blank=True)

    gender = models.CharField(max_length=10, choices=STUDENT_GENDERS)
    enrollment_year = models.PositiveIntegerField()
    status = models.CharField(max_length=20, choices=STUDENT_STATUSES, default='Active')

    dropout_reason = models.CharField(
        max_length=50,
        choices=DROPOUT_REASONS,
        null=True,
        blank=True
    )

    institution = models.ForeignKey(Institution, on_delete=models.PROTECT, related_name='students')

    program = models.ForeignKey(
        'faculties.Program',
        on_delete=models.PROTECT,
        related_name='students'
    )

    
    is_work_for_fees = models.BooleanField(default=False)

    WORK_AREAS = [
    # Academic / Learning Support
    ('Library', 'Library Assistant'),
    ('Labs', 'Laboratory Assistant'),
    ('Tutorials', 'Tutorial / Peer Learning Support'),
    ('E_Learning', 'E-Learning Support'),
    ('Research', 'Research Assistant'),
    ('Kitchen','Kitchen'),
    # Administrative / Office
    ('Admin', 'Administrative Support'),
    ('Registry', 'Registry / Records Office'),
    ('Admissions', 'Admissions Office'),
    ('Exams', 'Examinations Office'),
    ('Finance', 'Finance / Accounts Office'),
    ('HR', 'Human Resources Support'),

    # Technical / ICT
    ('ICT', 'ICT / IT Support'),
    ('Systems', 'Systems Administration Support'),
    ('Data', 'Data Entry / Data Support'),
    ('Media', 'Media & Communications Support'),

    # Facilities / Operations
    ('Grounds', 'Grounds Maintenance'),
    ('Maintenance', 'General Maintenance'),
    ('Electrical', 'Electrical Maintenance'),
    ('Plumbing', 'Plumbing Maintenance'),
    ('Cleaning', 'Cleaning / Janitorial Services'),

    # Student & Community Services
    ('DisabilitySupport', 'Disability Support Services'),
    ('Counselling', 'Counselling & Wellness Support'),
    ('Health', 'Health Services Support'),
    ('Sports', 'Sports & Recreation Support'),
    ('StudentAffairs', 'Student Affairs Office'),

    # Security & Logistics
    ('Security', 'Security Services'),
    ('Transport', 'Transport & Logistics'),
    ('Tuckshop', 'Tuckshop,Stores & Inventory Management'),

    # Innovation & Industry
    ('Innovation', 'Innovation & Entrepreneurship Hub'),
    ('Industry', 'Industry Liaison / Attachment Support'),
    ('Incubation', 'Business Incubation Support'),

    # Misc / Flexible
    ('FieldWork', 'Field Work / Outreach'),
    ('Multiple', 'Multiple Work Areas'),
    ('Other', 'Other (Specify)'),
]


    work_area = models.CharField(max_length=50, choices=WORK_AREAS, null=True, blank=True)
    hours_pledged = models.PositiveIntegerField(default=0)

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

    disability_type = models.CharField(max_length=100, choices=DISABILITY_TYPES, default='None')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    graduation_year = models.IntegerField(null=True, blank=True)
    final_grade = models.CharField(
        max_length=20,
        choices=[
            ('Distinction', 'Distinction'),
            ('Credit', 'Credit'),
            ('Pass', 'Pass'),
            ('Fail', 'Fail')
        ],
        null=True,
        blank=True
    )

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    def __str__(self):
        return f"{self.full_name} ({self.student_id})"


class FeeStructure(models.Model):
    program = models.OneToOneField('faculties.Program', on_delete=models.CASCADE, related_name='fees')
    semester_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)

    def __str__(self):
        return f"{self.program.name} - {self.semester_fee}"


class Payment(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date_paid = models.DateField()
    reference = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.student_id} - {self.amount}"
