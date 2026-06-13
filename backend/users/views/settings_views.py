from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from ..models import Role, Department, CustomUser
from ..serializers.settings_serializers import RoleSerializer, DepartmentSerializer, UserSerializer

# NOTE: For production, you would typically use finer-grained permissions
# (e.g., IsAdminUser) instead of just IsAuthenticated for CRUD views.

# --- 1. Role ViewSet ---
class RoleViewSet(viewsets.ModelViewSet):
    """
    CRUD for Role objects.
    Endpoint: /roles/
    """
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.level == '1' and not user.institution: # System Admin
            return Role.objects.all().order_by('name')
        return Role.objects.filter(institution=user.institution).order_by('name')

    def perform_create(self, serializer):
        # Automatically assign institution if not a system admin
        if self.request.user.institution:
            serializer.save(institution=self.request.user.institution)
        else:
            serializer.save()

# --- 2. Department ViewSet ---
class DepartmentViewSet(viewsets.ModelViewSet):
    """
    CRUD for Department objects.
    Endpoint: /departments/
    """
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.level == '1' and not user.institution: # System Admin
            return Department.objects.all().order_by('name')
        return Department.objects.filter(institution=user.institution).order_by('name')

    def perform_create(self, serializer):
        if self.request.user.institution:
            serializer.save(institution=self.request.user.institution)
        else:
            serializer.save()

    def destroy(self, request, *args, **kwargs):
        from rest_framework.response import Response
        from rest_framework import status
        
        instance = self.get_object()
        user_count = instance.users.count()
        force = request.query_params.get('force') == 'true'

        if user_count > 0 and not force:
            return Response(
                {
                    "error": "cannot_delete_has_users",
                    "message": f"Cannot delete department. There are {user_count} users assigned to this department.",
                    "user_count": user_count
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if force:
            # Delete all users in this department
            instance.users.all().delete()
            
        return super().destroy(request, *args, **kwargs)

# --- 3. User ViewSet ---
class UserViewSet(viewsets.ModelViewSet):
    """
    CRUD for CustomUser objects.
    Endpoint: /users/
    Excludes users assigned as Institution Admins.
    """
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.level == '1' and not user.institution:
            # We filter where 'inst_admin' is null to exclude institutional accounts
            # from the general system settings user list.
            return CustomUser.objects.filter(institution__isnull=True).order_by('username')
        
        # Institutional admins see users within their institution
        return CustomUser.objects.filter(institution=user.institution).order_by('username')
    
    def perform_create(self, serializer):
        if self.request.user.institution:
            serializer.save(institution=self.request.user.institution)
        else:
            serializer.save()

    def destroy(self, request, *args, **kwargs):
        from rest_framework.response import Response
        from rest_framework import status
        
        instance = self.get_object()
        force = request.query_params.get('force') == 'true'

        # Check for linked profiles
        has_staff = hasattr(instance, 'staff_profile') and instance.staff_profile is not None
        has_student = hasattr(instance, 'student_profile') and instance.student_profile is not None
        is_inst_admin = hasattr(instance, 'inst_admin') and instance.inst_admin is not None

        dependencies = []
        if has_staff: dependencies.append("Staff Profile")
        if has_student: dependencies.append("Student Profile")
        if is_inst_admin: dependencies.append("Institution Admin Record")

        if dependencies and not force:
            return Response(
                {
                    "error": "cannot_delete_has_dependencies",
                    "message": f"This user is linked to: {', '.join(dependencies)}. Deleting this user will affect these records.",
                    "dependencies": dependencies
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if force:
            # Clean up linked records if necessary
            # Note: InstitutionAdmin is CASCADE, so it would be deleted anyway, 
            # but Staff and Student are SET_NULL, so we might want to delete them if forcing.
            if has_staff:
                instance.staff_profile.delete()
            if has_student:
                instance.student_profile.delete()
            if is_inst_admin:
                instance.inst_admin.delete()
            
        return super().destroy(request, *args, **kwargs)

    
    