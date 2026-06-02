from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views.auth_views import (
    InstitutionAdminLogin,
    UserProfileView
)
from .views.user_management_views import InstitutionUserViewSet, RoleListViewSet
from rest_framework_simplejwt.views import TokenRefreshView

router = DefaultRouter()
router.register(r'users', InstitutionUserViewSet, basename='inst-users')
router.register(r'roles', RoleListViewSet, basename='inst-roles')

urlpatterns = [
    path("", include(router.urls)),
    path("login/", InstitutionAdminLogin.as_view(), name="inst-admin-login"),
    path("profile/", UserProfileView.as_view(), name="inst-admin-profile"),
    path("token/refresh/", TokenRefreshView.as_view(), name="inst-token-refresh"),
]
