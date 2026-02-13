from django.urls import path, include
from rest_framework.routers import DefaultRouter
# --- UPDATE THIS IMPORT LINE ---
from .views import IseopProgramViewSet, IseopStudentViewSet

router = DefaultRouter()
router.register(r'programs', IseopProgramViewSet, basename='iseop-programs')
router.register(r'students', IseopStudentViewSet, basename='iseop-students')

urlpatterns = [
    path('', include(router.urls)),
]