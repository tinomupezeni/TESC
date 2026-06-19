"""
Dynamic Report Schema Configuration
"""

STUDENT_STATUSES = ['Active', 'Attachment', 'Graduated', 'Suspended', 'Deferred', 'Dropout']
STUDENT_GENDERS = ['Male', 'Female', 'Other']
FINAL_GRADES = ['Distinction', 'Credit', 'Pass', 'Fail']
INCLUSIVITY_CATEGORIES = [
    'None', 'Physical', 'Amputation', 'Paralysis', 'CerebralPalsy', 'SpinalCord',
    'Visual', 'Hearing', 'Speech', 'DeafBlind', 'Intellectual', 'Learning',
    'Autism', 'ADHD', 'Epilepsy', 'MentalHealth', 'Albino', 'DownSyndrome',
    'SickleCell', 'ChronicIllness', 'Multiple', 'Other'
]
DROPOUT_REASONS = ['Financial', 'Academic', 'Medical', 'Personal', 'Transfer', 'Other']
WORK_AREAS = ['Library', 'Grounds', 'Labs', 'Admin']
STAFF_POSITIONS = ['Professor', 'Lecturer', 'Assistant', 'Admin', 'Other']
STAFF_QUALIFICATIONS = ['PhD', 'Masters', 'Bachelors', 'Diploma', 'Certificate', 'Other']
PROGRAM_LEVELS = [
    'Class 4', 'Class 3', 'Class 2', 'Class 1',
    'National Certificate', 'National Foundation Certificate',
    'Certificate', 'Diploma', 'Bachelors', 'Masters', 'PhD', 'Other'
]
PROGRAM_CATEGORIES = ['STEM', 'HEALTH', 'BUSINESS', 'SOCIAL', 'HUMANITIES', 'EDUCATION', 'LAW', 'VOCATIONAL', 'INTERDISCIPLINARY']
INSTITUTION_TYPES = ['Polytechnic', 'Teachers College', 'Industrial Training', 'Other']
PROVINCES = ['Harare', 'Bulawayo', 'Midlands', 'Manicaland', 'Masvingo',
             'Mashonaland East', 'Mashonaland West', 'Mashonaland Central',
             'Matabeleland North', 'Matabeleland South']

