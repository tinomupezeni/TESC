from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from ..models import InternationalMobility
from ..serializers.mobility_serializers import InternationalMobilitySerializer
from rest_framework import filters
from django_filters.rest_framework import DjangoFilterBackend

class InternationalMobilityViewSet(viewsets.ModelViewSet):
    serializer_class = InternationalMobilitySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['direction', 'country', 'student', 'student__institution']
    search_fields = ['country', 'foreign_institution', 'student__first_name', 'student__last_name', 'student__student_id']
    ordering_fields = ['country', 'created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        queryset = InternationalMobility.objects.all().select_related('student', 'student__program', 'student__institution')
        
        if user.is_superuser:
            pass
        elif hasattr(user, 'institution') and user.institution:
            queryset = queryset.filter(student__institution=user.institution)
        elif hasattr(user, 'staff') and user.staff.institution:
            queryset = queryset.filter(student__institution=user.staff.institution)
        else:
            return InternationalMobility.objects.none()
            
        return queryset