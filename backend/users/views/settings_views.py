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
        if user.level == '1': # System Admin
            return Role.objects.all().order_by('name')
        return Role.objects.filter(institution=user.institution).order_by('name')

    def perform_create(self, serializer):
        # Automatically assign institution if not a system admin
        if self.request.user.level != '1':
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
        if user.level == '1': # System Admin
            return Department.objects.all().order_by('name')
        return Department.objects.filter(institution=user.institution).order_by('name')

    def perform_create(self, serializer):
        if self.request.user.level != '1':
            serializer.save(institution=self.request.user.institution)
        else:
            serializer.save()

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
        if user.level == '1':
            # We filter where 'inst_admin' is null to exclude institutional accounts
            # from the general system settings user list.
            return CustomUser.objects.filter(institution__isnull=True).order_by('username')
        
        # Institutional admins see users within their institution
        return CustomUser.objects.filter(institution=user.institution).order_by('username')
    
    def perform_create(self, serializer):
        if self.request.user.level != '1':
            serializer.save(institution=self.request.user.institution)
        else:
            serializer.save()
    
    