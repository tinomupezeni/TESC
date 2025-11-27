from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .app_views import views
from .app_views.admin_views import (
    DashboardStatsView,
    EnrollmentTrendsView,
    InstitutionOverviewView
)

router = DefaultRouter()
router.register(r'students', views.StudentViewSet, basename='student')
router.register(r'institutions', views.InstitutionViewSet, basename='institution')
router.register(r'programs', views.ProgramViewSet, basename='program')
router.register(r'facilities', views.FacilityViewSet, basename='facility')

urlpatterns = [
    path('', include(router.urls)),

    # --- Dashboard Endpoints ---
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('dashboard/enrollment-trends/', EnrollmentTrendsView.as_view(), name='enrollment-trends'),
    path('dashboard/institutions/', InstitutionOverviewView.as_view(), name='dashboard-institutions'),
]
