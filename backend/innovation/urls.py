from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views.innovation_views import InnovationViewSet,dashboard_innovation_stats,detailed_project_tracking

router = DefaultRouter()

router.register(r'innovations', InnovationViewSet, basename='innovation')

urlpatterns = [
    path("", include(router.urls)),
    path("dashboard/stats/", dashboard_innovation_stats, name="dashboard-innovation-stats"),
    path("dashboard/projects/", detailed_project_tracking, name="dashboard-detailed-projects"),
]

