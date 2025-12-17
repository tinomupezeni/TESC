from django.db import transaction
from django.core.exceptions import ValidationError
from ..models import Innovation
from django.db.models import Count
from academic.models import Facility, Institution

class InnovationService:
    @staticmethod
    def create_innovation(validated_data):
        try:
            with transaction.atomic():
                innovation = Innovation.objects.create(**validated_data)
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


class InnovationAnalyticsService:

    @staticmethod
    def get_innovation_stats():
        return {
            "active_institutions": Institution.objects.filter(
                innovations__isnull=False
            ).distinct().count(),

            "total_innovations": Innovation.objects.count(),

            "innovation_hubs": Facility.objects.filter(
                facility_type="Innovation"
            ).count(),

            "market_ready_projects": Innovation.objects.filter(
                stage="market"
            ).count(),
        }

    @staticmethod
    def get_detailed_projects():
        innovations = (
            Innovation.objects
            .select_related("institution")
            .all()
            .order_by("created_at")
        )

        data = []
        for index, innovation in enumerate(innovations, start=1):
            data.append({
                "id": f"IN{str(index).zfill(3)}",
                "name": innovation.title,
                "institution": innovation.institution.name,
                "stage": innovation.get_stage_display(),
                "status": innovation.get_status_display(),
            })

        return data
