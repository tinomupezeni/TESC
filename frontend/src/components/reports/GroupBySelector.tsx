/**
 * GroupBySelector Component
 *
 * Allows users to select a field to group/aggregate results by.
 */

import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ReportField, ReportFormat, ReportOrientation } from '@/lib/types/report.types';

interface GroupBySelectorProps {
  fields: ReportField[];
  value: string | null;
  onChange: (value: string | null) => void;
}

export function GroupBySelector({
  fields,
  value,
  onChange,
}: GroupBySelectorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Group By</h3>
        {value && <Badge variant="secondary">Aggregated</Badge>}
      </div>

      <p className="text-sm text-muted-foreground">
        Group results by a field to see counts. Leave empty for detailed records.
      </p>

      <ScrollArea className="h-[200px] pr-4">
        <RadioGroup
          value={value || 'none'}
          onValueChange={(val) => onChange(val === 'none' ? null : val)}
        >
          <div className="flex items-center space-x-2 py-2">
            <RadioGroupItem value="none" id="group-none" />
            <Label htmlFor="group-none" className="cursor-pointer">
              No grouping (detailed records)
            </Label>
          </div>

          {fields.map((field) => (
            <div key={field.key} className="flex items-center space-x-2 py-2">
              <RadioGroupItem value={field.key} id={`group-${field.key}`} />
              <Label
                htmlFor={`group-${field.key}`}
                className="flex-1 cursor-pointer"
              >
                {field.label}
              </Label>
              <span className="text-xs text-muted-foreground">
                {field.type}
              </span>
            </div>
          ))}
        </RadioGroup>
      </ScrollArea>
    </div>
  );
}

interface FormatSelectorProps {
  format: ReportFormat;
  orientation: ReportOrientation;
  onFormatChange: (format: ReportFormat) => void;
  onOrientationChange: (orientation: ReportOrientation) => void;
}

export function FormatSelector({
  format,
  orientation,
  onFormatChange,
  onOrientationChange,
}: FormatSelectorProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="text-sm font-medium">Output Format</Label>
        <RadioGroup
          value={format}
          onValueChange={(val) => onFormatChange(val as ReportFormat)}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="pdf" id="format-pdf" />
            <Label htmlFor="format-pdf" className="cursor-pointer">
              PDF Document
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="json" id="format-json" />
            <Label htmlFor="format-json" className="cursor-pointer">
              JSON Data
            </Label>
          </div>
        </RadioGroup>
      </div>

      {format === 'pdf' && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">Page Orientation</Label>
          <Select
            value={orientation}
            onValueChange={(val) => onOrientationChange(val as ReportOrientation)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto (based on columns)</SelectItem>
              <SelectItem value="portrait">Portrait</SelectItem>
              <SelectItem value="landscape">Landscape</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}

export default GroupBySelector;
