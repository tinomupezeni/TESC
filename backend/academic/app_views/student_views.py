from jsonschema import ValidationError
from rest_framework import viewsets, status, filters, serializers
from core.mixins import InstitutionalIsolationMixin
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db.models import Count, Q, Sum, F, DecimalField, ExpressionWrapper, BooleanField
from django.db.models.functions import Coalesce
from collections import OrderedDict
from datetime import date

from ..models import Student
from ..serializers.student_serializers import StudentSerializer
from ..services.student_services import StudentService
from ..services.analysis_services import AnalysisService
from faculties.models import Program, PROGRAM_CATEGORIES # Import Program and its choices

COLOR_MAP = {
    'Financial': '#f87171',
    'Academic': '#60a5fa',
    'Medical': '#34d399',
    'Personal': '#fbbf24',
    'Transfer': '#a78bfa',
    'Other': '#cbd5e1',
}

# Define STEM categories from PROGRAM_CATEGORIES
STEM_CATEGORIES = [choice[0] for choice in PROGRAM_CATEGORIES if choice[0] in ['STEM']] # Add more STEM categories as needed

class StudentViewSet(InstitutionalIsolationMixin, viewsets.ModelViewSet):
    """
    ViewSet for managing Students.
    """
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    institution_lookup_path = 'institution'
    filter_backends = [filters.SearchFilter]
    search_fields = ['first_name', 'last_name', 'student_id', 'national_id']
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get_queryset(self):
        """
        Optimize queries and calculate financial balances in one database call.
        """
        queryset = super().get_queryset().select_related('institution', 'program')

        program_id = self.request.query_params.get('program_id') or self.request.query_params.get('program')
        if program_id:
            queryset = queryset.filter(program_id=program_id)

        return queryset.annotate(
            semester_fee=Coalesce(
                F('program__semester_fee'),
                0,
                output_field=DecimalField()
            ),
            total_paid=Coalesce(
                Sum('payments__amount'),
                0,
                output_field=DecimalField()
            )
        )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        except DjangoValidationError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def perform_create(self, serializer):
        instance = StudentService.create_student(serializer.validated_data)
        serializer.instance = instance

    def perform_update(self, serializer):
        try:
            StudentService.update_student(serializer.instance, serializer.validated_data)
        except DjangoValidationError as e:
            raise serializers.ValidationError(
                e.message_dict if hasattr(e, 'message_dict') else str(e)
            )

    def destroy(self, _request, *args, **kwargs):
        instance = self.get_object()
        try:
            StudentService.delete_student(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except DjangoValidationError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], url_path='bulk_upload')
    def bulk_upload(self, request):
        file_obj = request.FILES.get('file')
        institution_id = request.data.get('institution_id')
        confirm_creation = request.data.get('confirm_creation') == 'true' or request.data.get('confirm_creation') is True

        if not file_obj:
            return Response({"detail": "File is required."}, status=status.HTTP_400_BAD_REQUEST)

        if not institution_id and hasattr(request.user, 'institution'):
            institution_id = request.user.institution.id

        try:
            result = StudentService.bulk_create_from_file(file_obj, institution_id, confirm_creation=confirm_creation)
            if isinstance(result, dict) and result.get("requires_approval"):
                return Response(
                    {
                        "requires_approval": True,
                        "new_programs": result["new_programs"],
                        "message": "Some programs in the uploaded file do not exist. Please approve to create them."
                    },
                    status=status.HTTP_200_OK
                )
            count = result.get("count", 0) if isinstance(result, dict) else result
            return Response(
                {"message": f"Successfully enrolled {count} students."},
                status=status.HTTP_201_CREATED
            )
        except (DjangoValidationError, serializers.ValidationError) as e:
            error_data = {}
            if hasattr(e, 'message_dict') and e.message_dict:
                error_data = e.message_dict
            elif hasattr(e, 'detail'):
                error_data = {"detail": e.detail}
            elif hasattr(e, 'messages'):
                error_data = {"detail": "Validation error", "errors": e.messages}
            else:
                error_data = {"detail": str(e)}
            return Response(error_data, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'], url_path='bulk_upload_template')
    def bulk_upload_template(self, request):
        """
        Generates a dynamic Excel template for bulk student uploads.
        Includes data validation (dropdowns) for specific choices to prevent GIGO.
        """
        from django.http import HttpResponse
        from openpyxl import Workbook
        from openpyxl.worksheet.datavalidation import DataValidation

        wb = Workbook()
        ws = wb.active
        ws.title = "Students_Template"

        # Define columns matching the schema fields
        columns = [
            "Student ID", "First Name", "Last Name", "Gender", "Enrollment Year",
            "Enrollment Semester", "National ID", "Date of Birth", "Faculty", "Department",
            "Program Name", "Program Code", "Status", "Dropout Reason", "Is Work For Fees",
            "Work Area", "Hours Pledged", "Inclusivity Category", "Disability Specifications"
        ]
        ws.append(columns)

        # 1. Gender Validation (Male, Female)
        dv_gender = DataValidation(type="list", formula1='"Male,Female"', allow_blank=False)
        dv_gender.error ='Your entry is not in the list (Male or Female)'
        dv_gender.errorTitle = 'Invalid Gender'
        dv_gender.prompt = 'Please select Gender'
        dv_gender.promptTitle = 'Gender'
        ws.add_data_validation(dv_gender)
        dv_gender.add('D2:D1000')

        # 2. Status Validation
        status_options = ["Active", "Attachment", "Graduated", "Suspended", "Deferred", "Dropout"]
        dv_status = DataValidation(type="list", formula1=f'"{",".join(status_options)}"', allow_blank=True)
        dv_status.error ='Your entry is not in the list'
        dv_status.errorTitle = 'Invalid Status'
        ws.add_data_validation(dv_status)
        dv_status.add('M2:M1000')

        # 3. Is Work For Fees Validation
        dv_work_fees = DataValidation(type="list", formula1='"TRUE,FALSE"', allow_blank=True)
        dv_work_fees.error ='Must be TRUE or FALSE'
        dv_work_fees.errorTitle = 'Invalid Selection'
        ws.add_data_validation(dv_work_fees)
        dv_work_fees.add('O2:O1000')

        # 4. Enrollment Semester Validation
        dv_semester = DataValidation(type="list", formula1='"Semester 1,Semester 2"', allow_blank=False)
        dv_semester.error ='Must be Semester 1 or Semester 2'
        dv_semester.errorTitle = 'Invalid Semester'
        ws.add_data_validation(dv_semester)
        dv_semester.add('F2:F1000')

        # Formatting header to bold
        for cell in ws[1]:
            cell.font = cell.font.copy(bold=True)

        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename=Student_Upload_Template.xlsx'
        wb.save(response)
        return response

    @action(detail=False, methods=['get'], url_path='stem-students')
    def stem_students(self, request):
        institution_id = request.query_params.get('institution_id')
        search_query = request.query_params.get('search')

        queryset = self.get_queryset().filter(
            Q(program__categories__contains='STEM') |
            Q(program__categories__contains=['STEM']) |
            Q(program__category='STEM') |
            Q(selected_category='STEM')
        )

        if institution_id:
            queryset = queryset.filter(institution_id=institution_id)
        if search_query:
            queryset = queryset.filter(
                Q(first_name__icontains=search_query) |
                Q(last_name__icontains=search_query) |
                Q(student_id__icontains=search_query) |
                Q(program__name__icontains=search_query)
            )

        total_students = queryset.count()
        male_students = queryset.filter(gender='Male').count()
        female_students = queryset.filter(gender='Female').count()

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response({
                "total_students": total_students,
                "male_students": male_students,
                "female_students": female_students,
                "results": serializer.data
            })

        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "total_students": total_students,
            "male_students": male_students,
            "female_students": female_students,
            "results": serializer.data
        })

    @action(detail=False, methods=['get'], url_path='specialized-students')
    def specialized_students(self, request):
        institution_id = request.query_params.get('institution_id')
        search_query = request.query_params.get('search')

        queryset = self.get_queryset().filter(
            Q(program__is_specialized_skill=True) |
            Q(selected_category='SPECIALIZED')
        )

        if institution_id:
            queryset = queryset.filter(institution_id=institution_id)
        if search_query:
            queryset = queryset.filter(
                Q(first_name__icontains=search_query) |
                Q(last_name__icontains=search_query) |
                Q(student_id__icontains=search_query) |
                Q(program__name__icontains=search_query)
            )

        total_students = queryset.count()
        male_students = queryset.filter(gender='Male').count()
        female_students = queryset.filter(gender='Female').count()

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response({
                "total_students": total_students,
                "male_students": male_students,
                "female_students": female_students,
                "results": serializer.data
            })

        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "total_students": total_students,
            "male_students": male_students,
            "female_students": female_students,
            "results": serializer.data
        })

    @action(detail=False, methods=['get'], url_path='critical-students')
    def critical_students(self, request):
        institution_id = request.query_params.get('institution_id')
        search_query = request.query_params.get('search')

        queryset = self.get_queryset().filter(
            Q(program__is_critical_skill=True) |
            Q(selected_category='CRITICAL')
        )

        if institution_id:
            queryset = queryset.filter(institution_id=institution_id)
        if search_query:
            queryset = queryset.filter(
                Q(first_name__icontains=search_query) |
                Q(last_name__icontains=search_query) |
                Q(student_id__icontains=search_query) |
                Q(program__name__icontains=search_query)
            )

        total_students = queryset.count()
        male_students = queryset.filter(gender='Male').count()
        female_students = queryset.filter(gender='Female').count()

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response({
                "total_students": total_students,
                "male_students": male_students,
                "female_students": female_students,
                "results": serializer.data
            })

        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "total_students": total_students,
            "male_students": male_students,
            "female_students": female_students,
            "results": serializer.data
        })

    @action(detail=False, methods=['get'], url_path='inclusivity-report')
    def inclusivity_report(self, request):
        institution_id = request.query_params.get('institution_id')
        search_query = request.query_params.get('search')
        queryset = self.get_queryset().exclude(inclusivity_category__in=['None', '', None])

        if institution_id:
            queryset = queryset.filter(institution_id=institution_id)
        if search_query:
            queryset = queryset.filter(
                Q(first_name__icontains=search_query) |
                Q(last_name__icontains=search_query) |
                Q(student_id__icontains=search_query) |
                Q(program__name__icontains=search_query) |
                Q(inclusivity_category__icontains=search_query)
            )

        total_students = queryset.count()
        male_students = queryset.filter(gender='Male').count()
        female_students = queryset.filter(gender='Female').count()

        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "total_students": total_students,
            "male_students": male_students,
            "female_students": female_students,
            "results": serializer.data
        })

    @action(detail=False, methods=['get'], url_path='possible-graduates')
    def possible_graduates(self, request):
        institution_id = request.query_params.get('institution_id')
        search_query = request.query_params.get('search')
        # Logic for eligible but not graduated students
        queryset = self.get_queryset().filter(status='Active').exclude(graduation_year__isnull=False)

        if institution_id:
            queryset = queryset.filter(institution_id=institution_id)
        if search_query:
            queryset = queryset.filter(
                Q(first_name__icontains=search_query) |
                Q(last_name__icontains=search_query) |
                Q(student_id__icontains=search_query) |
                Q(program__name__icontains=search_query)
            )

        total_students = queryset.count()
        male_students = queryset.filter(gender='Male').count()
        female_students = queryset.filter(gender='Female').count()

        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "total_students": total_students,
            "male_students": male_students,
            "female_students": female_students,
            "results": serializer.data
        })

    @action(detail=False, methods=['get'], url_path='completion-stats')
    def completion_stats(self, request):
        """
        Calculates program completion rates based on duration and student status.
        """
        institution_id = request.query_params.get('institution_id')
        current_year = date.today().year
        
        # Statuses indicating the student is still in the system but not finished
        in_progress_statuses = ['Active', 'Attachment', 'Suspended', 'Deferred']

        queryset = Student.objects.select_related('program')

        if institution_id:
            queryset = queryset.filter(institution_id=institution_id)

        # Annotate expected completion year and identify delayed students
        annotated_students = queryset.annotate(
            expected_completion_year=F('enrollment_year') + F('program__duration'),
            is_delayed=ExpressionWrapper(
                Q(expected_completion_year__lt=current_year) & 
                Q(status__in=in_progress_statuses),
                output_field=BooleanField()
            )
        )

        total_students = annotated_students.count()
        delayed_students_count = annotated_students.filter(is_delayed=True).count()
        graduated_count = annotated_students.filter(status='Graduated').count()

        # Calculate Rate
        completion_rate = 0
        if total_students > 0:
            completion_rate = (graduated_count / total_students) * 100

        return Response({
            "total_students": total_students,
            "graduated": graduated_count,
            "in_progress_on_time": total_students - graduated_count - delayed_students_count,
            "in_progress_delayed": delayed_students_count,
            "completion_rate_percentage": round(completion_rate, 1)
        })

    @action(detail=False, methods=['get'], url_path='graduation-stats')
    def graduation_stats(self, request):
        institution_id = request.query_params.get('institution_id')

        queryset = Student.objects.filter(status='Graduated')

        if institution_id:
            queryset = queryset.filter(institution_id=institution_id)

        # 1. Get raw data first
        stats = queryset.values(
            'graduation_year',
            'gender',
            program__name=F('program__name'),
            program__level=F('program__level'),
            # Get the raw code (e.g., 'STEM')
            category_code=F('program__category'), 
            institution_name=F('institution__name'),
            type=F('institution__type'),
        ).annotate(
            total_graduates=Count('id'),
            distinctions=Count('id', filter=Q(final_grade='Distinction')),
            credits=Count('id', filter=Q(final_grade='Credit')),
            passes=Count('id', filter=Q(final_grade='Pass')),
            inclusivity=Count('id', filter=~Q(inclusivity_category__in=['None', '', None]))

        ).order_by('-graduation_year', 'program__name')

        # 2. FIX: Map the raw code to the human-readable label
        # We need to import Program to get the choices
        from faculties.models import Program
        category_map = dict(Program._meta.get_field('category').choices)

        for item in stats:
            if item['graduation_year'] is None:
                item['graduation_year'] = '0'
            
            # Replace code with label
            code = item.pop('category_code')
            item['category'] = category_map.get(code, code)

        return Response(stats)

    @action(detail=False, methods=['get'], url_path='summary-stats')
    def summary_stats(self, request):
        """
        High-level KPI totals for StatsCards.
        """
        institution_id = request.query_params.get('institution_id')
        base_query = Student.objects.all()

        if institution_id:
            base_query = base_query.filter(institution_id=institution_id)

        stats = base_query.aggregate(
            total_students=Count('id'),
            total_graduates=Count('id', filter=Q(status='Graduated')),
            total_distinctions=Count('id', filter=Q(status='Graduated', final_grade='Distinction')),
            males=Count('id', filter=Q(status='Graduated', gender='Male')),
            females=Count('id', filter=Q(status='Graduated', gender='Female')),
        )

        return Response(stats)

    @action(detail=False, methods=['get'], url_path='special-stats')
    def special_stats(self, request):
        institution_id = request.query_params.get('institution_id')
        data = AnalysisService.get_special_enrollment_stats(institution_id)
        return Response(data)

    @action(detail=False, methods=['get'], url_path='financial-stats')
    def financial_stats(self, request):
        institution_id = request.query_params.get('institution_id')
        data = AnalysisService.get_financial_stats(institution_id)
        return Response(data)

    @action(detail=False, methods=['get'], url_path='in-country-transfers')
    def in_country_transfers(self, request):
        from academic.models import InCountryTransfer
        from ..serializers.in_country_transfer_serializers import InCountryTransferSerializer

        institution_id = request.query_params.get('institution_id')
        search_query = request.query_params.get('search')

        queryset = InCountryTransfer.objects.all()

        if institution_id:
            # Assuming InCountryTransfer has a link to institution via student
            queryset = queryset.filter(student__institution_id=institution_id)
            
        if search_query:
            queryset = queryset.filter(
                Q(student__first_name__icontains=search_query) |
                Q(student__last_name__icontains=search_query) |
                Q(student__student_id__icontains=search_query) |
                Q(from_institution__icontains=search_query) |
                Q(to_institution__icontains=search_query)
            )

        serializer = InCountryTransferSerializer(queryset, many=True)
        return Response({"results": serializer.data})