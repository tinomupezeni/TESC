/**
 * ColumnSelector Component
 *
 * Allows users to select which columns to include in the report.
 */

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import type { ReportField } from '@/lib/types/report.types';

interface ColumnSelectorProps {
  fields: ReportField[];
  selectedColumns: string[];
  defaultColumns: string[];
  onChange: (columns: string[]) => void;
}

export function ColumnSelector({
  fields,
  selectedColumns,
  defaultColumns,
  onChange,
}: ColumnSelectorProps) {
  const toggleColumn = (key: string) => {
    if (selectedColumns.includes(key)) {
      // Don't allow deselecting all columns
      if (selectedColumns.length > 1) {
        onChange(selectedColumns.filter((c) => c !== key));
      }
    } else {
      onChange([...selectedColumns, key]);
    }
  };

  const selectAll = () => {
    onChange(fields.map((f) => f.key));
  };

  const selectDefault = () => {
    onChange(defaultColumns);
  };

  const selectNone = () => {
    // Keep at least the first column
    onChange([fields[0]?.key].filter(Boolean));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Columns</h3>
        <Badge variant="secondary">{selectedColumns.length} selected</Badge>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={selectAll}>
          Select All
        </Button>
        <Button variant="outline" size="sm" onClick={selectDefault}>
          Default
        </Button>
        <Button variant="outline" size="sm" onClick={selectNone}>
          Clear
        </Button>
      </div>

      <ScrollArea className="h-[300px] pr-4">
        <div className="space-y-3">
          {fields.map((field) => {
            const isSelected = selectedColumns.includes(field.key);
            const isDefault = defaultColumns.includes(field.key);

            return (
              <div
                key={field.key}
                className="flex items-center space-x-3 py-1"
              >
                <Checkbox
                  id={`col-${field.key}`}
                  checked={isSelected}
                  onCheckedChange={() => toggleColumn(field.key)}
                />
                <Label
                  htmlFor={`col-${field.key}`}
                  className="flex-1 cursor-pointer text-sm"
                >
                  {field.label}
                </Label>
                {isDefault && (
                  <Badge variant="outline" className="text-xs">
                    Default
                  </Badge>
                )}
                {field.type === 'computed' && (
                  <Badge variant="secondary" className="text-xs">
                    Computed
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <p className="text-xs text-muted-foreground">
        Select columns to include in the report. At least one column is required.
      </p>
    </div>
  );
}

export default ColumnSelector;
