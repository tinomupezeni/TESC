from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from users.models import CustomUser, Role
from .user_management_serializers import InstitutionUserSerializer
from ..models import InstitutionAdmin

class InstitutionUserViewSet(viewsets.ModelViewSet):
    serializer_class = InstitutionUserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Filter users belonging to the same institution as the current admin
        user = self.request.user
        try:
            # Check if this user is a primary institution admin
            inst_admin = InstitutionAdmin.objects.get(user=user)
            institution = inst_admin.institution
        except InstitutionAdmin.DoesNotExist:
            # If not a primary admin, maybe they are just a user within the institution
            institution = user.institution
            
        if not institution:
            return CustomUser.objects.none()
            
        return CustomUser.objects.filter(institution=institution).order_by('first_name')

    def perform_create(self, serializer):
        # Automatically assign the institution of the creator
        user = self.request.user
        try:
            inst_admin = InstitutionAdmin.objects.get(user=user)
            institution = inst_admin.institution
        except InstitutionAdmin.DoesNotExist:
            institution = user.institution

        if not institution:
            from rest_framework.exceptions import ValidationError
            raise ValidationError("You are not associated with any institution.")

        serializer.save(institution=institution)

class RoleListViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Role.objects.all().order_by('name')
    serializer_class = InstitutionUserSerializer # We only need names/ids
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer(self, *args, **kwargs):
        from users.serializers.settings_serializers import RoleSerializer
        return RoleSerializer(*args, **kwargs)
