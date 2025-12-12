from jsonschema import ValidationError
from rest_framework import viewsets, status, filters
from rest_framework.response import Response
from django.core.exceptions import ValidationError as DjangoValidationError
from ..models import Student
from ..serializers.student_serializers import StudentSerializer
from ..services.student_services import StudentService
from rest_framework import serializers
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db.models import Count, Q


class StudentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Students.
    """
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['first_name', 'last_name', 'student_id', 'national_id']
    
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get_queryset(self):
        """
        Optimize queries and allow filtering by institution or program.
        """
        # Use select_related to fetch ForeignKeys in one query
        queryset = Student.objects.select_related('institution', 'program')
        
        institution_param = self.request.query_params.get('institution') 
        if institution_param:
            queryset = queryset.filter(institution_id=institution_param)

        # Filter by Program
        program_id = self.request.query_params.get('program_id')
        # Check for just 'program' too just in case
        if not program_id:
             program_id = self.request.query_params.get('program')
             
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
        
    
    parser_classes = (MultiPartParser, FormParser)

    @action(detail=False, methods=['post'], url_path='bulk_upload')
    def bulk_upload(self, request):
        file_obj = request.FILES.get('file')
        institution_id = request.data.get('institution_id')

        if not file_obj:
            return Response({"detail": "File is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Fallback to user context if ID not sent manually
        if not institution_id and hasattr(request.user, 'institution'):
            institution_id = request.user.institution.id

        try:
            count = StudentService.bulk_create_from_file(file_obj, institution_id)
            return Response(
                {"message": f"Successfully enrolled {count} students."}, 
                status=status.HTTP_201_CREATED
            )
        except ValidationError as e:
            error_data = {}
            
            if hasattr(e, 'message_dict') and e.message_dict:
                error_data = e.message_dict
            elif hasattr(e, 'messages'):
                error_data = {"detail": "Validation error", "errors": e.messages}
            else:
                error_data = {"detail": str(e)}

            # Return 400 Bad Request, not 500
            return Response(error_data, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    @action(detail=False, methods=['get'], url_path='graduation-stats')
    def graduation_stats(self, request):
        """
        Aggregates graduation statistics by Year and Program.
        """
        institution_id = request.query_params.get('institution_id')
        
        # Filter strictly for Graduated students
        queryset = Student.objects.filter(
            institution_id=institution_id, 
            status='Graduated'
        ).values('graduation_year', 'program__name', 'program__level') \
         .annotate(
            total_graduates=Count('id'),
            distinctions=Count('id', filter=Q(final_grade='Distinction')),
            credits=Count('id', filter=Q(final_grade='Credit')),
            passes=Count('id', filter=Q(final_grade='Pass'))
         ).order_by('-graduation_year')

        return Response(queryset)