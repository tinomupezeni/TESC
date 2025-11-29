from rest_framework import viewsets, status, filters
from rest_framework.response import Response
from django.core.exceptions import ValidationError as DjangoValidationError
from ..models import Staff
from ..serializers.staff_serializers import StaffSerializer
from ..services.staff_services import StaffService
from rest_framework import serializers

class StaffViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Staff members.
    """
    queryset = Staff.objects.all()
    serializer_class = StaffSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['first_name', 'last_name', 'employee_id', 'email', 'department']

    def get_queryset(self):
        """
        Filter staff by Institution or Faculty.
        """
        queryset = Staff.objects.select_related('institution', 'faculty')
        
        # Filter by Institution
        institution_id = self.request.query_params.get('institution_id')
        if institution_id:
            queryset = queryset.filter(institution_id=institution_id)

        # Filter by Faculty
        faculty_id = self.request.query_params.get('faculty_id')
        if faculty_id:
            queryset = queryset.filter(faculty_id=faculty_id)

        # Filter by Active Status
        status = self.request.query_params.get('status')
        if status == 'active':
            queryset = queryset.filter(is_active=True)
            
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
        StaffService.create_staff(serializer.validated_data)

    def perform_update(self, serializer):
        try:
            StaffService.update_staff(serializer.instance, serializer.validated_data)
        except DjangoValidationError as e:
            # Re-raise as DRF validation error
            raise serializers.ValidationError({"detail": str(e)})

    def destroy(self, _request, *args, **kwargs):
        instance = self.get_object()
        try:
            StaffService.delete_staff(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except DjangoValidationError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)