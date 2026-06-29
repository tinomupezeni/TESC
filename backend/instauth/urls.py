from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views.auth_views import (
    InstitutionAdminLogin,
    UserProfileView,
    CustomTokenRefreshView,
    InstitutionAdminLogout,
    InstitutionVerifyOTPView,
)
from .views.user_management_views import InstitutionUserViewSet, RoleListViewSet

router = DefaultRouter()
router.register(r'users', InstitutionUserViewSet, basename='inst-users')
router.register(r'roles', RoleListViewSet, basename='inst-roles')

urlpatterns = [
    path("", include(router.urls)),
    path("login/", InstitutionAdminLogin.as_view(), name="inst-admin-login"),
    path("verify-otp/", InstitutionVerifyOTPView.as_view(), name="inst-verify-otp"),
    path("profile/", UserProfileView.as_view(), name="inst-admin-profile"),
    path("token/refresh/", CustomTokenRefreshView.as_view(), name="inst-token-refresh"),
    path("logout/", InstitutionAdminLogout.as_view(), name="inst-admin-logout"),
]
