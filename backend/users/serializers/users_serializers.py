# accounts/serializers.py
from rest_framework import serializers
from ..models import CustomUser

# Serializer for creating a new user (Signup)
class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = CustomUser
        fields = ('username', 'password', 'email', 'first_name', 'last_name')

    def create(self, validated_data):
        # Use the create_user method to handle password hashing
        user = CustomUser.objects.create_user(**validated_data)
        return user

# Serializer for viewing and updating user profile
class UserProfileSerializer(serializers.ModelSerializer):
    # Use source to pull the name from the related Institution model
    institution_name = serializers.CharField(source='institution.name', read_only=True)

    class Meta:
        model = CustomUser
        # Add the new fields
        fields = (
            'username',
            'email',
            'first_name',
            'last_name',
            'role',
            'institution', # Send the institution ID for updates
            'institution_name', # Send the institution name for display
        )
        read_only_fields = ('username', 'institution_name')