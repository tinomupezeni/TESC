from django.contrib import admin
from .models import ProgramMetric, SpecialStudent, WorkForFeesTask


# Register your models here.

admin.site.register(SpecialStudent)
admin.site.register(WorkForFeesTask)
admin.site.register(ProgramMetric)