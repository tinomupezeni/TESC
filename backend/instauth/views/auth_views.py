from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import authenticate
from ..models import InstitutionAdmin
from rest_framework import generics, permissions, status
from ..serializers.auth_serializers import UserProfileSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView

class InstitutionAdminLogin(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(username=username, password=password)
        if not user:
            raise AuthenticationFailed("Invalid credentials")

        if not user.institution:
            try:
                admin = user.inst_admin
                user.institution = admin.institution
                user.save()
            except InstitutionAdmin.DoesNotExist:
                raise AuthenticationFailed("User is not associated with any institution")

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        access = refresh.access_token

        response = Response({
            "message": "Login successful",
            "username": username,
            "institution_id": user.institution.id,
            "must_change_password": user.must_change_password,
            "tokens": {
                "access": str(access),
            }
        })

        secure = request.is_secure() or request.headers.get('X-Forwarded-Proto') == 'https' or request.headers.get('x-forwarded-proto') == 'https'
        response.set_cookie(
            key='refresh_token',
            value=str(refresh),
            httponly=True,
            secure=secure,
            samesite='Lax',
            path='/api/instauth/'
        )
        return response

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


class CustomTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        # Extract from cookie first, then request.data for compatibility
        refresh_token = request.COOKIES.get('refresh_token')
        if not refresh_token:
            refresh_token = request.data.get('refresh')
            
        if not refresh_token:
            return Response(
                {"detail": "Refresh token is missing from cookies or request body."},
                status=status.HTTP_401_UNAUTHORIZED
            )
            
        serializer = self.get_serializer(data={'refresh': refresh_token})
        try:
            serializer.is_valid(raise_exception=True)
        except (TokenError, InvalidToken):
            response = Response(
                {"detail": "Token is invalid or expired"},
                status=status.HTTP_401_UNAUTHORIZED
            )
            response.delete_cookie(
                key='refresh_token',
                path='/api/instauth/'
            )
            return response
            
        res_data = serializer.validated_data
        response = Response(res_data, status=status.HTTP_200_OK)
        
        # If rotation is enabled, set the new refresh token in the cookie
        if 'refresh' in res_data:
            new_refresh = res_data.pop('refresh')
            secure = request.is_secure() or request.headers.get('X-Forwarded-Proto') == 'https' or request.headers.get('x-forwarded-proto') == 'https'
            response.set_cookie(
                key='refresh_token',
                value=new_refresh,
                httponly=True,
                secure=secure,
                samesite='Lax',
                path='/api/instauth/'
            )
            
        return response


class InstitutionAdminLogout(APIView):
    def post(self, request):
        response = Response({"message": "Logout successful"}, status=status.HTTP_200_OK)
        response.delete_cookie(
            key='refresh_token',
            path='/api/instauth/'
        )
        return response

