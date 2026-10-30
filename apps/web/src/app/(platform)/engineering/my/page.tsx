"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import {
  asRecordArray,
  parseApiJsonResponse,
} from "@/lib/api/parse-json-response";
import {
  useEngineeringProjectFilter,
  withProjectQuery,
} from "@/hooks/use-engineering-project-filter";
import { useExperiencePerf } from "@/hooks/use-experience-perf";
import { MY_WORK_CATEGORIES } from "@/lib/engineering/eos3-my-work-ui";

type Row = Record<string, unknown>;

function labelOf(row: Row, keys: string[]): string {
  for (const k of keys) {
    const v = row[k];
    if (typeof v === "string" && v.trim()) return v;
  }
  return String(row.id ?? "Item");
}

function idOf(row: Row): string {
  return String(row.id ?? row.stable_id ?? row.stableId ?? Math.random());
}

export default function MyWorkPage() {
  useExperiencePerf("my-work");
  const projectId = useEngineeringProjectFilter();
  const [actions, setActions] = useState<Row[]>([]);
  const [tqs, setTqs] = useState<Row[]>([]);
  const [decisions, setDecisions] = useState<Row[]>([]);
  const [reviews, setReviews] = useState<Row[]>([]);
  const [changes, setChanges] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(withProjectQuery("/api/engineering/actions", projectId)).then((r) =>
        parseApiJsonResponse(r),
      ),
      fetch(withProjectQuery("/api/engineering/technical-queries", projectId)).then((r) =>
        parseApiJsonResponse(r),
      ),
      fetch(withProjectQuery("/api/engineering/decisions", projectId)).then((r) =>
        parseApiJsonResponse(r),
      ),
      fetch(withProjectQuery("/api/engineering/reviews", projectId)).then((r) =>
        parseApiJsonResponse(r),
      ),
      fetch(withProjectQuery("/api/engineering/changes", projectId)).then((r) =>
        parseApiJsonResponse(r),
      ),
    ])
      .then(([a, t, d, r, c]) => {
        setActions(asRecordArray(a.data).slice(0, 12));
        setTqs(asRecordArray(t.data).slice(0, 12));
        setDecisions(asRecordArray(d.data).slice(0, 12));
        setReviews(asRecordArray(r.data).slice(0, 12));
        setChanges(asRecordArray(c.data).slice(0, 12));
        if (![a, t, d, r, c].some((x) => x.ok)) {
          setError("Some work queues could not be loaded.");
        }
      })
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "Failed to load My Work"),
      )
      .finally(() => setLoading(false));
  }, [projectId]);

  const populated: Array<{
    id: string;
    label: string;
    href: string;
    rows: Row[];
    keys: string[];
    priority?: string;
  }> = [];

  if (actions.length > 0 || tqs.length > 0) {
    populated.push({
      id: "needs-action",
      label: "Needs Action",
      href: "/engineering/actions",
      rows: [...actions, ...tqs].slice(0, 12),
      keys: ["title", "action_title", "query_number", "subject", "summary"],
      priority: "High",
    });
  }
  if (changes.length > 0) {
    populated.push({
      id: "changed",
      label: "Changed",
      href: "/engineering/changes",
      rows: changes,
      keys: ["title", "change_title", "summary"],
      priority: "Medium",
    });
  }
  if (reviews.length > 0) {
    populated.push({
      id: "reviews",
      label: "Reviews",
      href: "/engineering/reviews",
      rows: reviews,
      keys: ["title", "review_title", "summary"],
      priority: "Medium",
    });
  }
  if (decisions.length > 0) {
    populated.push({
      id: "decisions",
      label: "Decisions",
      href: "/engineering/decisions",
      rows: decisions,
      keys: ["title", "decision_title", "summary", "question"],
      priority: "High",
    });
  }

  return (
    <>
      <Header
        title="My Work"
        description="Assigned actions, reviews, decisions, and blockers — dense engineering operating surface"
      />
      <main
        className="page-main flex-1 overflow-y-auto px-4 pb-8 pt-4 sm:px-6 lg:px-8"
        data-testid="my-work-foundation"
        data-eos-decorative-images="0"
      >
        {error ? <p className="mb-3 text-sm text-destructive">{error}</p> : null}
        {loading ? (
          <p className="text-sm text-muted-foreground" data-testid="my-work-loading">
            Loading your work…
          </p>
        ) : null}

        <nav
          className="mb-4 flex flex-wrap gap-2 text-xs"
          aria-label="My Work categories"
          data-testid="my-work-category-contract"
        >
          {MY_WORK_CATEGORIES.map((c) => {
            const active = populated.some((p) => p.id === c.id);
            return (
              <span
                key={c.id}
                className={`rounded border px-2 py-1 ${
                  active
                    ? "border-[color:var(--eos-navy,#0b1f3a)] bg-[color:var(--eos-navy,#0b1f3a)] text-white"
                    : "border-slate-200 text-slate-400"
                }`}
                data-testid={`my-work-cat-${c.id}`}
                data-populated={active ? "yes" : "no"}
              >
                {c.label}
              </span>
            );
          })}
        </nav>

        {populated.length === 0 && !loading ? (
          <p className="text-sm text-slate-600" data-testid="my-work-empty">
            No assigned work in the current deterministic queues. Categories remain ready for future
            population — nothing fabricated.
          </p>
        ) : null}

        <div className="space-y-6">
          {populated.map((section) => (
            <section key={section.id} data-testid={`my-work-section-${section.id}`}>
              <div className="mb-2 flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-slate-900">{section.label}</h2>
                <Link
                  href={section.href}
                  className="text-xs text-slate-600 underline-offset-2 hover:underline"
                >
                  Open register
                </Link>
              </div>
              <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-[11px] uppercase text-slate-500">
                    <tr>
                      <th className="px-3 py-2">Priority</th>
                      <th className="px-3 py-2">Item</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Due</th>
                      <th className="px-3 py-2">Context</th>
                      <th className="px-3 py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.rows.map((row) => (
                      <tr key={idOf(row)} className="border-t border-slate-100 text-slate-800">
                        <td className="px-3 py-2">
                          <span className="rounded border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-[11px] text-amber-900">
                            {section.priority ?? "—"}
                          </span>
                        </td>
                        <td className="px-3 py-2 font-medium">
                          <span className="mr-2 font-mono text-[11px] text-slate-500">
                            {String(row.stable_id ?? row.code ?? row.id ?? "—")}
                          </span>
                          {labelOf(row, section.keys)}
                        </td>
                        <td className="px-3 py-2 text-xs">
                          {String(row.status ?? row.state ?? "Open")}
                        </td>
                        <td className="px-3 py-2 text-xs">
                          {String(row.due_date ?? row.required_by ?? "—")}
                        </td>
                        <td className="px-3 py-2 text-xs text-slate-600">
                          {String(
                            row.work_package_id ??
                              row.asset_name ??
                              row.project_code ??
                              projectId ??
                              "—",
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <Link
                            href={section.href}
                            className="inline-flex min-h-8 items-center rounded border border-slate-300 px-2 text-xs"
                          >
                            Open
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      </main>
    </>
  );
}
