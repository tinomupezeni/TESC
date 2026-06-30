from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from ..models import IndustryPlacement
from ..serializers.industry_placement_serializers import IndustryPlacementSerializer
from rest_framework import filters
from django_filters.rest_framework import DjangoFilterBackend

class IndustryPlacementViewSet(viewsets.ModelViewSet):
    serializer_class = IndustryPlacementSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['placement_type', 'student', 'student__institution']
    search_fields = ['company_name', 'student__first_name', 'student__last_name', 'student__student_id']
    ordering_fields = ['start_date', 'created_at']
    ordering = ['-start_date']

    def get_queryset(self):
        user = self.request.user
        queryset = IndustryPlacement.objects.all().select_related('student', 'student__program', 'student__institution')
        
        # Superusers can see all, otherwise filter by user's institution
        if user.is_superuser:
            institution_id = self.request.query_params.get('institution_id') or self.request.query_params.get('institution')
            if institution_id:
                queryset = queryset.filter(student__institution_id=institution_id)
        elif hasattr(user, 'institution') and user.institution:
            queryset = queryset.filter(student__institution=user.institution)
        elif hasattr(user, 'staff') and user.staff.institution:
            queryset = queryset.filter(student__institution=user.staff.institution)
        else:
            return IndustryPlacement.objects.none()
            
        return queryset