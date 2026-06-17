from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework.exceptions import ValidationError
from django.http import HttpResponse
from openpyxl import Workbook
from openpyxl.worksheet.datavalidation import DataValidation
from django.db.models import F, ExpressionWrapper, BooleanField, Q
from django.db import transaction
from datetime import date
import pandas as pd

from core.mixins import InstitutionalIsolationMixin
from ..models import Student, STUDENT_GENDERS
from faculties.models import Program, Department

# We'll use the existing Student models and serializers but build custom logic for graduates.
class GraduateViewSet(InstitutionalIsolationMixin, viewsets.ViewSet):
    """
    ViewSet dedicated to managing Graduates (Bulk upload, Bulk actions, Auto-graduation).
    Inherits from InstitutionalIsolationMixin to enforce data isolation.
    """
    institution_lookup_path = 'institution'

    def get_queryset(self):
        # Base queryset isolated by mixin
        queryset = Student.objects.all()
        request = self.request
        user = request.user

        if user.is_authenticated and user.is_superuser:
            return queryset
        if not user.is_authenticated or not hasattr(user, 'institution') or not user.institution:
            return queryset.none()
            
        return queryset.filter(institution=user.institution)

    @action(detail=False, methods=['get'], url_path='template')
    def download_template(self, request):
        """
        Generates a dynamic Excel template for bulk graduate uploads.
        Includes data validation (dropdowns) for specific fields.
        """
        wb = Workbook()
        ws = wb.active
        ws.title = "Graduates_Template"

        # Define columns
        columns = [
            "Student ID", "National ID", "First Name", "Last Name", 
            "Gender", "Program Code", "Enrollment Year", "Graduation Year", "Final Grade"
        ]
        ws.append(columns)

        # 1. Gender Validation
        gender_options = [g[0] for g in STUDENT_GENDERS]
        dv_gender = DataValidation(type="list", formula1=f'"{",".join(gender_options)}"', allow_blank=True)
        dv_gender.error ='Your entry is not in the list'
        dv_gender.errorTitle = 'Invalid Entry'
        dv_gender.prompt = 'Please select from the list'
        dv_gender.promptTitle = 'Select Gender'
        ws.add_data_validation(dv_gender)
        # Apply to column E (Gender) from row 2 to 1000
        dv_gender.add('E2:E1000')

        # 2. Final Grade Validation
        grade_options = ['Distinction', 'Credit', 'Pass', 'Fail']
        dv_grade = DataValidation(type="list", formula1=f'"{",".join(grade_options)}"', allow_blank=True)
        dv_grade.error ='Your entry is not in the list'
        dv_grade.errorTitle = 'Invalid Entry'
        dv_grade.prompt = 'Please select from the list'
        dv_grade.promptTitle = 'Select Grade'
        ws.add_data_validation(dv_grade)
        # Apply to column I (Final Grade) from row 2 to 1000
        dv_grade.add('I2:I1000')

        # Formatting header
        for cell in ws[1]:
            cell.font = cell.font.copy(bold=True)

        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename=Graduates_Bulk_Upload_Template.xlsx'
        wb.save(response)
        return response

    @action(detail=False, methods=['post'], url_path='bulk-actions', parser_classes=[JSONParser])
    def bulk_actions(self, request):
        """
        Handles bulk delete or revert status for graduates.
        Payload: { "student_ids": [1, 2, 3], "action": "delete" | "revert" }
        """
        student_ids = request.data.get('student_ids', [])
        action_type = request.data.get('action')

        if not student_ids or not isinstance(student_ids, list):
            return Response({"detail": "Invalid or missing 'student_ids' list."}, status=status.HTTP_400_BAD_REQUEST)

        # Ensure we only act on students belonging to the user's institution
        queryset = self.get_queryset().filter(id__in=student_ids, status='Graduated')

        if action_type == 'delete':
            count, _ = queryset.delete()
            return Response({"message": f"Successfully deleted {count} records."})
        
        elif action_type == 'revert':
            count = queryset.update(status='Active', graduation_year=None, final_grade=None)
            return Response({"message": f"Successfully reverted {count} students back to Active status."})
        
        else:
            return Response({"detail": "Invalid action. Choose 'delete' or 'revert'."}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], url_path='bulk-upload', parser_classes=[MultiPartParser, FormParser])
    def bulk_upload(self, request):
        """
        Handles the Excel upload for graduates.
        Updates existing students to 'Graduated' or creates new historical records.
        """
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({"detail": "File is required."}, status=status.HTTP_400_BAD_REQUEST)

        institution = getattr(request.user, 'institution', None)
        if not institution:
            return Response({"detail": "User is not associated with an institution."}, status=status.HTTP_403_FORBIDDEN)

        try:
            if file_obj.name.endswith('.csv'):
                df = pd.read_csv(file_obj)
            else:
                df = pd.read_excel(file_obj)

            df.columns = [c.strip().lower().replace(' ', '_') for c in df.columns]

            # Cache programs by code
            prog_cache = {
                p.code.lower(): p 
                for p in Program.objects.filter(department__faculty__institution=institution)
            }

            errors = []
            updated_count = 0
            created_count = 0

            with transaction.atomic():
                for index, row in df.iterrows():
                    row_num = index + 2
                    try:
                        student_id = str(row.get('student_id', '')).strip()
                        if not student_id or pd.isna(row.get('student_id')):
                            continue

                        grad_year = row.get('graduation_year')
                        final_grade = str(row.get('final_grade', '')).strip()

                        if pd.isna(grad_year) or not final_grade or final_grade.lower() == 'nan':
                            errors.append(f"Row {row_num}: Graduation Year and Final Grade are required.")
                            continue

                        # Check if student exists in this institution
                        student = self.get_queryset().filter(student_id=student_id).first()

                        if student:
                            # Update existing student
                            student.status = 'Graduated'
                            student.graduation_year = int(grad_year)
                            student.final_grade = final_grade
                            student.save()
                            updated_count += 1
                        else:
                            # Create historical record
                            prog_code = str(row.get('program_code', '')).strip().lower()
                            program = prog_cache.get(prog_code)
                            
                            if not program:
                                errors.append(f"Row {row_num}: Program code '{prog_code}' not found in your institution.")
                                continue

                            Student.objects.create(
                                institution=institution,
                                student_id=student_id,
                                national_id=row.get('national_id'),
                                first_name=row.get('first_name'),
                                last_name=row.get('last_name'),
                                gender=row.get('gender', 'Other'),
                                enrollment_year=row.get('enrollment_year', int(grad_year)-program.duration),
                                program=program,
                                status='Graduated',
                                graduation_year=int(grad_year),
                                final_grade=final_grade
                            )
                            created_count += 1

                    except Exception as e:
                        errors.append(f"Row {row_num}: {str(e)}")

            if errors:
                return Response({"detail": "Bulk upload completed with errors.", "errors": errors, "updated": updated_count, "created": created_count}, status=status.HTTP_207_MULTI_STATUS)

            return Response({
                "message": f"Successfully processed graduates.",
                "updated": updated_count,
                "created": created_count
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'], url_path='eligible')
    def eligible_for_graduation(self, request):
        """
        Finds cohorts of students whose enrollment_year + program_duration <= current_year
        and are still 'Active'. Grouped by Program.
        """
        current_year = date.today().year
        
        # Annotate expected graduation year and filter active students
        eligible_students = self.get_queryset().filter(status='Active').annotate(
            expected_grad_year=F('enrollment_year') + F('program__duration')
        ).filter(expected_grad_year__lte=current_year).select_related('program')

        # Group by program
        cohorts = {}
        for student in eligible_students:
            prog_id = student.program.id
            if prog_id not in cohorts:
                cohorts[prog_id] = {
                    "program_id": prog_id,
                    "program_name": student.program.name,
                    "program_code": student.program.code,
                    "expected_year": student.expected_grad_year,
                    "student_count": 0,
                    "students": []
                }
            
            cohorts[prog_id]["student_count"] += 1
            cohorts[prog_id]["students"].append({
                "id": student.id,
                "student_id": student.student_id,
                "full_name": student.full_name,
                "enrollment_year": student.enrollment_year,
            })

        return Response(list(cohorts.values()))

    @action(detail=False, methods=['post'], url_path='confirm-auto', parser_classes=[JSONParser])
    def confirm_auto_graduation(self, request):
        """
        Confirms graduation for a cohort.
        Payload: {
            "program_id": 1,
            "expected_year": 2024,
            "excluded_student_ids": [5, 10], # IDs of students who failed/deferred
            "default_grade": "Pass" # Or can require individual grading later
        }
        """
        program_id = request.data.get('program_id')
        expected_year = request.data.get('expected_year')
        excluded_ids = request.data.get('excluded_student_ids', [])
        default_grade = request.data.get('default_grade', 'Pass')

        if not program_id or not expected_year:
            return Response({"detail": "program_id and expected_year are required."}, status=status.HTTP_400_BAD_REQUEST)

        # Get the eligible students for this program
        students_to_graduate = self.get_queryset().filter(
            status='Active',
            program_id=program_id
        ).annotate(
            expected_grad_year=F('enrollment_year') + F('program__duration')
        ).filter(
            expected_grad_year=expected_year
        ).exclude(
            id__in=excluded_ids
        )

        count = students_to_graduate.update(
            status='Graduated',
            graduation_year=expected_year,
            final_grade=default_grade
        )

        return Response({"message": f"Successfully graduated {count} students."})
