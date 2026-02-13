from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
import csv
import io
from .models import IseopProgram, IseopStudent
from .serializers import IseopProgramSerializer, IseopStudentSerializer

class IseopProgramViewSet(viewsets.ModelViewSet):
    serializer_class = IseopProgramSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Temporarily return ALL programs to see if they appear
        return IseopProgram.objects.all()
# --- ADD THIS VIEWSET ---
class IseopStudentViewSet(viewsets.ModelViewSet):
    serializer_class = IseopStudentSerializer
    permission_classes = [IsAuthenticated]

    print("hello")
    print(serializer_class)
    def get_queryset(self):
        # Only show students belonging to the user's institution
        
        return IseopStudent.objects.all()
    @action(detail=False, methods=['post'])
    def bulk_upload(self, request):
        file = request.FILES.get('file')
        if not file:
            return Response({"error": "No file provided"}, status=status.HTTP_400_BAD_REQUEST)

        # Assuming CSV for now
        decoded_file = file.read().decode('utf-8')
        io_string = io.StringIO(decoded_file)
        reader = csv.DictReader(io_string)

        print(request.user.institution)
        
        students_to_create = []
        for row in reader:
            # Match CSV headers to your model fields
            students_to_create.append(IseopStudent(
                institution=request.user.institution,
                student_id=row['student_id'],
                first_name=row['first_name'],
                last_name=row['last_name'],
                email=row.get('email')
            ))

        IseopStudent.objects.bulk_create(students_to_create)
        return Response({"message": "Bulk upload successful"}, status=status.HTTP_201_CREATED)