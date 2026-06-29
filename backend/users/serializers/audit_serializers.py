from rest_framework import serializers
from ..models import AuditTrail

class AuditTrailSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    institution_name = serializers.CharField(source='institution.name', read_only=True)

    class Meta:
        model = AuditTrail
        fields = ['id', 'institution', 'institution_name', 'user', 'user_name', 'action', 'module', 'details', 'ip_address', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_user_name(self, obj):
        if obj.user:
            return obj.user.get_full_name() or obj.user.email
        return "Unknown User"
