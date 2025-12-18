# reports/admin.py
from django.contrib import admin
from .models import ReportTemplate, GeneratedReport

@admin.register(ReportTemplate)
class ReportTemplateAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'default_format', 'is_active')

@admin.register(GeneratedReport)
class GeneratedReportAdmin(admin.ModelAdmin):
    list_display = ('title', 'template', 'status', 'requested_at')