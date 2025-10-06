# TESC-main/backend/core/modules/Users/users_urls.py

from django.urls import path
from .users_views import UserRegisterAPIView, UserLoginAPIView

urlpatterns = [
    path('signup/', UserRegisterAPIView.as_view(), name='signup'),
    path('login/', UserLoginAPIView.as_view(), name='login'),
]