# accounts/views.py
from rest_framework import generics, permissions
from ..models import CustomUser
from ..serializers.users_serializers import UserRegistrationSerializer, UserProfileSerializer

# View for User Registration/Signup
class UserRegistrationView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny] # Anyone can register

# View for Viewing and Updating User Profile
class UserProfileView(generics.RetrieveUpdateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated] # Only logged-in users can access

    def get_object(self):
        # This ensures the user can only view/edit their own profile
        return self.request.user