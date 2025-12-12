# statistical_analytics/urls.py
from django.urls import path

from .views import dashboard_stats,student_distribution

urlpatterns = [
    path("dashboard/", dashboard_stats, name="dashboard_stats"),
    path("student-distribution/", student_distribution, name="student_distribution"),


]
