from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed

class SingleSessionJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        user = super().get_user(validated_token)
        
        token_session_version = validated_token.get('session_version')
        
        # If the token session version doesn't match the database,
        # it means the user logged in from another device.
        if token_session_version is None or token_session_version != user.session_version:
            print(f"DEBUG AUTH: token_session_version={token_session_version}, user.session_version={user.session_version}")
            raise AuthenticationFailed('Session expired. You logged in from another device.', code='session_expired')
            
        # Update last_activity if it's been more than 1 minute to save DB queries
        from django.utils import timezone
        import datetime
        now = timezone.now()
        if not user.last_activity or (now - user.last_activity) > datetime.timedelta(minutes=1):
            user.last_activity = now
            user.save(update_fields=['last_activity'])
            
        return user
