from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .app_views import views
from .app_views.admin_views import (
    DashboardStatsView,
    EnrollmentTrendsView,
    InstitutionOverviewView, 
)
from .app_views.student_views import StudentViewSet
from .app_views.bulk_delete_views import BulkDeleteView
from .app_views.facility_views import FacilityViewSet
from .app_views.payments_views import PaymentViewSet
from .app_views.graduate_views import GraduateViewSet
from .app_views.industry_placement_views import IndustryPlacementViewSet
from .app_views.scholarship_views import StudentScholarshipViewSet
from .app_views.mobility_views import InternationalMobilityViewSet
from .app_views.transfer_views import InCountryTransferViewSet
from .app_views.ingestion_views import TemplateDownloadView, ValidateUploadView, CommitUploadView
from faculties.views import FacultyViewSet # Import FacultyViewSet

router = DefaultRouter()
router.register(r'students', StudentViewSet, basename='student')
router.register(r'institutions', views.InstitutionViewSet, basename='institution')
router.register(r'faculties', FacultyViewSet, basename='faculty') # Register FacultyViewSet
router.register(r'programs', views.ProgramViewSet, basename='program')
router.register(r'facilities', FacilityViewSet, basename='facility')
router.register(r'payments', PaymentViewSet, basename='payment')
router.register(r'graduates-mgmt', GraduateViewSet, basename='graduate-mgmt')
router.register(r'placements', IndustryPlacementViewSet, basename='placement')
router.register(r'scholarships', StudentScholarshipViewSet, basename='scholarship')
router.register(r'mobility', InternationalMobilityViewSet, basename='mobility')
router.register(r'transfers', InCountryTransferViewSet, basename='transfer')

urlpatterns = [
    path('students/bulk-delete/', BulkDeleteView.as_view(), name='student-bulk-delete'),
    path('students/bulk_delete/', BulkDeleteView.as_view(), name='student-bulk-delete-underscore'),
    path('', include(router.urls)),
    path('ingestion/template/<str:module_type>/', TemplateDownloadView.as_view(), name='template-download'),
    path('ingestion/validate/<str:module_type>/', ValidateUploadView.as_view(), name='template-validate'),
    path('ingestion/commit/<str:module_type>/', CommitUploadView.as_view(), name='template-commit'),
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('dashboard/enrollment-trends/', EnrollmentTrendsView.as_view(), name='enrollment-trends'),
    path('dashboard/institutions/', InstitutionOverviewView.as_view(), name='dashboard-institutions'),
]
