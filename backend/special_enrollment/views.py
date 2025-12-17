from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import ProgramMetric, SpecialStudent, WorkForFeesTask


# Create your views here.

@api_view(['GET'])
def get_enrollment_stats(request):
    # Fetch data from Database
    students = SpecialStudent.objects.all()
    work_tasks = WorkForFeesTask.objects.all()

    # Get the ISEOP value from our new table
    # If it doesn't exist in the DB yet, it defaults to 0
    iseop_metric = ProgramMetric.objects.filter(name="ISEOP Total").first()
    iseop_value = iseop_metric.value if iseop_metric else 0

    # Format Special Students for the Pie Chart
    special_students_data = [
        {"name": s.name, "value": s.count, "color": s.color_variable} 
        for s in students
    ]

    # Format Work for Fees for the Table
    work_data = [
        {"name": w.name, "students": w.students_count, "hours": w.total_hours}
        for w in work_tasks
    ]

    # Calculate Totals for the StatsCards
    total_disabled = sum(s.count for s in students)
    # Filter specifically for Albinism card
    albino_count = SpecialStudent.objects.filter(name="Albino Students").first()
    
    return Response({
        "specialStudents": special_students_data,
        "workForFeesData": work_data,
        "metrics": {
            "totalDisabled": total_disabled,
            "workForFeesTotal": sum(w.students_count for w in work_tasks),
            "iseopTotal": iseop_value, # This could also be a model later
            "albinoTotal": albino_count.count if albino_count else 0
        }
    })