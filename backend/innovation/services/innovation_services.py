from django.db import transaction
from django.core.exceptions import ValidationError
from ..models import Project

class InnovationService:
    @staticmethod
    def create_innovation(validated_data):
        try:
            with transaction.atomic():
                innovation = Project.objects.create(**validated_data)
                return innovation
        except Exception as e:
            raise ValidationError(f"Error creating innovation: {str(e)}")

    @staticmethod
    def update_innovation(instance, validated_data):
        try:
            with transaction.atomic():
                for attr, value in validated_data.items():
                    setattr(instance, attr, value)
                instance.save()
                return instance
        except Exception as e:
            raise ValidationError(f"Error updating innovation: {str(e)}")

    @staticmethod
    def delete_innovation(instance):
        try:
            instance.delete()
        except Exception as e:
            raise ValidationError(f"Error deleting innovation: {str(e)}")