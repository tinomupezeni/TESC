from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings

User = get_user_model()
token_generator = PasswordResetTokenGenerator()

class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email_or_username = request.data.get('email') # Can be username or email
        if not email_or_username:
            return Response({'error': 'Please provide an email or username'}, status=400)
            
        user = User.objects.filter(email__iexact=email_or_username).first()
        if not user:
            user = User.objects.filter(username__iexact=email_or_username).first()
            
        if user:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = token_generator.make_token(user)
            
            # Determine base URL dynamically based on where the request originated
            origin = request.META.get('HTTP_ORIGIN') or request.headers.get('origin')
            base_url = origin if origin else settings.FRONTEND_URL
            
            # Create link pointing to the frontend React route
            reset_link = f"{base_url}/reset-password?uid={uid}&token={token}"
            
            try:
                send_mail(
                    subject="Password Reset Request",
                    message=f"You requested a password reset. Click the link below to reset your password:\n\n{reset_link}\n\nIf you did not request this, please ignore this email.",
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user.email],
                    fail_silently=False,
                )
            except Exception as e:
                print(f"Failed to send email: {e}")
                
        # Always return 200 to prevent user enumeration
        return Response({'message': 'If an account with that email/username exists, a reset link has been sent.'})


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        uidb64 = request.data.get('uid')
        token = request.data.get('token')
        new_password = request.data.get('new_password')
        
        if not uidb64 or not token or not new_password:
            return Response({'error': 'Missing required fields'}, status=400)
            
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None
            
        if user is not None and token_generator.check_token(user, token):
            user.set_password(new_password)
            user.must_change_password = False # In case they were forced
            # Optional: Invalidate existing sessions by incrementing version
            user.session_version += 1
            user.save()
            return Response({'message': 'Password has been reset successfully.'})
        else:
            return Response({"message": "Invalid link or token has expired."}, status=status.HTTP_400_BAD_REQUEST)

class VerifyOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)
