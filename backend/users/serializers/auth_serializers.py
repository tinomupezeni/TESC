from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims for the token payload
        token['session_version'] = user.session_version
        token['email'] = user.email
        token['first_name'] = user.first_name
        token['last_name'] = user.last_name
        token['level'] = user.level
        token['must_change_password'] = user.must_change_password
        token['institution_id'] = user.institution.id if user.institution else None
        
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
        
        from django.utils import timezone
        import datetime
        from rest_framework import serializers
        import random
        from django.core.mail import send_mail
        from django.conf import settings

        now = timezone.now()
        
        request = self.context.get('request')
        is_smoke_test = request and request.headers.get('X-Smoke-Test-Key') == getattr(settings, 'SMOKE_TEST_KEY', None)
        
        # TEST ENVIRONMENT BYPASS
        if is_smoke_test or settings.DEBUG:
            user.session_version += 1
            user.last_activity = now
            user.save(update_fields=['session_version', 'last_activity'])
            
            refresh = self.get_token(user)
            data['refresh'] = str(refresh)
            data['access'] = str(refresh.access_token)
            data['user'] = {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'level': user.level,
                'must_change_password': user.must_change_password,
                'institution': {
                    'id': user.institution.id,
                    'name': user.institution.name
                } if getattr(user, 'institution', None) else None,
                'role': {
                    'id': user.role.id,
                    'name': user.role.name
                } if getattr(user, 'role', None) else None,
                'department': {
                    'id': user.department.id,
                    'name': user.department.name,
                    'permissions': getattr(user.department, 'permissions', [])
                } if getattr(user, 'department', None) else None,
            }
            return data

        otp = str(random.randint(100000, 999999))
        user.otp_code = otp
        user.otp_created_at = now
        user.save(update_fields=['otp_code', 'otp_created_at'])
        
        try:
            send_mail(
                "Your Login OTP - ScalarEye",
                f"Your one-time password is: {otp}. It expires in 5 minutes.",
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=True
            )
        except Exception:
            pass
            
        return {
            "requires_otp": True,
            "user_id": user.id,
            "message": "An OTP has been sent to your email."
        }

class VerifyOTPSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    otp_code = serializers.CharField(max_length=6)

    def validate(self, attrs):
        from django.contrib.auth import get_user_model
        from django.utils import timezone
        import datetime
        from rest_framework_simplejwt.tokens import RefreshToken

        User = get_user_model()
        user_id = attrs.get('user_id')
        otp_code = attrs.get('otp_code')

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            raise serializers.ValidationError("User not found.")

        if not user.otp_code or user.otp_code != otp_code:
            raise serializers.ValidationError({"detail": "Invalid OTP code."})

        now = timezone.now()
        if user.otp_created_at and (now - user.otp_created_at) > datetime.timedelta(minutes=5):
            raise serializers.ValidationError({"detail": "OTP code has expired."})

        # OTP is valid. Clear it.
        user.otp_code = None
        user.otp_created_at = None

        # SINGLE SESSION LOGIC
        user.session_version += 1
        user.last_activity = now
        user.save(update_fields=['otp_code', 'otp_created_at', 'session_version', 'last_activity'])

        # Generate tokens
        refresh = CustomTokenObtainPairSerializer.get_token(user)
        
        data = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'level': user.level,
                'must_change_password': user.must_change_password,
                'institution': {
                    'id': user.institution.id,
                    'name': user.institution.name
                } if getattr(user, 'institution', None) else None,
                'role': {
                    'id': user.role.id,
                    'name': user.role.name
                } if getattr(user, 'role', None) else None,
                'department': {
                    'id': user.department.id,
                    'name': user.department.name,
                    'permissions': getattr(user.department, 'permissions', [])
                } if getattr(user, 'department', None) else None,
            }
        }
        return data