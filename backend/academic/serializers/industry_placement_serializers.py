from rest_framework import serializers
from ..models import IndustryPlacement

class IndustryPlacementSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    student_id_number = serializers.CharField(source='student.student_id', read_only=True)
    program_name = serializers.CharField(source='student.program.name', read_only=True)
    institution_id = serializers.IntegerField(source='student.institution.id', read_only=True)

    class Meta:
        model = IndustryPlacement
        fields = [
            'id', 
            'student', 
            'student_name', 
            'student_id_number',
            'program_name',
            'institution_id',
            'placement_type', 
            'company_name', 
            'start_date', 
            'end_date', 
            'created_at', 
            'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']