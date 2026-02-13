"""
Dynamic Report Schema Configuration

Defines field metadata for each report type including:
- Field key and display label
- Field type (string, number, boolean, choice, date, relation, computed)
- Choices for choice fields
- Whether field is filterable, selectable, and groupable
"""

# Student status choices
STUDENT_STATUSES = ['Active', 'Attachment', 'Graduated', 'Suspended', 'Deferred', 'Dropout']

# Student gender choices
STUDENT_GENDERS = ['Male', 'Female', 'Other']

# Final grade choices
FINAL_GRADES = ['Distinction', 'Credit', 'Pass', 'Fail']

# Disability types
DISABILITY_TYPES = ['None', 'Physical', 'Albino', 'Hearing', 'Visual']

# Dropout reasons
DROPOUT_REASONS = ['Financial', 'Academic', 'Medical', 'Personal', 'Transfer', 'Other']

# Work areas for work-for-fees
WORK_AREAS = ['Library', 'Grounds', 'Labs', 'Admin']

# Staff positions
STAFF_POSITIONS = ['Professor', 'Lecturer', 'Assistant', 'Admin', 'Other']

# Staff qualifications
STAFF_QUALIFICATIONS = ['PhD', 'Masters', 'Bachelors', 'Diploma', 'Certificate', 'Other']

# Program levels
PROGRAM_LEVELS = ['Certificate', 'Diploma', 'Bachelors', 'Masters', 'PhD', 'Other']

# Program categories
PROGRAM_CATEGORIES = ['STEM', 'HEALTH', 'BUSINESS', 'SOCIAL', 'HUMANITIES', 'EDUCATION', 'LAW', 'VOCATIONAL', 'INTERDISCIPLINARY']

# Institution types
INSTITUTION_TYPES = ['Polytechnic', 'Teachers College', 'Industrial Training', 'Other']

# Provinces
PROVINCES = ['Harare', 'Bulawayo', 'Midlands', 'Manicaland', 'Masvingo',
             'Mashonaland East', 'Mashonaland West', 'Mashonaland Central',
             'Matabeleland North', 'Matabeleland South']


