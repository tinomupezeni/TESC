from rest_framework import viewsets, permissions
from core.mixins import InstitutionalIsolationMixin
from ..models import AuditTrail
from ..serializers.audit_serializers import AuditTrailSerializer

class AuditTrailViewSet(InstitutionalIsolationMixin, viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing Audit Trails.
    Institutional isolation ensures users only see logs for their institution.
    """
    queryset = AuditTrail.objects.all().select_related('user', 'institution')
    serializer_class = AuditTrailSerializer
    permission_classes = [permissions.IsAuthenticated]
    institution_lookup_path = 'institution'
    
    # Optionally add filtering by module, user, date, etc.
