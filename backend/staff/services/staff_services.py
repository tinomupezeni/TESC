from django.db import transaction
from django.core.exceptions import ValidationError
from ..models import Staff

class StaffService:
    @staticmethod
    def create_staff(validated_data):
        try:
            with transaction.atomic():
                staff = Staff.objects.create(**validated_data)
                return staff
        except Exception as e:
            raise ValidationError(f"Error creating staff member: {str(e)}")

    @staticmethod
    def update_staff(instance, validated_data):
        try:
            with transaction.atomic():
                for attr, value in validated_data.items():
                    setattr(instance, attr, value)
                instance.save()
                return instance
        except Exception as e:
            raise ValidationError(f"Error updating staff member: {str(e)}")

    @staticmethod
    def delete_staff(instance):
        try:
            # Soft delete logic could go here (e.g., instance.is_active = False)
            # For now, we do a hard delete
            instance.delete()
        except Exception as e:
            raise ValidationError(f"Error deleting staff member: {str(e)}")