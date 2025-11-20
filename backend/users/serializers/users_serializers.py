from rest_framework import serializers
from ..models import Role, Department, CustomUser

# --- Nested Detail Serializers (for displaying objects) ---

class RoleDetailSerializer(serializers.ModelSerializer):
    """A simplified serializer for nesting Role data."""
    class Meta:
        model = Role
        fields = ['id', 'name']
        
class DepartmentDetailSerializer(serializers.ModelSerializer):
    """A simplified serializer for nesting Department data."""
    class Meta:
        model = Department
        fields = ['id', 'name']
        

# --- 1. User Profile Serializer (For GET /api/users/profile/) ---
class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for reading user profile data.
    This ensures 'role' and 'department' are returned as objects, fixing the refresh bug.
    """
    # 🚨 FIX: Explicitly define the foreign key fields using the detail serializers
    role = RoleDetailSerializer(read_only=True)
    department = DepartmentDetailSerializer(read_only=True)

    class Meta:
        model = CustomUser
        fields = [
            'id', 
            'email', 
            'first_name', 
            'last_name', 
            'level', 
            'role',             # Nested object returned
            'department',       # Nested object returned
        ]
        read_only_fields = fields # All fields are read-only for a profile GET request

# --- 2. User Registration Serializer (For POST /api/users/register/) ---
class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer used for public user registration.
    """
    # Fields for setting foreign keys during creation
    role_id = serializers.PrimaryKeyRelatedField(
        queryset=Role.objects.all(), 
        source='role', 
        write_only=True,
        required=False, 
        allow_null=True
    )
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(), 
        source='department', 
        write_only=True,
        required=False,
        allow_null=True
    )
    
    # Password field for security
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = CustomUser
        fields = [
            'id', 'username', 'email', 'password', 
            'first_name', 'last_name', 
            'role_id', 'department_id',
        ]
        extra_kwargs = {
            'username': {'required': False}, 
            'first_name': {'required': True},
            'last_name': {'required': True},
        }

    def create(self, validated_data):
        """Creates user and hashes the password."""
        password = validated_data.pop('password')
        
        # Ensure a unique username is generated if not provided
        if not validated_data.get('username'):
             validated_data['username'] = f"{validated_data['first_name']}_{validated_data['last_name']}".lower().replace(' ', '_')

        user = CustomUser.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        return user