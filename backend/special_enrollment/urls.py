from django.urls import path
from .views import get_enrollment_stats

urlpatterns = [
    path('stats/', get_enrollment_stats, name='enrollment-stats'),
]