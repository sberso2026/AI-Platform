"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Button, Input } from "@rtb/ui";
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
import { parseApiJsonResponse } from "@/lib/api/parse-json-response";
import { asRecordArray } from "@/lib/api/parse-json-response";
import { useEngineeringWriteAccess } from "@/hooks/use-engineering-write-access";

export default function TechnicalQueriesPage() {
  const projectId = useResolvedEngineeringProjectId();
  const { canMutate } = useEngineeringWriteAccess();
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [question, setQuestion] = useState("");
  const [responseDue, setResponseDue] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = () => {
    setLoading(true);
    fetch(withProjectQuery("/api/engineering/technical-queries", projectId))
      .then((r) => parseApiJsonResponse(r))
      .then((parsed) => {
        if (!parsed.ok) {
          setError(parsed.errorMessage ?? "Cannot load technical queries");
          setItems([]);
          return;
        }
        setError(null);
        setItems(asRecordArray(parsed.data));
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Cannot load technical queries"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const rows: OperationalRow[] = items.map((item) => ({
    ...item,
    record: `${String(item.tq_number ?? "")} — ${String(item.question ?? item.title ?? "")}`.replace(/^ — /, ""),
    owner: pickExistingField(item, ["assigned_to", "owner_id", "owner"]),
    due: formatOperationalDate(item.response_due ?? item.due_date),
    updated: formatOperationalDate(item.updated_at),
  }));

  return (
    <>
      <Header
        title="Technical Query Register"
        description="Engineering RFIs and technical queries with threaded discussion support"
      />
      <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8" data-testid="page-main">
        {projectId ? (
          <EngineeringBreadcrumb
            items={[
              { href: "/engineering/projects", label: "Projects" },
              { href: `/engineering/projects/${projectId}`, label: "Selected project" },
              { label: "Technical Queries" },
            ]}
          />
        ) : null}
        {canMutate ? (
        <form
          className="mb-6 grid gap-2 rounded border p-4 md:grid-cols-2"
          onSubmit={async (e) => {
            e.preventDefault();
            await fetch("/api/engineering/technical-queries", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                question,
                responseDue,
                ...(projectId ? { projectId } : {}),
              }),
            });
            setQuestion("");
            setResponseDue("");
            reload();
          }}
        >
          <div className="md:col-span-2">
            <label htmlFor="tq-question" className="mb-1 block text-xs text-muted-foreground">Question</label>
            <textarea
              id="tq-question"
              className="min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="tq-response-due" className="mb-1 block text-xs text-muted-foreground">Response due</label>
            <Input id="tq-response-due" type="date" value={responseDue} onChange={(e) => setResponseDue(e.target.value)} />
          </div>
          <div className="flex items-end">
            <Button type="submit" size="sm">
              Submit TQ
            </Button>
          </div>
        </form>
        ) : (
          <p className="mb-4 text-sm text-muted-foreground">Read-only — technical queries are visible, not editable.</p>
        )}

        {canMutate && items.length > 0 ? (
          <div className="mb-6 space-y-2 rounded-lg border border-slate-200 bg-white p-3">
            <p className="text-sm font-medium">Respond / close TQ</p>
            {items.slice(0, 8).map((item) => (
              <form
                key={String(item.id)}
                className="grid gap-2 md:grid-cols-[1fr_auto_auto]"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const response = (form.elements.namedItem("response") as HTMLInputElement).value;
                  const status = (form.elements.namedItem("status") as HTMLSelectElement).value;
                  await fetch("/api/engineering/technical-queries", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: item.id, response, status }),
                  });
                  reload();
                }}
              >
                <Input
                  name="response"
                  defaultValue={String(item.response ?? "")}
                  placeholder={`${String(item.tq_number ?? "")} response`}
                  required
                />
                <select name="status" defaultValue={String(item.status ?? "open")} className="rounded border px-2 py-1 text-sm">
                  <option value="open">open</option>
                  <option value="responded">responded</option>
                  <option value="closed">closed</option>
                </select>
                <Button type="submit" size="sm" variant="secondary">
                  Save
                </Button>
              </form>
            ))}
          </div>
        ) : null}

        {error ? <OperationalError message={error} /> : null}
        {loading ? <OperationalSkeleton /> : null}
        {!loading && items.length === 0 && !error ? (
          <EmptyOperationalState
            title="No open technical queries"
            description="No TQs are recorded in this scope. That is normal when none have been raised."
          />
        ) : (
          <StatusTable
            columns={[
              { key: "record", label: "Technical query" },
              { key: "status", label: "Status", status: true },
              { key: "owner", label: "Owner" },
              { key: "due", label: "Due" },
              { key: "updated", label: "Last update" },
            ]}
            rows={rows}
            emptyTitle="No open technical queries"
            emptyDescription="No TQs are recorded in this scope."
          />
        )}
      </main>
    </>
  );
}
