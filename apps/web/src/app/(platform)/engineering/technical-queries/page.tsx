"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { StatusChip } from "@rtb/ui";
import {
  useResolvedEngineeringProjectId,
  withProjectQuery,
} from "@/hooks/use-engineering-project-filter";
import {
  EmptyOperationalState,
  EngineeringBreadcrumb,
  OperationalError,
  OperationalSkeleton,
} from "@/components/engineering/operational";
import { parseApiJsonResponse, asRecordArray } from "@/lib/api/parse-json-response";
import { useEngineeringWriteAccess } from "@/hooks/use-engineering-write-access";
import { formatTqDate, TQ_REGISTER_VIEWS } from "@/lib/engineering/technical-query-ux";
import { TQ_SCROLL_MAIN } from "@/components/engineering/technical-query-ui";
import type { TechnicalQueryPerson, TechnicalQueryPresentation } from "@rtb/engineering-os/browser";

type RegisterItem = Record<string, unknown> & {
  presentation?: TechnicalQueryPresentation;
};

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "awaiting_response", label: "Awaiting Response" },
  { value: "response_submitted", label: "Response Submitted" },
  { value: "under_review", label: "Under Review" },
  { value: "clarification_required", label: "Clarification Required" },
  { value: "accepted", label: "Accepted" },
  { value: "closed", label: "Closed" },
];

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Normal" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

