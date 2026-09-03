"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Input, StatusChip } from "@rtb/ui";
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
import type { TechnicalQueryPerson, TechnicalQueryPresentation } from "@rtb/engineering-os/browser";

type RegisterItem = Record<string, unknown> & {
  presentation?: TechnicalQueryPresentation;
};

export default function TechnicalQueriesPage() {
  const projectId = useResolvedEngineeringProjectId();
  const { canMutate } = useEngineeringWriteAccess();
  const [items, setItems] = useState<RegisterItem[]>([]);
  const [people, setPeople] = useState<TechnicalQueryPerson[]>([]);
  const [disciplines, setDisciplines] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState("all");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [disciplineId, setDisciplineId] = useState("");
  const [initiatorId, setInitiatorId] = useState("");
  const [actionById, setActionById] = useState("");
  const [classification, setClassification] = useState("");
  const [priority, setPriority] = useState("");
  const [sortKey, setSortKey] = useState<"updated" | "due" | "number">("updated");

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (projectId) params.set("projectId", projectId);
    if (view !== "all") params.set("view", view);
    if (search.trim()) params.set("q", search.trim());
    if (status) params.set("status", status);
    if (disciplineId) params.set("disciplineId", disciplineId);
    if (initiatorId) params.set("initiatorId", initiatorId);
    if (actionById) params.set("actionById", actionById);
    if (classification) params.set("classification", classification);
    if (priority) params.set("priority", priority);
    const qs = params.toString();
    return `/api/engineering/technical-queries${qs ? `?${qs}` : ""}`;
  }, [projectId, view, search, status, disciplineId, initiatorId, actionById, classification, priority]);

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

  return (
    <>
      <Header
        title="Technical Queries"
        description="Controlled technical query / RFI register for engineering response, review, and closeout"
      />
      <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8" data-testid="tq-register">
        {projectId ? (
          <EngineeringBreadcrumb
            items={[
              { href: "/engineering/projects", label: "Projects" },
              { href: `/engineering/projects/${projectId}`, label: "Selected project" },
              { label: "Technical Queries" },
            ]}
          />
        ) : null}

        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <nav className="flex flex-wrap gap-1" aria-label="Technical query queues">
            {TQ_REGISTER_VIEWS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`rounded-md px-3 py-2 text-sm ${
                  view === item.id ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-800"
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
              className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground"
            >
              + New Technical Query
            </Link>
          ) : (
            <p className="text-sm text-muted-foreground">Read-only — technical queries are visible, not editable.</p>
          )}
        </div>

        <div className="mb-4 grid gap-2 md:grid-cols-4 xl:grid-cols-8">
          <Input
            placeholder="Search TQs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search technical queries"
          />
          <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
            <option value="">Status</option>
            <option value="draft">Draft</option>
            <option value="awaiting_response">Awaiting Response</option>
            <option value="response_submitted">Response Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="clarification_required">Clarification Required</option>
            <option value="accepted">Accepted</option>
            <option value="closed">Closed</option>
          </select>
          <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={disciplineId} onChange={(e) => setDisciplineId(e.target.value)} aria-label="Discipline">
            <option value="">Discipline</option>
            {disciplines.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={initiatorId} onChange={(e) => setInitiatorId(e.target.value)} aria-label="Initiator">
            <option value="">Initiator</option>
            {people.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </select>
          <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={actionById} onChange={(e) => setActionById(e.target.value)} aria-label="Action By">
            <option value="">Action By</option>
            {people.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </select>
          <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={classification} onChange={(e) => setClassification(e.target.value)} aria-label="Classification">
            <option value="">Classification</option>
            <option value="technical_clarification">Technical Clarification</option>
            <option value="drawing_clarification">Drawing Clarification</option>
            <option value="specification_clarification">Specification Clarification</option>
            <option value="information_request">Information Request</option>
            <option value="site_construction_query">Site / Construction Query</option>
            <option value="other">Other</option>
          </select>
          <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={priority} onChange={(e) => setPriority(e.target.value)} aria-label="Priority">
            <option value="">Priority</option>
            <option value="low">Low</option>
            <option value="medium">Normal</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={sortKey} onChange={(e) => setSortKey(e.target.value as typeof sortKey)} aria-label="Sort">
            <option value="updated">Updated</option>
            <option value="due">Due</option>
            <option value="number">TQ No.</option>
          </select>
        </div>

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
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  {["TQ No.", "Title / Query", "Project", "Discipline", "Status", "Initiator", "Action By", "Due", "Age", "Priority", "Last Activity"].map((label) => (
                    <th key={label} scope="col" className="px-4 py-3 font-semibold">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row) => (
                  <tr
                    key={String(row.id)}
                    className={`relative hover:bg-slate-50 ${row.overdue ? "bg-rose-50" : ""}`}
                  >
                    <td className="px-4 py-3 font-medium text-slate-900">
                      <Link href={String(row.href)} className="after:absolute after:inset-0">
                        {String(row.tq)}
                      </Link>
                    </td>
                    <td className="max-w-sm px-4 py-3 text-slate-800">{String(row.subject)}</td>
                    <td className="px-4 py-3">{String(row.project)}</td>
                    <td className="px-4 py-3">{String(row.discipline)}</td>
                    <td className="px-4 py-3">
                      <StatusChip value={String(row.status)}>{String(row.status)}</StatusChip>
                    </td>
                    <td className="px-4 py-3">{String(row.initiator)}</td>
                    <td className="px-4 py-3">{String(row.actionBy)}</td>
                    <td className={`px-4 py-3 ${row.overdue ? "font-semibold text-rose-800" : ""}`}>{String(row.due)}</td>
                    <td className="px-4 py-3 tabular-nums">{String(row.age)}</td>
                    <td className="px-4 py-3">{String(row.priority)}</td>
                    <td className="px-4 py-3">{String(row.updated)}</td>
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
