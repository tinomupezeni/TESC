from rest_framework import serializers
from ..models import Program

class ProgramSerializer(serializers.ModelSerializer):
    # Helpful to see the faculty name in responses, not just the ID
    department_name = serializers.CharField(source='department.name', read_only=True)
    faculty_name = serializers.CharField(source='department.faculty.name', read_only=True)
    institution_name = serializers.CharField(source='department.faculty.institution.name', read_only=True)

    class Meta:
        model = Program
        fields = [
            'id', 
            'department', 
            'department_name',
            'faculty_name',     
            'institution_name',
            'name', 
            'levels',     # NEW
            'categories', # NEW
            'code', 
            'duration', 
            'level',      # Deprecated
            'category',   # Deprecated
            'is_critical_skill', # NEW Phase 1
            'program_type',      # NEW Phase 1
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