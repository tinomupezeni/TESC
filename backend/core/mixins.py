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

    def get_serializer(self, *args, **kwargs):
        if not hasattr(super(), 'get_serializer'):
            return None
        serializer = super().get_serializer(*args, **kwargs)
        request = self.request
        if request and request.user and request.user.is_authenticated and not request.user.is_superuser:
            user_inst = getattr(request.user, 'institution', None)
            if not user_inst and hasattr(request.user, "inst_admin"):
                user_inst = request.user.inst_admin.institution
            
            if user_inst:
                # Restrict querysets of all related fields to the user's institution
                for field_name, field in getattr(serializer, 'fields', {}).items():
                    if hasattr(field, 'queryset') and field.queryset is not None:
                        model = field.queryset.model
                        model_name = model.__name__
                        
                        try:
                            if model_name == 'Institution':
                                field.queryset = field.queryset.filter(id=user_inst.id)
                            elif hasattr(model, 'institution'):
                                field.queryset = field.queryset.filter(institution=user_inst)
                            elif hasattr(model, 'student'):
                                field.queryset = field.queryset.filter(student__institution=user_inst)
                            elif hasattr(model, 'department'):
                                field.queryset = field.queryset.filter(department__institution=user_inst)
                            elif hasattr(model, 'faculty'):
                                field.queryset = field.queryset.filter(faculty__institution=user_inst)
                            elif hasattr(model, 'program'):
                                field.queryset = field.queryset.filter(program__department__faculty__institution=user_inst)
                        except Exception:
                            # Graceful fallback if lookup paths don't match
                            pass
        return serializer
