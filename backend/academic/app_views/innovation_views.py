from rest_framework import viewsets, filters, status
from rest_framework.response import Response
from django.core.exceptions import ValidationError as DjangoValidationError
from ..models import Innovation
from ..serializers.innovation_serializers import InnovationSerializer
from ..services.innovation_services import InnovationService,InnovationAnalyticsService
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Count

from academic.models import Institution
from ..models import Facility
from ..models import Innovation
class InnovationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Innovations.
    """
    queryset = Innovation.objects.all()
    serializer_class = InnovationSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'team_name', 'department', 'category']

    def get_queryset(self):
        """
        Filter innovations by Institution, Category, or Stage.
        """
        queryset = Innovation.objects.select_related('institution')
        
        # Filter by Institution
        institution_id = self.request.query_params.get('institution_id')
        if institution_id:
            queryset = queryset.filter(institution_id=institution_id)

        # Filter by Category
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)

        # Filter by Stage
        stage = self.request.query_params.get('stage')
        if stage:
            queryset = queryset.filter(stage=stage)
            
        return queryset

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
        InnovationService.create_innovation(serializer.validated_data)

    def perform_update(self, serializer):
        try:
            InnovationService.update_innovation(serializer.instance, serializer.validated_data)
        except DjangoValidationError as e:
            from rest_framework import serializers
            raise serializers.ValidationError({"detail": str(e)})

    def destroy(self, _request, *args, **kwargs):
        instance = self.get_object()
        try:
            InnovationService.delete_innovation(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except DjangoValidationError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
@api_view(['GET'])
def dashboard_innovation_stats(request):
    """
    Returns dashboard stats: total innovations, innovation hubs, active institutions.
    """
    

    total_innovations = Innovation.objects.count()
    innovation_hubs = Facility.objects.filter(facility_type='Innovation').count()  # matches FACILITY_TYPES
    active_institutions = Institution.objects.filter(status='Active').count()
    

    data = {
        "total_innovations": total_innovations,
        "innovation_hubs": innovation_hubs,
        "active_institutions": active_institutions,
        "ideation": Innovation.objects.filter(stage='idea').count(),
        "research": Innovation.objects.filter(stage='incubation').count(),
        "prototype": Innovation.objects.filter(stage='prototype').count(),  # fixed
        "industrialization": Innovation.objects.filter(stage='market').count(),
        "commercialized": Innovation.objects.filter(stage='0').count(), 
    }
    return Response(data)

@api_view(["GET"])
def detailed_project_tracking(request):
    """
    Returns detailed innovation project tracking for dashboard tables.
    """
    data = InnovationAnalyticsService.get_detailed_projects()
    return Response(data)

