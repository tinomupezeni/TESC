from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Customizes TokenObtainPairSerializer to include user role, department, 
    and level in the token payload and response data.
    """
    
    # 1. Override the get_token method to add fields to the token itself
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Add custom claims to the token
        token['email'] = user.email
        token['level'] = user.level
        
        # Include role name and department name/ID if they exist
        if user.role:
            token['role_id'] = user.role.id
            token['role_name'] = user.role.name
            
        if user.department:
            token['department_id'] = user.department.id
            token['department_name'] = user.department.name

        return token

    # 2. Override the validate method to include fields in the final response data
    def validate(self, attrs):
        # Call the base class method to get the tokens (access and refresh)
        data = super().validate(attrs)

        # Add user data directly to the response data (for easy frontend access)
        data['user'] = {
            'id': self.user.id,
            'email': self.user.email,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'level': self.user.level,
            'role': {
                'id': self.user.role.id,
                'name': self.user.role.name,
            } if self.user.role else None,
            'department': {
                'id': self.user.department.id,
                'name': self.user.department.name,
            } if self.user.department else None,
        }
        
        return data