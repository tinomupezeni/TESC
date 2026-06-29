import jwt
from django.db import connection
from django.conf import settings
from django.contrib.auth import get_user_model

class RLSMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        auth_header = request.headers.get('Authorization')
        institution_id = ''
        
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            try:
                decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
                user_id = decoded.get('user_id')
                User = get_user_model()
                user = User.objects.filter(id=user_id).first()
                if user and getattr(user, 'institution_id', None):
                    institution_id = str(user.institution_id)
            except Exception:
                pass

        with connection.cursor() as cursor:
            if institution_id:
                cursor.execute("SET app.current_institution_id = %s", [institution_id])
            else:
                cursor.execute("SET app.current_institution_id = ''")
                
        response = self.get_response(request)
        return response
