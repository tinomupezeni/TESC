from django.db import transaction
from django.core.exceptions import ValidationError
from ..models import Student, STUDENT_STATUSES
import pandas as pd
from faculties.models import Department, Faculty, Program
from django.forms.models import model_to_dict


class StudentService:
    @staticmethod
    def normalize_gender(gender_str):
        """Standardizes gender values into 'Male' or 'Female'."""
        if not gender_str or pd.isna(gender_str):
            raise ValidationError("Gender is required.")
            
        g = str(gender_str).strip().lower()
        if g in ['m', 'male']:
            return "Male"
        elif g in ['f', 'female']:
            return "Female"
        else:
            raise ValidationError(f"Invalid gender choice: {gender_str}. Gender must be 'Male' or 'Female'.")

    @staticmethod
    def _validate_student_data(data):
        """Helper to validate conditional fields based on model constraints"""
        if data.get('is_work_for_fees'):
            # 1. Validate work_area is present
            if not data.get('work_area'):
                raise ValidationError("Work area is required if student is working for fees.")
            
            # 2. VALIDATION FIX: Removed strict choice validation to allow flexible work areas

            # 3. Validate hours (removed the explicit 'not None' check here 
            # to rely on Django's model validation for PositveIntegerField)
            if data.get('hours_pledged', 0) <= 0:
                raise ValidationError("Valid pledged hours are required if student is working for fees.")

    @staticmethod
    def create_student(validated_data):
        """
        Creates a new Student instance.
        Ensures graduation info is present if status is Graduated.
        """
        # Run custom validation first
        StudentService._validate_student_data(validated_data)

        # Force uppercase for free-form text fields
        for field in ['first_name', 'last_name', 'student_id', 'national_id', 'date_of_birth']:
            if field in validated_data and isinstance(validated_data[field], str):
                validated_data[field] = validated_data[field].upper()

        if 'gender' in validated_data:
            validated_data['gender'] = StudentService.normalize_gender(validated_data['gender'])

        if validated_data.get('status') == 'Graduated':
            if not validated_data.get('graduation_year'):
                raise ValidationError("Graduation year is required for graduated students.")
            if not validated_data.get('final_grade'):
                raise ValidationError("Final grade is required for graduated students.")

        new_program_code = validated_data.pop('new_program_code', None)
        new_program_name = validated_data.pop('new_program_name', None)
        new_program_level = validated_data.pop('new_program_level', 'Degree')
        new_program_category = validated_data.pop('new_program_category', 'STEM')

        if new_program_code:
            institution = validated_data.get('institution')
            department = validated_data.get('department')
            
            # Look up program across the institution
            if department:
                program = Program.objects.filter(
                    code__iexact=new_program_code,
                    department__faculty__institution=institution
                ).first()
            else:
                program = Program.objects.filter(
                    code__iexact=new_program_code,
                    institution=institution
                ).first()
            
            if not program:
                program = Program.objects.create(
                    department=department,
                    institution=institution,
                    name=new_program_name or f"{new_program_code} Program",
                    code=new_program_code.upper(),
                    duration=4,
                    level=new_program_level,
                    levels=[new_program_level],
                    category=new_program_category,
                    categories=[new_program_category],
                    description="Auto-created via Individual Student Add"
                )
            validated_data['program'] = program

        try:
            with transaction.atomic():
                student = Student.objects.create(**validated_data)
                return student
        except Exception as e:
            raise ValidationError(f"Error creating student: {str(e)}")

    @staticmethod
    def update_student(instance, validated_data):
        """
        Updates an existing Student instance.
        Ensures graduation info is present for Graduated students.
        """
        # Force uppercase for free-form text fields
        for field in ['first_name', 'last_name', 'student_id', 'national_id', 'date_of_birth']:
            if field in validated_data and isinstance(validated_data[field], str):
                validated_data[field] = validated_data[field].upper()
        new_program_code = validated_data.pop('new_program_code', None)
        new_program_name = validated_data.pop('new_program_name', None)
        new_program_level = validated_data.pop('new_program_level', 'Degree')
        new_program_category = validated_data.pop('new_program_category', 'STEM')

        if 'gender' in validated_data:
            validated_data['gender'] = StudentService.normalize_gender(validated_data['gender'])

        if new_program_code:
            institution = instance.institution
            department = validated_data.get('department', instance.department)
            
            if department:
                program = Program.objects.filter(
                    code__iexact=new_program_code,
                    department__faculty__institution=institution
                ).first()
            else:
                program = Program.objects.filter(
                    code__iexact=new_program_code,
                    institution=institution
                ).first()
            
            if not program:
                program = Program.objects.create(
                    department=department,
                    institution=institution,
                    name=new_program_name or f"{new_program_code} Program",
                    code=new_program_code.upper(),
                    duration=4,
                    level=new_program_level,
                    levels=[new_program_level],
                    category=new_program_category,
                    categories=[new_program_category],
                    description="Auto-created via Individual Student Add"
                )
            validated_data['program'] = program

        try:
            with transaction.atomic():
                protected_fields = ['id', 'institution']

                # Temporarily update instance for validation
                for attr, value in validated_data.items():
                    if attr not in protected_fields:
                        setattr(instance, attr, value)
                
                # New validation check
                StudentService._validate_student_data(model_to_dict(instance))

                # Validate graduation info
                status = validated_data.get('status', instance.status)
                grad_year = validated_data.get('graduation_year', instance.graduation_year)
                final_grade = validated_data.get('final_grade', instance.final_grade)

                if status == 'Graduated':
                    if not grad_year:
                        raise ValidationError("Graduation year is required for graduated students.")
                    if not final_grade:
                        raise ValidationError("Final grade is required for graduated students.")

                instance.full_clean()
                instance.save()
                return instance

        except ValidationError as e:
            raise e
        except Exception as e:
            raise ValidationError(f"Error updating student: {str(e)}")

    @staticmethod
    def delete_student(instance):
        """
        Deletes a Student instance.
        """
        try:
            instance.delete()
        except Exception as e:
            raise ValidationError(f"Error deleting student: {str(e)}")

    @staticmethod
    def bulk_create_from_file(file, institution_id, confirm_creation=False):
        """
        Parses an Excel/CSV file and enrolls students.
        """
        try:
            # ---------------- READ FILE ----------------
            if file.name.endswith('.csv'):
                df = pd.read_csv(file, dtype=str)
            else:
                df = pd.read_excel(file, dtype=str)

            df.columns = [c.strip().lower().replace(' ', '_') for c in df.columns]

            # ---------------- CACHES ----------------
            fac_cache = {f.name.lower(): f for f in Faculty.objects.filter(institution_id=institution_id)}
            dept_cache = {(d.faculty_id, d.name.lower()): d for d in Department.objects.filter(
                faculty__institution_id=institution_id
            )}
            prog_cache = {p.code.lower(): p for p in Program.objects.filter(
                department__faculty__institution_id=institution_id
            )}

            existing_ids = set(
                Student.objects.filter(institution_id=institution_id)
                .values_list('student_id', flat=True)
            )

            seen_in_file = set()
            students_to_create = []
            errors = []
            new_programs_to_create = {}

            GRADE_MAP = {
                'distinction': 'Distinction',
                'credit': 'Credit',
                'pass': 'Pass',
                'fail': 'Fail',
            }

            label_to_code = {label.lower(): code for code, label in Student.DROPOUT_REASONS}
            for code, label in Student.DROPOUT_REASONS:
                label_to_code[code.lower()] = code
            
            valid_statuses = {}
            for s in STUDENT_STATUSES:
                valid_statuses[s[0].lower()] = s[0]
                valid_statuses[s[1].lower()] = s[0]
                
            valid_work_areas = {}
            for code, label in Student.WORK_AREAS:
                valid_work_areas[code.lower()] = code
                valid_work_areas[label.lower()] = code
                
            valid_inclusivity = {}
            for code, label in Student.INCLUSIVITY_CATEGORIES:
                valid_inclusivity[code.lower()] = code
                valid_inclusivity[label.lower()] = code
                
            valid_semesters = {'semester 1': 'Semester 1', 'semester 2': 'Semester 2', '1': 'Semester 1', '2': 'Semester 2'}

            # ---------------- PROCESS ROWS ----------------
            rows_to_process = []
            for index, row in df.iterrows():
                row_num = index + 2
                error_prefix = f"Row {row_num}"
                try:
                    student_id_raw = row.get('student_id')
                    student_id = str(student_id_raw).strip().upper() if pd.notna(student_id_raw) else ""
                    
                    error_prefix = f"Student ID {student_id}" if student_id else f"Row {row_num} (No Student ID)"
                    
                    if not student_id:
                        errors.append(f"{error_prefix}: Student ID is required.")
                        continue

                    if student_id in seen_in_file:
                        errors.append(f"{error_prefix}: Duplicate Student ID '{student_id}' in the uploaded file.")
                        continue
                    seen_in_file.add(student_id)

                    if student_id in existing_ids:
                        errors.append(f"{error_prefix}: Student ID '{student_id}' already exists in database.")
                        continue

                    # Validate basic fields to prevent GIGO
                    first_name_raw = row.get('first_name')
                    last_name_raw = row.get('last_name')
                    first_name = str(first_name_raw).strip().upper() if pd.notna(first_name_raw) else ""
                    last_name = str(last_name_raw).strip().upper() if pd.notna(last_name_raw) else ""
                    
                    gender_raw = str(row.get('gender', '')).strip() if pd.notna(row.get('gender')) else ""

                    if not first_name:
                        errors.append(f"{error_prefix}: First Name is required.")
                    if not last_name:
                        errors.append(f"{error_prefix}: Last Name is required.")
                    
                    try:
                        gender = StudentService.normalize_gender(gender_raw)
                    except ValidationError as ge:
                        errors.append(f"{error_prefix}: {str(ge)}")
                        gender = "Male"  # Placeholder for temporary object

                    # Program identification - we work with program code
                    prog_raw = row.get('program_code', row.get('program'))
                    program_code = str(prog_raw).strip().upper() if pd.notna(prog_raw) else ""
                    if not program_code:
                        errors.append(f"{error_prefix}: Program Code is required.")
                        continue

                    # Check if program exists by code in the institution
                    program_obj = prog_cache.get(program_code.lower())
                    if not program_obj:
                        prog_name = str(row.get('program_name', row.get('program', ''))).strip().upper() or f"{program_code} PROGRAM"
                        raw_fac = str(row.get('faculty', 'GENERAL FACULTY')).strip().upper()
                        raw_dept = str(row.get('department', 'GENERAL DEPARTMENT')).strip().upper()
                        
                        level = str(row.get('level', 'Degree')).strip().capitalize()
                        category = str(row.get('category', 'STEM')).strip().upper()
                        
                        new_programs_to_create[program_code.lower()] = {
                            "code": program_code,
                            "name": prog_name,
                            "department": raw_dept,
                            "faculty": raw_fac,
                            "level": level,
                            "category": category
                        }

                    # -------- Status / Dropout --------
                    status_raw = str(row.get('status', 'Active')).strip() if pd.notna(row.get('status')) else 'Active'
                    status = valid_statuses.get(status_raw.lower(), status_raw)
                    if not status:
                        status = 'Active'
                        
                    dropout_raw = str(row.get('dropout_reason', '')).strip() if pd.notna(row.get('dropout_reason')) else ""
                    dropout_reason = None
                    if status == 'Dropout' and dropout_raw:
                        dropout_reason = label_to_code.get(dropout_raw.lower(), dropout_raw)

                    # -------- Enrollment Year --------
                    enrollment_year_raw = row.get('enrollment_year')
                    enrollment_year = 2025
                    if pd.notna(enrollment_year_raw):
                        try:
                            enrollment_year = int(float(enrollment_year_raw))
                        except ValueError:
                            errors.append(f"{error_prefix}: Enrollment Year must be a number.")
                    else:
                        errors.append(f"{error_prefix}: Enrollment Year is required.")

                    # -------- Graduation Year --------
                    grad_year = None
                    if pd.notna(row.get('graduation_year')):
                        try:
                            grad_year = int(float(row.get('graduation_year')))
                        except ValueError:
                            errors.append(f"{error_prefix}: Graduation Year must be a number.")

                    # -------- Final Grade --------
                    raw_grade = str(row.get('final_grade', '')).strip().lower()
                    final_grade = GRADE_MAP.get(raw_grade) if raw_grade else None

                    # -------- Work for Fees Fields --------
                    work_fees_raw = str(row.get('is_work_for_fees', '')).strip().lower() if pd.notna(row.get('is_work_for_fees')) else ""
                    is_work_for_fees = work_fees_raw in ['true', 'yes', '1', 'y', 't']
                    
                    work_area_raw = str(row.get('work_area', '')).strip() if pd.notna(row.get('work_area')) else ""
                    work_area = None
                    if work_area_raw:
                        work_area = valid_work_areas.get(work_area_raw.lower(), work_area_raw)
                            
                    hours_pledged = 0
                    if pd.notna(row.get('hours_pledged')):
                        try:
                            hours_pledged = int(float(row.get('hours_pledged')))
                        except ValueError:
                            errors.append(f"{error_prefix}: Hours Pledged must be a number.")

                    inclusivity_raw = str(row.get('inclusivity_category', row.get('disability_type', ''))).strip() if pd.notna(row.get('inclusivity_category')) or pd.notna(row.get('disability_type')) else ""
                    inclusivity_category = 'None'
                    if inclusivity_raw:
                        inclusivity_category = valid_inclusivity.get(inclusivity_raw.lower(), inclusivity_raw)

                    sem_raw = str(row.get('enrollment_semester', row.get('semester', 'Semester 1'))).strip() if pd.notna(row.get('enrollment_semester')) or pd.notna(row.get('semester')) else 'Semester 1'
                    enrollment_semester = valid_semesters.get(sem_raw.lower(), sem_raw)
                    if not enrollment_semester:
                        enrollment_semester = 'Semester 1'

                    student_data = {
                        "is_work_for_fees": is_work_for_fees,
                        "work_area": work_area,
                        "hours_pledged": hours_pledged,
                        "status": status,
                        "graduation_year": grad_year,
                        "final_grade": final_grade,
                        "gender": gender,
                    }
                    
                    try:
                        StudentService._validate_student_data(student_data)
                        if status == 'Graduated':
                            if not grad_year:
                                raise ValidationError("Graduation year is required for graduated students.")
                            if not final_grade:
                                raise ValidationError("Final grade is required for graduated students.")
                    except ValidationError as ve:
                        # Extract error message string
                        err_msg = ve.message if hasattr(ve, 'message') else str(ve)
                        # Also handle dictionary or list of errors if wrapped
                        if hasattr(ve, 'message_dict') and ve.message_dict:
                            err_msg = str(ve.message_dict)
                        errors.append(f"{error_prefix}: {err_msg}")

                    rows_to_process.append({
                        "row_num": row_num,
                        "student_id": student_id,
                        "first_name": first_name,
                        "last_name": last_name,
                        "gender": gender,
                        "enrollment_year": enrollment_year,
                        "enrollment_semester": enrollment_semester,
                        "program_code": program_code,
                        "national_id": str(row.get('national_id', '')).strip().upper() if pd.notna(row.get('national_id')) else None,
                        "date_of_birth": str(row.get('date_of_birth', '')).strip().upper() if pd.notna(row.get('date_of_birth')) else None,
                        "status": status,
                        "dropout_reason": dropout_reason,
                        "graduation_year": grad_year,
                        "final_grade": final_grade,
                        "is_work_for_fees": is_work_for_fees,
                        "work_area": work_area,
                        "hours_pledged": hours_pledged,
                        "inclusivity_category": inclusivity_category,
                    })

                except Exception as e:
                    errors.append(f"{error_prefix}: {str(e)}")

            if errors:
                raise ValidationError({"detail": "Bulk upload validation failed.", "errors": errors})

            # Check if warning approval is needed
            if new_programs_to_create and not confirm_creation:
                return {
                    "requires_approval": True,
                    "new_programs": list(new_programs_to_create.values())
                }

            # Write transaction
            with transaction.atomic():
                # Process creation of programs, departments, and faculties if needed
                for code_l, info in new_programs_to_create.items():
                    # Get or create Faculty
                    fac_name = info['faculty']
                    faculty_obj = fac_cache.get(fac_name.lower())
                    if not faculty_obj:
                        faculty_obj = Faculty.objects.create(
                            institution_id=institution_id,
                            name=fac_name,
                            description="Auto-created via Student Upload"
                        )
                        fac_cache[fac_name.lower()] = faculty_obj

                    # Get or create Department
                    dept_name = info['department']
                    dept_key = (faculty_obj.id, dept_name.lower())
                    department_obj = dept_cache.get(dept_key)
                    if not department_obj:
                        department_obj = Department.objects.create(
                            faculty=faculty_obj,
                            name=dept_name,
                            code=dept_name[:3].upper().replace(' ', ''),
                            description="Auto-created via Student Upload"
                        )
                        dept_cache[dept_key] = department_obj

                    # Create Program
                    program_obj = Program.objects.create(
                        department=department_obj,
                        name=info['name'],
                        code=info['code'],
                        duration=4,
                        level=info['level'] if info['level'] in ['Certificate', 'Diploma', 'Degree', 'Postgraduate'] else 'Degree',
                        levels=[info['level']],
                        category=info['category'],
                        categories=[info['category']],
                        description="Auto-created via Student Upload"
                    )
                    prog_cache[code_l] = program_obj

                # Create Students
                for r in rows_to_process:
                    program_obj = prog_cache.get(r['program_code'].lower())
                    
                    student = Student(
                        institution_id=institution_id,
                        student_id=r['student_id'],
                        first_name=r['first_name'],
                        last_name=r['last_name'],
                        national_id=r['national_id'],
                        gender=r['gender'],
                        date_of_birth=r['date_of_birth'],
                        enrollment_year=r['enrollment_year'],
                        enrollment_semester=r['enrollment_semester'],
                        program=program_obj,
                        faculty=program_obj.department.faculty if program_obj else None,
                        department=program_obj.department if program_obj else None,
                        status=r['status'],
                        dropout_reason=r['dropout_reason'],
                        graduation_year=r['graduation_year'],
                        final_grade=r['final_grade'],
                        is_work_for_fees=r['is_work_for_fees'],
                        work_area=r['work_area'],
                        hours_pledged=r['hours_pledged'],
                        inclusivity_category=r['inclusivity_category']
                    )
                    
                    # Call save-related validations
                    # (Already validated in the first loop)
                    students_to_create.append(student)

                Student.objects.bulk_create(students_to_create)

            return {
                "requires_approval": False,
                "count": len(students_to_create)
            }

        except ValidationError:
            raise
        except Exception as e:
            raise ValidationError(f"Processing error: {str(e)}")