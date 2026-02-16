from rest_framework import serializers
from .models import IseopProgram, IseopStudent


class IseopProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = IseopProgram
        fields = "__all__"


class IseopStudentSerializer(serializers.ModelSerializer):
    institution_name = serializers.CharField(source="institution.name", read_only=True)
    program_name = serializers.CharField(source="program.name", read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = IseopStudent
        fields = [
            "id",
            "student_id",
            "national_id",  # ✅ ADDED
            "first_name",
            "last_name",
            "full_name",
            'disability_type',
            "email",
            "status",
            "institution",
            "institution_name",
            "program",
            "program_name",
            "gender",
            "enrollment_year",
            "created_at",
        ]

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()
