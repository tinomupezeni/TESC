import pandas as pd
from openpyxl import Workbook
from openpyxl.worksheet.datavalidation import DataValidation
from django.db import models
from academic.models import Student
from faculties.models import Faculty, FACULTY_STATUSES, Department, PROGRAM_LEVELS, PROGRAM_CATEGORIES, PROGRAM_TYPES, Program # Import Department, Program, and Program choices

# Define templates for each module
# This maps the field name to (Label, Required)
TEMPLATE_SCHEMAS = {
    'faculties': {
        'name': ('Faculty Name', True),
        'dean': ('Dean Name', False),
        'location': ('Location', False),
        'email': ('Email', False),
        'description': ('Description', False),
        'status': ('Status (Active/Setup/Review/Archived)', True),
    },
    'programs': {
        'faculty_name': ('Faculty Name', True),
        'department_name': ('Department Name', True),
        'name': ('Program Name', True),
        'code': ('Program Code', True),
        'duration': ('Duration (Years)', True),
        'levels': ('Levels (Comma-separated: Bachelors, Masters, etc.)', True),
        'categories': ('Categories (Comma-separated: STEM, BUSINESS, etc.)', True),
        'is_critical_skill': ('Is Critical Skill (TRUE/FALSE)', False),
        'program_type': ('Program Type (Degree/Diploma/Certificate/Short Course/Other)', True),
        'description': ('Description', False),
        'coordinator': ('Coordinator', False),
        'student_capacity': ('Student Capacity', False),
        'semester_fee': ('Semester Fee', False),
        'modules': ('Modules (Comma-separated)', False),
        'entry_requirements': ('Entry Requirements', False),
    },
    'stem_students': {
        'student_id': ('Student ID', True),
    },
    'inclusivity': {
        'student_id': ('Student ID', True),
        'inclusivity_category': ('Inclusivity Category', True),
    },
    'possible_graduates': {
        'student_id': ('Student ID', True),
        'graduation_year': ('Expected Graduation Year', True),
    },
    'placements': {
        'student_id': ('Student ID', True),
        'placement_type': ('Placement Type (Attachment/Apprenticeship)', True),
        'company_name': ('Company Name', True),
        'start_date': ('Start Date (YYYY-MM-DD)', True),
        'end_date': ('End Date (YYYY-MM-DD)', False),
    },
    'scholarships': {
        'student_id': ('Student ID', True),
        'provider_name': ('Provider Name', True),
        'amount': ('Amount', False),
        'year_awarded': ('Year Awarded', True),
    },
    'mobility': {
        'student_id': ('Student ID', True),
        'direction': ('Direction (Inbound/Outbound)', True),
        'country': ('Country', True),
        'foreign_institution': ('Foreign Institution', False),
    },
    'in_country_transfers': {
        'student_id': ('Student ID', True),
        'from_institution': ('From Institution Name', True),
        'to_institution': ('To Institution Name', True),
        'transfer_date': ('Transfer Date (YYYY-MM-DD)', True),
    }
}

