from rest_framework import serializers
from ..models import Partnership

class PartnershipSerializer(serializers.ModelSerializer):
    institution_name = serializers.CharField(source='institution.name', read_only=True)

    class Meta:
        model = Partnership
        fields = [
            'id', 
            'institution', 
            'institution_name', 
            'partner_name', 
            'focus_area', 
            'agreement_date', 
            'status'
        ]