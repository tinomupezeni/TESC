from rest_framework import viewsets, filters, status
from rest_framework.response import Response
from django.core.exceptions import ValidationError as DjangoValidationError
from ..models import Innovation
from ..serializers.innovation_serializers import InnovationSerializer
from ..services.innovation_services import InnovationService

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