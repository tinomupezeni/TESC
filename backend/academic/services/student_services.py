from django.db import transaction
from django.core.exceptions import ValidationError
from ..models import Student

class StudentService:
    @staticmethod
    def create_student(validated_data):
        """
        Creates a new Student instance.
        """
        try:
            with transaction.atomic():
                # logic for auto-generating student_id could go here if not provided
                student = Student.objects.create(**validated_data)
                return student
        except Exception as e:
            raise ValidationError(f"Error creating student: {str(e)}")

    @staticmethod
    def update_student(instance, validated_data):
        """
        Updates an existing Student instance.
        """
        try:
            with transaction.atomic():
                for attr, value in validated_data.items():
                    setattr(instance, attr, value)
                instance.save()
                return instance
        except Exception as e:
            raise ValidationError(f"Error updating student: {str(e)}")

    @staticmethod
    def delete_student(instance):
        """
        Deletes a Student instance.
        """
        try:
            # Check for dependencies (e.g., library books, unpaid fees) before deletion
            instance.delete()
        except Exception as e:
            raise ValidationError(f"Error deleting student: {str(e)}")