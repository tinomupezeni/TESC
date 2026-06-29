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


from core.mixins import InstitutionalIsolationMixin

class IseopProgramViewSet(InstitutionalIsolationMixin, viewsets.ModelViewSet):
    queryset = IseopProgram.objects.all()
    serializer_class = IseopProgramSerializer
    permission_classes = [IsAuthenticated]
    institution_lookup_path = 'institution'


class IseopStudentViewSet(InstitutionalIsolationMixin, viewsets.ModelViewSet):
    queryset = IseopStudent.objects.all()
    serializer_class = IseopStudentSerializer
    permission_classes = [IsAuthenticated]
    institution_lookup_path = 'institution'
    lookup_field = "id"

    # -------------------------
    # LIST QUERYSET
    # -------------------------
    def get_queryset(self):
        return super().get_queryset()


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
        import pandas as pd
        file = request.FILES.get("file")
        if not file:
            return Response({"detail": "No file uploaded"}, status=400)

        # 1. Identify Institution
        user = request.user
        user_inst = getattr(user, "institution", None)
        if not user_inst and hasattr(user, "inst_admin"):
            user_inst = user.inst_admin.institution
            
        if not user_inst:
            from academic.models import Institution
            inst_id = request.data.get("institution_id")
            if inst_id:
                try:
                    user_inst = Institution.objects.get(id=inst_id)
                except Institution.DoesNotExist:
                    return Response({"detail": "Institution not found."}, status=404)
            else:
                return Response({"detail": "User has no institution context."}, status=403)

        try:
            if file.name.endswith('.csv'):
                df = pd.read_csv(file, dtype=str)
            else:
                df = pd.read_excel(file, dtype=str)
                
            # Normalize columns
            df.columns = [c.strip().lower().replace(' ', '_').replace('/', '_') for c in df.columns]
        except Exception as e:
            return Response({"detail": f"Error parsing file: {str(e)}"}, status=400)

        created_count = 0
        errors = []
        seen_in_file = set()

        existing_ids = set(
            IseopStudent.objects.filter(institution=user_inst)
            .values_list('student_id', flat=True)
        )

        for index, row in df.iterrows():
            row_num = index + 2
            error_prefix = f"Row {row_num}"
            try:
                # ---------------- ID & Basics ----------------
                student_id_raw = row.get('student_id')
                student_id = str(student_id_raw).strip().upper() if pd.notna(student_id_raw) else ""
                error_prefix = f"Student ID {student_id}" if student_id else f"Row {row_num} (No Student ID)"
                
                if not student_id:
                    errors.append(f"{error_prefix}: Student ID is required.")
                    continue

                if student_id in seen_in_file:
                    errors.append(f"{error_prefix}: Duplicate Student ID '{student_id}' in the uploaded file.")
                    continue
                seen_in_file.add(student_id)

                if student_id in existing_ids:
                    errors.append(f"{error_prefix}: Student ID '{student_id}' already exists in database.")
                    continue

                first_name_raw = row.get('first_name')
                last_name_raw = row.get('last_name')
                first_name = str(first_name_raw).strip().upper() if pd.notna(first_name_raw) else ""
                last_name = str(last_name_raw).strip().upper() if pd.notna(last_name_raw) else ""

                if not first_name:
                    errors.append(f"{error_prefix}: First Name is required.")
                if not last_name:
                    errors.append(f"{error_prefix}: Last Name is required.")

                national_id_raw = row.get('national_id')
                national_id = str(national_id_raw).strip().upper() if pd.notna(national_id_raw) else ""
                if not national_id:
                    errors.append(f"{error_prefix}: National ID is required.")

                # ---------------- Contact Info ----------------
                contact_raw = row.get('email_or_phone', row.get('email_phone', row.get('email', row.get('phone'))))
                contact = str(contact_raw).strip() if pd.notna(contact_raw) else ""
                email = contact if "@" in contact else ""
                phone = contact if "@" not in contact else ""

                gender_raw = str(row.get('gender', 'Male')).strip() if pd.notna(row.get('gender')) else "Male"
                
                # ---------------- Program ----------------
                program_raw = row.get('program')
                program_name = str(program_raw).strip().upper() if pd.notna(program_raw) else ""
                if not program_name:
                    errors.append(f"{error_prefix}: Program name is required.")
                    continue

                program, _ = IseopProgram.objects.get_or_create(
                    name=program_name,
                    institution=user_inst,
                    defaults={'status': 'Active', 'capacity': 0}
                )

                # ---------------- Dates ----------------
                enrollment_date = row.get('enrollment_date')
                enrollment_year_raw = row.get('enrollment_year')
                enrollment_year = None
                
                if pd.notna(enrollment_date):
                    enrollment_date_str = str(enrollment_date).strip()
                    if "-" in enrollment_date_str:
                        enrollment_year = int(enrollment_date_str.split("-")[0])
                elif pd.notna(enrollment_year_raw):
                    try:
                        enrollment_year = int(float(str(enrollment_year_raw).strip()))
                    except ValueError:
                        errors.append(f"{error_prefix}: Enrollment Year must be a number.")

                # ---------------- Status & Disability ----------------
                status_raw = str(row.get('status', 'Active/Enrolled')).strip() if pd.notna(row.get('status')) else 'Active/Enrolled'
                disability_raw = str(row.get('disability_type', 'None')).strip() if pd.notna(row.get('disability_type')) else 'None'

                # If we encountered basic validation errors, skip creating this row
                if errors and any(e.startswith(error_prefix) for e in errors):
                    continue

                student = IseopStudent.objects.create(
                    student_id=student_id,
                    institution=user_inst,
                    first_name=first_name,
                    last_name=last_name,
                    national_id=national_id,
                    email=email,
                    phone=phone,
                    gender=gender_raw,
                    status=status_raw,
                    disability_type=disability_raw,
                    program=program,
                    enrollment_year=enrollment_year,
                )
                
                program.occupied = IseopStudent.objects.filter(program=program).count()
                program.save()

                created_count += 1

            except Exception as e:
                errors.append(f"{error_prefix}: {str(e)}")

        if errors:
            return Response({
                "detail": "Bulk upload validation failed.",
                "errors": errors
            }, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            "success": True,
            "created_count": created_count,
            "error_count": 0,
            "errors": []
        }, status=status.HTTP_200_OK)