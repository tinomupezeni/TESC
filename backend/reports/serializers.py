from rest_framework import serializers
from .models import ReportTemplate, GeneratedReport

class ReportTemplateSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    
    class Meta:
        model = ReportTemplate
        fields = ['id', 'name', 'description', 'category', 'category_display', 
                  'default_format', 'is_active', 'created_at']


class GeneratedReportSerializer(serializers.ModelSerializer):
    template_name = serializers.CharField(source='template.name', read_only=True)
    template_category = serializers.CharField(source='template.category', read_only=True)
    generated_by = serializers.CharField(source='generated_by.get_full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    # This field is needed by frontend
    date_generated = serializers.DateTimeField(source='requested_at', read_only=True)

    class Meta:
        model = GeneratedReport
        fields = [
            'id', 'title', 'template', 'template_name', 'template_category',
            'generated_by', 'date_generated', 'format', 'status', 'status_display', 'file'
        ]

class ReportGenerationRequestSerializer(serializers.Serializer):
    template_id = serializers.IntegerField()
    parameters = serializers.JSONField(default=dict, required=False)
    format = serializers.ChoiceField(
        choices=ReportTemplate.FORMAT_CHOICES,
        default='pdf',
        required=False
    )
    institution_id = serializers.IntegerField(required=False)
    start_date = serializers.DateField(required=False)
    end_date = serializers.DateField(required=False)

    def validate_template_id(self, value):
        if not ReportTemplate.objects.filter(id=value, is_active=True).exists():
            raise serializers.ValidationError("Invalid template ID")
        return value
