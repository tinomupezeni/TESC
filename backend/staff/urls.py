from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views.staff_viewset import StaffViewSet

router = DefaultRouter()
router.register(r'members', StaffViewSet, basename='staff')

urlpatterns = [
    path('', include(router.urls)),
]