# analysis/views.py
from django.db.models import Count
from rest_framework.views import APIView
from rest_framework.response import Response
from academic.models import Institution, Student
from django.db import models

class RegionalAnalysisView(APIView):
    """
    Endpoint: /api/analysis/regional-stats/
    """
    def get(self, request):
        # 1. Get stats grouped by Province from Institutions
        # This gives us: Province Name, Count of Institutions, Count of Hubs
        inst_stats = Institution.objects.values('province').annotate(
            institutions_count=Count('id'),
            hubs_count=Count('id', filter=models.Q(has_innovation_hub=True))
        ).order_by('province')

        # 2. Get Student counts grouped by Province
        # We query Student -> Institution -> Province
        student_stats = Student.objects.values('institution__province').annotate(
            student_count=Count('id')
        )
        
        # Convert student stats to a dictionary for easy lookup: {'Harare': 1500, ...}
        student_map = {item['institution__province']: item['student_count'] for item in student_stats}

        # 3. Merge Data for Frontend
        formatted_data = []
        total_students = 0
        total_institutions = 0
        
        # Define provinces list to ensure we show 0 for empty ones or just iterate results
        # Iterating results is safer for now
        for entry in inst_stats:
            prov_name = entry['province']
            s_count = student_map.get(prov_name, 0)
            i_count = entry['institutions_count']
            h_count = entry['hubs_count']

            formatted_data.append({
                "province": prov_name,
                "institutions": i_count,
                "students": s_count,
                "hubs": h_count
            })
            
            total_students += s_count
            total_institutions += i_count

        # Sort by student count for the chart (optional)
        formatted_data.sort(key=lambda x: x['students'], reverse=True)

        return Response({
            "stats": {
                "provinces_covered": len(formatted_data),
                "top_enrollment": formatted_data[0]['province'] if formatted_data else "N/A",
                "total_enrollment": total_students,
                "total_institutions": total_institutions
            },
            "chart_data": formatted_data
        })