from django.db.models import Count, Q
from rest_framework.views import APIView
from rest_framework.response import Response
from academic.models import Institution
from django.db import models

class RegionalAnalysisView(APIView):
    def get(self, request):
        # 1. Fetch institutions and count related students and innovation hubs
        # 'students' and 'hubs' are the related_names defined in your models
        institutions = Institution.objects.annotate(
            student_count=Count('students', distinct=True),
            actual_hubs_count=Count('hubs', distinct=True)
        ).values(
            'name', 
            'province', 
            'location', 
            'student_count', 
            'actual_hubs_count'
        ).order_by('-student_count')

        chart_data = []
        total_students = 0
        total_hubs = 0
        provinces_set = set()

        for inst in institutions:
            hubs_in_this_inst = inst['actual_hubs_count']
            chart_data.append({
                "province": inst['province'],
                "location": inst['location'] or "Unknown",
                "institution_name": inst['name'],
                "students": inst['student_count'],
                "institutions": inst['name'], # Send name to frontend for list
                "hubs": hubs_in_this_inst
            })
            total_students += inst['student_count']
            total_hubs += hubs_in_this_inst
            provinces_set.add(inst['province'])

        # Calculate Top Enrollment Location
        top_loc = chart_data[0]['location'] if chart_data else "N/A"

        return Response({
            "stats": {
                "provinces_covered": len(provinces_set),
                "top_enrollment": top_loc,
                "total_enrollment": total_students,
                "total_institutions": institutions.count(),
                "total_hubs": total_hubs, # Explicitly sending total hubs
            },
            "chart_data": chart_data
        })