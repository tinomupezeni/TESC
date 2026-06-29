from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from ..models import Student
from ..services.student_services import StudentService
from django.core.exceptions import ValidationError as DjangoValidationError

class BulkDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        student_ids = request.data.get('student_ids', request.data.get('ids', []))
        if not student_ids:
            return Response({"detail": "No student IDs provided for bulk deletion."}, status=status.HTTP_400_BAD_REQUEST)

        deleted_count = 0
        errors = {}

        # Assuming standard queryset for bulk deletion, might need institutional isolation
        students_to_delete = Student.objects.filter(id__in=student_ids)

        for student in students_to_delete:
            try:
                StudentService.delete_student(student)
                deleted_count += 1
            except DjangoValidationError as e:
                errors[str(student.id)] = str(e)
            except Exception as e:
                errors[str(student.id)] = f"Unexpected error: {str(e)}"
        
        if errors:
            message = f"Successfully deleted {deleted_count} students, but encountered errors for some."
            return Response({"message": message, "errors": errors}, status=status.HTTP_200_OK)
        else:
            return Response({"message": f"Successfully deleted {deleted_count} students."}, status=status.HTTP_204_NO_CONTENT)

    def post(self, request):
        return self.delete(request)
