from rest_framework import serializers
from ..models import Program

class ProgramSerializer(serializers.ModelSerializer):
    # Helpful to see the faculty name in responses, not just the ID
    faculty_name = serializers.CharField(source='faculty.name', read_only=True)

    class Meta:
        model = Program
        fields = [
            'id', 
            'faculty', 
            'faculty_name',
            'name', 
            'code', 
            'duration', 
            'level', 
            'description', 
            'coordinator', 
            'student_capacity', 
            'modules', 
            'entry_requirements', 
            'created_at', 
            'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def validate_code(self, value):
        """
        Ensure code is uppercase for consistency.
        """
        return value.upper()