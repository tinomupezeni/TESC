from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Sum, Q

from .models import IseopProgram, IseopStudent
from .serializers import (
    IseopProgramSerializer,
    IseopStudentSerializer,
    IseopStudentCreateSerializer,
    IseopStatsSerializer
)


class IseopProgramViewSet(viewsets.ModelViewSet):
    """
    ViewSet for ISEOP Programs CRUD operations.
    Programs are filtered by institution.
    """
    serializer_class = IseopProgramSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = IseopProgram.objects.all()

        # Filter by institution_id from query params or user's institution
        institution_id = self.request.query_params.get('institution_id')
        if institution_id:
            queryset = queryset.filter(institution_id=institution_id)
        elif hasattr(user, 'institution_user') and user.institution_user:
            queryset = queryset.filter(institution=user.institution_user.institution)

        return queryset.order_by('-created_at')

    def perform_create(self, serializer):
        # Auto-assign institution from user if not provided
        user = self.request.user
        if hasattr(user, 'institution_user') and user.institution_user:
            serializer.save(institution=user.institution_user.institution)
        else:
            serializer.save()


class IseopStudentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for ISEOP Students - community members enrolled in ISEOP programs.
    These are NOT formal institutional students.
    """
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action in ['create']:
            return IseopStudentCreateSerializer
        return IseopStudentSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = IseopStudent.objects.select_related('institution', 'program')

        # Filter by institution_id from query params or user's institution
        institution_id = self.request.query_params.get('institution_id')
        if institution_id:
            queryset = queryset.filter(institution_id=institution_id)
        elif hasattr(user, 'institution_user') and user.institution_user:
            queryset = queryset.filter(institution=user.institution_user.institution)

        # Filter by program
        program_id = self.request.query_params.get('program_id')
        if program_id:
            queryset = queryset.filter(program_id=program_id)

        # Search by name or national_id
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(national_id__icontains=search) |
                Q(phone__icontains=search)
            )

        # Filter by status
        student_status = self.request.query_params.get('status')
        if student_status:
            queryset = queryset.filter(status=student_status)

        # Filter by work_for_fees
        is_work_for_fees = self.request.query_params.get('is_work_for_fees')
        if is_work_for_fees:
            queryset = queryset.filter(is_work_for_fees=is_work_for_fees.lower() == 'true')

        return queryset.order_by('-created_at')

    def perform_create(self, serializer):
        # Auto-assign institution from user if not provided
        user = self.request.user
        if hasattr(user, 'institution_user') and user.institution_user:
            serializer.save(institution=user.institution_user.institution)
        else:
            serializer.save()

        # Update program occupied count
        student = serializer.instance
        program = student.program
        program.occupied = program.students.filter(status='Active').count()
        program.save()

    def perform_destroy(self, instance):
        program = instance.program
        instance.delete()
        # Update program occupied count
        program.occupied = program.students.filter(status='Active').count()
        program.save()


class IseopStatsViewSet(viewsets.ViewSet):
    """
    ViewSet for ISEOP statistics and dashboard data.
    """
    permission_classes = [IsAuthenticated]

    def list(self, request):
        """Get ISEOP statistics for dashboard."""
        user = request.user
        institution_id = request.query_params.get('institution_id')

        # Base querysets
        programs = IseopProgram.objects.all()
        students = IseopStudent.objects.all()

        # Filter by institution_id from query params or user's institution
        if institution_id:
            programs = programs.filter(institution_id=institution_id)
            students = students.filter(institution_id=institution_id)
        elif hasattr(user, 'institution_user') and user.institution_user:
            programs = programs.filter(institution=user.institution_user.institution)
            students = students.filter(institution=user.institution_user.institution)

        # Calculate program stats
        total_programs = programs.count()
        active_programs = programs.filter(status='Active').count()
        total_capacity = programs.aggregate(total=Sum('capacity'))['total'] or 0
        total_occupied = programs.aggregate(total=Sum('occupied'))['total'] or 0

        # Calculate student stats
        total_students = students.count()
        active_students = students.filter(status='Active').count()
        completed_students = students.filter(status='Completed').count()
        work_for_fees_count = students.filter(is_work_for_fees=True).count()

        # Work area breakdown
        work_area_stats = students.filter(
            is_work_for_fees=True,
            work_area__isnull=False
        ).exclude(work_area='').values('work_area').annotate(count=Count('id'))

        # Gender breakdown
        gender_stats = students.values('gender').annotate(count=Count('id'))

        # Status breakdown
        status_stats = students.values('status').annotate(count=Count('id'))

        # Program breakdown (students per program)
        program_stats = students.values(
            'program__name'
        ).annotate(count=Count('id')).order_by('-count')[:10]

        return Response({
            'programs': {
                'total': total_programs,
                'active': active_programs,
                'capacity': total_capacity,
                'occupied': total_occupied,
                'utilization': round((total_occupied / total_capacity * 100), 1) if total_capacity > 0 else 0
            },
            'students': {
                'total': total_students,
                'active': active_students,
                'completed': completed_students,
                'work_for_fees': work_for_fees_count,
            },
            'work_areas': list(work_area_stats),
            'gender_breakdown': list(gender_stats),
            'status_breakdown': list(status_stats),
            'program_breakdown': [
                {'program': item['program__name'], 'count': item['count']}
                for item in program_stats
            ],
        })
