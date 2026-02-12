from rest_framework import serializers
from .models import IseopProgram, IseopStudent


class IseopProgramSerializer(serializers.ModelSerializer):
    institution_name = serializers.CharField(source='institution.name', read_only=True)
    student_count = serializers.SerializerMethodField()

    class Meta:
        model = IseopProgram
        fields = [
            'id', 'institution', 'institution_name', 'name', 'capacity',
            'occupied', 'status', 'duration', 'activity_level', 'description',
            'student_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'student_count']

    def get_student_count(self, obj):
        return obj.students.filter(status='Active').count()


class IseopStudentSerializer(serializers.ModelSerializer):
    """Serializer for ISEOP community students."""
    institution_name = serializers.CharField(source='institution.name', read_only=True)
    program_name = serializers.CharField(source='program.name', read_only=True)
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = IseopStudent
        fields = [
            'id', 'institution', 'institution_name', 'program', 'program_name',
            'first_name', 'last_name', 'full_name', 'national_id', 'gender',
            'date_of_birth', 'phone', 'email', 'address',
            'enrollment_date', 'expected_completion', 'status',
            'is_work_for_fees', 'work_area', 'hours_pledged', 'hours_completed',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'enrollment_date']


class IseopStudentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating ISEOP students."""

    class Meta:
        model = IseopStudent
        fields = [
            'institution', 'program', 'first_name', 'last_name', 'national_id',
            'gender', 'date_of_birth', 'phone', 'email', 'address',
            'expected_completion', 'status', 'is_work_for_fees', 'work_area',
            'hours_pledged'
        ]


class IseopStatsSerializer(serializers.Serializer):
    """Serializer for ISEOP statistics response."""
    programs = serializers.DictField()
    students = serializers.DictField()
    work_areas = serializers.ListField()
    gender_breakdown = serializers.ListField()
    status_breakdown = serializers.ListField()
    program_breakdown = serializers.ListField()
