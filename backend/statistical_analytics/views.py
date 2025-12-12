from django.shortcuts import render
from academic.models import Student
from rest_framework.response import Response
from rest_framework.decorators import api_view
from academic.models import Student, Institution, Innovation, Facility
from faculties.models import Program, Faculty
from staff.models import Staff 
from django.db.models import Count


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
