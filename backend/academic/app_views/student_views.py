from rest_framework import viewsets, status, filters
from rest_framework.response import Response
from django.core.exceptions import ValidationError as DjangoValidationError
from ..models import Student
from ..serializers.student_serializers import StudentSerializer
from ..services.student_services import StudentService
from rest_framework import serializers

class StudentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Students.
    """
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['first_name', 'last_name', 'student_id', 'national_id']

    def get_queryset(self):
        """
        Optimize queries and allow filtering by institution or program.
        """
        # Use select_related to fetch ForeignKeys in one query
        queryset = Student.objects.select_related('institution', 'program')
        
        # Filter by Institution
        institution_id = self.request.query_params.get('institution_id')
        if institution_id:
            queryset = queryset.filter(institution_id=institution_id)

        # Filter by Program
        program_id = self.request.query_params.get('program_id')
        if program_id:
            queryset = queryset.filter(program_id=program_id)
            
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
        StudentService.create_student(serializer.validated_data)

    def perform_update(self, serializer):
        try:
            StudentService.update_student(serializer.instance, serializer.validated_data)
        except DjangoValidationError as e:
            # We catch this here in case the service throws a validation error during update
            raise serializers.ValidationError({"detail": str(e)})

    def destroy(self, _request, *args, **kwargs):
        instance = self.get_object()
        try:
            StudentService.delete_student(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except DjangoValidationError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)