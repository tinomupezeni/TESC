from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.core.exceptions import ValidationError as DjangoValidationError

from .serializers.program_serializers import ProgramSerializer
from .services.program_services import ProgramService
from .models import Faculty, Program
from .serializers.faculty_serializer import FacultySerializer
from .services.faculty_services import FacultyService

class FacultyViewSet(viewsets.ModelViewSet):
    """
    A simple ViewSet for viewing and editing faculties.
    """
    queryset = Faculty.objects.all()
    serializer_class = FacultySerializer

    def get_queryset(self):
        """
        Optionally restricts the returned faculties to a given institution.
        """
        # Removed .prefetch_related('departments') to prevent crash if model is missing
        queryset = Faculty.objects.select_related('institution')
        institution_id = self.request.query_params.get('institution_id')
        
        if institution_id is not None:
            queryset = queryset.filter(institution_id=institution_id)
            
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
        FacultyService.create_faculty(serializer.validated_data)

    def destroy(self, _request, *args, **kwargs):
        instance = self.get_object()
        try:
            FacultyService.delete_faculty(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except DjangoValidationError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def stats(self, _request):
        total = self.get_queryset().count()
        active = self.get_queryset().filter(status='Active').count()
        return Response({
            "total_faculties": total,
            "active_faculties": active
        })
        

class ProgramViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing programs.
    """
    queryset = Program.objects.all()
    serializer_class = ProgramSerializer

    def get_queryset(self):
        """
        Filter programs by Faculty ID or Institution ID.
        """
        queryset = Program.objects.select_related('faculty', 'faculty__institution')
        
        # Filter by Faculty
        faculty_id = self.request.query_params.get('faculty_id')
        if faculty_id:
            queryset = queryset.filter(faculty_id=faculty_id)
            
        # Filter by Institution (via Faculty)
        institution_id = self.request.query_params.get('institution_id')
        if institution_id:
            queryset = queryset.filter(faculty__institution_id=institution_id)
            
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
        # Uses the Service to create
        ProgramService.create_program(serializer.validated_data)

    def perform_update(self, serializer):
        # Uses the Service to update (Handling PUT/PATCH)
        ProgramService.update_program(serializer.instance, serializer.validated_data)

    def destroy(self, _request, *args, **kwargs):
        instance = self.get_object()
        try:
            ProgramService.delete_program(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except DjangoValidationError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)