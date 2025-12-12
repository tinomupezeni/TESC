from django.urls import path
from .views.students_views import DropoutAnalysisView
from .views.financial_views import FinancialAnalysisView
from .views.regional_views import RegionalAnalysisView
from .views.innovations_views import HubAnalysisView, StartupAnalysisView, IndustrialAnalysisView, InnovationOverviewView
from .views.admissions_views import AdmissionsAnalysisView

urlpatterns = [
    # This results in: /api/analysis/dropout-analysis/
    path('dropout-analysis/', DropoutAnalysisView.as_view(), name='dropout-analysis'),
    path('financial-stats/', FinancialAnalysisView.as_view(), name='financial-stats'),
    path('regional-stats/', RegionalAnalysisView.as_view(), name='regional-stats'),
    path('hubs/', HubAnalysisView.as_view()),
    path('startups/', StartupAnalysisView.as_view()),
    path('industrial/', IndustrialAnalysisView.as_view()),
    path('innovation-overview/', InnovationOverviewView.as_view(), name='innovation-overview'),
    path('admissions-stats/', AdmissionsAnalysisView.as_view(), name='admissions-stats'),
]