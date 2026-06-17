from rest_framework import permissions

class InstitutionalIsolationMixin:
    """
    Mixin to enforce institutional data isolation at the database level.
    It automatically filters querysets based on the authenticated user's institution.
    """
    
    # Optional: override this in the ViewSet if the path to institution is complex
    # e.g., 'department__faculty__institution'
    institution_lookup_path = 'institution'

    def get_queryset(self):
        """
        Enforce institutional isolation on the queryset.
        """
        queryset = super().get_queryset()
        request = self.request
        user = request.user

        # 1. Bypass isolation for Superusers (System Admins)
        if user.is_authenticated and user.is_superuser:
            return queryset

        # 2. Block access if user is not authenticated or has no institution
        if not user.is_authenticated or not hasattr(user, 'institution') or not user.institution:
            # If it's a list action and unauthenticated, some views might allow it (e.g. login dropdowns)
            # But generally, we want to return nothing for sensitive data.
            return queryset.none()

        # 3. Apply the institutional filter
        # We use the institution object from the authenticated user
        filter_kwargs = {self.institution_lookup_path: user.institution}
        return queryset.filter(**filter_kwargs)
