# TESC-main/backend/core/modules/Users/users_views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .Services.Services import UserService

class UserRegisterAPIView(APIView):
    """
    API view for handling new user registrations.
    """
    def post(self, request):
        """
        Receives user data from the frontend and passes it to the UserService.
        """
        # Call the service layer to handle the registration process
        result = UserService.register_user(request.data)

        # The service returns serializer errors if validation fails
        if isinstance(result, dict):
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
        
        # The service returns the created user object on success
        return Response({'message': 'User registered successfully'}, status=status.HTTP_201_CREATED)

class UserLoginAPIView(APIView):
    """
    API view for handling user logins.
    """
    def post(self, request):
        """
        Authenticates a user by checking their username and password.
        """
        username = request.data.get('email')
        password = request.data.get('password')
        print(request.data)
        print(username)
        # Call the service layer to handle the login logic
        user = UserService.login_user(username, password)
        
        if user:
            # Login successful, return a success message
            # In a real-world app, you would return a token here
            return Response({'message': 'Login successful'}, status=status.HTTP_200_OK)
        
        # Login failed
        return Response({'message': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)