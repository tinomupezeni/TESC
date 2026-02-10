from rest_framework import serializers
from ..models import InnovationHub, Project, ResearchGrant, Partnership
from academic.models import Institution
from .innovation_serializers import IPRegistrationSerializer


class InnovationHubSerializer(serializers.ModelSerializer):
    class Meta:
        model = InnovationHub
        fields = '__all__'


class ProjectSerializer(serializers.ModelSerializer):
    # Display fields
    stage_display = serializers.CharField(source='get_stage_display', read_only=True)
    sector_display = serializers.CharField(source='get_sector_display', read_only=True)
    hub_name = serializers.CharField(source='hub.name', read_only=True)
    institution_name = serializers.CharField(source='institution.name', read_only=True)
    institution_type = serializers.CharField(source='institution.type', read_only=True)
    # Nested IP details (read-only for GET)
    ip_details = IPRegistrationSerializer(read_only=True)

    # Writable IP fields for POST/PUT/PATCH
    ip_type = serializers.CharField(write_only=True, required=False, allow_null=True)
    filing_route = serializers.CharField(write_only=True, required=False, allow_null=True)
    date_filed = serializers.DateField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = Project
        fields = [
            'id',
            'institution',
            'institution_name', 
            'institution_type',
            'hub',
            'hub_name',
            'name',
            'team_name',
            'sector',
            'sector_display',
            'location_category',
            'stage',
            'stage_display',
            'problem_statement',
            'proposed_solution',
            'revenue_generated',
            'funding_acquired',
            'jobs_created',
            'ip_details',
            'ip_type',       # write-only
            'filing_route',  # write-only
            'date_filed',    # write-only
            'created_at',
            'updated_at',
        ]

    def create(self, validated_data):
        ip_type = validated_data.pop('ip_type', None)
        filing_route = validated_data.pop('filing_route', None)
        date_filed = validated_data.pop('date_filed', None)

        project = Project.objects.create(**validated_data)

        # Create IP details if frontend provided them
        if ip_type and filing_route and date_filed:
            IPRegistrationSerializer.Meta.model.objects.create(
                project=project,
                ip_type=ip_type,
                filing_route=filing_route,
                date_filed=date_filed
            )

        return project

    def update(self, instance, validated_data):
        ip_type = validated_data.pop('ip_type', None)
        filing_route = validated_data.pop('filing_route', None)
        date_filed = validated_data.pop('date_filed', None)

        # Update project fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update or create IP details if frontend provides them
        if ip_type or filing_route or date_filed:
            IPRegistrationSerializer.Meta.model.objects.update_or_create(
                project=instance,
                defaults={
                    'ip_type': ip_type if ip_type is not None else instance.ip_details.ip_type if instance.ip_details else None,
                    'filing_route': filing_route if filing_route is not None else instance.ip_details.filing_route if instance.ip_details else None,
                    'date_filed': date_filed if date_filed is not None else instance.ip_details.date_filed if instance.ip_details else None,
                }
            )

        return instance


class ResearchGrantSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source='project.name', read_only=True)

    class Meta:
        model = ResearchGrant
        fields = [
            'id',
            'institution',
            'project',
            'project_name',
            'donor',
            'amount',
            'date_awarded',
        ]


class PartnershipSerializer(serializers.ModelSerializer):
    class Meta:
        model = Partnership
        fields = '__all__'
