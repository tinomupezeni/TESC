# statistical_analytics/urls.py
from django.urls import path

from ..analysis.stats_views import dashboard_stats,student_distribution,enrollment_trends,student_teacher_ratio

urlpatterns = [
    path("dashboard/", dashboard_stats, name="dashboard_stats"),
    path("student-distribution/", student_distribution, name="student_distribution"),
    path("dashboard/enrollment-trends/", enrollment_trends, name="enrollment-trends"),
    path("student-teacher-ratio/", student_teacher_ratio, name="student_teacher_ratio"),



]
