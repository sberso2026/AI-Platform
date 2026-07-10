"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Card, CardContent, StatusChip } from "@rtb/ui";

export function EngineeringListPage({
  title,
  description,
  apiEndpoint,
  createHref,
  createLabel,
  emptyMessage,
  renderItem,
}: {
  title: string;
  description: string;
  apiEndpoint: string;
  createHref?: string;
  createLabel?: string;
  emptyMessage?: string;
  renderItem?: (item: Record<string, unknown>) => React.ReactNode;
}) {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(apiEndpoint)
      .then((r) => r.json())
      .then((json) => {
        if (json.error) setError(json.error);
        else setItems(Array.isArray(json.data) ? json.data : []);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [apiEndpoint]);

  return (
      <>
        <Header title={title} description={description} />
              <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8" data-testid="page-main">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[0.9375rem] text-slate-500">
            {loading ? "Loading..." : `${items.length} records`}
          </p>
          {createHref && (
            <Link
              href={createHref}
              className="inline-flex h-8 items-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90"
            >
              {createLabel ?? "Create"}
            </Link>
          )}
        </div>
        {error && <p className="mb-4 text-sm text-destructive">{error}</p>}
        {!loading && !error && items.length === 0 && (
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">
                {emptyMessage ?? "No records yet."}
              </p>
            </CardContent>
          </Card>
        )}
        <div className="grid gap-4">
          {items.map((item, i) => (
            <Card key={(item.id as string) ?? i}>
              <CardContent className="p-4">
                {renderItem ? (
                  renderItem(item)
                ) : (
                  <DefaultEngItem item={item} />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
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
