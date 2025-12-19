from django.utils import timezone
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from .models import ReportTemplate, GeneratedReport
from .serializers import (
    ReportTemplateSerializer,
    GeneratedReportSerializer,
    ReportGenerationRequestSerializer
)

# --- Report Templates View ---
class ReportTemplateViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ReportTemplate.objects.filter(is_active=True)
    serializer_class = ReportTemplateSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['name', 'description', 'category']
    filterset_fields = ['category']

    @action(detail=False, methods=['get'])
    def categories(self, request):
        categories = ReportTemplate.objects.filter(is_active=True)\
            .values_list('category', flat=True)\
            .distinct()
        return Response(list(categories))


# --- Generated Reports View ---
class GeneratedReportViewSet(viewsets.ModelViewSet):
    serializer_class = GeneratedReportSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    ordering_fields = ['requested_at']
    ordering = ['-requested_at']

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return GeneratedReport.objects.all()
        return GeneratedReport.objects.filter(generated_by=user)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    # --- Generate Report ---
    @action(detail=False, methods=['post'])
    def generate(self, request):
        serializer = ReportGenerationRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        template = ReportTemplate.objects.get(id=data['template_id'], is_active=True)

        # Build report title
        report_title = f"{template.name} - {timezone.now().strftime('%Y-%m-%d %H:%M')}"

        # Generate report data based on template
        report_data = self._generate_report_data(template, data.get('parameters', {}))

        report = GeneratedReport.objects.create(
            title=report_title,
            template=template,
            generated_by=request.user,
            format=data.get('format', template.default_format),
            status='completed',
            requested_at=timezone.now(),
            report_data=report_data  # Store the data
        )

        return Response(
            GeneratedReportSerializer(report, context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )

    def _generate_report_data(self, template, parameters):
    
        if template.category == 'enrollment':
            data = self._generate_enrollment_data(parameters)
        elif template.category == 'academic':
            data = self._generate_academic_data(parameters)
        elif template.category == 'staff':
            data = self._generate_staff_data(parameters)
        elif template.category == 'financial':
            data = self._generate_financial_data(parameters)
        else:
            data = {
                "title": template.name,
                "generated_at": timezone.now().isoformat(),
                "parameters": parameters,
                "data": []  # Default empty array
            }
    
         # Ensure 'data' property exists
        if 'data' not in data:
            data['data'] = []  # Add empty data array if not present
    
            return data


    def _generate_enrollment_data(self, parameters):
        """Example: Generate enrollment report data"""
        # In reality, you would query your database here
        period = parameters.get('period', 'current')
        
        # Mock data - replace with actual database queries
        return {
            "title": "Enrollment Statistics",
            "period": period,
            "summary": {
                "total_students": 1250,
                "new_enrollments": 150,
                "graduated": 75,
                "dropouts": 12
            },
            "by_program": [
                {"program": "Computer Science", "count": 300},
                {"program": "Engineering", "count": 250},
                {"program": "Business", "count": 400},
                {"program": "Medicine", "count": 200},
                {"program": "Arts", "count": 100}
            ],
            "trends": [
                {"month": "Jan", "enrollments": 100},
                {"month": "Feb", "enrollments": 120},
                {"month": "Mar", "enrollments": 150},
                {"month": "Apr", "enrollments": 130}
            ]
        }

    def _generate_academic_data(self, parameters):
        """Example: Generate academic performance data"""
        return {
            "title": "Academic Performance Report",
            "summary": {
                "average_gpa": 3.2,
                "pass_rate": 85.5,
                "top_performer": "John Doe (GPA: 4.0)"
            },
            "performance_by_subject": [
                {"subject": "Mathematics", "average": 75, "pass_rate": 80},
                {"subject": "Physics", "average": 68, "pass_rate": 75},
                {"subject": "Chemistry", "average": 72, "pass_rate": 78}
            ]
        }

    def _generate_staff_data(self, parameters):
        """Example: Generate staff analytics data"""
        return {
            "title": "Staff Analytics Report",
            "summary": {
                "total_staff": 150,
                "faculty": 100,
                "administrative": 50
            },
            "by_department": [
                {"department": "Computer Science", "count": 20},
                {"department": "Engineering", "count": 25},
                {"department": "Business", "count": 30}
            ]
        }

    def _generate_financial_data(self, parameters):
        """Example: Generate financial report data"""
        return {
            "title": "Financial Overview",
            "summary": {
                "total_revenue": 5000000,
                "total_expenses": 3500000,
                "net_profit": 1500000
            },
            "revenue_by_program": [
                {"program": "Engineering", "revenue": 2000000},
                {"program": "Medicine", "revenue": 1500000},
                {"program": "Business", "revenue": 1000000}
            ]
        }

    # --- Stats Endpoint ---
    @action(detail=False, methods=['get'])
    def stats(self, request):
        queryset = self.get_queryset()

        # By category
        by_category = {}
        for report in queryset:
            if report.template:
                cat = report.template.category
                by_category[cat] = by_category.get(cat, 0) + 1

        # By status
        by_status = {}
        for status_choice in GeneratedReport.STATUS_CHOICES:
            code = status_choice[0]
            by_status[code] = queryset.filter(status=code).count()

        # Recent reports
        recent_reports = queryset.order_by('-requested_at')[:5]

        return Response({
            'total_reports': queryset.count(),
            'by_category': by_category,
            'by_status': by_status,
            'recent_reports': GeneratedReportSerializer(
                recent_reports, many=True, context={'request': request}
            ).data
        })

    # --- Remove the download endpoint (frontend handles PDF generation) ---
    # The download action is removed since frontend will generate PDFs