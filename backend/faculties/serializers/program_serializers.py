from rest_framework import serializers
from ..models import Program

class ProgramSerializer(serializers.ModelSerializer):
    # Helpful to see the faculty name in responses, not just the ID
    department_name = serializers.SerializerMethodField()
    faculty_name = serializers.SerializerMethodField()
    institution_name = serializers.SerializerMethodField()

    def get_department_name(self, obj):
        return obj.department.name if obj.department else None

    def get_faculty_name(self, obj):
        return obj.department.faculty.name if (obj.department and obj.department.faculty) else None

    def get_institution_name(self, obj):
        if obj.department and obj.department.faculty and obj.department.faculty.institution:
            return obj.department.faculty.institution.name
        return None

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
            'duration_years',
            'duration_months',
            'duration_weeks',
            'duration_days', 
            'level',      # Deprecated
            'category',   # Deprecated
            'is_critical_skill', # NEW Phase 1
            'is_specialized_skill',
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