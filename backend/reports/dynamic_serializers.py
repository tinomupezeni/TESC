"""
Serializers for Dynamic Report API

Handles validation of report configuration requests.
"""

from rest_framework import serializers


class ReportFilterSerializer(serializers.Serializer):
    """Serializer for individual filter values - can be various types."""
    pass  # Filters are validated dynamically based on schema


class ReportGenerateSerializer(serializers.Serializer):
    """Serializer for report generation request."""

    report_type = serializers.ChoiceField(
        choices=['staff', 'students', 'graduates'],
        required=True,
        help_text="Type of report to generate"
    )

    title = serializers.CharField(
        max_length=255,
        required=False,
        default='',
        help_text="Custom report title"
    )

    filters = serializers.DictField(
        child=serializers.JSONField(),
        required=False,
        default=dict,
        help_text="Filter criteria as key-value pairs"
    )

    columns = serializers.ListField(
        child=serializers.CharField(max_length=100),
        required=False,
        default=list,
        help_text="List of column keys to include"
    )

    group_by = serializers.CharField(
        max_length=100,
        required=False,
        allow_blank=True,
        allow_null=True,
        help_text="Field to group results by"
    )

    institution_id = serializers.IntegerField(
        required=False,
        allow_null=True,
        help_text="Filter by institution ID"
    )

    format = serializers.ChoiceField(
        choices=['pdf', 'json', 'preview'],
        default='pdf',
        help_text="Output format: pdf, json data, or preview (first 10 rows)"
    )

    orientation = serializers.ChoiceField(
        choices=['portrait', 'landscape', 'auto'],
        default='auto',
        help_text="PDF page orientation"
    )

    def validate(self, data):
        """Additional validation."""
        from .schema_config import get_schema, get_field_by_key

        report_type = data.get('report_type')

        try:
            schema = get_schema(report_type)
        except ValueError as e:
            raise serializers.ValidationError({'report_type': str(e)})

        # Validate columns exist in schema
        columns = data.get('columns', [])
        valid_keys = [f['key'] for f in schema['fields']]

        for col in columns:
            if col not in valid_keys:
                raise serializers.ValidationError({
                    'columns': f"Invalid column '{col}' for report type '{report_type}'"
                })

        # Validate group_by field is groupable
        group_by = data.get('group_by')
        if group_by:
            field_def = get_field_by_key(report_type, group_by)
            if not field_def:
                raise serializers.ValidationError({
                    'group_by': f"Invalid field '{group_by}' for report type '{report_type}'"
                })
            if not field_def.get('groupable', False):
                raise serializers.ValidationError({
                    'group_by': f"Field '{group_by}' is not groupable"
                })

        return data


class ReportPreviewSerializer(ReportGenerateSerializer):
    """Serializer for report preview - inherits from generate but forces preview format."""

    format = serializers.ChoiceField(
        choices=['preview'],
        default='preview'
    )


class RelationOptionsRequestSerializer(serializers.Serializer):
    """Serializer for fetching relation field options."""

    report_type = serializers.ChoiceField(
        choices=['staff', 'students', 'graduates'],
        required=True
    )

    field_key = serializers.CharField(
        max_length=100,
        required=True
    )

    institution_id = serializers.IntegerField(
        required=False,
        allow_null=True
    )


class SchemaResponseSerializer(serializers.Serializer):
    """Serializer for schema response."""

    model = serializers.CharField()
    title = serializers.CharField()
    fields = serializers.ListField()
    default_columns = serializers.ListField(child=serializers.CharField())


class FieldDefinitionSerializer(serializers.Serializer):
    """Serializer for field definition in schema."""

    key = serializers.CharField()
    label = serializers.CharField()
    type = serializers.ChoiceField(
        choices=['string', 'number', 'boolean', 'choice', 'date', 'relation', 'computed']
    )
    choices = serializers.ListField(child=serializers.CharField(), required=False)
    filterable = serializers.BooleanField(default=False)
    selectable = serializers.BooleanField(default=True)
    groupable = serializers.BooleanField(default=False)
    relation_model = serializers.CharField(required=False)


class ReportDataResponseSerializer(serializers.Serializer):
    """Serializer for report data response."""

    data = serializers.ListField()
    total = serializers.IntegerField()
    columns = serializers.ListField()
    is_aggregated = serializers.BooleanField()
    group_by = serializers.CharField(allow_null=True)
    group_label = serializers.CharField(allow_null=True, required=False)
