"""
Dynamic Report Service

Handles building querysets, applying filters, aggregations, and generating report data.
"""

from django.db.models import Count, Q
from django.apps import apps

from .schema_config import get_schema, get_field_by_key, REPORT_SCHEMAS


class DynamicReportService:
    """Service for generating dynamic reports based on schema configuration."""

    @staticmethod
    def get_model(report_type: str):
        """Get the Django model for a report type."""
        schema = get_schema(report_type)
        model_path = schema['model']
        app_label, model_name = model_path.split('.')
        return apps.get_model(app_label, model_name)

    @staticmethod
    def build_queryset(report_type: str, filters: dict = None, institution_id: int = None):
        """
        Build a queryset with filters applied.

        Args:
            report_type: Type of report (staff, students, graduates)
            filters: Dictionary of filter key-value pairs
            institution_id: Optional institution ID to filter by

        Returns:
            QuerySet with filters applied
        """
        Model = DynamicReportService.get_model(report_type)
        schema = get_schema(report_type)

        queryset = Model.objects.all()

        # Apply base filter if defined (e.g., graduates = status='Graduated')
        base_filter = schema.get('base_filter', {})
        if base_filter:
            queryset = queryset.filter(**base_filter)

        # Apply institution filter if provided
        if institution_id:
            queryset = queryset.filter(institution_id=institution_id)

        # Add select_related for relation fields to optimize queries
        select_related = []
        if report_type == 'staff':
            select_related = ['institution', 'faculty', 'department']
        elif report_type in ['students', 'graduates']:
            select_related = ['institution', 'program', 'program__department', 'program__department__faculty']

        if select_related:
            queryset = queryset.select_related(*select_related)

        # Apply user-provided filters
        if filters:
            filter_kwargs = {}
            exclude_kwargs = {}

            for key, value in filters.items():
                if value is None or value == '' or value == 'all':
                    continue

                field_def = get_field_by_key(report_type, key)
                if not field_def:
                    continue

                field_type = field_def.get('type')

                # Handle different field types
                if field_type == 'boolean':
                    if value in [True, 'true', 'True', '1', 1]:
                        filter_kwargs[key] = True
                    elif value in [False, 'false', 'False', '0', 0]:
                        filter_kwargs[key] = False

                elif field_type == 'choice':
                    if isinstance(value, list):
                        # Multiple choice filter (OR)
                        filter_kwargs[f'{key}__in'] = value
                    else:
                        filter_kwargs[key] = value

                elif field_type == 'relation':
                    # Handle relation filters - map to actual field names
                    actual_key = DynamicReportService._get_relation_filter_key(report_type, key)
                    if isinstance(value, list):
                        filter_kwargs[f'{actual_key}__in'] = value
                    else:
                        filter_kwargs[actual_key] = value

                elif field_type == 'number':
                    # Support range filters for numbers
                    if isinstance(value, dict):
                        if 'min' in value and value['min'] is not None:
                            filter_kwargs[f'{key}__gte'] = value['min']
                        if 'max' in value and value['max'] is not None:
                            filter_kwargs[f'{key}__lte'] = value['max']
                    else:
                        filter_kwargs[key] = value

                elif field_type == 'date':
                    # Support date range filters
                    if isinstance(value, dict):
                        if 'from' in value and value['from']:
                            filter_kwargs[f'{key}__gte'] = value['from']
                        if 'to' in value and value['to']:
                            filter_kwargs[f'{key}__lte'] = value['to']
                    else:
                        filter_kwargs[key] = value

                elif field_type == 'string':
                    # Case-insensitive contains search for strings
                    filter_kwargs[f'{key}__icontains'] = value

            if filter_kwargs:
                queryset = queryset.filter(**filter_kwargs)
            if exclude_kwargs:
                queryset = queryset.exclude(**exclude_kwargs)

        return queryset

    @staticmethod
    def _get_relation_filter_key(report_type: str, key: str) -> str:
        """Map relation display key to actual filter key."""
        mapping = {
            'staff': {
                'institution_name': 'institution_id',
                'faculty_name': 'faculty_id',
                'department_name': 'department_id',
            },
            'students': {
                'institution_name': 'institution_id',
                'program_name': 'program_id',
                'program_level': 'program__level',
                'program_category': 'program__category',
            },
            'graduates': {
                'institution_name': 'institution_id',
                'program_name': 'program_id',
                'program_level': 'program__level',
                'program_category': 'program__category',
            }
        }
        return mapping.get(report_type, {}).get(key, key)

    @staticmethod
    def apply_aggregation(queryset, group_by: str, report_type: str):
        """
        Apply grouping/aggregation to a queryset.

        Args:
            queryset: The base queryset
            group_by: Field to group by
            report_type: Type of report

        Returns:
            QuerySet with aggregation applied, returning group name and count
        """
        # Map group_by field to actual model field
        group_field_map = {
            'staff': {
                'position': 'position',
                'qualification': 'qualification',
                'institution_name': 'institution__name',
                'faculty_name': 'faculty__name',
                'department_name': 'department__name',
                'is_active': 'is_active',
            },
            'students': {
                'gender': 'gender',
                'status': 'status',
                'enrollment_year': 'enrollment_year',
                'institution_name': 'institution__name',
                'program_name': 'program__name',
                'program_level': 'program__level',
                'program_category': 'program__category',
                'disability_type': 'disability_type',
                'is_iseop': 'is_iseop',
                'is_work_for_fees': 'is_work_for_fees',
                'work_area': 'work_area',
            },
            'graduates': {
                'gender': 'gender',
                'enrollment_year': 'enrollment_year',
                'graduation_year': 'graduation_year',
                'final_grade': 'final_grade',
                'institution_name': 'institution__name',
                'program_name': 'program__name',
                'program_level': 'program__level',
                'program_category': 'program__category',
                'disability_type': 'disability_type',
                'is_iseop': 'is_iseop',
            }
        }

        actual_field = group_field_map.get(report_type, {}).get(group_by, group_by)

        return queryset.values(actual_field).annotate(
            count=Count('id')
        ).order_by('-count')

    @staticmethod
    def extract_record_data(obj, columns: list, report_type: str) -> dict:
        """
        Extract data from a model instance based on selected columns.

        Args:
            obj: Model instance
            columns: List of column keys to extract
            report_type: Type of report

        Returns:
            Dictionary of column values
        """
        data = {}

        for col in columns:
            value = DynamicReportService._get_field_value(obj, col, report_type)
            data[col] = value

        return data

    @staticmethod
    def _get_field_value(obj, key: str, report_type: str):
        """Get the value of a field from a model instance."""
        # Handle computed fields
        if key == 'full_name':
            return f"{obj.first_name} {obj.last_name}"

        # Handle relation display fields
        relation_map = {
            'institution_name': lambda o: o.institution.name if o.institution else '',
            'faculty_name': lambda o: o.faculty.name if hasattr(o, 'faculty') and o.faculty else '',
            'department_name': lambda o: o.department.name if hasattr(o, 'department') and o.department else '',
            'program_name': lambda o: o.program.name if hasattr(o, 'program') and o.program else '',
            'program_level': lambda o: o.program.level if hasattr(o, 'program') and o.program else '',
            'program_category': lambda o: o.program.category if hasattr(o, 'program') and o.program else '',
        }

        if key in relation_map:
            return relation_map[key](obj)

        # Handle boolean display
        if key == 'is_active':
            return 'Active' if getattr(obj, key, False) else 'Inactive'
        if key in ['is_iseop', 'is_work_for_fees']:
            return 'Yes' if getattr(obj, key, False) else 'No'

        # Default: get attribute directly
        return getattr(obj, key, '')

    @staticmethod
    def generate_report_data(config: dict) -> dict:
        """
        Main entry point for generating report data.

        Args:
            config: Report configuration containing:
                - report_type: Type of report (staff, students, graduates)
                - filters: Dictionary of filters
                - columns: List of columns to include
                - group_by: Optional field to group by
                - institution_id: Optional institution filter

        Returns:
            Dictionary containing:
                - data: List of records or aggregated data
                - total: Total record count
                - columns: Column definitions for selected columns
                - is_aggregated: Whether data is aggregated
                - group_by: Group by field (if aggregated)
        """
        report_type = config.get('report_type')
        filters = config.get('filters', {})
        columns = config.get('columns', [])
        group_by = config.get('group_by')
        institution_id = config.get('institution_id')

        # Get schema and default columns if none specified
        schema = get_schema(report_type)
        if not columns:
            columns = schema.get('default_columns', [])

        # Build base queryset
        queryset = DynamicReportService.build_queryset(
            report_type=report_type,
            filters=filters,
            institution_id=institution_id
        )

        total = queryset.count()

        # Handle aggregated reports
        if group_by:
            aggregated = DynamicReportService.apply_aggregation(
                queryset=queryset,
                group_by=group_by,
                report_type=report_type
            )

            field_def = get_field_by_key(report_type, group_by)
            group_label = field_def['label'] if field_def else group_by

            # Get the actual DB field name
            group_field_map = {
                'staff': {
                    'institution_name': 'institution__name',
                    'faculty_name': 'faculty__name',
                    'department_name': 'department__name',
                },
                'students': {
                    'institution_name': 'institution__name',
                    'program_name': 'program__name',
                    'program_level': 'program__level',
                    'program_category': 'program__category',
                },
                'graduates': {
                    'institution_name': 'institution__name',
                    'program_name': 'program__name',
                    'program_level': 'program__level',
                    'program_category': 'program__category',
                }
            }
            actual_field = group_field_map.get(report_type, {}).get(group_by, group_by)

            data = []
            for item in aggregated:
                group_value = item.get(actual_field, item.get(group_by, 'Unknown'))
                # Handle boolean display
                if group_by == 'is_active':
                    group_value = 'Active' if group_value else 'Inactive'
                elif group_by in ['is_iseop', 'is_work_for_fees']:
                    group_value = 'Yes' if group_value else 'No'

                data.append({
                    'group': group_value if group_value else 'Not Specified',
                    'count': item['count']
                })

            return {
                'data': data,
                'total': total,
                'is_aggregated': True,
                'group_by': group_by,
                'group_label': group_label,
                'columns': [
                    {'key': 'group', 'label': group_label},
                    {'key': 'count', 'label': 'Count'}
                ]
            }

        # Non-aggregated: return individual records
        data = []
        for obj in queryset:
            record = DynamicReportService.extract_record_data(obj, columns, report_type)
            data.append(record)

        # Get column definitions for selected columns
        column_defs = []
        for col in columns:
            field_def = get_field_by_key(report_type, col)
            if field_def:
                column_defs.append({
                    'key': col,
                    'label': field_def['label']
                })

        return {
            'data': data,
            'total': total,
            'is_aggregated': False,
            'group_by': None,
            'columns': column_defs
        }

    @staticmethod
    def get_relation_options(report_type: str, field_key: str, institution_id: int = None) -> list:
        """
        Get available options for a relation field.

        Args:
            report_type: Type of report
            field_key: The field key (e.g., 'institution_name')
            institution_id: Optional institution filter

        Returns:
            List of options with id and name
        """
        field_def = get_field_by_key(report_type, field_key)
        if not field_def or field_def.get('type') != 'relation':
            return []

        relation_model = field_def.get('relation_model')
        if not relation_model:
            return []

        app_label, model_name = relation_model.split('.')
        Model = apps.get_model(app_label, model_name)

        queryset = Model.objects.all()

        # Apply institution filter for nested relations
        if institution_id:
            if model_name == 'Program':
                queryset = queryset.filter(
                    department__faculty__institution_id=institution_id
                )
            elif model_name in ['Faculty', 'Department']:
                queryset = queryset.filter(institution_id=institution_id)

        return [{'id': obj.id, 'name': str(obj)} for obj in queryset.order_by('name')[:100]]
