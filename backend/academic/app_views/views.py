# academic/views.py
from django.db import transaction
from rest_framework import viewsets, status, serializers, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from django.db.models import Count, OuterRef, Subquery, IntegerField, Value
from django.db.models.functions import Coalesce
from ..models import Institution, Facility, Student
from faculties.models import Program, Department as FacultyDepartment
from ..serializers.academic_serializers import (
    InstitutionSerializer, ProgramSerializer, FacilitySerializer,
    StudentWriteSerializer, StudentReadSerializer
)
from ..services.academic_services import (
     ProgramService, FacilityService, StudentService
)
from instauth.models import InstitutionAdmin
from users.models import CustomUser, Role, Department as UserDepartment


class FacilityViewSet(viewsets.ModelViewSet):
    queryset = Facility.objects.all()
    serializer_class = FacilitySerializer
    # simple enough not to need a service/repo layer, but we can use it
    # for consistency.
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.service = FacilityService()

    def get_queryset(self):
        return self.service.get_all_facilities()

class InstitutionViewSet(viewsets.ModelViewSet):
    queryset = Institution.objects.all()
    serializer_class = InstitutionSerializer

    def get_permissions(self):
        if self.action == 'list':
            return [permissions.AllowAny()]
        return super().get_permissions()

    def perform_create(self, serializer):
        with transaction.atomic():
            # 1. Save the Institution first to get the ID and Name
            institution = serializer.save()

            email = getattr(institution, 'email', None) or self.request.data.get('email')

            if not email:
                raise serializers.ValidationError(
                    {"email": "An institutional email is required for registration."}
                )

            # 3. Check if a user with this email already exists
            if CustomUser.objects.filter(email=email).exists():
                raise serializers.ValidationError(
                    {"email": "A user with this email already exists."}
                )

            # 4. Create the User Account
            default_password = 'scalareye@123'
            
            # We use the email as the username to ensure it's unique and matches the login flow
            user = CustomUser.objects.create_user(
                username=email, 
                email=email,
                password=default_password,
                first_name=institution.name,
                is_staff=True, # Adjust permissions as needed
                institution=institution,
                level='1' # Full Access
            )

            # Create/Get Super Admin Role for this institution
            super_admin_role, _ = Role.objects.get_or_create(
                institution=institution,
                name='Super Admin',
                defaults={'description': 'Full administrative access to the institution.'}
            )
            user.role = super_admin_role
            user.must_change_password = True
            user.save()

            # 5. Link User to Institution via InstitutionAdmin
            InstitutionAdmin.objects.create(
                user=user,
                institution=institution
            )

            # 6. Store credentials to return them in the response
            self.admin_credentials = {
                "email": email,
                "password": default_password,
                "note": "Please change this password immediately on first login."
            }

    def perform_update(self, serializer):
        instance = self.get_object()
        old_email = instance.email
        
        with transaction.atomic():
            institution = serializer.save()
            new_email = institution.email
            
            if old_email != new_email and new_email:
                # Sync the admin user's email/username if it matched the old institution email
                admin_link = InstitutionAdmin.objects.filter(institution=institution).first()
                if admin_link:
                    user = admin_link.user
                    if user.email == old_email:
                        # Check if new email is already taken by another user
                        if CustomUser.objects.filter(email=new_email).exclude(id=user.id).exists():
                            raise serializers.ValidationError(
                                {"email": "A user with this new email already exists."}
                            )
                        user.email = new_email
                        user.username = new_email
                        user.save()

    def create(self, request, *args, **kwargs):
        # We wrap the standard create logic to inject the credentials into the response
        try:
            response = super().create(request, *args, **kwargs)
            
            # If creds were generated successfully, add them to the response
            if hasattr(self, "admin_credentials"):
                response.data["admin_credentials"] = self.admin_credentials
                
            return response
            
        except serializers.ValidationError as e:
            # Pass validation errors (like duplicate email) straight to the frontend
            raise e
        except Exception as e:
            # Handle unexpected errors
            # print(e) # For debugging
            raise serializers.ValidationError(
                {"detail": "Failed to register institution. Please check the data and try again."}
            )
    def get_queryset(self):
        """
        🚀 High Performance implementation using Subqueries.
        Avoids the Cartesian Product issue (joining multiple tables) which causes
        hangs when data volume is high (e.g. 9,000+ students).
        """
        queryset = Institution.objects.all()
        
        # If public list (unauthenticated login dropdown), return minimal data fast
        if self.action == 'list' and not self.request.user.is_authenticated:
            return queryset.only('id', 'name')

        # 1. Student Count Subquery
        students_subquery = Student.objects.filter(
            institution=OuterRef('pk')
        ).values('institution').annotate(
            count=Count('id')
        ).values('count')

        # 2. Staff Count Subquery
        from staff.models import Staff
        staff_subquery = Staff.objects.filter(
            institution=OuterRef('pk')
        ).values('institution').annotate(
            count=Count('id')
        ).values('count')

        # 3. User Count Subquery
        users_subquery = CustomUser.objects.filter(
            institution=OuterRef('pk')
        ).values('institution').annotate(
            count=Count('id')
        ).values('count')

        # 4. Program Count Subquery
        programs_subquery = Program.objects.filter(
            department__faculty__institution=OuterRef('pk')
        ).values('department__faculty__institution').annotate(
            count=Count('id')
        ).values('count')

        return queryset.annotate(
            student_count=Coalesce(Subquery(students_subquery, output_field=IntegerField()), Value(0)),
            staff_count=Coalesce(Subquery(staff_subquery, output_field=IntegerField()), Value(0)),
            user_count=Coalesce(Subquery(users_subquery, output_field=IntegerField()), Value(0)),
            program_count=Coalesce(Subquery(programs_subquery, output_field=IntegerField()), Value(0))
        )

    def destroy(self, request, *args, **kwargs):
        """
        Manually handle deletion of related objects to avoid IntegrityErrors
        and ensure clean cleanup of institutional data.
        """
        instance = self.get_object()
        with transaction.atomic():
            # 1. Delete Roles and Departments (from users app)
            Role.objects.filter(institution=instance).delete()
            UserDepartment.objects.filter(institution=instance).delete()
            
            # 2. Deleting InstitutionAdmin will cascade to the associated CustomUser
            InstitutionAdmin.objects.filter(institution=instance).delete()
            
            # 3. Perform standard deletion (will cascade to Students, Facilities, etc.)
            return super().destroy(request, *args, **kwargs)

