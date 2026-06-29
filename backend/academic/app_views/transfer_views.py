from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from ..models import InCountryTransfer
from ..serializers.in_country_transfer_serializers import InCountryTransferSerializer

class InCountryTransferViewSet(viewsets.ModelViewSet):
    serializer_class = InCountryTransferSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['student', 'student__institution']
    search_fields = ['from_institution', 'to_institution', 'student__first_name', 'student__last_name', 'student__student_id']
    ordering_fields = ['transfer_date', 'id']
    ordering = ['-transfer_date']

    def get_queryset(self):
        user = self.request.user
        queryset = InCountryTransfer.objects.all().select_related('student', 'student__institution')
        
        # Superusers can see all, otherwise filter by user's institution
        if user.is_superuser:
            pass
        elif hasattr(user, 'institution') and user.institution:
            queryset = queryset.filter(student__institution=user.institution)
        elif hasattr(user, 'staff') and user.staff.institution:
            queryset = queryset.filter(student__institution=user.staff.institution)
        else:
            return InCountryTransfer.objects.none()
            
        return queryset
