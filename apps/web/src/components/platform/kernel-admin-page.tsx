"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge } from "@rtb/ui";

interface KernelAdminPageProps {
  title: string;
  description: string;
  apiEndpoint: string;
  emptyMessage?: string;
  renderItem?: (item: Record<string, unknown>) => React.ReactNode;
}

export function KernelAdminPage({
  title,
  description,
  apiEndpoint,
  emptyMessage = "No records yet.",
  renderItem,
}: KernelAdminPageProps) {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(apiEndpoint)
      .then((r) => r.json())
      .then((json) => {
        const data = json.data;
        if (Array.isArray(data)) {
          setItems(data);
        } else if (data && typeof data === "object") {
          const flat = Object.values(data).flat();
          setItems(Array.isArray(flat) ? flat as Record<string, unknown>[] : []);
        }
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
        {loading && <p className="text-sm text-muted-foreground">Loading...</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}
        {!loading && !error && items.length === 0 && (
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">{emptyMessage}</p>
            </CardContent>
          </Card>
        )}
        <div className="grid gap-4">
          {items.map((item, i) => (
            <Card key={(item.id as string) ?? i}>
              <CardContent className="p-4">
                {renderItem ? renderItem(item) : <DefaultItemView item={item} />}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      </>
  );
}

function DefaultItemView({ item }: { item: Record<string, unknown> }) {
  const title = (item.name ?? item.title ?? item.slug ?? item.id ?? "Record") as string;
  const status = item.status as string | undefined;
  const type = (item.type ?? item.node_type ?? item.twin_type ?? item.job_type ?? item.event_type) as string | undefined;

  return (
    <div className="flex items-start justify-between">
      <div>
        <p className="font-medium">{title}</p>
        {type && <p className="text-xs text-muted-foreground">{type}</p>}
        {item.created_at ? (
          <p className="mt-1 text-xs text-muted-foreground">
            {new Date(item.created_at as string).toLocaleString()}
          </p>
        ) : null}
      </div>
      {status && (
        <Badge variant={status === "completed" || status === "active" || status === "enabled" ? "success" : "secondary"}>
          {status}
        </Badge>
      )}
    </div>
  );
}

export function KernelInfoPage({
  title,
  description,
  sections,
}: {
  title: string;
  description: string;
  sections: { title: string; description: string; items?: string[] }[];
}) {
  return (
      <>
        <Header title={title} description={description} />
              <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8" data-testid="page-main">
        <div className="grid gap-4 md:grid-cols-2">
          {sections.map((section) => (
            <Card key={section.title}>
              <CardHeader>
                <CardTitle className="text-base">{section.title}</CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              {section.items && (
                <CardContent>
                  <ul className="list-inside list-disc text-sm text-muted-foreground">
                    {section.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </main>
      </>
  );
}
