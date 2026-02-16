from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action, parser_classes
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Count
from django.http import Http404
import csv

from .models import IseopProgram, IseopStudent
from .serializers import IseopProgramSerializer, IseopStudentSerializer


class IseopProgramViewSet(viewsets.ModelViewSet):
    queryset = IseopProgram.objects.all()
    serializer_class = IseopProgramSerializer
    permission_classes = [IsAuthenticated]


class IseopStudentViewSet(viewsets.ModelViewSet):
    serializer_class = IseopStudentSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "id"

    # -------------------------
    # LIST QUERYSET
    # -------------------------
    def get_queryset(self):
        qs = IseopStudent.objects.all()
        institution_id = self.request.query_params.get("institution_id")
        if institution_id:
            qs = qs.filter(institution__id=int(institution_id))
        return qs


    # -------------------------
    # DETAIL OBJECT LOOKUP
    # -------------------------
    def get_object(self):
        queryset = IseopStudent.objects.all()
        lookup_value = self.kwargs[self.lookup_field]

        if self.request.user.is_superuser:
            return get_object_or_404(queryset, id=lookup_value)

        # Corrected: Explicitly check for institution ID to ensure object exists
        # within the user's scope.
        user_institution_id = getattr(self.request.user, "institution_id", None)
        
        if not user_institution_id:
            raise Http404
        print(f"DEBUG: User: {self.request.user}")
        print(f"DEBUG: User Institution: {getattr(self.request.user, 'institution', 'No Institution')}")
        print(f"DEBUG: User Institution ID: {getattr(self.request.user, 'institution_id', 'No ID')}")

        return get_object_or_404(
            queryset,
            id=lookup_value,
            institution__id=user_institution_id
        )

    # -------------------------
    # STATS
    # -------------------------
    @action(detail=False, methods=["get"])
    def stats(self, request):
        user = request.user
        user_institution_id = getattr(user, "institution_id", None)

        students = (
            IseopStudent.objects.all()
            if user.is_superuser
            else IseopStudent.objects.filter(institution__id=user_institution_id)
        )

        programs = (
            IseopProgram.objects.all()
            if user.is_superuser
            else IseopProgram.objects.filter(institution__id=user_institution_id)
        )

        total_students = students.count()

        # -------------------------
        # STATUS BREAKDOWN
        # -------------------------
        status_breakdown = dict(
            students.values_list("status")
            .annotate(c=Count("status"))
        )

        # -------------------------
        # GENDER STATS
        # -------------------------
        gender_counts = dict(
            students.exclude(gender__isnull=True)
            .exclude(gender__exact="")
            .values_list("gender")
            .annotate(c=Count("gender"))
        )

        male = gender_counts.get("Male", 0)
        female = gender_counts.get("Female", 0)

        male_pct = round((male / total_students) * 100, 1) if total_students else 0
        female_pct = round((female / total_students) * 100, 1) if total_students else 0

        # -------------------------
        # DISABILITY STATS
        # -------------------------
        disability_qs = (
            students
            .exclude(disability_type__isnull=True)
            .exclude(disability_type__exact="")
            .exclude(disability_type__iexact="None")
        )

        disability_count = disability_qs.count()
        disability_pct = (
            round((disability_count / total_students) * 100, 1)
            if total_students else 0
        )

        disability_breakdown = dict(
            disability_qs.values_list("disability_type")
            .annotate(c=Count("disability_type"))
        )

        # -------------------------
        # YEAR BREAKDOWN
        # -------------------------
        year_breakdown = dict(
            students.exclude(enrollment_year__isnull=True)
            .values_list("enrollment_year")
            .annotate(c=Count("enrollment_year"))
        )

        # -------------------------
        # PROGRAM BREAKDOWN
        # -------------------------
        program_breakdown = dict(
            students.exclude(program__isnull=True)
            .values_list("program__name")
            .annotate(c=Count("program__name"))
        )

        return Response({
            "total_students": total_students,
            "total_programs": programs.count(),
            "status_breakdown": status_breakdown,
            "gender_stats": {
                "male": male,
                "female": female,
                "male_pct": male_pct,
                "female_pct": female_pct,
            },
            "disability_stats": {
                "with_disability": disability_count,
                "with_disability_pct": disability_pct,
                "by_type": disability_breakdown,
            },
            "year_breakdown": year_breakdown,
            "program_breakdown": program_breakdown,
        })

    # -------------------------
    # BULK UPLOAD
    # -------------------------
    @action(detail=False, methods=["post"], url_path="bulk_upload")
    @parser_classes([MultiPartParser])
    def bulk_upload(self, request):
        file = request.FILES.get("file")
        if not file:
            return Response({"detail": "No file uploaded"}, status=400)

        decoded = file.read().decode("utf-8").splitlines()
        reader = csv.DictReader(decoded)
        created = 0
        errors = []

        for row in reader:
            try:
                # Ensure program belongs to the institution
                program = IseopProgram.objects.get(id=int(row["program"]), institution=request.user.institution)
                enrollment_date = row.get("enrollment_date")
                enrollment_year = (
                    int(enrollment_date.split("-")[0])
                    if enrollment_date else None
                )

                IseopStudent.objects.update_or_create(
                    student_id=row["student_id"],
                    institution=request.user.institution,
                    defaults={
                        "first_name": row["first_name"],
                        "last_name": row["last_name"],
                        "national_id": row["national_id"],
                        "email": row.get("email"),
                        "gender": row.get("gender", "Male"),
                        "status": row.get("status", "Active/Enrolled"),
                        "disability_type": row.get("disability_type", "None"),
                        "program": program,
                        "enrollment_year": enrollment_year,
                    },
                )
                created += 1

            except Exception as e:
                errors.append({"row": row, "error": str(e)})

        return Response({
            "created": created,
            "errors": errors
        })