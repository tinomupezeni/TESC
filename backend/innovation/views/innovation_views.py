from rest_framework.viewsets import ViewSet, ModelViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Count
from innovation.models import InnovationHub, Project
from innovation.serializers.project_serializers import ProjectSerializer, InnovationHubSerializer

from core.mixins import InstitutionalIsolationMixin

class InnovationViewSet(InstitutionalIsolationMixin, ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    institution_lookup_path = 'institution'

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset().select_related(
            'institution', 'hub', 'ip_details'
        )
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="dashboard/stats")
    def dashboard_stats(self, request):
        queryset = self.get_queryset()
        pipeline_counts = queryset.values('stage').annotate(count=Count('id'))
        stage_map = {p['stage']: p['count'] for p in pipeline_counts}

        # For hubs, we might need a separate lookup or just use the related model
        hubs_count = InnovationHub.objects.filter(institution=request.user.institution).count() if request.user.institution else 0
        if request.user.is_superuser:
            hubs_count = InnovationHub.objects.count()

        return Response({
            "total_projects": queryset.count(),
            "innovation_hubs": hubs_count,
            "active_institutions": queryset.values('institution').distinct().count(),
            "ideation": stage_map.get('ideation', 0),
            "prototype": stage_map.get('prototype', 0),
            "incubation": stage_map.get('incubation', 0),
            "ip_registration": stage_map.get('ip_registration', 0),
            "commercialisation": stage_map.get('commercialisation', 0),
            "industrial": stage_map.get('industrial', 0),
        })

    @action(detail=False, methods=["get", "post"], url_path="dashboard/projects")
    def dashboard_projects(self, request):
        if request.method == "POST":
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save(institution=request.user.institution)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        queryset = self.get_queryset().select_related(
            'institution', 'hub', 'ip_details'
        )
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
