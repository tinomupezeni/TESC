from rest_framework import serializers
from ..models import InCountryTransfer

class InCountryTransferSerializer(serializers.ModelSerializer):
    student_id_number = serializers.CharField(source='student.student_id', read_only=True)
    student_name = serializers.CharField(source='student.full_name', read_only=True)

    class Meta:
        model = InCountryTransfer
        fields = [
            'id',
            'student',
            'student_id_number',
            'student_name',
            'from_institution',
            'to_institution',
            'transfer_date'
        ]
