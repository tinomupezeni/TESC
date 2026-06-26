from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from ..models import StudentScholarship
from ..serializers.scholarship_serializers import StudentScholarshipSerializer
from rest_framework import filters
from django_filters.rest_framework import DjangoFilterBackend

class StudentScholarshipViewSet(viewsets.ModelViewSet):
    serializer_class = StudentScholarshipSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['year_awarded', 'student', 'student__institution']
    search_fields = ['provider_name', 'student__first_name', 'student__last_name', 'student__student_id']
    ordering_fields = ['year_awarded', 'amount', 'created_at']
    ordering = ['-year_awarded', 'provider_name']

    def get_queryset(self):
        user = self.request.user
        queryset = StudentScholarship.objects.all().select_related('student', 'student__program', 'student__institution')
        
        if user.is_superuser:
            pass
        elif hasattr(user, 'institution') and user.institution:
            queryset = queryset.filter(student__institution=user.institution)
        elif hasattr(user, 'staff') and user.staff.institution:
            queryset = queryset.filter(student__institution=user.staff.institution)
        else:
            return StudentScholarship.objects.none()
            
        return queryset