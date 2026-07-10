"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, Badge, Button, Input } from "@rtb/ui";

export function useRegisterList(endpoint: string) {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reload = () => {
    setLoading(true);
    fetch(endpoint)
      .then((r) => r.json())
      .then((json) => {
        if (json.error) setError(json.error);
        else setItems(Array.isArray(json.data) ? json.data : json.data?.risks ?? []);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  };
  useEffect(reload, [endpoint]);
  return { items, loading, error, reload };
}

export function CreateForm({
  fields,
  endpoint,
  extra,
  onCreated,
}: {
  fields: { key: string; label: string; required?: boolean; multiline?: boolean; type?: string }[];
  endpoint: string;
  extra?: Record<string, unknown>;
  onCreated: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  if (!open) {
    return (
      <Button size="sm" onClick={() => setOpen(true)}>
        New
      </Button>
    );
  }
  return (
    <form
      className="mb-4 grid gap-2 rounded border p-4 md:grid-cols-2"
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...extra, ...values }),
        });
        setLoading(false);
        setOpen(false);
        setValues({});
        onCreated();
      }}
    >
      {fields.map((f) => (
        <div key={f.key} className={f.multiline ? "md:col-span-2" : ""}>
          <label className="mb-1 block text-xs text-muted-foreground">{f.label}</label>
          {f.multiline ? (
            <textarea
              className="min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              required={f.required}
              value={values[f.key] ?? ""}
              onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
            />
          ) : (
            <Input
              type={f.type ?? "text"}
              required={f.required}
              value={values[f.key] ?? ""}
              onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
            />
          )}
        </div>
      ))}
      <div className="flex gap-2 md:col-span-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Create"}
        </Button>
        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function RegisterShell({
  title,
  description,
  endpoint,
  fields,
  numberKey,
  renderMeta,
  createExtra,
}: {
  title: string;
  description: string;
  endpoint: string;
  fields: { key: string; label: string; required?: boolean; multiline?: boolean; type?: string }[];
  numberKey: string;
  renderMeta?: (item: Record<string, unknown>) => React.ReactNode;
  createExtra?: Record<string, unknown>;
}) {
  const { items, loading, error, reload } = useRegisterList(endpoint);
  return (
    <>
      <Header title={title} description={description} />
      <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8" data-testid="page-main">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {loading ? "Loading..." : `${items.length} records`}
          </p>
          <CreateForm fields={fields} endpoint={endpoint} extra={createExtra} onCreated={reload} />
        </div>
        {error && <p className="mb-4 text-sm text-destructive">{error}</p>}
        <div className="grid gap-3">
          {items.map((item) => (
            <Card key={item.id as string}>
              <CardContent className="flex items-start justify-between gap-4 p-4">
                <div>
                  <p className="font-medium">
                    {(item[numberKey] as string) ?? ""} — {(item.title as string) ?? ""}
                  </p>
                  {renderMeta?.(item)}
                </div>
                <div className="flex gap-2">
                  {item.priority ? <Badge variant="outline">{item.priority as string}</Badge> : null}
                  <Badge variant="secondary">{(item.status as string) ?? "—"}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
          {!loading && items.length === 0 && (
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">No records yet.</CardContent>
            </Card>
          )}
        </div>
      </main>
    </>
  );
}
