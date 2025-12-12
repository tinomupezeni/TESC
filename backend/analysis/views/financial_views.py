# analysis/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum, FloatField
from django.db.models.functions import TruncMonth, Coalesce
from academic.models import Student, Payment
from faculties.models import Program
from datetime import datetime

class FinancialAnalysisView(APIView):
    """
    Endpoint: /api/analysis/financial-stats/
    """
    def get(self, request):
        # 1. Calculate Targets (Total Expected Fees for active students)
        # Formula: Sum of (Student's Program Fee)
        active_students = Student.objects.filter(status='Active').select_related('program')
        
        total_expected = sum(s.program.annual_fee for s in active_students if s.program)
        
        # 2. Calculate Actuals (Total Collected YTD)
        current_year = datetime.now().year
        total_collected = Payment.objects.filter(date_paid__year=current_year).aggregate(
            total=Coalesce(Sum('amount'), 0.00, output_field=FloatField())
        )['total']

        # 3. Key Metrics
        total_pending = float(total_expected) - total_collected
        compliance_rate = (total_collected / float(total_expected) * 100) if total_expected > 0 else 0
        
        # Count students who haven't paid fully (Simplified logic for demo)
        # In production, you'd check individual balances. 
        # Here we estimate based on active students vs payment counts.
        students_with_pending = active_students.count() - Payment.objects.filter(date_paid__year=current_year).values('student').distinct().count()

        # 4. Fee Structure Data (Top 5 Programs by Fee)
        fee_structure = Program.objects.values('name', 'annual_fee').order_by('-annual_fee')[:5]

        # 5. Monthly Trend (Recharts Data)
        monthly_payments = Payment.objects.filter(date_paid__year=current_year)\
            .annotate(month=TruncMonth('date_paid'))\
            .values('month')\
            .annotate(collected=Sum('amount'))\
            .order_by('month')

        payment_compliance_data = []
        for entry in monthly_payments:
            month_name = entry['month'].strftime('%b') # Jan, Feb
            payment_compliance_data.append({
                "month": month_name,
                "Collected": entry['collected'],
                "Target": float(total_expected) / 12 # Simple linear target distribution
            })

        # top_pending = []
        # (Optimized logic omitted for brevity, returning structure for frontend)

        return Response({
            "stats": {
                "totalPending": total_pending,
                "complianceRate": round(compliance_rate, 1),
                "studentsWithPending": max(0, students_with_pending),
                "totalCollectedYTD": total_collected
            },
            "fee_structure": fee_structure,
            "payment_data": payment_compliance_data,
            # Return real students if you implement the per-student balance logic
            "top_pending": [] 
        })