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

        # 2. Block access if user is not authenticated
        if not user.is_authenticated:
            return queryset.none()

        # 3. Identify the Institution Context
        user_inst = getattr(user, 'institution', None)

        # If no direct institution, check via InstitutionAdmin relationship
        if not user_inst and hasattr(user, "inst_admin"):
            user_inst = user.inst_admin.institution

        # 4. Security Guardrail
        if not user_inst:
            return queryset.none()

        # 5. Apply the institutional filter
        filter_kwargs = {self.institution_lookup_path: user_inst}
        return queryset.filter(**filter_kwargs)
