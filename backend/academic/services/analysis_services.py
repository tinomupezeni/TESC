# academic/services/analysis_services.py
from django.db.models import Sum, Count
from ..models import Student
from iseop.models import IseopStudent

class AnalysisService:
    @staticmethod
    def get_special_enrollment_stats(institution_id=None):
        # -----------------------------
        # NORMAL STUDENTS
        # -----------------------------
        student_filters = {}
        if institution_id:
            student_filters['institution_id'] = institution_id

        students = Student.objects.filter(**student_filters)

        # Disabled students (excluding None, 'None', 'none', or null)
        disabled_students = students.exclude(disability_type__isnull=True).exclude(disability_type__iexact='none')

        disability_data = disabled_students.values('disability_type').annotate(
            value=Count('id')
        )

        work_data = students.filter(is_work_for_fees=True).values('work_area').annotate(
            students=Count('id'),
            hours=Sum('hours_pledged')
        )

        normal_counts = {
            "work_for_fees": students.filter(is_work_for_fees=True).count(),
            "disabled": disabled_students.count()
        }

        # -----------------------------
        # ISEOP STUDENTS
        # -----------------------------
        iseop_filters = {}
        if institution_id:
            iseop_filters['institution_id'] = institution_id

        iseop_students = IseopStudent.objects.filter(**iseop_filters)

        # Disabled ISEOP students (excluding None, 'None', 'none', or null)
        iseop_disabled = iseop_students.exclude(disability_type__isnull=True).exclude(disability_type__iexact='none')

        iseop_disability_data = iseop_disabled.values('disability_type').annotate(
            value=Count('id')
        )

        iseop_counts = {
            "disabled": iseop_disabled.count(),
            "total": iseop_students.count()
        }

        return {
            "students": {
                "special_students": list(disability_data),
                "work_for_fees": list(work_data),
                "counts": normal_counts
            },
            "iseop": {
                "special_students": list(iseop_disability_data),
                "counts": iseop_counts
            }
        }
