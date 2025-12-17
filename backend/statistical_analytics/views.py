from django.shortcuts import render
from academic.models import Student
from rest_framework.response import Response
from rest_framework.decorators import api_view
from academic.models import Student, Institution, Innovation, Facility
from faculties.models import Program, Faculty
from staff.models import Staff 
from django.db.models import Count,Q
from django.db.models.functions import ExtractYear
from collections import defaultdict

@api_view(['GET'])
def dashboard_stats(request):
    return Response({
        "total_students": Student.objects.count(),
        "total_staff": Staff.objects.count(),
        "total_faculties": Faculty.objects.count(),
        "total_programs": Program.objects.count(),
        "total_institutions": Institution.objects.count(),
        "total_innovations": Innovation.objects.count(),
        "total_facilities": Facility.objects.count(),
    })
@api_view(['GET'])
def student_distribution(request):
    """
    Returns the total number of students per institution type.
    Example response:
    {
        "Polytechnic": 27100,
        "Teachers College": 18200,
        "Industrial Training": 14200
    }
    """

    # Group students by institution type and count
    distribution = (
        Institution.objects
        .annotate(total_students=Count('students'))  # Count related Student objects
        .values('type', 'total_students')
    )

    # Convert queryset to dictionary { type: count }
    data = {item['type']: item['total_students'] for item in distribution}

    return Response(data)

@api_view(["GET"])
def enrollment_trends(request):
    """
    Returns the number of students enrolled per year per institution type.
    Example response:
    [
        {
            "year": "2020",
            "Polytechnic": 1200,
            "Teachers College": 800,
            "Industrial Training": 500
        },
        {
            "year": "2021",
            "Polytechnic": 1300,
            "Teachers College": 900,
            "Industrial Training": 600
        },
        ...
    ]
    """

    # Aggregate student counts per year per institution type
    trends_qs = (
        Student.objects
        .values('enrollment_year', 'institution__type')
        .annotate(total_students=Count('id'))
        .order_by('enrollment_year')
    )

@api_view(["GET"])
def student_teacher_ratio(request):
    """
    Returns student–teacher ratio per institution.
    """
    TEACHING_POSITIONS = ["Professor", "Lecturer", "Assistant"]

    data = []

    institutions = Institution.objects.all()

    for institution in institutions:
        total_students = institution.students.count()
        total_teachers = institution.staff_members.filter(
            position__in=TEACHING_POSITIONS,
            is_active=True
        ).count()
        ratio = round(total_students / total_teachers, 2) if total_teachers > 0 else 0

        data.append({
            "name": institution.name,
            "ratio": ratio
        })

    return Response(data)