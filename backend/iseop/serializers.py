from rest_framework import serializers
from .models import IseopProgram, IseopStudent

class IseopProgramSerializer(serializers.ModelSerializer):
    institution_name = serializers.CharField(source='institution.name', read_only=True)

    class Meta:
        model = IseopProgram
        fields = [
            'id', 'institution', 'institution_name', 'name', 'capacity',
            'occupied', 'status', 'activity_level', 'description',
            'created_at', 'updated_at'
        ]

class IseopStudentSerializer(serializers.ModelSerializer):
    institution_name = serializers.CharField(source='institution.name', read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = IseopStudent
        fields = [
            'id', 'institution', 'institution_name', 'student_id',
            'first_name', 'last_name', 'full_name', 'email', 'status',
            'created_at', 'updated_at'
        ]

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"