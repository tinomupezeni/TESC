from rest_framework import serializers
from ..models import Student


class StudentSerializer(serializers.ModelSerializer):
    # =====================
    # Read-only display fields
    # =====================
    institution_name = serializers.CharField(source='institution.name', read_only=True)
    type = serializers.CharField(source='institution.type', read_only=True)
    faculty_name = serializers.CharField(source='faculty.name', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    program_name = serializers.CharField(source='program.name', read_only=True)
    program_categories = serializers.JSONField(source='program.categories', read_only=True)
    full_name = serializers.CharField(read_only=True)
    student_id_number = serializers.CharField(source='student_id', read_only=True)

    semester_fee = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    total_paid = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    # Custom Program Auto-creation Fields
    new_program_code = serializers.CharField(required=False, write_only=True, allow_null=True, allow_blank=True)
    new_program_name = serializers.CharField(required=False, write_only=True, allow_null=True, allow_blank=True)
    new_program_level = serializers.CharField(required=False, write_only=True, allow_null=True, allow_blank=True)
    new_program_category = serializers.CharField(required=False, write_only=True, allow_null=True, allow_blank=True)

    # =====================
    # 🔐 ENCRYPTED FIELDS MUST BE CHARFIELDS
    # =====================
    date_of_birth = serializers.CharField(
        required=False,
        allow_null=True,
        allow_blank=True
    )

    # =====================
    # Work-for-fees fields
    # =====================
    is_work_for_fees = serializers.BooleanField(required=False)
    work_area = serializers.ChoiceField(
        choices=Student.WORK_AREAS,
        required=False,
        allow_null=True,
        allow_blank=True
    )
    hours_pledged = serializers.IntegerField(required=False, min_value=0)

    class Meta:
        model = Student
        fields = [
            'id',
            'user',
            'student_id',
            'national_id',
            'first_name',
            'last_name',
            'full_name',
            'gender',
            'date_of_birth',
            'enrollment_year',
            'enrollment_semester',
            'status',
            'dropout_reason',
            'graduation_year',
            'type',
            'final_grade',
            'institution',
            'institution_name',
            'faculty',
            'faculty_name',
            'department',
            'department_name',
            'program',
            'program_name',
            'program_categories',
            'selected_level',    # NEW
            'selected_category', # NEW
            'created_at',
            'updated_at',
            'is_work_for_fees',
            'work_area',
            'hours_pledged',
            'inclusivity_category',
            'semester_fee',
            'total_paid',
            'is_iseop',
            'new_program_code',
            'new_program_name',
            'new_program_level',
            'new_program_category',
            'student_id_number',
        ]
        read_only_fields = ['created_at', 'updated_at', 'full_name']

    # =====================
    # Conditional validation
    # =====================
    def validate(self, data):
        is_work = data.get(
            'is_work_for_fees',
            self.instance.is_work_for_fees if self.instance else False
        )

        if is_work:
            if not data.get('work_area'):
                raise serializers.ValidationError({
                    'work_area': 'Work area is required if student is working for fees.'
                })

            if data.get('hours_pledged', 0) <= 0:
                raise serializers.ValidationError({
                    'hours_pledged': 'Valid pledged hours are required if student is working for fees.'
                })

        return data
