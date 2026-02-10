from rest_framework import serializers
from ..models import Project, IPRegistration


class IPRegistrationSerializer(serializers.ModelSerializer):
    ip_type_display = serializers.CharField(
        source='get_ip_type_display', read_only=True
    )
    filing_route_display = serializers.CharField(
        source='get_filing_route_display', read_only=True
    )

    class Meta:
        model = IPRegistration
        fields = [
            'id',
            'ip_type',
            'ip_type_display',
            'filing_route',
            'filing_route_display',
            'date_filed'
        ]


class InnovationSerializer(serializers.ModelSerializer):
    institution_name = serializers.CharField(
        source='institution.name', read_only=True
    )
    hub_name = serializers.CharField(
        source='hub.name', read_only=True
    )
    sector_display = serializers.CharField(
        source='get_sector_display', read_only=True
    )
    stage_display = serializers.CharField(
        source='get_stage_display', read_only=True
    )

    ip_details = IPRegistrationSerializer(read_only=True)
    ip_registration_data = IPRegistrationSerializer(
        write_only=True, required=False
    )

    class Meta:
        model = Project
        fields = [
            'id',
            'institution',
            'institution_name',
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
            'ip_registration_data',
            'created_at',
            'updated_at',
        ]

    def validate(self, data):
        stage = data.get('stage')
        ip_data = data.get('ip_registration_data')

        if stage == 'ip_registration' and not ip_data:
            if not (self.instance and hasattr(self.instance, 'ip_details')):
                raise serializers.ValidationError({
                    "ip_registration_data":
                    "IP details are required when stage is IP Registration."
                })
        return data

    def create(self, validated_data):
        ip_data = validated_data.pop('ip_registration_data', None)
        project = Project.objects.create(**validated_data)

        if ip_data:
            IPRegistration.objects.create(
                project=project, **ip_data
            )
        return project

    def update(self, instance, validated_data):
        ip_data = validated_data.pop('ip_registration_data', None)

        old_stage = instance.stage
        new_stage = validated_data.get('stage', old_stage)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

    # ✅ AUTO-CREATE IP IF STAGE JUST CHANGED
        if new_stage == 'ip_registration' and not hasattr(instance, 'ip_details'):
          IPRegistration.objects.create(
            project=instance,
            ip_type='patents',
            filing_route='national',
            date_filed=timezone.now().date()
        )

    # Normal update path
        if ip_data:
          IPRegistration.objects.update_or_create(
            project=instance,
            defaults=ip_data
        )

        return instance
