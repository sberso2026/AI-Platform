import { Card, CardContent } from "@rtb/ui";
import type { ReactNode } from "react";

export interface CommerceTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
}

export function CommerceDataTable<T extends { id: string }>({
  columns,
  rows,
  emptyMessage = "No records found.",
}: {
  columns: CommerceTableColumn<T>[];
  rows: T[];
  emptyMessage?: string;
}) {
  if (rows.length === 0) {
    return (
      <Card data-testid="commerce-data-table-empty">
        <CardContent className="py-10 text-center text-sm text-slate-500">
          {emptyMessage}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden" data-testid="commerce-data-table">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-slate-50 text-left">
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 font-medium text-slate-600">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-border last:border-0 hover:bg-slate-50/50"
                data-testid={`commerce-row-${row.id}`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-slate-700">
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
