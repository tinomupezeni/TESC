from rest_framework import serializers
from users.models import CustomUser, Role

class InstitutionUserSerializer(serializers.ModelSerializer):
    role_name = serializers.CharField(source='role.name', read_only=True)
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = CustomUser
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 
            'role', 'role_name', 'level', 'must_change_password', 
            'is_active', 'password'
        ]
        read_only_fields = ['id', 'must_change_password']

    def create(self, validated_data):
        password = validated_data.pop('password', 'scalareye@123')
        # Institution will be set by the ViewSet
        user = CustomUser.objects.create(**validated_data)
        user.set_password(password)
        user.must_change_password = True
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        if password:
            instance.set_password(password)
        return super().update(instance, validated_data)
