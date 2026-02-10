from django.db import transaction
from django.core.exceptions import ValidationError
from django.db.models import Count
from ..models import Project, InnovationHub, IPRegistration
from academic.models import Institution


class InnovationService:
    @staticmethod
    def create_innovation(validated_data):
        """
        Creates a Project and optional IPRegistration.
        """
        try:
            with transaction.atomic():
                ip_data = validated_data.pop("ip_registration_data", None)

                project = Project.objects.create(**validated_data)

                if ip_data:
                    IPRegistration.objects.create(
                        project=project,
                        **ip_data
                    )

                return project

        except Exception as e:
            raise ValidationError(f"Error creating innovation: {str(e)}")

    @staticmethod
    def update_innovation(instance, validated_data):
        """
        Updates Project and correctly updates/creates IPRegistration.
        """
        try:
            with transaction.atomic():
                ip_data = validated_data.pop("ip_registration_data", None)

                # Update project fields
                for attr, value in validated_data.items():
                    setattr(instance, attr, value)
                instance.save()

                # Update or create IP details
                if ip_data:
                    IPRegistration.objects.update_or_create(
                        project=instance,
                        defaults=ip_data
                    )

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
        """
        Calculates KPIs for Stats Cards.
        """
        stage_counts = Project.objects.values("stage").annotate(
            count=Count("stage")
        )
        stats = {item["stage"]: item["count"] for item in stage_counts}

        return {
            "total_projects": Project.objects.count(),
            "innovation_hubs": InnovationHub.objects.count(),
            "active_institutions": Institution.objects.filter(
                projects__isnull=False
            ).distinct().count(),

            "ideation": stats.get("ideation", 0),
            "prototype": stats.get("prototype", 0),
            "incubation": stats.get("incubation", 0),
            "ip_registration": stats.get("ip_registration", 0),
            "commercialisation": stats.get("commercialisation", 0),
            "industrial": stats.get("industrial", 0),

            "total_ip_registered": IPRegistration.objects.count(),
        }

    @staticmethod
    def get_detailed_projects():
        """
        Returns flattened project + IP data.
        """
        projects = Project.objects.select_related(
            "institution",
            "hub",
            "ip_details"
        ).order_by("-updated_at")

        data = []
        for project in projects:
            ip_type = None
            ip_route = None
            ip_date = None

            if project.ip_details:
                ip_type = project.ip_details.get_ip_type_display()
                ip_route = project.ip_details.get_filing_route_display()
                ip_date = project.ip_details.date_filed.isoformat()

            data.append({
                "id": project.id,
                "name": project.name,
                "team_name": project.team_name,

                "institution": project.institution.id,
                "institution_name": project.institution.name,

                "hub": project.hub.id if project.hub else None,
                "hub_name": project.hub.name if project.hub else None,

                "sector": project.sector,
                "sector_display": project.get_sector_display(),

                "stage": project.stage,
                "stage_display": project.get_stage_display(),

                "problem_statement": project.problem_statement,
                "proposed_solution": project.proposed_solution,

                "revenue_generated": float(project.revenue_generated),
                "funding_acquired": float(project.funding_acquired),
                "jobs_created": project.jobs_created,

                "ip_type": ip_type,
                "ip_route": ip_route,
                "ip_date": ip_date,

                "created_at": project.created_at.isoformat(),
                "updated_at": project.updated_at.isoformat(),
            })

        return data
