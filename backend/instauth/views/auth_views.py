from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import authenticate
from ..models import InstitutionAdmin
from rest_framework import generics, permissions, status
from ..serializers.auth_serializers import UserProfileSerializer
from rest_framework_simplejwt.tokens import RefreshToken

class InstitutionAdminLogin(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(username=username, password=password)
        if not user:
            raise AuthenticationFailed("Invalid credentials")

        try:
            admin = user.inst_admin
        except InstitutionAdmin.DoesNotExist:
            raise AuthenticationFailed("Not an institution admin")

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        access = refresh.access_token

        return Response({
            "message": "Login successful",
            "username": username,
            "institution_id": admin.institution.id,
            "must_change_password": user.must_change_password,
            "tokens": {
                "access": str(access),
                "refresh": str(refresh)
            }
        })

class UserProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserProfileSerializer

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        user = self.get_object()
        data = request.data

        # Custom logic for password change
        if 'old_password' in data and 'new_password' in data:
            # 1. Check if the old password is correct
            if not user.check_password(data.get('old_password')):
                return Response(
                    {"error": "The current password you entered is incorrect."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # 2. Set and hash the new password
            user.set_password(data.get('new_password'))
            user.must_change_password = False
            user.save()
            
            return Response({"message": "Password updated successfully"}, status=status.HTTP_200_OK)

        # Handle regular profile updates (name, etc.)
        return super().update(request, *args, **kwargs)