class ProgramViewSet(viewsets.ModelViewSet):
    queryset = Program.objects.all()
    serializer_class = ProgramSerializer

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.service = ProgramService()
    
    # We can add custom actions to filter
    @action(detail=True, methods=['get'])
    def by_institution(self, request, pk=None):
        """
        Get all programs for a specific institution.
        URL: /api/institutions/<institution_pk>/programs/
        """
        # This logic is a bit wrong for a nested route,
        # Let's override get_queryset instead.
        pass

    def get_queryset(self):
        """
        Optionally filter programs by institution_id query param.
        e.g., /api/programs/?institution_id=1
        """
        queryset = super().get_queryset()
        institution_id = self.request.query_params.get('institution_id')
        if institution_id:
            return self.service.get_programs_for_institution(institution_id)
        return queryset

class StudentViewSet(viewsets.ModelViewSet):
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.service = StudentService()

    def get_queryset(self):
        return self.service.get_all_students()

    def get_serializer_class(self):
        """
        Use StudentWriteSerializer for write actions (create, update)
        and StudentReadSerializer for read actions (list, retrieve).
        """
        if self.action in ['create', 'update', 'partial_update']:
            return StudentWriteSerializer
        return StudentReadSerializer

    def create(self, request, *args, **kwargs):
        """
        Override the default create method to use our service.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Pass validated data to the service
        try:
            student = self.service.create_student(serializer.validated_data)
        except ValidationError as e:
            return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)

        # Return the created object using the Read serializer
        read_serializer = StudentReadSerializer(student)
        return Response(read_serializer.data, status=status.HTTP_201_CREATED)
    
    def update(self, request, *args, **kwargs):
        # ... you would override update similarly,
        # calling a self.service.update_student(...) method
        return super().update(request, *args, **kwargs)