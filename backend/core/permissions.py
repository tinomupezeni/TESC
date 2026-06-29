from rest_framework import permissions

class IsGlobalAdmin(permissions.BasePermission):
    """
    Allows access only to users who do not belong to a specific institution 
    (i.e., TESC Main global admins).
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and not request.user.institution)

class IsInstitutionAdmin(permissions.BasePermission):
    """
    Allows access only to users who belong to an institution.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.institution)

class HasReadWriteRole(permissions.BasePermission):
    """
    Blocks non-safe methods (POST, PUT, PATCH, DELETE) if the user's role 
    is strictly read-only.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
            
        # Example check: if role says read_only, block it
        if hasattr(request.user, 'role') and request.user.role:
            # Assuming Role model has a boolean `is_read_only` or similar
            # Since we don't have is_read_only defined yet, we'll check by name
            if 'Viewer' in getattr(request.user.role, 'name', ''):
                return False
                
        return True
