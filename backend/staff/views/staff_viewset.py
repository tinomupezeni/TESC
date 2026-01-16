from rest_framework import viewsets, status, filters
from rest_framework.response import Response
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.exceptions import ValidationError
from rest_framework.decorators import action
# 1. Ensure JSONParser is imported
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser 
from ..models import Staff
from ..serializers.staff_serializers import StaffSerializer
from ..services.staff_services import StaffService

class StaffViewSet(viewsets.ModelViewSet):
    queryset = Staff.objects.all()
    serializer_class = StaffSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['first_name', 'last_name', 'employee_id', 'email'] 
    
    # 2. Add JSONParser here to allow normal JSON requests + File Uploads
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get_queryset(self):
        """
        Filter staff by Institution to ensure data isolation.
        """
        # Optimize query joins
        queryset = Staff.objects.select_related('institution', 'faculty', 'department')
        
        # 1. Filter by Institution
        institution_id = self.request.query_params.get('institution_id')
        if not institution_id:
             institution_id = self.request.query_params.get('institution')

        if institution_id:
            queryset = queryset.filter(institution_id=institution_id)
            
        # 2. Filter by Faculty
        faculty_id = self.request.query_params.get('faculty_id')
        if faculty_id:
            queryset = queryset.filter(faculty_id=faculty_id)

        # 3. Filter by Status
        status_param = self.request.query_params.get('status')
        if status_param:
            if status_param.lower() == 'active':
                queryset = queryset.filter(is_active=True)
            elif status_param.lower() == 'inactive':
                queryset = queryset.filter(is_active=False)
            
        return queryset

    def create(self, request, *args, **kwargs):
        # Standard create wrapper
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
        StaffService.update_staff(serializer.instance, serializer.validated_data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            StaffService.delete_staff(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
    @action(detail=False, methods=['post'], url_path='bulk_upload')
    def bulk_upload(self, request):
        """
        Endpoint to handle Excel/CSV bulk upload.
        """
        file_obj = request.FILES.get('file')
        institution_id = request.data.get('institution_id')

        if not file_obj:
            return Response({"detail": "File is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        if not institution_id:
            if hasattr(request.user, 'institution'):
                institution_id = request.user.institution.id
            else:
                return Response({"detail": "Institution ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            count = StaffService.bulk_create_from_file(file_obj, institution_id)
            return Response(
                {"message": f"Successfully imported {count} staff members."}, 
                status=status.HTTP_201_CREATED
            )
        except ValidationError as e:
            return Response(e.message_dict if hasattr(e, 'message_dict') else {"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)