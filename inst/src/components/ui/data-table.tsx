// ui/data-table.tsx
import React from "react";

export interface DataTableColumn<T> {
  header: string;
  accessorKey: keyof T | "actions"; // for action buttons
  cell?: (props: { row: T }) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  loading?: boolean;
}

export const DataTable = <T extends Record<string, any>>({ columns, data, loading }: DataTableProps<T>) => {
  if (loading) return <div className="p-4 text-center">Loading...</div>;

  return (
    <table className="w-full border-collapse border">
      <thead>
        <tr>
          {columns.map(col => (
            <th key={col.header} className="border p-2">{col.header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i}>
            {columns.map(col => (
              <td key={col.header} className="border p-2">
                {col.cell ? col.cell({ row }) : row[col.accessorKey as keyof T]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
