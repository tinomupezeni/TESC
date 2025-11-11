# users/serializers.py
from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import Role, Department, CustomUser

# Optional: Define levels for easy reference
LEVEL_CHOICES = (
    (1, "Full Access"),
    (2, "Limited Access"),
    (3, "Department Access"),
    (4, "Staff Only"),
)

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = '__all__'

class DepartmentSerializer(serializers.ModelSerializer):
    roles = RoleSerializer(many=True, read_only=True)
    roles_ids = serializers.PrimaryKeyRelatedField(
        many=True, write_only=True, queryset=Role.objects.all(), source='roles'
    )

    class Meta:
        model = Department
        fields = ['id', 'name', 'roles', 'roles_ids']

class UserSerializer(serializers.ModelSerializer):
    role = serializers.PrimaryKeyRelatedField(queryset=Role.objects.all())
    department = serializers.PrimaryKeyRelatedField(queryset=Department.objects.all(), allow_null=True, required=False)
    level = serializers.ChoiceField(choices=LEVEL_CHOICES)

    class Meta:
        model = CustomUser
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'password',
            'department',
            'role',
            'level',
        ]
        extra_kwargs = {
            'password': {'write_only': True},
        }

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = CustomUser(**validated_data)
        if password:
            user.password = make_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.password = make_password(password)
        instance.save()
        return instance
