from django.db import transaction
from django.core.exceptions import ValidationError
from ..models import Student
import pandas as pd
from faculties.models import Department, Faculty, Program
from django.forms.models import model_to_dict


class StudentService:
    @staticmethod
    def _validate_student_data(data):
        """Helper to validate conditional fields based on model constraints"""
        if data.get('is_work_for_fees'):
            # 1. Validate work_area is present
            if not data.get('work_area'):
                raise ValidationError("Work area is required if student is working for fees.")
            
            # 2. VALIDATION FIX: Ensure the work_area is a valid choice
            # Using dict to get the first element of the tuple in WORK_AREAS
            valid_work_areas = [choice[0] for choice in Student.WORK_AREAS]
            if data.get('work_area') not in valid_work_areas:
                raise ValidationError(f"Invalid work area: {data.get('work_area')}")

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

        if validated_data.get('status') == 'Graduated':
            if not validated_data.get('graduation_year'):
                raise ValidationError("Graduation year is required for graduated students.")
            if not validated_data.get('final_grade'):
                raise ValidationError("Final grade is required for graduated students.")

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
    def bulk_create_from_file(file, institution_id):
        """
        Parses an Excel/CSV file and enrolls students.
        """
        try:
            # ---------------- READ FILE ----------------
            if file.name.endswith('.csv'):
                df = pd.read_csv(file)
            else:
                df = pd.read_excel(file)

            df.columns = [c.strip().lower().replace(' ', '_') for c in df.columns]

            # ---------------- CACHES ----------------
            fac_cache = {f.name.lower(): f for f in Faculty.objects.filter(institution_id=institution_id)}
            dept_cache = {(d.faculty_id, d.name.lower()): d for d in Department.objects.filter(
                faculty__institution_id=institution_id
            )}
            prog_cache = {}
            for p in Program.objects.filter(department__faculty__institution_id=institution_id):
                prog_cache[(p.department_id, p.code.lower())] = p
                prog_cache[(p.department_id, p.name.lower())] = p

            existing_ids = set(
                Student.objects.filter(institution_id=institution_id)
                .values_list('student_id', flat=True)
            )

            students_to_create = []
            errors = []

            GRADE_MAP = {
                'distinction': 'Distinction',
                'credit': 'Credit',
                'pass': 'Pass',
                'fail': 'Fail',
            }

            label_to_code = {label.lower(): code for code, label in Student.DROPOUT_REASONS}

            # ---------------- PROCESS ROWS ----------------
            for index, row in df.iterrows():
                row_num = index + 2
                try:
                    student_id = str(row.get('student_id', '')).strip()
                    if not student_id:
                        continue

                    if student_id in existing_ids:
                        errors.append(f"Row {row_num}: Student ID '{student_id}' already exists.")
                        continue

                    # -------- Faculty --------
                    raw_fac = str(row.get('faculty', 'General')).strip()
                    faculty_obj = fac_cache.get(raw_fac.lower())
                    if not faculty_obj:
                        faculty_obj = Faculty.objects.create(
                            institution_id=institution_id,
                            name=raw_fac,
                            description="Auto-created via Student Upload"
                        )
                        fac_cache[raw_fac.lower()] = faculty_obj

                    # -------- Department --------
                    raw_dept = str(row.get('department', 'General Department')).strip()
                    dept_key = (faculty_obj.id, raw_dept.lower())
                    department_obj = dept_cache.get(dept_key)
                    if not department_obj:
                        department_obj = Department.objects.create(
                            faculty=faculty_obj,
                            name=raw_dept,
                            code=raw_dept[:3].upper(),
                            description="Auto-created via Student Upload"
                        )
                        dept_cache[dept_key] = department_obj

                    # -------- Program --------
                    raw_prog = str(row.get('program', 'General Course')).strip()
                    prog_key = (department_obj.id, raw_prog.lower())
                    program_obj = prog_cache.get(prog_key)
                    if not program_obj:
                        program_obj = Program.objects.create(
                            department=department_obj,
                            name=raw_prog,
                            code=raw_prog[:6].upper().replace(' ', ''),
                            duration=4,
                            level='Bachelors',
                            description="Auto-created via Student Upload"
                        )
                        prog_cache[prog_key] = program_obj

                    # -------- Status / Dropout --------
                    status = str(row.get('status', 'Active')).capitalize()
                    dropout_raw = str(row.get('dropout_reason', '')).strip().lower()
                    dropout_reason = label_to_code.get(dropout_raw) if status == 'Dropout' else None

                    # -------- Graduation Year --------
                    grad_year = None
                    if pd.notna(row.get('graduation_year')):
                        grad_year = int(row.get('graduation_year'))

                    # -------- Final Grade --------
                    raw_grade = str(row.get('final_grade', '')).strip().lower()
                    final_grade = GRADE_MAP.get(raw_grade) if raw_grade else None

                    # -------- Work for Fees Fields --------
                    is_work_for_fees = bool(row.get('is_work_for_fees', False))
                    work_area = row.get('work_area')
                    hours_pledged = row.get('hours_pledged') or 0

                    # -------- Create Student --------
                    student = Student(
                        institution_id=institution_id,
                        student_id=student_id,
                        first_name=row.get('first_name'),
                        last_name=row.get('last_name'),
                        national_id=row.get('national_id'),
                        gender=str(row.get('gender', 'Other')).capitalize(),
                        enrollment_year=row.get('enrollment_year') or 2025,
                        program=program_obj,
                        status=status,
                        dropout_reason=dropout_reason,
                        graduation_year=grad_year,
                        final_grade=final_grade,
                        is_work_for_fees=is_work_for_fees,
                        work_area=work_area,
                        hours_pledged=hours_pledged,
                    )

                    # Run custom validation on the temporary object
                    StudentService._validate_student_data(model_to_dict(student))

                    students_to_create.append(student)
                    existing_ids.add(student_id)

                except Exception as e:
                    errors.append(f"Row {row_num}: {str(e)}")

            if errors:
                raise ValidationError({"detail": "Bulk upload failed.", "errors": errors})

            with transaction.atomic():
                Student.objects.bulk_create(students_to_create)

            return len(students_to_create)

        except ValidationError:
            raise
        except Exception as e:
            raise ValidationError(f"Processing error: {str(e)}")