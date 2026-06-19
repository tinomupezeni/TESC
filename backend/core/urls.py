from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView # Import JWT views

urlpatterns = [
    path("admin/", admin.site.urls),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'), # JWT token endpoint
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'), # JWT token refresh endpoint
    path('api/users/', include('users.urls')), # Include our API URLs
    path('api/academic/', include('academic.urls')),
    path("api/instauth/", include("instauth.urls")),
    path("api/faculties/", include("faculties.urls")),
    path("api/staff/", include("staff.urls")),
    path("api/v1/reports/", include("reports.urls")),
    path("api/analysis/", include("analysis.urls")),
    path("api/innovation/", include("innovation.urls")),
    path('api/iseop/', include('iseop.urls')),           # For ISEOP Programs
    

]
