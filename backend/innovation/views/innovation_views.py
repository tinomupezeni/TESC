from rest_framework.viewsets import ViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Count
from innovation.models import InnovationHub, Project
from innovation.serializers.project_serializers import ProjectSerializer, InnovationHubSerializer


class InnovationViewSet(ViewSet):

    def list(self, request):
        projects = Project.objects.select_related(
            'institution', 'hub', 'ip_details'
        )
        serializer = ProjectSerializer(projects, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="dashboard/stats")
    def dashboard_stats(self, request):
        projects = Project.objects.all()
        pipeline_counts = projects.values('stage').annotate(count=Count('id'))
        stage_map = {p['stage']: p['count'] for p in pipeline_counts}

        return Response({
            "total_projects": projects.count(),
            "innovation_hubs": InnovationHub.objects.count(),
            "active_institutions": projects.values('institution').distinct().count(),
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
            serializer = ProjectSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        projects = Project.objects.select_related(
            'institution', 'hub', 'ip_details'
        )
        serializer = ProjectSerializer(projects, many=True)
        return Response(serializer.data)
