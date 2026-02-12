from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import IseopProgram
from .serializers import IseopProgramSerializer

class IseopProgramViewSet(viewsets.ModelViewSet):
    serializer_class = IseopProgramSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Only show programs belonging to the user's institution
        user = self.request.user
        if hasattr(user, 'institution'):
            return IseopProgram.objects.filter(institution=user.institution)
        return IseopProgram.objects.none()