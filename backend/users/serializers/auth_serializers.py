from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims for the token payload
        token['email'] = user.email
        token['first_name'] = user.first_name
        token['last_name'] = user.last_name
        token['level'] = user.level
        token['must_change_password'] = user.must_change_password
        
        # Add Department and Permissions
        if user.department:
            token['department'] = {
                'id': user.department.id,
                'name': user.department.name,
                'permissions': user.department.permissions # 🚨 This is the magic array
            }
        else:
            token['department'] = None

        if user.role:
            token['role'] = {
                'id': user.role.id,
                'name': user.role.name
            }

        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Add the same user info to the standard response body 
        # so it's available in the AuthContext immediately
        user = self.user
        data['user'] = {
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'level': user.level,
            'must_change_password': user.must_change_password,
            'role': {
                'id': user.role.id,
                'name': user.role.name
            } if user.role else None,
            'department': {
                'id': user.department.id,
                'name': user.department.name,
                'permissions': user.department.permissions
            } if user.department else None,
        }
        
        return data