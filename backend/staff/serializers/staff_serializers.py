from rest_framework import serializers
from ..models import Staff

class StaffSerializer(serializers.ModelSerializer):
    institution_name = serializers.CharField(source='institution.name', read_only=True)
    faculty_name = serializers.CharField(source='faculty.name', read_only=True)
    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = Staff
        fields = [
            'id',
            'user',
            'institution',
            'institution_name',
            'faculty',
            'faculty_name',
            'first_name',
            'last_name',
            'full_name',
            'email',
            'phone',
            'employee_id',
            'position',
            'department',
            'qualification',
            'specialization',
            'date_joined',
            'is_active',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'full_name']

    def validate_employee_id(self, value):
        """
        Ensure Employee ID is unique.
        """
        qs = Staff.objects.filter(employee_id=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("This Employee ID is already in use.")
        return value