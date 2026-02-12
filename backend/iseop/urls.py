from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import IseopProgramViewSet, IseopStudentViewSet, IseopStatsViewSet

router = DefaultRouter()
router.register(r'programs', IseopProgramViewSet, basename='iseop-programs')
router.register(r'students', IseopStudentViewSet, basename='iseop-students')
router.register(r'stats', IseopStatsViewSet, basename='iseop-stats')

urlpatterns = [
    path('', include(router.urls)),
]