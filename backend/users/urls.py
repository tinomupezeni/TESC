# accounts/urls.py
from django.urls import path
from .views.user_views import UserRegistrationView, UserProfileView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    # Signup
    path('register/', UserRegistrationView.as_view(), name='user_register'),

    # Profile
    path('profile/', UserProfileView.as_view(), name='user_profile'),

    # JWT Token Endpoints
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'), # Login
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]