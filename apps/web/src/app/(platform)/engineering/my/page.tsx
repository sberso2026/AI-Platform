"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
import {
  isMyWorkCategoryId,
  MY_WORK_CATEGORIES,
  MY_WORK_PRIORITY_BANDS,
  type MyWorkCategoryId,
} from "@/lib/engineering/eos3-my-work-ui";

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

type Section = {
  id: MyWorkCategoryId;
  label: string;
  href: string;
  rows: Row[];
  keys: string[];
  priority: string;
  typeLabel: string;
};

function MyWorkInner() {
  useExperiencePerf("my-work");
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = useEngineeringProjectFilter();
  const catParam = searchParams.get("cat");
  const priorityParam = searchParams.get("priority");
  const activeCat: MyWorkCategoryId | "all" = isMyWorkCategoryId(catParam)
    ? catParam
    : "all";
  const activePriority =
    priorityParam &&
    MY_WORK_PRIORITY_BANDS.includes(
      priorityParam.toUpperCase() as (typeof MY_WORK_PRIORITY_BANDS)[number],
    )
      ? priorityParam.toUpperCase()
      : "all";
  const sortMode = searchParams.get("sort") === "due" ? "due" : "priority";
  const [query, setQuery] = useState("");
  const [actions, setActions] = useState<Row[]>([]);
  const [tqs, setTqs] = useState<Row[]>([]);
  const [decisions, setDecisions] = useState<Row[]>([]);
  const [reviews, setReviews] = useState<Row[]>([]);
  const [changes, setChanges] = useState<Row[]>([]);
  const [risks, setRisks] = useState<Row[]>([]);
  const [priorityRows, setPriorityRows] = useState<Row[]>([]);
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
      fetch(withProjectQuery("/api/engineering/risks", projectId)).then((r) =>
        parseApiJsonResponse(r),
      ),
      fetch(
        withProjectQuery(
          `/api/engineering/my-work/priority?view=list${projectId ? `&projectId=${encodeURIComponent(projectId)}` : ""}`,
          projectId,
        ),
      )
        .then((r) => parseApiJsonResponse(r))
        .catch(() => ({ ok: false, data: [] })),
    ])
      .then(([a, t, d, r, c, risk, pri]) => {
        setActions(asRecordArray(a.data).slice(0, 40));
        setTqs(asRecordArray(t.data).slice(0, 40));
        setDecisions(asRecordArray(d.data).slice(0, 40));
        setReviews(asRecordArray(r.data).slice(0, 40));
        setChanges(asRecordArray(c.data).slice(0, 40));
        setRisks(asRecordArray(risk.data).slice(0, 40));
        setPriorityRows(asRecordArray(pri.data).slice(0, 80));
        if (![a, t, d, r, c, risk].some((x) => x.ok)) {
          setError("Some work queues could not be loaded.");
        } else {
          setError(null);
        }
      })
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "Failed to load My Work"),
      )
      .finally(() => setLoading(false));
  }, [projectId]);

  const sections: Section[] = useMemo(() => {
    return [
      {
        id: "needs-action",
        label: "Needs Action",
        href: "/engineering/actions",
        rows: [...actions, ...tqs],
        keys: ["title", "action_title", "query_number", "subject", "summary"],
        priority: "High",
        typeLabel: "Action / TQ",
      },
      {
        id: "changed",
        label: "Changed",
        href: "/engineering/changes",
        rows: changes,
        keys: ["title", "change_title", "summary"],
        priority: "Medium",
        typeLabel: "Change",
      },
      {
        id: "reviews",
        label: "Reviews",
        href: "/review",
        rows: reviews,
        keys: ["title", "review_title", "summary"],
        priority: "Medium",
        typeLabel: "Review",
      },
      {
        id: "decisions",
        label: "Decisions",
        href: "/engineering/decisions",
        rows: decisions,
        keys: ["title", "decision_title", "summary", "question"],
        priority: "High",
        typeLabel: "Decision",
      },
      {
        id: "waiting-for-others",
        label: "Waiting on Others",
        href: "/engineering/technical-queries",
        rows: tqs.filter((row) => {
          const st = String(row.status ?? row.state ?? "").toLowerCase();
          return st.includes("wait") || st.includes("open") || st === "";
        }),
        keys: ["title", "query_number", "subject", "summary"],
        priority: "Medium",
        typeLabel: "Dependency",
      },
      {
        id: "at-risk",
        label: "At Risk",
        href: "/engineering/risks",
        rows: risks,
        keys: ["title", "risk_title", "summary"],
        priority: "High",
        typeLabel: "Risk",
      },
      {
        id: "recently-completed",
        label: "Completed",
        href: "/engineering/actions",
        rows: [...actions, ...changes].filter((row) => {
          const st = String(row.status ?? row.state ?? "").toLowerCase();
          return st.includes("complete") || st.includes("closed") || st.includes("done");
        }),
        keys: ["title", "action_title", "change_title", "summary"],
        priority: "Low",
        typeLabel: "Completed",
      },
    ];
  }, [actions, tqs, changes, reviews, decisions, risks]);

  const priorityByObject = useMemo(() => {
    const m = new Map<string, Row>();
    for (const row of priorityRows) {
      const key = String(row.objectStableId ?? row.stable_id ?? row.id ?? "");
      if (key) m.set(key, row);
    }
    return m;
  }, [priorityRows]);

  const visible = useMemo(() => {
    const filtered =
      activeCat === "all" ? sections : sections.filter((s) => s.id === activeCat);
    const q = query.trim().toLowerCase();
    return filtered.map((s) => {
      let rows = s.rows;
      if (q) {
        rows = rows.filter((row) => JSON.stringify(row).toLowerCase().includes(q));
      }
      if (activePriority !== "all") {
        rows = rows.filter((row) => {
          const key = String(row.stable_id ?? row.stableId ?? row.id ?? "");
          const pri = priorityByObject.get(key);
          const band = String(pri?.priorityBand ?? s.priority).toUpperCase();
          return band === activePriority;
        });
      }
      // Default sort by governed priority; due sort does not rewrite canonical priority
      if (sortMode === "priority" && priorityRows.length > 0) {
        const rank: Record<string, number> = {
          CRITICAL: 4,
          HIGH: 3,
          MEDIUM: 2,
          LOW: 1,
        };
        rows = [...rows].sort((a, b) => {
          const ka = String(a.stable_id ?? a.stableId ?? a.id ?? "");
          const kb = String(b.stable_id ?? b.stableId ?? b.id ?? "");
          const pa = String(priorityByObject.get(ka)?.priorityBand ?? s.priority).toUpperCase();
          const pb = String(priorityByObject.get(kb)?.priorityBand ?? s.priority).toUpperCase();
          return (rank[pb] ?? 0) - (rank[pa] ?? 0);
        });
      } else if (sortMode === "due") {
        rows = [...rows].sort((a, b) =>
          String(a.due_date ?? a.required_by ?? "9999").localeCompare(
            String(b.due_date ?? b.required_by ?? "9999"),
          ),
        );
      }
      return { ...s, rows };
    });
  }, [sections, activeCat, query, activePriority, sortMode, priorityByObject, priorityRows.length]);

  function setCategory(id: MyWorkCategoryId | "all") {
    const params = new URLSearchParams(searchParams.toString());
    if (id === "all") params.delete("cat");
    else params.set("cat", id);
    const qs = params.toString();
    router.push(qs ? `/engineering/my?${qs}` : "/engineering/my");
  }

  function setPriorityFilter(band: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (band === "all") params.delete("priority");
    else params.set("priority", band);
    const qs = params.toString();
    router.push(qs ? `/engineering/my?${qs}` : "/engineering/my");
  }

  return (
    <>
      <Header
        title="My Work"
        description="Assigned actions, reviews, decisions, and blockers — dense engineering operating surface"
      />
      <main
        className="page-main eos-engineering-work-surface flex-1 overflow-y-auto px-4 pb-8 pt-4 sm:px-6 lg:px-8"
        data-testid="my-work-foundation"
        data-eos-decorative-images="0"
        data-eos-my-work-dense="yes"
        data-eos-dependency-contextual="yes"
      >
        {error ? <p className="mb-3 text-sm text-destructive">{error}</p> : null}
        {loading ? (
          <p className="text-sm text-muted-foreground" data-testid="my-work-loading">
            Loading your work…
          </p>
        ) : null}

        <div className="mb-3 flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="my-work-search">
            Search My Work
          </label>
          <input
            id="my-work-search"
            data-testid="my-work-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search work items…"
            className="min-h-10 min-w-[220px] flex-1 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900"
          />
          <div
            className="flex flex-wrap gap-1"
            data-testid="my-work-priority-filter"
            aria-label="Priority filter"
          >
            <button
              type="button"
              className={`min-h-9 rounded border px-2 text-xs ${
                activePriority === "all"
                  ? "border-[color:var(--eos-navy,#0b1f3a)] bg-[color:var(--eos-navy,#0b1f3a)] text-white"
                  : "border-slate-300 bg-white text-slate-700"
              }`}
              onClick={() => setPriorityFilter("all")}
            >
              All priorities
            </button>
            {MY_WORK_PRIORITY_BANDS.map((b) => (
              <button
                key={b}
                type="button"
                data-testid={`my-work-priority-${b.toLowerCase()}`}
                className={`min-h-9 rounded border px-2 text-xs ${
                  activePriority === b
                    ? "border-[color:var(--eos-navy,#0b1f3a)] bg-[color:var(--eos-navy,#0b1f3a)] text-white"
                    : "border-slate-300 bg-white text-slate-700"
                }`}
                onClick={() => setPriorityFilter(b)}
              >
                {b.charAt(0) + b.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
        <p className="sr-only" data-testid="my-work-default-priority-sort">
          Default sort: engineering priority
        </p>

        <nav
          className="mb-4 flex flex-wrap gap-2 text-xs"
          aria-label="My Work categories"
          data-testid="my-work-category-contract"
        >
          <button
            type="button"
            className={`min-h-9 rounded border px-2 py-1 ${
              activeCat === "all"
                ? "border-[color:var(--eos-navy,#0b1f3a)] bg-[color:var(--eos-navy,#0b1f3a)] text-white"
                : "border-slate-300 bg-white text-slate-700"
            }`}
            data-testid="my-work-cat-all"
            onClick={() => setCategory("all")}
          >
            All
          </button>
          {MY_WORK_CATEGORIES.filter((c) => c.id !== "waiting-for-me").map((c) => {
            const section = sections.find((s) => s.id === c.id);
            const count = section?.rows.length ?? 0;
            const active = activeCat === c.id;
            return (
              <button
                key={c.id}
                type="button"
                className={`min-h-9 rounded border px-2 py-1 ${
                  active
                    ? "border-[color:var(--eos-navy,#0b1f3a)] bg-[color:var(--eos-navy,#0b1f3a)] text-white"
                    : "border-slate-300 bg-white text-slate-700"
                }`}
                data-testid={`my-work-cat-${c.id}`}
                data-populated={count > 0 ? "yes" : "no"}
                aria-pressed={active}
                onClick={() => setCategory(c.id)}
              >
                {c.label}
                <span className="ml-1 tabular-nums opacity-80">({count})</span>
              </button>
            );
          })}
        </nav>

        {visible.every((s) => s.rows.length === 0) && !loading ? (
          <p
            className="rounded-md border border-slate-200 bg-white p-4 text-sm text-slate-600"
            data-testid="my-work-empty"
          >
            {activeCat === "reviews"
              ? "No reviews awaiting you"
              : activeCat === "decisions"
                ? "No decisions currently require your action"
                : "No assigned work in the current deterministic queues. Nothing fabricated."}
          </p>
        ) : null}

        <div className="space-y-6">
          {visible.map((section) =>
            section.rows.length === 0 ? null : (
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
                <div className="overflow-x-auto rounded-md border border-slate-200 bg-white shadow-sm">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-50 text-[11px] uppercase text-slate-500">
                      <tr>
                        <th className="px-3 py-2">Priority</th>
                        <th className="px-3 py-2">Why</th>
                        <th className="px-3 py-2">Work Item</th>
                        <th className="px-3 py-2">Project / Work Package</th>
                        <th className="px-3 py-2">Asset / System</th>
                        <th className="px-3 py-2">Type</th>
                        <th className="px-3 py-2">Due</th>
                        <th className="px-3 py-2">Next Action</th>
                      </tr>
                    </thead>
                    <tbody data-testid="my-work-priority-enriched">
                      {section.rows.map((row) => {
                        const key = String(row.stable_id ?? row.stableId ?? row.id ?? "");
                        const pri = priorityByObject.get(key);
                        const band = String(
                          pri?.priorityBand ?? section.priority,
                        );
                        const why = String(pri?.reason ?? "");
                        const nextLabel = String(
                          pri?.nextRecommendedAction ?? "Open",
                        );
                        const openHref = String(
                          row.href ??
                            row.url ??
                            `${section.href}${row.id ? `?id=${encodeURIComponent(String(row.id))}` : ""}`,
                        );
                        return (
                          <tr key={idOf(row)} className="border-t border-slate-100 text-slate-800">
                            <td className="px-3 py-2">
                              <span
                                className="rounded border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-[11px] text-amber-900"
                                data-testid="my-work-priority-band"
                                title={why || undefined}
                              >
                                {band.charAt(0) + band.slice(1).toLowerCase()}
                              </span>
                            </td>
                            <td
                              className="max-w-[180px] truncate px-3 py-2 text-xs text-slate-600"
                              data-testid="my-work-priority-why"
                              title={why || undefined}
                            >
                              {why || "—"}
                            </td>
                            <td className="px-3 py-2 font-medium">
                              <span className="mr-2 font-mono text-[11px] text-slate-500">
                                {String(row.stable_id ?? row.code ?? row.id ?? "—")}
                              </span>
                              {labelOf(row, section.keys)}
                            </td>
                            <td className="px-3 py-2 text-xs text-slate-600">
                              {String(
                                pri?.workPackageStableId ??
                                  row.work_package_id ??
                                  row.workPackageId ??
                                  row.project_code ??
                                  projectId ??
                                  "—",
                              )}
                            </td>
                            <td className="px-3 py-2 text-xs text-slate-600">
                              {String(
                                pri?.assetSystem ??
                                  row.asset_name ??
                                  row.system_name ??
                                  row.asset ??
                                  "—",
                              )}
                            </td>
                            <td className="px-3 py-2 text-xs">{section.typeLabel}</td>
                            <td className="px-3 py-2 text-xs">
                              {String(
                                pri?.dueOrRequiredBy ??
                                  row.due_date ??
                                  row.required_by ??
                                  "—",
                              )}
                            </td>
                            <td className="px-3 py-2">
                              <Link
                                href={openHref}
                                className="inline-flex min-h-8 items-center rounded border border-slate-300 bg-white px-2 text-xs font-medium text-slate-800 hover:border-[color:var(--eos-gold,#c4a35a)]"
                                data-testid="my-work-next-action"
                              >
                                {nextLabel === "Open" ? "Open" : nextLabel}
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            ),
          )}
        </div>
      </main>
    </>
  );
}

export default function MyWorkPage() {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-slate-600">Loading My Work…</p>}>
      <MyWorkInner />
    </Suspense>
  );
}
