import re

file_path = "src/components/reports/ReportBuilder.tsx"
with open(file_path, "r") as f:
    content = f.read()

# 1. Update Props
props_pattern = r'interface ReportBuilderProps \{(.*?)\}'
props_repl = r'''interface ReportBuilderProps {\1
  defaultFilters?: Record<string, any>;
  hideFilters?: boolean;
}'''
content = re.sub(props_pattern, props_repl, content, flags=re.DOTALL)

# 2. Update destructuring
destruct_pattern = r'export function ReportBuilder\(\{([^\}]+)\}: ReportBuilderProps\) \{'
destruct_repl = r'export function ReportBuilder({\1, defaultFilters, hideFilters}: ReportBuilderProps) {'
content = re.sub(destruct_pattern, destruct_repl, content)

# 3. Update reset state to use defaultFilters
reset_pattern = r'setFilters\(\{\}\);'
reset_repl = r'setFilters(defaultFilters || {});'
content = content.replace(reset_pattern, reset_repl)

# 4. Hide filters tab if hideFilters is true
tabs_list_pattern = r'(<TabsList className="grid w-full[^"]*">)'
content = re.sub(
    tabs_list_pattern,
    r'\1\n              {!hideFilters && <TabsTrigger value="filters">Filters</TabsTrigger>}',
    content
)

# And remove the original TabsTrigger for filters
content = content.replace('<TabsTrigger value="filters">Filters</TabsTrigger>', '')

# Hide the actual FilterSection content
filter_section_pattern = r'(<TabsContent value="filters" className="mt-4">.*?<FilterSection.*?</TabsContent>)'
filter_section_repl = r'''{!hideFilters && \1}'''
content = re.sub(filter_section_pattern, filter_section_repl, content, flags=re.DOTALL)

# Because we removed the filter tab, if hideFilters is true, default value should be 'columns' instead of 'filters'
# Look for <Tabs defaultValue="filters"
content = content.replace('<Tabs defaultValue="filters"', '<Tabs defaultValue={hideFilters ? "columns" : "filters"}')

with open(file_path, "w") as f:
    f.write(content)