REPORT_SCHEMAS = {
    'staff': {
        'model': 'staff.Staff',
        'title': 'Staff Report',
        'fields': [
            {
                'key': 'employee_id',
                'label': 'Employee ID',
                'type': 'string',
                'filterable': True,
                'selectable': True,
                'groupable': False
            },
            {
                'key': 'full_name',
                'label': 'Full Name',
                'type': 'computed',
                'filterable': False,
                'selectable': True,
                'groupable': False
            },
            {
                'key': 'first_name',
                'label': 'First Name',
                'type': 'string',
                'filterable': True,
                'selectable': True,
                'groupable': False
            },
            {
                'key': 'last_name',
                'label': 'Last Name',
                'type': 'string',
                'filterable': True,
                'selectable': True,
                'groupable': False
            },
            {
                'key': 'email',
                'label': 'Email',
                'type': 'string',
                'filterable': False,
                'selectable': True,
                'groupable': False
            },
            {
                'key': 'phone',
                'label': 'Phone',
                'type': 'string',
                'filterable': False,
                'selectable': True,
                'groupable': False
            },
            {
                'key': 'position',
                'label': 'Position',
                'type': 'choice',
                'choices': STAFF_POSITIONS,
                'filterable': True,
                'selectable': True,
                'groupable': True
            },
            {
                'key': 'qualification',
                'label': 'Qualification',
                'type': 'choice',
                'choices': STAFF_QUALIFICATIONS,
                'filterable': True,
                'selectable': True,
                'groupable': True
            },
            {
                'key': 'specialization',
                'label': 'Specialization',
                'type': 'string',
                'filterable': False,
                'selectable': True,
                'groupable': False
            },
            {
                'key': 'institution_name',
                'label': 'Institution',
                'type': 'relation',
                'relation_model': 'academic.Institution',
                'filterable': True,
                'selectable': True,
                'groupable': True
            },
            {
                'key': 'faculty_name',
                'label': 'Faculty',
                'type': 'relation',
                'relation_model': 'faculties.Faculty',
                'filterable': True,
                'selectable': True,
                'groupable': True
            },
            {
                'key': 'department_name',
                'label': 'Department',
                'type': 'relation',
                'relation_model': 'faculties.Department',
                'filterable': True,
                'selectable': True,
                'groupable': True
            },
            {
                'key': 'date_joined',
                'label': 'Date Joined',
                'type': 'date',
                'filterable': True,
                'selectable': True,
                'groupable': False
            },
            {
                'key': 'is_active',
                'label': 'Status',
                'type': 'boolean',
                'filterable': True,
                'selectable': True,
                'groupable': True
            },
        ],
        'default_columns': ['employee_id', 'full_name', 'position', 'qualification', 'institution_name', 'is_active']
    },

    'students': {
        'model': 'academic.Student',
        'title': 'Students Report',
        'fields': [
            {
                'key': 'student_id',
                'label': 'Student ID',
                'type': 'string',
                'filterable': True,
                'selectable': True,
                'groupable': False
            },
            {
                'key': 'full_name',
                'label': 'Full Name',
                'type': 'computed',
                'filterable': False,
                'selectable': True,
                'groupable': False
            },
            {
                'key': 'first_name',
                'label': 'First Name',
                'type': 'string',
                'filterable': True,
                'selectable': True,
                'groupable': False
            },
            {
                'key': 'last_name',
                'label': 'Last Name',
                'type': 'string',
                'filterable': True,
                'selectable': True,
                'groupable': False
            },
            {
                'key': 'gender',
                'label': 'Gender',
                'type': 'choice',
                'choices': STUDENT_GENDERS,
                'filterable': True,
                'selectable': True,
                'groupable': True
            },
            {
                'key': 'enrollment_year',
                'label': 'Enrollment Year',
                'type': 'number',
                'filterable': True,
                'selectable': True,
                'groupable': True
            },
            {
                'key': 'status',
                'label': 'Status',
                'type': 'choice',
                'choices': STUDENT_STATUSES,
                'filterable': True,
                'selectable': True,
                'groupable': True
            },
            {
                'key': 'institution_name',
                'label': 'Institution',
                'type': 'relation',
                'relation_model': 'academic.Institution',
                'filterable': True,
                'selectable': True,
                'groupable': True
            },
            {
                'key': 'program_name',
                'label': 'Program',
                'type': 'relation',
                'relation_model': 'faculties.Program',
                'filterable': True,
                'selectable': True,
                'groupable': True
            },
            {
                'key': 'program_level',
                'label': 'Program Level',
                'type': 'choice',
                'choices': PROGRAM_LEVELS,
                'filterable': True,
                'selectable': True,
                'groupable': True
            },
            {
                'key': 'program_category',
                'label': 'Program Category',
                'type': 'choice',
                'choices': PROGRAM_CATEGORIES,
                'filterable': True,
                'selectable': True,
                'groupable': True
            },
            {
                'key': 'disability_type',
                'label': 'Disability Type',
                'type': 'choice',
                'choices': DISABILITY_TYPES,
                'filterable': True,
                'selectable': True,
                'groupable': True
            },
            {
                'key': 'is_iseop',
                'label': 'ISEOP Student',
                'type': 'boolean',
                'filterable': True,
                'selectable': True,
                'groupable': True
            },
            {
                'key': 'is_work_for_fees',
                'label': 'Work for Fees',
                'type': 'boolean',
                'filterable': True,
                'selectable': True,
                'groupable': True
            },
            {
                'key': 'work_area',
                'label': 'Work Area',
                'type': 'choice',
                'choices': WORK_AREAS,
                'filterable': True,
                'selectable': True,
                'groupable': True
            },
        ],
        'default_columns': ['student_id', 'full_name', 'gender', 'program_name', 'institution_name', 'status']
    },

    'graduates': {
        'model': 'academic.Student',
        'title': 'Graduates Report',
        'base_filter': {'status': 'Graduated'},
        'fields': [
            {
                'key': 'student_id',
                'label': 'Student ID',
                'type': 'string',
                'filterable': True,
                'selectable': True,
                'groupable': False
            },
            {
                'key': 'full_name',
                'label': 'Full Name',
                'type': 'computed',
                'filterable': False,
                'selectable': True,
                'groupable': False
            },
            {
                'key': 'first_name',
                'label': 'First Name',
                'type': 'string',
                'filterable': True,
                'selectable': True,
                'groupable': False
            },
            {
                'key': 'last_name',
                'label': 'Last Name',
                'type': 'string',
                'filterable': True,
                'selectable': True,
                'groupable': False
            },
            {
                'key': 'gender',
                'label': 'Gender',
                'type': 'choice',
                'choices': STUDENT_GENDERS,
                'filterable': True,
                'selectable': True,
                'groupable': True
            },
            {
                'key': 'enrollment_year',
                'label': 'Enrollment Year',
                'type': 'number',
                'filterable': True,
                'selectable': True,
                'groupable': True
            },
            {
                'key': 'graduation_year',
                'label': 'Graduation Year',
                'type': 'number',
                'filterable': True,
                'selectable': True,
                'groupable': True
            },
            {
                'key': 'final_grade',
                'label': 'Final Grade',
                'type': 'choice',
                'choices': FINAL_GRADES,
                'filterable': True,
                'selectable': True,
                'groupable': True
            },
            {
                'key': 'institution_name',
                'label': 'Institution',
                'type': 'relation',
                'relation_model': 'academic.Institution',
                'filterable': True,
                'selectable': True,
                'groupable': True
            },
            {
                'key': 'program_name',
                'label': 'Program',
                'type': 'relation',
                'relation_model': 'faculties.Program',
                'filterable': True,
                'selectable': True,
                'groupable': True
            },
            {
                'key': 'program_level',
                'label': 'Program Level',
                'type': 'choice',
                'choices': PROGRAM_LEVELS,
                'filterable': True,
                'selectable': True,
                'groupable': True
            },
            {
                'key': 'program_category',
                'label': 'Program Category',
                'type': 'choice',
                'choices': PROGRAM_CATEGORIES,
                'filterable': True,
                'selectable': True,
                'groupable': True
            },
            {
                'key': 'disability_type',
                'label': 'Disability Type',
                'type': 'choice',
                'choices': DISABILITY_TYPES,
                'filterable': True,
                'selectable': True,
                'groupable': True
            },
            {
                'key': 'is_iseop',
                'label': 'ISEOP Student',
                'type': 'boolean',
                'filterable': True,
                'selectable': True,
                'groupable': True
            },
        ],
        'default_columns': ['student_id', 'full_name', 'gender', 'program_name', 'graduation_year', 'final_grade']
    }
}


def get_schema(report_type: str) -> dict:
    """Get the schema configuration for a report type."""
    if report_type not in REPORT_SCHEMAS:
        raise ValueError(f"Unknown report type: {report_type}")
    return REPORT_SCHEMAS[report_type]


def get_filterable_fields(report_type: str) -> list:
    """Get all filterable fields for a report type."""
    schema = get_schema(report_type)
    return [f for f in schema['fields'] if f.get('filterable', False)]


def get_selectable_fields(report_type: str) -> list:
    """Get all selectable (column) fields for a report type."""
    schema = get_schema(report_type)
    return [f for f in schema['fields'] if f.get('selectable', False)]


def get_groupable_fields(report_type: str) -> list:
    """Get all groupable fields for a report type."""
    schema = get_schema(report_type)
    return [f for f in schema['fields'] if f.get('groupable', False)]


def get_field_by_key(report_type: str, key: str) -> dict:
    """Get a specific field definition by key."""
    schema = get_schema(report_type)
    for field in schema['fields']:
        if field['key'] == key:
            return field
    return None
