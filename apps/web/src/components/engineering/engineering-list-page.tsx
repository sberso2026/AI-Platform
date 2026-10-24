"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { StatusChip } from "@rtb/ui";
import { loadEngineeringListItems } from "@/lib/engineering/load-engineering-list";
import {
  useResolvedEngineeringProjectId,
  withProjectQuery,
} from "@/hooks/use-engineering-project-filter";
import {
  EmptyOperationalState,
  OperationalError,
  OperationalSkeleton,
  StatusTable,
  type OperationalRow,
} from "@/components/engineering/operational";
import { formatOperationalDate, pickExistingField } from "@/lib/engineering/enterprise-ux";

export function EngineeringListPage({
  title,
  description,
  apiEndpoint,
  createHref,
  createLabel,
  emptyTitle,
  emptyMessage,
  emptyDescription,
  renderItem,
  columns,
  rowHref,
}: {
  title: string;
  description: string;
  apiEndpoint: string;
  createHref?: string;
  createLabel?: string;
  emptyTitle?: string;
  emptyMessage?: string;
  emptyDescription?: string;
  renderItem?: (item: Record<string, unknown>) => React.ReactNode;
  columns?: Array<{ key: string; label: string; hrefKey?: boolean; status?: boolean }>;
  rowHref?: (item: Record<string, unknown>) => string;
}) {
  const projectId = useResolvedEngineeringProjectId();
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scopedEndpoint = useMemo(
    () => withProjectQuery(apiEndpoint, projectId),
    [apiEndpoint, projectId],
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    loadEngineeringListItems(scopedEndpoint)
      .then((result) => {
        if (cancelled) return;
        setItems(result.items);
        setError(result.error);
        setLoading(false);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load records");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [scopedEndpoint]);

  const createButton =
    createHref ? (
      <Link
        href={withProjectQuery(createHref, projectId)}
        className="inline-flex min-h-11 items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        data-testid="engineering-list-create"
      >
        {createLabel ?? "Create"}
      </Link>
    ) : null;

  const tableRows: OperationalRow[] = items.map((item) => ({
    ...item,
    href: rowHref?.(item),
    project:
      [item.project_code, item.project_name].filter(Boolean).join(" — ") ||
      pickExistingField(item, ["project_name", "project_code"]),
    asset:
      [item.asset_tag, item.asset_name].filter(Boolean).join(" — ") ||
      pickExistingField(item, ["asset_name", "asset_tag"]),
    owner: pickExistingField(item, ["assigned_to", "owner_id", "owner"]),
    due: formatOperationalDate(item.due_date ?? item.response_due),
    updated: formatOperationalDate(item.updated_at),
    criticality: item.criticality ?? "—",
  }));

  return (
    <>
      <Header title={title} description={description} />
      <main
        className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8"
        data-testid="page-main"
      >
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[0.9375rem] text-slate-500">
            {loading ? "Loading…" : `${items.length} records`}
            {projectId ? " · selected project" : " · workspace"}
          </p>
          {createButton}
        </div>
        {error ? (
          <div className="mb-4" data-testid="engineering-list-error">
            <OperationalError message={error} />
          </div>
        ) : null}
        {loading ? <OperationalSkeleton label={`Loading ${title}…`} /> : null}
        {!loading && !error && items.length === 0 ? (
          <div data-testid="engineering-list-empty">
            <EmptyOperationalState
              title={emptyTitle ?? "No records yet"}
              description={
                emptyDescription ??
                emptyMessage ??
                "Nothing is recorded in this scope yet. That can be normal for a new workspace."
              }
              action={createButton}
            />
          </div>
        ) : null}
        {!loading && items.length > 0 ? (
          columns ? (
            <StatusTable
              columns={columns}
              rows={tableRows}
              emptyTitle={emptyTitle ?? "No records yet"}
              emptyDescription={emptyDescription ?? emptyMessage ?? "No records yet."}
            />
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
              <table className="min-w-full text-left text-sm">
                <caption className="sr-only">{title}</caption>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, i) => (
                    <tr key={(item.id as string) ?? i} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        {renderItem ? renderItem(item) : <DefaultEngItem item={item} />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : null}
      </main>
    </>
  );
}

function DefaultEngItem({ item }: { item: Record<string, unknown> }) {
  const title = (item.project_name ??
    item.asset_name ??
    item.title ??
    item.name ??
    item.id) as string;
  const subtitle = (item.project_code ??
    item.asset_tag ??
    item.document_number ??
    item.company_type ??
    item.discipline_key) as string | undefined;
  const status = item.status as string | undefined;

  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-[0.9375rem] font-medium text-slate-800">{title}</p>
        {subtitle && (
          <p className="mt-1 text-[0.8125rem] text-slate-500">{subtitle}</p>
        )}
      </div>
      {status && <StatusChip value={status} />}
    </div>
  );
}
