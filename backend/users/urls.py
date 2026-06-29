# accounts/urls.py
from django.urls import path, include
from .views.user_views import UserRegistrationView, UserProfileView
from .views.settings_views import RoleViewSet, DepartmentViewSet, UserViewSet
from .views.audit_views import AuditTrailViewSet
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from rest_framework.routers import DefaultRouter
from .serializers.auth_serializers import CustomTokenObtainPairSerializer
from .views import user_views, settings_views, audit_views, auth_views

router = DefaultRouter()

router.register(r'roles', RoleViewSet, basename='role')
router.register(r'departments', DepartmentViewSet, basename='department')
router.register(r'users', UserViewSet, basename='user')
router.register(r'audit-logs', AuditTrailViewSet, basename='audit-log')

urlpatterns = [
    path('', include(router.urls)),
    # Signup
    path('register/', UserRegistrationView.as_view(), name='user_register'),

    # Profile
    path('profile/', UserProfileView.as_view(), name='user_profile'),

    # JWT Token Endpoints
    path('token/', TokenObtainPairView.as_view(serializer_class=CustomTokenObtainPairSerializer), name='token_obtain_pair'), # Login
    path('verify-otp/', auth_views.VerifyOTPView.as_view(), name='verify_otp'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'), # Refresh Token
    path('password-reset/', auth_views.PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('password-reset-confirm/', auth_views.PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
]