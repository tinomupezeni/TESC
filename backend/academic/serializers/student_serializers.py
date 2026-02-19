from rest_framework import serializers
from ..models import Student


class StudentSerializer(serializers.ModelSerializer):
    # =====================
    # Read-only display fields
    # =====================
    institution_name = serializers.CharField(source='institution.name', read_only=True)
    type = serializers.CharField(source='institution.type', read_only=True)
    program_name = serializers.CharField(source='program.name', read_only=True)
    program_category = serializers.CharField(source='program.category', read_only=True)
    full_name = serializers.CharField(read_only=True)

    semester_fee = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    total_paid = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

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
            'status',
            'dropout_reason',
            'graduation_year',
            'type',
            'final_grade',
            'institution',
            'institution_name',
            'program',
            'program_name',
            'program_category',
            'created_at',
            'updated_at',
            'is_work_for_fees',
            'work_area',
            'hours_pledged',
            'disability_type',
            'semester_fee',
            'total_paid',
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
