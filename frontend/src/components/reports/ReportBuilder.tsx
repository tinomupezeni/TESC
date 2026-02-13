/**
 * ReportBuilder Component
 *
 * Main dialog component for building and generating dynamic reports.
 * Provides tabs for filters, columns, and options.
 */

import { useState, useEffect, useCallback } from 'react';
import { FileText, Download, Eye, Loader2, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

import { FilterSection } from './FilterSection';
import { ColumnSelector } from './ColumnSelector';
import { GroupBySelector, FormatSelector } from './GroupBySelector';

import {
  getReportSchema,
  previewReport,
  generateReportPDF,
} from '@/services/dynamic-reports.service';

import type {
  ReportType,
  ReportSchema,
  ReportDataResponse,
  FilterValue,
  ReportFormat,
  ReportOrientation,
} from '@/lib/types/report.types';

interface ReportBuilderProps {
  reportType: ReportType;
  institutionId?: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerated?: () => void;
}

export function ReportBuilder({
  reportType,
  institutionId,
  open,
  onOpenChange,
  onGenerated,
}: ReportBuilderProps) {
  // Schema state
  const [schema, setSchema] = useState<ReportSchema | null>(null);
  const [schemaLoading, setSchemaLoading] = useState(false);
  const [schemaError, setSchemaError] = useState<string | null>(null);

  // Configuration state
  const [title, setTitle] = useState('');
  const [filters, setFilters] = useState<Record<string, FilterValue>>({});
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [groupBy, setGroupBy] = useState<string | null>(null);
  const [format, setFormat] = useState<ReportFormat>('pdf');
  const [orientation, setOrientation] = useState<ReportOrientation>('auto');

  // Preview state
  const [previewData, setPreviewData] = useState<ReportDataResponse | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load schema when dialog opens
  useEffect(() => {
    if (open && !schema) {
      loadSchema();
    }
  }, [open, reportType]);

  // Reset state when report type changes
  useEffect(() => {
    setSchema(null);
    setFilters({});
    setSelectedColumns([]);
    setGroupBy(null);
    setPreviewData(null);
    setError(null);
  }, [reportType]);

  const loadSchema = async () => {
    setSchemaLoading(true);
    setSchemaError(null);

    try {
      const data = await getReportSchema(reportType);
      setSchema(data);
      setSelectedColumns(data.default_columns);
      setTitle(data.title);
    } catch (err) {
      setSchemaError('Failed to load report schema');
      console.error('Schema load error:', err);
    } finally {
      setSchemaLoading(false);
    }
  };

  const handlePreview = async () => {
    if (!schema) return;

    setPreviewLoading(true);
    setError(null);

    try {
      const data = await previewReport({
        report_type: reportType,
        filters,
        columns: selectedColumns,
        group_by: groupBy,
        institution_id: institutionId,
      });
      setPreviewData(data);
    } catch (err) {
      setError('Failed to generate preview');
      console.error('Preview error:', err);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!schema) return;

    setIsGenerating(true);
    setError(null);

    try {
      await generateReportPDF({
        report_type: reportType,
        title: title || schema.title,
        filters,
        columns: selectedColumns,
        group_by: groupBy,
        institution_id: institutionId,
        orientation,
      });
      onGenerated?.();
      onOpenChange(false);
    } catch (err) {
      setError('Failed to generate report');
      console.error('Generate error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const reportTypeLabel = {
    staff: 'Staff',
    students: 'Students',
    graduates: 'Graduates',
  }[reportType];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-green-600" />
            Generate {reportTypeLabel} Report
          </DialogTitle>
          <DialogDescription>
            Configure filters, columns, and options to generate a custom report.
          </DialogDescription>
        </DialogHeader>

        {schemaLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : schemaError ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <p className="text-destructive">{schemaError}</p>
            <Button variant="outline" onClick={loadSchema}>
              Retry
            </Button>
          </div>
        ) : schema ? (
          <>
            {/* Title Input */}
            <div className="space-y-2">
              <Label htmlFor="report-title">Report Title</Label>
              <Input
                id="report-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={schema.title}
              />
            </div>

            {/* Main Tabs */}
            <Tabs defaultValue="filters" className="flex-1 overflow-hidden">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="filters">
                  Filters
                  {Object.keys(filters).length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {Object.keys(filters).length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="columns">
                  Columns
                  <Badge variant="secondary" className="ml-2">
                    {selectedColumns.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="options">Options</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-hidden mt-4">
                <TabsContent value="filters" className="h-full m-0">
                  <FilterSection
                    fields={schema.filterable_fields}
                    filters={filters}
                    onChange={setFilters}
                    reportType={reportType}
                    institutionId={institutionId}
                  />
                </TabsContent>

                <TabsContent value="columns" className="h-full m-0">
                  <ColumnSelector
                    fields={schema.selectable_fields}
                    selectedColumns={selectedColumns}
                    defaultColumns={schema.default_columns}
                    onChange={setSelectedColumns}
                  />
                </TabsContent>

                <TabsContent value="options" className="h-full m-0">
                  <div className="grid grid-cols-2 gap-8">
                    <GroupBySelector
                      fields={schema.groupable_fields}
                      value={groupBy}
                      onChange={setGroupBy}
                    />
                    <FormatSelector
                      format={format}
                      orientation={orientation}
                      onFormatChange={setFormat}
                      onOrientationChange={setOrientation}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="preview" className="h-full m-0">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium">Data Preview</h3>
                        <p className="text-xs text-muted-foreground">
                          Preview the first 10 rows of your report
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePreview}
                        disabled={previewLoading}
                      >
                        {previewLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Eye className="h-4 w-4 mr-2" />
                        )}
                        Refresh Preview
                      </Button>
                    </div>

                    {previewData ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-4 text-sm">
                          <Badge variant="outline">
                            Total: {previewData.total.toLocaleString()}
                          </Badge>
                          {previewData.showing && (
                            <span className="text-muted-foreground">
                              Showing {previewData.showing} of {previewData.total}
                            </span>
                          )}
                          {previewData.is_aggregated && (
                            <Badge>Grouped by {previewData.group_label}</Badge>
                          )}
                        </div>

                        <ScrollArea className="h-[250px] border rounded-md">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                {previewData.columns.map((col) => (
                                  <TableHead key={col.key}>{col.label}</TableHead>
                                ))}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {previewData.data.map((row, idx) => (
                                <TableRow key={idx}>
                                  {previewData.columns.map((col) => (
                                    <TableCell key={col.key}>
                                      {String(row[col.key] ?? '')}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </ScrollArea>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                        <Eye className="h-8 w-8 mb-2" />
                        <p>Click "Refresh Preview" to see data</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </div>
            </Tabs>

            <Separator />

            {/* Error Display */}
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md flex items-center justify-between">
                {error}
                <button onClick={() => setError(null)}>
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Footer */}
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isGenerating}
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={handlePreview}
                disabled={previewLoading || isGenerating}
              >
                {previewLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Eye className="h-4 w-4 mr-2" />
                )}
                Preview
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || selectedColumns.length === 0}
                className="bg-green-600 hover:bg-green-700"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Generate PDF
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export default ReportBuilder;