function ColumnFilter({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="min-w-[7rem]">
      <span className="block text-[0.65rem] font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      <select
        id={id}
        aria-label={label}
        className="mt-0.5 h-7 w-full rounded border border-slate-200 bg-white px-1.5 text-xs text-slate-800"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">All</option>
        {options.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function TechnicalQueriesPage() {
  const projectId = useResolvedEngineeringProjectId();
  const { canMutate } = useEngineeringWriteAccess();
  const [items, setItems] = useState<RegisterItem[]>([]);
  const [people, setPeople] = useState<TechnicalQueryPerson[]>([]);
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([]);
  const [disciplines, setDisciplines] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState("all");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [disciplineId, setDisciplineId] = useState("");
  const [initiatorId, setInitiatorId] = useState("");
  const [actionById, setActionById] = useState("");
  const [priority, setPriority] = useState("");
  const [columnProjectId, setColumnProjectId] = useState("");
  const [sortKey, setSortKey] = useState<"updated" | "due" | "number">("updated");

  const effectiveProjectId = columnProjectId || projectId || "";

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (effectiveProjectId) params.set("projectId", effectiveProjectId);
    if (view !== "all") params.set("view", view);
    if (search.trim()) params.set("q", search.trim());
    if (status) params.set("status", status);
    if (disciplineId) params.set("disciplineId", disciplineId);
    if (initiatorId) params.set("initiatorId", initiatorId);
    if (actionById) params.set("actionById", actionById);
    if (priority) params.set("priority", priority);
    const qs = params.toString();
    return `/api/engineering/technical-queries${qs ? `?${qs}` : ""}`;
  }, [effectiveProjectId, view, search, status, disciplineId, initiatorId, actionById, priority]);

  useEffect(() => {
    setLoading(true);
    fetch(query)
      .then((r) => parseApiJsonResponse(r))
      .then((parsed) => {
        if (!parsed.ok) {
          setError(parsed.errorMessage ?? "Cannot load technical queries");
          setItems([]);
          return;
        }
        setError(null);
        setItems(asRecordArray(parsed.data) as RegisterItem[]);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Cannot load technical queries"))
      .finally(() => setLoading(false));
  }, [query]);

  useEffect(() => {
    fetch("/api/engineering/technical-queries/directory")
      .then((r) => parseApiJsonResponse(r))
      .then((parsed) => {
        if (parsed.ok) setPeople(asRecordArray(parsed.data) as TechnicalQueryPerson[]);
      })
      .catch(() => undefined);
    fetch("/api/engineering/disciplines")
      .then((r) => parseApiJsonResponse(r))
      .then((parsed) => {
        if (parsed.ok) {
          setDisciplines(
            asRecordArray(parsed.data).map((row) => ({
              id: String(row.id ?? ""),
              name: String(row.name ?? ""),
            })),
          );
        }
      })
      .catch(() => undefined);
    fetch("/api/engineering/projects")
      .then((r) => parseApiJsonResponse(r))
      .then((parsed) => {
        if (parsed.ok) {
          setProjects(
            asRecordArray(parsed.data).map((row) => ({
              id: String(row.id ?? ""),
              name: String(row.project_name ?? row.name ?? "Project"),
            })),
          );
        }
      })
      .catch(() => undefined);
  }, []);

  const sorted = [...items].sort((a, b) => {
    const pa = a.presentation;
    const pb = b.presentation;
    if (sortKey === "due") return String(pa?.due ?? "").localeCompare(String(pb?.due ?? ""));
    if (sortKey === "number") return String(pa?.tqNumber ?? "").localeCompare(String(pb?.tqNumber ?? ""));
    return String(pb?.lastActivity ?? "").localeCompare(String(pa?.lastActivity ?? ""));
  });

  const rows = sorted.map((item) => {
    const presentation = item.presentation;
    const href = `/engineering/technical-queries/${String(item.id)}`;
    return {
      id: item.id,
      href,
      tq: presentation?.tqNumber ?? String(item.tq_number ?? ""),
      subject: presentation?.title ?? String(item.title ?? item.question ?? ""),
      project: presentation?.projectName ?? "—",
      discipline: presentation?.disciplineName ?? "—",
      status: presentation?.statusLabel ?? "—",
      initiator: presentation?.initiator?.name ?? "—",
      actionBy: presentation?.actionBy?.name ?? "Unassigned",
      due: formatTqDate(presentation?.due ?? item.response_due),
      age: presentation?.ageDays != null ? `${presentation.ageDays}d` : "—",
      priority: presentation?.priority ?? "—",
      updated: formatTqDate(presentation?.lastActivity ?? item.updated_at),
      overdue: presentation?.overdue ? "overdue" : "",
    };
  });

  const activeFilters: Array<{ key: string; label: string; onClear: () => void }> = [];
  if (search.trim()) activeFilters.push({ key: "search", label: `Title: ${search.trim()}`, onClear: () => setSearch("") });
  if (columnProjectId) {
    const name = projects.find((p) => p.id === columnProjectId)?.name ?? "Project";
    activeFilters.push({ key: "project", label: `Project: ${name}`, onClear: () => setColumnProjectId("") });
  }
  if (status) {
    const label = STATUS_OPTIONS.find((s) => s.value === status)?.label ?? status;
    activeFilters.push({ key: "status", label: `Status: ${label}`, onClear: () => setStatus("") });
  }
  if (disciplineId) {
    const name = disciplines.find((d) => d.id === disciplineId)?.name ?? "Discipline";
    activeFilters.push({ key: "discipline", label: `Discipline: ${name}`, onClear: () => setDisciplineId("") });
  }
  if (initiatorId) {
    const name = people.find((p) => p.id === initiatorId)?.name ?? "Initiator";
    activeFilters.push({ key: "initiator", label: `Initiator: ${name}`, onClear: () => setInitiatorId("") });
  }
  if (actionById) {
    const name = people.find((p) => p.id === actionById)?.name ?? "Action By";
    activeFilters.push({ key: "actionBy", label: `Action By: ${name}`, onClear: () => setActionById("") });
  }
  if (priority) {
    const label = PRIORITY_OPTIONS.find((p) => p.value === priority)?.label ?? priority;
    activeFilters.push({ key: "priority", label: `Priority: ${label}`, onClear: () => setPriority("") });
  }

  function clearAllFilters() {
    setSearch("");
    setStatus("");
    setDisciplineId("");
    setInitiatorId("");
    setActionById("");
    setPriority("");
    setColumnProjectId("");
  }

  const peopleOptions = people.map((person) => ({ value: person.id, label: person.name }));

  return (
    <>
      <Header
        title="Technical Queries"
        description="Controlled technical query / RFI register for engineering response, review, and closeout"
      />
      <main className={TQ_SCROLL_MAIN} data-testid="tq-register">
        {projectId ? (
          <EngineeringBreadcrumb
            items={[
              { href: "/engineering/projects", label: "Projects" },
              { href: `/engineering/projects/${projectId}`, label: "Selected project" },
              { label: "Technical Queries" },
            ]}
          />
        ) : null}

        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <nav className="inline-flex flex-wrap rounded-md border border-slate-200 bg-white p-0.5" aria-label="Technical query queues" role="tablist">
            {TQ_REGISTER_VIEWS.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={view === item.id}
                className={`rounded px-2.5 py-1.5 text-xs font-medium sm:text-sm ${
                  view === item.id ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-50"
                }`}
                onClick={() => setView(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>
          {canMutate ? (
            <Link
              href={withProjectQuery("/engineering/technical-queries/new", projectId)}
              className="inline-flex h-8 items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground"
            >
              + New Technical Query
            </Link>
          ) : (
            <p className="text-sm text-muted-foreground">Read-only — technical queries are visible, not editable.</p>
          )}
        </div>

        {activeFilters.length > 0 ? (
          <div className="mb-2 flex flex-wrap items-center gap-1.5" data-testid="tq-active-filters">
            {activeFilters.map((filter) => (
              <button
                key={filter.key}
                type="button"
                className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-slate-50 px-2 py-0.5 text-xs text-slate-800"
                onClick={filter.onClear}
                aria-label={`Clear ${filter.label}`}
              >
                {filter.label} <span aria-hidden="true">×</span>
              </button>
            ))}
            <button type="button" className="text-xs font-medium text-slate-700 underline" onClick={clearAllFilters}>
              Clear all filters
            </button>
          </div>
        ) : null}

        {error ? <OperationalError message={error} /> : null}
        {loading ? <OperationalSkeleton /> : null}
        {!loading && rows.length === 0 && !error ? (
          <EmptyOperationalState
            title="No technical queries in this queue"
            description="Raise a technical query when information, clarification, or a proposed resolution is required."
            action={
              canMutate ? (
                <Link
                  href={withProjectQuery("/engineering/technical-queries/new", projectId)}
                  className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground"
                >
                  + New Technical Query
                </Link>
              ) : null
            }
          />
        ) : !loading ? (
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white" data-testid="tq-register-table">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                <tr>
                  <th scope="col" className="px-3 py-2 align-bottom">
                    <button type="button" className="text-[0.65rem] font-semibold uppercase tracking-wide" onClick={() => setSortKey("number")}>
                      TQ No.{sortKey === "number" ? " ↕" : ""}
                    </button>
                  </th>
                  <th scope="col" className="min-w-[12rem] px-3 py-2 align-bottom">
                    <label htmlFor="tq-col-search" className="block text-[0.65rem] font-semibold uppercase tracking-wide">
                      Title / Query
                    </label>
                    <input
                      id="tq-col-search"
                      type="search"
                      placeholder="Search…"
                      aria-label="Search title or query"
                      className="mt-0.5 h-7 w-full rounded border border-slate-200 bg-white px-2 text-xs"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </th>
                  <th scope="col" className="px-3 py-2 align-bottom">
                    <ColumnFilter
                      id="tq-col-project"
                      label="Project"
                      value={columnProjectId}
                      onChange={setColumnProjectId}
                      options={projects.map((item) => ({ value: item.id, label: item.name }))}
                    />
                  </th>
                  <th scope="col" className="px-3 py-2 align-bottom">
                    <ColumnFilter
                      id="tq-col-discipline"
                      label="Discipline"
                      value={disciplineId}
                      onChange={setDisciplineId}
                      options={disciplines.map((item) => ({ value: item.id, label: item.name }))}
                    />
                  </th>
                  <th scope="col" className="px-3 py-2 align-bottom">
                    <ColumnFilter id="tq-col-status" label="Status" value={status} onChange={setStatus} options={STATUS_OPTIONS} />
                  </th>
                  <th scope="col" className="px-3 py-2 align-bottom">
                    <ColumnFilter
                      id="tq-col-initiator"
                      label="Initiator"
                      value={initiatorId}
                      onChange={setInitiatorId}
                      options={peopleOptions}
                    />
                  </th>
                  <th scope="col" className="px-3 py-2 align-bottom">
                    <ColumnFilter
                      id="tq-col-action-by"
                      label="Action By"
                      value={actionById}
                      onChange={setActionById}
                      options={peopleOptions}
                    />
                  </th>
                  <th scope="col" className="px-3 py-2 align-bottom">
                    <button
                      type="button"
                      className="text-[0.65rem] font-semibold uppercase tracking-wide"
                      onClick={() => setSortKey("due")}
                      aria-label="Sort by due date"
                    >
                      Due{sortKey === "due" ? " ↕" : ""}
                    </button>
                  </th>
                  <th scope="col" className="px-3 py-2 align-bottom text-[0.65rem] font-semibold uppercase tracking-wide">
                    Age
                  </th>
                  <th scope="col" className="px-3 py-2 align-bottom">
                    <ColumnFilter
                      id="tq-col-priority"
                      label="Priority"
                      value={priority}
                      onChange={setPriority}
                      options={PRIORITY_OPTIONS}
                    />
                  </th>
                  <th scope="col" className="px-3 py-2 align-bottom">
                    <button
                      type="button"
                      className="text-[0.65rem] font-semibold uppercase tracking-wide"
                      onClick={() => setSortKey("updated")}
                      aria-label="Sort by last activity"
                    >
                      Last Activity{sortKey === "updated" ? " ↕" : ""}
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row) => (
                  <tr
                    key={String(row.id)}
                    className={`relative hover:bg-slate-50 ${row.overdue ? "bg-rose-50" : ""}`}
                  >
                    <td className="whitespace-nowrap px-3 py-1.5 font-medium text-slate-900">
                      <Link href={String(row.href)} className="after:absolute after:inset-0">
                        {String(row.tq)}
                      </Link>
                    </td>
                    <td className="max-w-xs px-3 py-1.5 text-slate-800">
                      <span className="line-clamp-2" title={String(row.subject)}>
                        {String(row.subject)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-1.5">{String(row.project)}</td>
                    <td className="whitespace-nowrap px-3 py-1.5">{String(row.discipline)}</td>
                    <td className="whitespace-nowrap px-3 py-1.5">
                      <StatusChip value={String(row.status)}>{String(row.status)}</StatusChip>
                    </td>
                    <td className="whitespace-nowrap px-3 py-1.5">{String(row.initiator)}</td>
                    <td className="whitespace-nowrap px-3 py-1.5">{String(row.actionBy)}</td>
                    <td className={`whitespace-nowrap px-3 py-1.5 ${row.overdue ? "font-semibold text-rose-800" : ""}`}>
                      {String(row.due)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-1.5 tabular-nums">{String(row.age)}</td>
                    <td className="whitespace-nowrap px-3 py-1.5">{String(row.priority)}</td>
                    <td className="whitespace-nowrap px-3 py-1.5">{String(row.updated)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </main>
    </>
  );
}
