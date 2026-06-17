from rest_framework import viewsets, filters

from ..models import  Vacancy
from ..serializers.staff_serializers import  VacancySerializer
from ..services.staff_services import VacancyService


from core.mixins import InstitutionalIsolationMixin

class VacancyViewSet(InstitutionalIsolationMixin, viewsets.ModelViewSet):
    queryset = Vacancy.objects.all()
    serializer_class = VacancySerializer
    institution_lookup_path = 'institution'
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'department', 'faculty']

    def get_queryset(self):
        """
        Filter vacancies by institution ID provided in query params.
        """
        queryset = super().get_queryset().select_related('institution')
            
        # Filter by Status (Optional)
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
            
        return queryset

    def perform_create(self, serializer):
        instance = VacancyService.create_vacancy(serializer.validated_data)
        serializer.instance = instance