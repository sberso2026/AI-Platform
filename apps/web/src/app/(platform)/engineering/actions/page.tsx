"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Button, Input, StatusChip } from "@rtb/ui";
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
import { asRecordArray, parseApiJsonResponse } from "@/lib/api/parse-json-response";

export default function ActionsPage() {
  const projectId = useResolvedEngineeringProjectId();
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [view, setView] = useState<"table" | "kanban">("table");
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = () => {
    setLoading(true);
    fetch(withProjectQuery("/api/engineering/actions", projectId))
      .then((r) => parseApiJsonResponse(r))
      .then((parsed) => {
        if (!parsed.ok) {
          setError(parsed.errorMessage ?? "Cannot load actions");
          setItems([]);
          return;
        }
        setError(null);
        setItems(asRecordArray(parsed.data));
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Cannot load actions"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const columns = ["open", "in_progress", "completed", "cancelled"];
  const rows: OperationalRow[] = items.map((item) => ({
    ...item,
    record: `${String(item.action_number ?? "")} — ${String(item.title ?? "")}`.replace(/^ — /, ""),
    owner: pickExistingField(item, ["assigned_to", "owner_id", "owner"]),
    due: formatOperationalDate(item.due_date),
    updated: formatOperationalDate(item.updated_at),
  }));

  return (
    <>
      <Header
        title="Action Register"
        description="Engineering actions with table and kanban views"
      />
      <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8" data-testid="page-main">
        {projectId ? (
          <EngineeringBreadcrumb
            items={[
              { href: "/engineering/projects", label: "Projects" },
              { href: `/engineering/projects/${projectId}`, label: "Selected project" },
              { label: "Actions" },
            ]}
          />
        ) : null}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Button size="sm" variant={view === "table" ? "default" : "outline"} onClick={() => setView("table")}>
            Table
          </Button>
          <Button size="sm" variant={view === "kanban" ? "default" : "outline"} onClick={() => setView("kanban")}>
            Kanban
          </Button>
          <form
            className="ml-auto flex gap-2"
            onSubmit={async (e) => {
              e.preventDefault();
              await fetch("/api/engineering/actions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  title,
                  dueDate,
                  ...(projectId ? { projectId } : {}),
                }),
              });
              setTitle("");
              reload();
            }}
          >
            <Input placeholder="New action title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            <Button type="submit" size="sm">
              Add
            </Button>
          </form>
        </div>

        {error ? <OperationalError message={error} /> : null}
        {loading ? <OperationalSkeleton /> : null}

        {!loading && items.length === 0 && !error ? (
          <EmptyOperationalState
            title="No open actions"
            description="No actions are recorded in this scope yet. Outstanding work appears here when captured."
          />
        ) : null}

        {!loading && items.length > 0 && view === "table" ? (
          <StatusTable
            columns={[
              { key: "record", label: "Action" },
              { key: "status", label: "Status", status: true },
              { key: "owner", label: "Owner" },
              { key: "due", label: "Due" },
              { key: "updated", label: "Last update" },
            ]}
            rows={rows}
            emptyTitle="No open actions"
            emptyDescription="No actions are recorded in this scope yet."
          />
        ) : null}

        {!loading && items.length > 0 && view === "kanban" ? (
          <div className="grid gap-3 overflow-x-auto md:grid-cols-4">
            {columns.map((col) => (
              <section key={col} className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="mb-2">
                  <StatusChip value={col} />
                </div>
                {items
                  .filter((i) => (i.status as string) === col)
                  .map((item) => (
                    <div key={item.id as string} className="mb-2 rounded border border-slate-100 p-2 text-sm">
                      {(item.action_number as string) ?? ""} {(item.title as string) ?? ""}
                    </div>
                  ))}
              </section>
            ))}
          </div>
        ) : null}
      </main>
    </>
  );
}
