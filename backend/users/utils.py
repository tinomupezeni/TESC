from .models import AuditTrail

def log_audit(user, action, module, details='', ip_address=None):
    """
    Utility function to log user activity.
    """
    if not user or not user.is_authenticated:
        return
        
    institution = getattr(user, 'institution', None)
    
    AuditTrail.objects.create(
        institution=institution,
        user=user,
        action=action,
        module=module,
        details=details,
        ip_address=ip_address
    )
