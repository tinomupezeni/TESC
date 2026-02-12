/**
 * Dynamic Report Types
 *
 * Type definitions for the dynamic report generation system.
 */

// Field type options
export type ReportFieldType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'choice'
  | 'date'
  | 'relation'
  | 'computed';

// Report type options
export type ReportType = 'staff' | 'students' | 'graduates';

// Output format options
export type ReportFormat = 'pdf' | 'json' | 'preview';

// Page orientation options
export type ReportOrientation = 'portrait' | 'landscape' | 'auto';

/**
 * Field definition from schema
 */
export interface ReportField {
  key: string;
  label: string;
  type: ReportFieldType;
  choices?: string[];
  filterable?: boolean;
  selectable?: boolean;
  groupable?: boolean;
  relation_model?: string;
}

/**
 * Report schema returned by API
 */
export interface ReportSchema {
  report_type: ReportType;
  title: string;
  fields: ReportField[];
  filterable_fields: ReportField[];
  selectable_fields: ReportField[];
  groupable_fields: ReportField[];
  default_columns: string[];
}

/**
 * Schema list item
 */
export interface ReportSchemaListItem {
  report_type: ReportType;
  title: string;
  field_count: number;
  groupable_count: number;
}

/**
 * Filter value - can be various types
 */
export type FilterValue =
  | string
  | string[]
  | number
  | boolean
  | null
  | { min?: number; max?: number }
  | { from?: string; to?: string };

/**
 * Report configuration for generating reports
 */
export interface ReportConfig {
  report_type: ReportType;
  title?: string;
  filters: Record<string, FilterValue>;
  columns: string[];
  group_by?: string | null;
  institution_id?: number | null;
  format: ReportFormat;
  orientation?: ReportOrientation;
}

/**
 * Column definition in report response
 */
export interface ReportColumn {
  key: string;
  label: string;
}

/**
 * Report data response from API
 */
export interface ReportDataResponse {
  data: Record<string, unknown>[];
  total: number;
  columns: ReportColumn[];
  is_aggregated: boolean;
  group_by: string | null;
  group_label?: string | null;
  preview?: boolean;
  showing?: number;
}

/**
 * Aggregated report row (when group_by is used)
 */
export interface AggregatedRow {
  group: string;
  count: number;
}

/**
 * Relation option for dropdowns
 */
export interface RelationOption {
  id: number;
  name: string;
}

/**
 * Relation options response
 */
export interface RelationOptionsResponse {
  options: RelationOption[];
}

/**
 * Report builder state
 */
export interface ReportBuilderState {
  reportType: ReportType;
  schema: ReportSchema | null;
  filters: Record<string, FilterValue>;
  selectedColumns: string[];
  groupBy: string | null;
  title: string;
  format: ReportFormat;
  orientation: ReportOrientation;
  isLoading: boolean;
  isGenerating: boolean;
  previewData: ReportDataResponse | null;
  error: string | null;
}

/**
 * Filter component props
 */
export interface FilterProps {
  field: ReportField;
  value: FilterValue;
  onChange: (value: FilterValue) => void;
  relationOptions?: RelationOption[];
  onLoadOptions?: () => Promise<RelationOption[]>;
}

/**
 * Column selector props
 */
export interface ColumnSelectorProps {
  fields: ReportField[];
  selectedColumns: string[];
  onChange: (columns: string[]) => void;
}

/**
 * Group by selector props
 */
export interface GroupBySelectorProps {
  fields: ReportField[];
  value: string | null;
  onChange: (value: string | null) => void;
}

/**
 * Report builder dialog props
 */
export interface ReportBuilderProps {
  reportType: ReportType;
  institutionId?: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerated?: () => void;
}
