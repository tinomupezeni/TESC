/**
 * FilterSection Component
 *
 * Renders dynamic filter inputs based on field type.
 */

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import type {
  ReportField,
  FilterValue,
  RelationOption,
} from '@/lib/types/report.types';
import { getRelationOptions } from '@/services/dynamic-reports.service';

interface FilterSectionProps {
  fields: ReportField[];
  filters: Record<string, FilterValue>;
  onChange: (filters: Record<string, FilterValue>) => void;
  reportType: 'staff' | 'students' | 'graduates';
  institutionId?: number | null;
}

export function FilterSection({
  fields,
  filters,
  onChange,
  reportType,
  institutionId,
}: FilterSectionProps) {
  const [relationOptions, setRelationOptions] = useState<
    Record<string, RelationOption[]>
  >({});
  const [loadingOptions, setLoadingOptions] = useState<Record<string, boolean>>(
    {}
  );

  // Load relation options when needed
  const loadRelationOptions = async (fieldKey: string) => {
    if (relationOptions[fieldKey] || loadingOptions[fieldKey]) return;

    setLoadingOptions((prev) => ({ ...prev, [fieldKey]: true }));
    try {
      const response = await getRelationOptions(
        reportType,
        fieldKey,
        institutionId
      );
      setRelationOptions((prev) => ({ ...prev, [fieldKey]: response.options }));
    } catch (error) {
      console.error(`Failed to load options for ${fieldKey}:`, error);
    } finally {
      setLoadingOptions((prev) => ({ ...prev, [fieldKey]: false }));
    }
  };

  const updateFilter = (key: string, value: FilterValue) => {
    onChange({ ...filters, [key]: value });
  };

  const renderFilter = (field: ReportField) => {
    const value = filters[field.key];

    switch (field.type) {
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              id={field.key}
              checked={value === true}
              onCheckedChange={(checked) => updateFilter(field.key, checked)}
            />
            <Label htmlFor={field.key} className="text-sm">
              {value === true ? 'Yes' : value === false ? 'No' : 'All'}
            </Label>
            {value !== null && value !== undefined && (
              <Badge
                variant="outline"
                className="cursor-pointer text-xs"
                onClick={() => updateFilter(field.key, null)}
              >
                Clear
              </Badge>
            )}
          </div>
        );

      case 'choice':
        return (
          <div className="space-y-2">
            <Select
              value={typeof value === 'string' ? value : 'all'}
              onValueChange={(val) =>
                updateFilter(field.key, val === 'all' ? null : val)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {field.choices?.map((choice) => (
                  <SelectItem key={choice} value={choice}>
                    {choice}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Multi-select checkboxes for advanced filtering */}
            {Array.isArray(value) && value.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {value.map((v) => (
                  <Badge key={v} variant="secondary" className="text-xs">
                    {v}
                    <button
                      className="ml-1 hover:text-destructive"
                      onClick={() =>
                        updateFilter(
                          field.key,
                          (value as string[]).filter((x) => x !== v)
                        )
                      }
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        );

      case 'relation':
        const options = relationOptions[field.key] || [];
        return (
          <Select
            value={typeof value === 'number' ? value.toString() : 'all'}
            onValueChange={(val) =>
              updateFilter(
                field.key,
                val === 'all' ? null : parseInt(val, 10)
              )
            }
            onOpenChange={(open) => {
              if (open) loadRelationOptions(field.key);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={loadingOptions[field.key] ? 'Loading...' : 'Select...'}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {options.map((opt) => (
                <SelectItem key={opt.id} value={opt.id.toString()}>
                  {opt.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'number':
        const numValue =
          typeof value === 'object' && value !== null
            ? (value as { min?: number; max?: number })
            : {};
        return (
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="number"
                placeholder="Min"
                value={numValue.min ?? ''}
                onChange={(e) =>
                  updateFilter(field.key, {
                    ...numValue,
                    min: e.target.value ? parseInt(e.target.value, 10) : undefined,
                  })
                }
                className="w-full"
              />
            </div>
            <div className="flex-1">
              <Input
                type="number"
                placeholder="Max"
                value={numValue.max ?? ''}
                onChange={(e) =>
                  updateFilter(field.key, {
                    ...numValue,
                    max: e.target.value ? parseInt(e.target.value, 10) : undefined,
                  })
                }
                className="w-full"
              />
            </div>
          </div>
        );

      case 'date':
        const dateValue =
          typeof value === 'object' && value !== null
            ? (value as { from?: string; to?: string })
            : {};
        return (
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="date"
                placeholder="From"
                value={dateValue.from ?? ''}
                onChange={(e) =>
                  updateFilter(field.key, {
                    ...dateValue,
                    from: e.target.value || undefined,
                  })
                }
                className="w-full"
              />
            </div>
            <div className="flex-1">
              <Input
                type="date"
                placeholder="To"
                value={dateValue.to ?? ''}
                onChange={(e) =>
                  updateFilter(field.key, {
                    ...dateValue,
                    to: e.target.value || undefined,
                  })
                }
                className="w-full"
              />
            </div>
          </div>
        );

      case 'string':
      default:
        return (
          <Input
            type="text"
            placeholder={`Search ${field.label.toLowerCase()}...`}
            value={(value as string) ?? ''}
            onChange={(e) => updateFilter(field.key, e.target.value || null)}
            className="w-full"
          />
        );
    }
  };

  const activeFiltersCount = Object.values(filters).filter(
    (v) => v !== null && v !== undefined && v !== ''
  ).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Filters</h3>
        {activeFiltersCount > 0 && (
          <Badge variant="secondary">{activeFiltersCount} active</Badge>
        )}
      </div>

      <ScrollArea className="h-[300px] pr-4">
        <div className="space-y-4">
          {fields.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label className="text-sm text-muted-foreground">
                {field.label}
              </Label>
              {renderFilter(field)}
            </div>
          ))}
        </div>
      </ScrollArea>

      {activeFiltersCount > 0 && (
        <button
          className="text-sm text-muted-foreground hover:text-foreground"
          onClick={() => onChange({})}
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}

export default FilterSection;
