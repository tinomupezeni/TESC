from django.urls import path
from rest_framework_simplejwt.views import TokenVerifyView
from .views import (
    UserRegistrationView,
    UserLoginView,
    UserLogoutView,
    UserProfileView,
    CheckAuthView,
    RefreshTokenView
)

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('login/', UserLoginView.as_view(), name='login'),
    path('logout/', UserLogoutView.as_view(), name='logout'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('check-auth/', CheckAuthView.as_view(), name='check-auth'),
    path('token/refresh/', RefreshTokenView.as_view(), name='token-refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token-verify'),
]