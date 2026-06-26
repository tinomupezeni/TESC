from rest_framework import serializers
from ..models import InternationalMobility

class InternationalMobilitySerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    student_id_number = serializers.CharField(source='student.student_id', read_only=True)
    program_name = serializers.CharField(source='student.program.name', read_only=True)
    institution_id = serializers.IntegerField(source='student.institution.id', read_only=True)

    class Meta:
        model = InternationalMobility
        fields = [
            'id', 
            'student', 
            'student_name', 
            'student_id_number',
            'program_name',
            'institution_id',
            'direction', 
            'country', 
            'foreign_institution', 
            'created_at', 
            'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']