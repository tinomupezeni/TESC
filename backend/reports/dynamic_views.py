"""
Dynamic Report API Views

Provides endpoints for:
- Getting report schema/field definitions
- Generating reports (PDF, JSON, preview)
- Getting relation field options
"""

from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .schema_config import (
    get_schema,
    get_filterable_fields,
    get_selectable_fields,
    get_groupable_fields,
    REPORT_SCHEMAS
)
from .dynamic_service import DynamicReportService
from .dynamic_serializers import (
    ReportGenerateSerializer,
    RelationOptionsRequestSerializer
)
from .pdf_generator import generate_dynamic_report_pdf


class ReportSchemaView(APIView):
    """
    GET /api/reports/schema/<report_type>/

    Returns the schema configuration for a report type including:
    - Available fields with metadata
    - Filterable fields
    - Selectable (column) fields
    - Groupable fields
    - Default columns
    """

    def get(self, request, report_type):
        try:
            schema = get_schema(report_type)
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Enrich response with categorized fields
        response_data = {
            'report_type': report_type,
            'title': schema.get('title', f'{report_type.title()} Report'),
            'fields': schema['fields'],
            'filterable_fields': get_filterable_fields(report_type),
            'selectable_fields': get_selectable_fields(report_type),
            'groupable_fields': get_groupable_fields(report_type),
            'default_columns': schema.get('default_columns', []),
        }

        return Response(response_data)


class ReportSchemaListView(APIView):
    """
    GET /api/reports/schemas/

    Returns list of available report types with basic info.
    """

    def get(self, request):
        schemas = []
        for report_type, schema in REPORT_SCHEMAS.items():
            schemas.append({
                'report_type': report_type,
                'title': schema.get('title', f'{report_type.title()} Report'),
                'field_count': len(schema['fields']),
                'groupable_count': len([f for f in schema['fields'] if f.get('groupable')])
            })
        return Response(schemas)


class DynamicReportGenerateView(APIView):
    """
    POST /api/reports/dynamic/generate/

    Generate a report based on configuration.

    Request body:
    {
        "report_type": "staff",
        "title": "Custom Report Title",
        "filters": {
            "position": ["Lecturer", "Professor"],
            "is_active": true
        },
        "columns": ["employee_id", "full_name", "position", "department_name"],
        "group_by": "position",  // optional
        "institution_id": 1,  // optional
        "format": "pdf",  // pdf, json, or preview
        "orientation": "auto"  // portrait, landscape, or auto
    }

    Returns:
    - PDF file download (format=pdf)
    - JSON data (format=json)
    - Preview data - first 10 rows (format=preview)
    """

    def post(self, request):
        serializer = ReportGenerateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        report_type = data['report_type']
        output_format = data.get('format', 'pdf')

        # Build report configuration
        config = {
            'report_type': report_type,
            'filters': data.get('filters', {}),
            'columns': data.get('columns', []),
            'group_by': data.get('group_by'),
            'institution_id': data.get('institution_id'),
        }

        # Generate report data
        try:
            report_data = DynamicReportService.generate_report_data(config)
        except Exception as e:
            return Response(
                {'error': f'Failed to generate report: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # Handle preview format - return first 10 rows
        if output_format == 'preview':
            preview_data = report_data.copy()
            preview_data['data'] = report_data['data'][:10]
            preview_data['preview'] = True
            preview_data['showing'] = min(10, len(report_data['data']))
            return Response(preview_data)

        # Handle JSON format - return all data
        if output_format == 'json':
            return Response(report_data)

        # Handle PDF format
        schema = get_schema(report_type)
        title = data.get('title') or schema.get('title', f'{report_type.title()} Report')

        # Get institution name if filtered
        institution_name = None
        institution_id = data.get('institution_id')
        if institution_id:
            from academic.models import Institution
            try:
                institution = Institution.objects.get(id=institution_id)
                institution_name = institution.name
            except Institution.DoesNotExist:
                pass

        try:
            pdf_buffer = generate_dynamic_report_pdf(
                report_type=report_type,
                title=title,
                report_data=report_data,
                institution_name=institution_name,
                orientation=data.get('orientation', 'auto')
            )
        except Exception as e:
            return Response(
                {'error': f'Failed to generate PDF: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # Create filename
        from datetime import datetime
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{report_type}_report_{timestamp}.pdf"

        # Return PDF response
        response = HttpResponse(
            pdf_buffer.getvalue(),
            content_type='application/pdf'
        )
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response


class DynamicReportPreviewView(APIView):
    """
    POST /api/reports/dynamic/preview/

    Preview report data (first 10 rows) without generating PDF.
    Useful for validating filters before generating full report.
    """

    def post(self, request):
        # Force preview format
        data = request.data.copy()
        data['format'] = 'preview'

        serializer = ReportGenerateSerializer(data=data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        validated_data = serializer.validated_data

        config = {
            'report_type': validated_data['report_type'],
            'filters': validated_data.get('filters', {}),
            'columns': validated_data.get('columns', []),
            'group_by': validated_data.get('group_by'),
            'institution_id': validated_data.get('institution_id'),
        }

        try:
            report_data = DynamicReportService.generate_report_data(config)
        except Exception as e:
            return Response(
                {'error': f'Failed to generate preview: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # Return preview (first 10 rows)
        preview_data = report_data.copy()
        preview_data['data'] = report_data['data'][:10]
        preview_data['preview'] = True
        preview_data['showing'] = min(10, len(report_data['data']))

        return Response(preview_data)


class RelationOptionsView(APIView):
    """
    GET /api/reports/options/<report_type>/<field_key>/

    Get available options for a relation field.
    Used to populate dropdowns for relation filters.
    """

    def get(self, request, report_type, field_key):
        institution_id = request.query_params.get('institution_id')
        if institution_id:
            try:
                institution_id = int(institution_id)
            except ValueError:
                institution_id = None

        try:
            options = DynamicReportService.get_relation_options(
                report_type=report_type,
                field_key=field_key,
                institution_id=institution_id
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response({'options': options})