class IngestionService:
    @staticmethod
    def generate_template(module_type: str):
        """Generates an Excel template with dropdown validation."""
        schema = TEMPLATE_SCHEMAS.get(module_type)
        if not schema:
            raise ValueError(f"Unknown module type: {module_type}")
            
        wb = Workbook()
        ws = wb.active
        ws.title = module_type.capitalize()
        
        # Add headers
        headers = [field[0] for field in schema.values()]
        ws.append(headers)
        
        # Add basic dropdown for choices if applicable
        if module_type == 'placements':
            dv = DataValidation(type="list", formula1='"Attachment,Apprenticeship"', allow_blank=False)
            ws.add_data_validation(dv)
            dv.add(f'B2:B1000')
        elif module_type == 'mobility':
            dv = DataValidation(type="list", formula1='"Inbound,Outbound"', allow_blank=False)
            ws.add_data_validation(dv)
            dv.add(f'B2:B1000')
        elif module_type == 'faculties':
            status_choices = ','.join([choice[0] for choice in FACULTY_STATUSES])
            dv = DataValidation(type="list", formula1=f'"{status_choices}"', allow_blank=False)
            ws.add_data_validation(dv)
            dv.add(f'F2:F1000') # Assuming status is the 6th column (index 5)
        elif module_type == 'programs':
            # Data validation for program_type
            program_type_choices = ','.join([choice[0] for choice in PROGRAM_TYPES])
            dv_type = DataValidation(type="list", formula1=f'"{program_type_choices}"', allow_blank=False)
            ws.add_data_validation(dv_type)
            # Assuming 'Program Type' is the 10th column (index 9) based on TEMPLATE_SCHEMAS
            dv_type.add(f'J2:J1000') 

            # Data validation for is_critical_skill
            dv_skill = DataValidation(type="list", formula1='"TRUE,FALSE"', allow_blank=False)
            ws.add_data_validation(dv_skill)
            # Assuming 'Is Critical Skill' is the 9th column (index 8)
            dv_skill.add(f'I2:I1000')

            # Data validation for levels (multi-select implied, but providing options)
            level_choices = ','.join([choice[0] for choice in PROGRAM_LEVELS])
            dv_levels = DataValidation(type="list", formula1=f'"{level_choices}"', allow_blank=True)
            ws.add_data_validation(dv_levels)
            # Assuming 'Levels' is the 6th column (index 5)
            dv_levels.add(f'F2:F1000')

            # Data validation for categories (multi-select implied, but providing options)
            category_choices = ','.join([choice[0] for choice in PROGRAM_CATEGORIES])
            dv_categories = DataValidation(type="list", formula1=f'"{category_choices}"', allow_blank=True)
            ws.add_data_validation(dv_categories)
            # Assuming 'Categories' is the 7th column (index 6)
            dv_categories.add(f'G2:G1000')
            
        return wb

    @staticmethod
    def validate_upload(module_type: str, file_path: str, institution_id: int = None): # Added institution_id
        """
        Validates an uploaded Excel file against the module's schema.
        Returns a list of dictionaries, each representing a row with its data, status, and messages.
        """
        schema = TEMPLATE_SCHEMAS.get(module_type)
        if not schema:
            raise ValueError(f"Unknown module type for validation: {module_type}")

        try:
            df = pd.read_excel(file_path)
        except Exception as e:
            return {"status": "error", "message": f"Failed to read Excel file: {e}"}

        processed_data = []
        # Map Excel headers to internal field names
        header_map = {v[0]: k for k, v in schema.items()}

        for index, row in df.iterrows():
            row_data = {}
            errors = []
            status = "Success"

            for excel_header, internal_field_name in header_map.items():
                value = row.get(excel_header)
                is_required = schema[internal_field_name][1]

                if pd.isna(value) or value == '':
                    if is_required:
                        errors.append(f"Missing required field: {excel_header}")
                        status = "Error"
                    row_data[internal_field_name] = None
                else:
                    # Basic type conversion/validation
                    if internal_field_name in ['start_date', 'end_date', 'year_awarded']:
                        try:
                            # Attempt to convert to date string or year int
                            if internal_field_name == 'year_awarded':
                                row_data[internal_field_name] = int(value)
                            else:
                                row_data[internal_field_name] = pd.to_datetime(value).strftime('%Y-%m-%d')
                        except ValueError:
                            errors.append(f"Invalid date format for {excel_header}. Use YYYY-MM-DD.")
                            status = "Error"
                    elif internal_field_name == 'amount':
                        try:
                            row_data[internal_field_name] = float(value)
                        except ValueError:
                            errors.append(f"Invalid amount for {excel_header}. Must be a number.")
                            status = "Error"
                    else:
                        row_data[internal_field_name] = str(value).strip()
            
            # Additional validation specific to module types
            if module_type == 'faculties':
                # Validate status choices
                if 'status' in row_data and row_data['status']:
                    valid_statuses = [choice[0] for choice in FACULTY_STATUSES]
                    if row_data['status'] not in valid_statuses:
                        errors.append(f"Invalid status: {row_data['status']}. Must be one of {', '.join(valid_statuses)}.")
                        status = "Error"
                
            processed_data.append({
                "row_number": index + 2, # Excel rows are 1-based, and +1 for header
                "status": status,
                "messages": errors,
                "data": row_data
            })
        
        # In a real scenario, you'd check for student existence here
        # For now, we'll assume student_id only needs basic presence check.
        # Student linking is done in commit_upload.

        return {
            "status": "success",
            "message": f"Successfully processed {len(processed_data)} rows.",
            "processed_data": processed_data
        }

    @staticmethod
    def commit_upload(module_type: str, validated_data: list, institution_id: int = None):
        """Commits validated/corrected data to the database."""
        from academic.models import Student, Institution, IndustryPlacement, StudentScholarship, InternationalMobility, InCountryTransfer
        from faculties.models import Program, Faculty, Department

        success_count = 0
        for item in validated_data:
            # Re-initialize status and errors from item if they exist, or set defaults
            status = item.get('status', 'Success')
            errors = item.get('messages', [])

            if status == 'Error': # Skip items that were already marked as Error during validation
                continue
            
            data = item['data']

            # Student lookup is relevant for most modules tied to students
            student = None
            if module_type in ['placements', 'scholarships', 'mobility', 'inclusivity', 'possible_graduates', 'in_country_transfers']:
                student_id = str(data.get('student_id', ''))
                student = Student.objects.filter(student_id=student_id, institution_id=institution_id).first() # Filter by institution_id
                
                if not student:
                    continue

            # Create module record based on type
            if module_type == 'placements':
                IndustryPlacement.objects.create(
                    student=student,
                    placement_type=data['placement_type'],
                    company_name=data['company_name'],
                    start_date=data['start_date']
                )
            elif module_type == 'scholarships':
                StudentScholarship.objects.create(
                    student=student,
                    provider_name=data['provider_name'],
                    amount=data.get('amount'),
                    year_awarded=data['year_awarded']
                )
            elif module_type == 'mobility':
                InternationalMobility.objects.create(
                    student=student,
                    direction=data['direction'],
                    country=data['country'],
                    foreign_institution=data.get('foreign_institution')
                )
            elif module_type == 'in_country_transfers':
                InCountryTransfer.objects.create(
                    student=student,
                    from_institution=data['from_institution'],
                    to_institution=data['to_institution'],
                    transfer_date=data['transfer_date']
                )
            elif module_type == 'faculties':
                institution = Institution.objects.get(id=institution_id)
                Faculty.objects.get_or_create(
                    institution=institution,
                    name=data['name'],
                    defaults={
                        'dean': data.get('dean', ''),
                        'location': data.get('location', ''),
                        'email': data.get('email', ''),
                        'description': data.get('description', ''),
                        'status': data.get('status', 'Active')
                    }
                )
            elif module_type == 'programs':
                institution = Institution.objects.get(id=institution_id)
                faculty_name = data.get('faculty_name')
                department_name = data.get('department_name')

                faculty = Faculty.objects.filter(institution=institution, name__iexact=faculty_name).first()
                if not faculty: continue
                
                department = Department.objects.filter(faculty=faculty, name__iexact=department_name).first()
                if not department: continue
                
                levels = [lvl.strip() for lvl in str(data.get('levels', '')).split(',') if lvl.strip()]
                categories = [cat.strip() for cat in str(data.get('categories', '')).split(',') if cat.strip()]
                is_critical_skill = str(data.get('is_critical_skill', 'FALSE')).upper() == 'TRUE'
                
                Program.objects.create(
                    department=department,
                    name=data['name'],
                    code=data['code'],
                    duration=int(data.get('duration', 0)),
                    levels=levels,
                    categories=categories,
                    is_critical_skill=is_critical_skill,
                    program_type=data.get('program_type'),
                    description=data.get('description', ''),
                    coordinator=data.get('coordinator', ''),
                    student_capacity=int(data.get('student_capacity', 0)),
                    semester_fee=float(data.get('semester_fee', 0.00)),
                    modules=data.get('modules', ''),
                    entry_requirements=data.get('entry_requirements', '')
                )
            elif module_type == 'inclusivity':
                student.inclusivity_category = data['inclusivity_category']
                student.save()
            elif module_type == 'possible_graduates':
                student.graduation_year = int(data['graduation_year'])
                student.save()
            elif module_type == 'stem_students':
                pass
            success_count += 1
            
        return success_count
