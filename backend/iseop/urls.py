from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import IseopProgramViewSet

router = DefaultRouter()
router.register(r'programs', IseopProgramViewSet, basename='iseop-programs')

urlpatterns = [
    path('', include(router.urls)),
]