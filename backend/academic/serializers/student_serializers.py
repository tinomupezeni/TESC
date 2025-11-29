from rest_framework import serializers
from ..models import Student

class StudentSerializer(serializers.ModelSerializer):
    # Read-only fields for frontend display
    institution_name = serializers.CharField(source='institution.name', read_only=True)
    program_name = serializers.CharField(source='program.name', read_only=True)
    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = Student
        fields = [
            'id',
            'user', # Optional: link to Auth User
            'student_id',
            'national_id',
            'first_name',
            'last_name',
            'full_name',
            'gender',
            'date_of_birth',
            'enrollment_year',
            'status',
            'institution',
            'institution_name',
            'program',
            'program_name',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at', 'full_name']

    def validate_national_id(self, value):
        """
        Check if national ID is unique, excluding the current instance during updates.
        """
        qs = Student.objects.filter(national_id=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        
        if qs.exists():
            raise serializers.ValidationError("A student with this National ID already exists.")
        return value