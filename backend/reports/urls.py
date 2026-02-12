from django.urls import path
from .views import GenerateReportView, DownloadReportView
from .dynamic_views import (
    ReportSchemaView,
    ReportSchemaListView,
    DynamicReportGenerateView,
    DynamicReportPreviewView,
    RelationOptionsView,
)

urlpatterns = [
    # Legacy endpoints
    path("generate/", GenerateReportView.as_view()),
    path("download/<uuid:report_id>/", DownloadReportView.as_view()),

    # Dynamic report endpoints
    path("schemas/", ReportSchemaListView.as_view(), name="report-schema-list"),
    path("schema/<str:report_type>/", ReportSchemaView.as_view(), name="report-schema"),
    path("dynamic/generate/", DynamicReportGenerateView.as_view(), name="dynamic-report-generate"),
    path("dynamic/preview/", DynamicReportPreviewView.as_view(), name="dynamic-report-preview"),
    path("options/<str:report_type>/<str:field_key>/", RelationOptionsView.as_view(), name="report-options"),
]