REPORT_SCHEMAS = {
    'staff': {
        'model': 'staff.Staff',
        'title': 'Staff Report',
        'fields': [
            {'key': 'employee_id', 'label': 'Employee ID', 'type': 'string', 'filterable': True, 'selectable': True, 'groupable': False},
            {'key': 'full_name', 'label': 'Full Name', 'type': 'computed', 'filterable': False, 'selectable': True, 'groupable': False},
            {'key': 'position', 'label': 'Position', 'type': 'choice', 'choices': STAFF_POSITIONS, 'filterable': True, 'selectable': True, 'groupable': True},
        ],
        'default_columns': ['employee_id', 'full_name', 'position']
    },
    'students': {
        'model': 'academic.Student',
        'title': 'Students Report',
        'fields': [
            {'key': 'student_id', 'label': 'Student ID', 'type': 'string', 'filterable': True, 'selectable': True, 'groupable': False},
            {'key': 'full_name', 'label': 'Full Name', 'type': 'computed', 'filterable': False, 'selectable': True, 'groupable': False},
            {'key': 'gender', 'label': 'Gender', 'type': 'choice', 'choices': STUDENT_GENDERS, 'filterable': True, 'selectable': True, 'groupable': True},
            {'key': 'inclusivity_category', 'label': 'Inclusivity Category', 'type': 'choice', 'choices': INCLUSIVITY_CATEGORIES, 'filterable': True, 'selectable': True, 'groupable': True},
        ],
        'default_columns': ['student_id', 'full_name', 'gender']
    },
    'graduates': {
        'model': 'academic.Student',
        'title': 'Graduates Report',
        'base_filter': {'status': 'Graduated'},
        'fields': [
            {'key': 'student_id', 'label': 'Student ID', 'type': 'string', 'filterable': True, 'selectable': True, 'groupable': False},
            {'key': 'full_name', 'label': 'Full Name', 'type': 'computed', 'filterable': False, 'selectable': True, 'groupable': False},
            {'key': 'inclusivity_category', 'label': 'Inclusivity Category', 'type': 'choice', 'choices': INCLUSIVITY_CATEGORIES, 'filterable': True, 'selectable': True, 'groupable': True},
        ],
        'default_columns': ['student_id', 'full_name']
    },
    'placements': {
        'model': 'academic.IndustryPlacement',
        'title': 'Industry Placements Report',
        'fields': [
            {'key': 'placement_type', 'label': 'Placement Type', 'type': 'choice', 'choices': ['Attachment', 'Apprenticeship'], 'filterable': True, 'selectable': True, 'groupable': True},
            {'key': 'company_name', 'label': 'Company Name', 'type': 'string', 'filterable': True, 'selectable': True, 'groupable': True},
            {'key': 'gender', 'label': 'Gender', 'type': 'choice', 'choices': STUDENT_GENDERS, 'filterable': True, 'selectable': True, 'groupable': True},
        ],
        'default_columns': ['placement_type', 'company_name']
    },
    'scholarships': {
        'model': 'academic.StudentScholarship',
        'title': 'Scholarships Report',
        'fields': [
            {'key': 'provider_name', 'label': 'Provider', 'type': 'string', 'filterable': True, 'selectable': True, 'groupable': True},
            {'key': 'amount', 'label': 'Amount', 'type': 'number', 'filterable': True, 'selectable': True, 'groupable': False},
            {'key': 'year_awarded', 'label': 'Year Awarded', 'type': 'number', 'filterable': True, 'selectable': True, 'groupable': True},
            {'key': 'student_id_number', 'label': 'Student ID', 'type': 'string', 'filterable': False, 'selectable': True, 'groupable': False},
            {'key': 'student_name', 'label': 'Student Name', 'type': 'string', 'filterable': False, 'selectable': True, 'groupable': False},
        ],
        'default_columns': ['student_id_number', 'student_name', 'provider_name', 'amount', 'year_awarded']
    },
    'mobility': {
        'model': 'academic.InternationalMobility',
        'title': 'International Mobility Report',
        'fields': [
            {'key': 'direction', 'label': 'Direction', 'type': 'choice', 'choices': ['Inbound', 'Outbound'], 'filterable': True, 'selectable': True, 'groupable': True},
            {'key': 'country', 'label': 'Country', 'type': 'string', 'filterable': True, 'selectable': True, 'groupable': True},
            {'key': 'foreign_institution', 'label': 'Foreign Institution', 'type': 'string', 'filterable': True, 'selectable': True, 'groupable': True},
            {'key': 'student_id_number', 'label': 'Student ID', 'type': 'string', 'filterable': False, 'selectable': True, 'groupable': False},
            {'key': 'student_name', 'label': 'Student Name', 'type': 'string', 'filterable': False, 'selectable': True, 'groupable': False},
            {'key': 'gender', 'label': 'Gender', 'type': 'choice', 'choices': STUDENT_GENDERS, 'filterable': True, 'selectable': True, 'groupable': True}
        ],
        'default_columns': ['student_id_number', 'student_name', 'direction', 'country', 'foreign_institution']
    }
}

def get_schema(report_type: str) -> dict:
    if report_type not in REPORT_SCHEMAS:
        raise ValueError(f"Unknown report type: {report_type}")
    return REPORT_SCHEMAS[report_type]

def get_filterable_fields(report_type: str) -> list:
    schema = get_schema(report_type)
    return [f for f in schema['fields'] if f.get('filterable', False)]

def get_selectable_fields(report_type: str) -> list:
    schema = get_schema(report_type)
    return [f for f in schema['fields'] if f.get('selectable', False)]

def get_groupable_fields(report_type: str) -> list:
    schema = get_schema(report_type)
    return [f for f in schema['fields'] if f.get('groupable', False)]

def get_field_by_key(report_type: str, key: str) -> dict:
    schema = get_schema(report_type)
    for field in schema['fields']:
        if field['key'] == key:
            return field
    return None
