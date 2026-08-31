"use client";

import { Fragment, useEffect, useState } from "react";
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

export default function RisksPage() {
  const projectId = useResolvedEngineeringProjectId();
  const [risks, setRisks] = useState<Record<string, unknown>[]>([]);
  const [cells, setCells] = useState<Record<string, number>>({});
  const [title, setTitle] = useState("");
  const [probability, setProbability] = useState("3");
  const [consequence, setConsequence] = useState("3");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = () => {
    setLoading(true);
    fetch(withProjectQuery("/api/engineering/risks?view=matrix", projectId))
      .then((r) => parseApiJsonResponse<{ risks?: Record<string, unknown>[]; cells?: Record<string, number> }>(r))
      .then((parsed) => {
        if (!parsed.ok) {
          setError(parsed.errorMessage ?? "Cannot load this risk register");
          setRisks([]);
          return;
        }
        setError(null);
        setRisks(parsed.data?.risks ?? []);
        setCells(parsed.data?.cells ?? {});
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Cannot load this risk register"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const rows: OperationalRow[] = risks.map((item) => ({
    ...item,
    record: `${String(item.risk_number ?? "")} — ${String(item.title ?? "")}`.replace(/^ — /, ""),
    owner: pickExistingField(item, ["assigned_to", "owner_id", "owner"]),
    due: formatOperationalDate(item.due_date),
    updated: formatOperationalDate(item.updated_at),
    priority: item.severity ?? item.priority ?? item.score ?? "—",
  }));

  return (
    <>
      <Header
        title="Risk Register"
        description="Engineering risk matrix with probability × consequence scoring"
      />
      <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8" data-testid="page-main">
        {projectId ? (
          <EngineeringBreadcrumb
            items={[
              { href: "/engineering/projects", label: "Projects" },
              { href: `/engineering/projects/${projectId}`, label: "Selected project" },
              { label: "Risks" },
            ]}
          />
        ) : null}
        <form
          className="mb-6 flex flex-wrap gap-2"
          onSubmit={async (e) => {
            e.preventDefault();
            await fetch("/api/engineering/risks", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title,
                probability: Number(probability),
                consequence: Number(consequence),
                ...(projectId ? { projectId } : {}),
              }),
            });
            setTitle("");
            reload();
          }}
        >
          <Input className="min-w-[200px]" placeholder="Risk title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <Input className="w-24" type="number" min={1} max={5} value={probability} onChange={(e) => setProbability(e.target.value)} />
          <Input className="w-24" type="number" min={1} max={5} value={consequence} onChange={(e) => setConsequence(e.target.value)} />
          <Button type="submit" size="sm">
            Add Risk
          </Button>
        </form>

        {error ? <OperationalError message={error} /> : null}
        {loading ? <OperationalSkeleton /> : null}

        <div className="mb-6 overflow-x-auto rounded-lg border border-slate-200 bg-white p-4">
          <p className="mb-3 text-sm font-medium">Risk matrix (P × C counts)</p>
          <div className="grid grid-cols-6 gap-1 text-center text-xs">
            <div />
            {[1, 2, 3, 4, 5].map((c) => (
              <div key={c} className="font-medium text-muted-foreground">
                C{c}
              </div>
            ))}
            {[5, 4, 3, 2, 1].map((p) => (
              <Fragment key={`row-${p}`}>
                <div className="font-medium text-muted-foreground">P{p}</div>
                {[1, 2, 3, 4, 5].map((c) => {
                  const count = cells[`${p}x${c}`] ?? 0;
                  const score = p * c;
                  const tone =
                    score >= 15 ? "bg-red-100" : score >= 8 ? "bg-amber-100" : "bg-slate-50";
                  return (
                    <div key={`${p}-${c}`} className={`rounded p-2 ${tone}`}>
                      {count || "·"}
                    </div>
                  );
                })}
              </Fragment>
            ))}
          </div>
        </div>

        {!loading && risks.length === 0 && !error ? (
          <EmptyOperationalState
            title="No open risks recorded"
            description="No risks are recorded in this scope yet. That is normal before a risk workshop or register entry."
          />
        ) : (
          <StatusTable
            columns={[
              { key: "record", label: "Risk" },
              { key: "status", label: "Status", status: true },
              { key: "priority", label: "Score / severity" },
              { key: "owner", label: "Owner" },
              { key: "due", label: "Due" },
              { key: "updated", label: "Last update" },
            ]}
            rows={rows}
            emptyTitle="No open risks recorded"
            emptyDescription="No risks are recorded in this scope yet."
          />
        )}
      </main>
    </>
  );
}
