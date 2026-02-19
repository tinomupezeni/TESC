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
        print(institution_id)
        if institution_id:
            qs = qs.filter(institution__id=int(institution_id))
        return qs


    def get_object(self):
        lookup_value = self.kwargs[self.lookup_field]
        user = self.request.user

        # 1. Superuser Override: Full access to everything
        if user.is_superuser:
            return get_object_or_404(IseopStudent, id=lookup_value)

        # 2. Identify the Institution Context
        # Check payload (PATCH/POST) first, then the User's database profile (DELETE/GET)
        user_inst_id = self.request.data.get("institution") or getattr(user, "institution_id", None)

        # 3. If no direct institution, check via InstitutionAdmin relationship
        if user_inst_id is None and hasattr(user, "inst_admin"):
            user_inst_id = user.inst_admin.institution_id

        # 4. Security Guardrail
        if user_inst_id is None:
            print(f"DEBUG: Operation failed. User {user.email} has no institution context.")
            # If we can't verify who the user belongs to, we deny the existence of the resource
            raise Http404("No institution context found for this request.")

        # 5. Perform the scoped lookup
        # This ensures a user from Institution A cannot PATCH or DELETE a student from Institution B
        obj = get_object_or_404(
            IseopStudent,
            id=lookup_value,
            institution_id=user_inst_id
        )

        return obj
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

        # 1. Identify Institution
        user = request.user
        user_inst = getattr(user, "institution", None)
        if not user_inst and hasattr(user, "inst_admin"):
            user_inst = user.inst_admin.institution
            
        if not user_inst:
            return Response({"detail": "User has no institution context."}, status=403)

        decoded = file.read().decode("utf-8").splitlines()
        reader = csv.DictReader(decoded)
        created_count = 0
        errors = []

        for row in reader:
            try:
                # 2. Handle Program: Get or Create by Name
                program_name = row.get("program", "").strip()
                if not program_name:
                    raise ValueError("Program name is missing in CSV row")

                # This will find the program or create it if it doesn't exist for this institution
                program, _ = IseopProgram.objects.get_or_create(
                    name=program_name,
                    institution=user_inst,
                    defaults={'status': 'Active', 'capacity': 0}
                )

                enrollment_date = row.get("enrollment_date")
                enrollment_year = None
                if enrollment_date and "-" in enrollment_date:
                    enrollment_year = int(enrollment_date.split("-")[0])
                elif row.get("enrollment_year"):
                    enrollment_year = int(row.get("enrollment_year"))

                # 3. Create or Update Student
                student, created_bool = IseopStudent.objects.update_or_create(
                    student_id=row["student_id"],
                    institution=user_inst,
                    defaults={
                        "first_name": row.get("first_name", ""),
                        "last_name": row.get("last_name", ""),
                        "national_id": row.get("national_id", ""),
                        "email": row.get("email"),
                        "gender": row.get("gender", "Male"),
                        "status": row.get("status", "Active/Enrolled"),
                        "disability_type": row.get("disability_type", "None"),
                        "program": program,
                        "enrollment_year": enrollment_year,
                    },
                )
                
                # 4. Update Program Occupancy
                # Recalculate occupied count for this program
                program.occupied = IseopStudent.objects.filter(program=program).count()
                program.save()

                created_count += 1

            except Exception as e:
                errors.append({"student_id": row.get("student_id", "Unknown"), "error": str(e)})

        return Response({
            "success": True,
            "created_count": created_count,
            "error_count": len(errors),
            "errors": errors
        }, status=status.HTTP_200_OK)