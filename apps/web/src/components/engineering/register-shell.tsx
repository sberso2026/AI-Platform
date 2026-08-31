"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Button, Input, StatusChip } from "@rtb/ui";
import {
  asRecordArray,
  parseApiJsonResponse,
} from "@/lib/api/parse-json-response";
import {
  useResolvedEngineeringProjectId,
  withProjectQuery,
} from "@/hooks/use-engineering-project-filter";
import {
  EmptyOperationalState,
  EngineeringBreadcrumb,
  OperationalError,
  OperationalSkeleton,
  StatusTable,
  type OperationalRow,
} from "@/components/engineering/operational";
import { formatOperationalDate, pickExistingField } from "@/lib/engineering/enterprise-ux";

export function useRegisterList(endpoint: string) {
  const projectId = useResolvedEngineeringProjectId();
  const scoped = withProjectQuery(endpoint, projectId);
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reload = () => {
    setLoading(true);
    setError(null);
    fetch(scoped)
      .then((r) => parseApiJsonResponse(r))
      .then((parsed) => {
        if (!parsed.ok) {
          setError(
            parsed.errorMessage ?? `Request failed with status ${parsed.status}`,
          );
          setItems([]);
        } else if (Array.isArray(parsed.data)) {
          setItems(asRecordArray(parsed.data));
        } else if (
          parsed.data &&
          typeof parsed.data === "object" &&
          Array.isArray((parsed.data as { risks?: unknown }).risks)
        ) {
          setItems(asRecordArray((parsed.data as { risks: unknown }).risks));
        } else {
          setItems([]);
        }
        setLoading(false);
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Failed to load records");
        setLoading(false);
      });
  };
  useEffect(reload, [scoped]);
  return { items, loading, error, reload, projectId };
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
  emptyTitle,
  emptyDescription,
}: {
  title: string;
  description: string;
  endpoint: string;
  fields: { key: string; label: string; required?: boolean; multiline?: boolean; type?: string }[];
  numberKey: string;
  renderMeta?: (item: Record<string, unknown>) => React.ReactNode;
  createExtra?: Record<string, unknown>;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  const { items, loading, error, reload, projectId } = useRegisterList(endpoint);
  const rows: OperationalRow[] = items.map((item) => ({
    ...item,
    record: `${String(item[numberKey] ?? "")} — ${String(item.title ?? "")}`.replace(/^ — /, ""),
    owner: pickExistingField(item, ["assigned_to", "owner_id", "owner"]),
    due: formatOperationalDate(item.due_date ?? item.response_due),
    updated: formatOperationalDate(item.updated_at),
    status: item.approval_status ?? item.status ?? "—",
    priority: item.priority ?? item.severity ?? item.criticality ?? "—",
  }));

  return (
    <>
      <Header title={title} description={description} />
      <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8" data-testid="page-main">
        {projectId ? (
          <EngineeringBreadcrumb
            items={[
              { href: "/engineering/projects", label: "Projects" },
              { href: `/engineering/projects/${projectId}`, label: "Selected project" },
              { label: title },
            ]}
          />
        ) : null}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {loading ? "Loading…" : `${items.length} records`}
            {projectId ? " · selected project" : " · workspace"}
          </p>
          <CreateForm
            fields={fields}
            endpoint={endpoint}
            extra={{ ...createExtra, ...(projectId ? { projectId } : {}) }}
            onCreated={reload}
          />
        </div>
        {error ? <OperationalError message={error} /> : null}
        {loading ? <OperationalSkeleton /> : null}
        {!loading && !error && items.length === 0 ? (
          <EmptyOperationalState
            title={emptyTitle ?? `No ${title.toLowerCase()} recorded`}
            description={
              emptyDescription ??
              `Nothing is recorded in this scope yet. That can be normal before work is captured.`
            }
          />
        ) : null}
        {!loading && items.length > 0 ? (
          renderMeta ? (
            <div className="grid gap-3">
              {items.map((item) => (
                <div
                  key={item.id as string}
                  className="flex items-start justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4"
                >
                  <div>
                    <p className="font-medium">
                      {(item[numberKey] as string) ?? ""} — {(item.title as string) ?? ""}
                    </p>
                    {renderMeta(item)}
                  </div>
                  <div className="flex gap-2">
                    {item.priority ? <StatusChip value={item.priority as string} /> : null}
                    <StatusChip value={(item.approval_status as string) ?? (item.status as string) ?? ""} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <StatusTable
              columns={[
                { key: "record", label: "Record" },
                { key: "status", label: "Status", status: true },
                { key: "priority", label: "Priority", status: true },
                { key: "owner", label: "Owner" },
                { key: "due", label: "Due" },
                { key: "updated", label: "Last update" },
              ]}
              rows={rows}
              emptyTitle={emptyTitle ?? "No records yet"}
              emptyDescription={emptyDescription ?? "No records yet."}
            />
          )
        ) : null}
      </main>
    </>
  );
}
