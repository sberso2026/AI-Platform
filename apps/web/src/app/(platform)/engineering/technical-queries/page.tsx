"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import {
  Button,
  CommandPageTitle,
  CommandPanel,
  EmptyState,
  Input,
  LiveSignal,
  StatusChip,
} from "@rtb/ui";
import { Image as ImageIcon, Paperclip, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { asRecordArray, parseApiJsonResponse } from "@/lib/api/parse-json-response";
import { useEngineeringProjectFilter, withProjectQuery } from "@/hooks/use-engineering-project-filter";
import {
  projectTqRegisterRow,
  rowMatchesView,
  tqSignalCounts,
  TQ_REGISTER_VIEWS,
  type TqRegisterRow,
  type TqRegisterViewId,
} from "@/lib/engineering/tq-register-presentation";

type LoadState = "loading" | "loaded" | "failed";

function signalValue(state: LoadState, value: number): string {
  if (state === "loading") return "—";
  if (state === "failed") return "Unavailable";
  return String(value);
}

export default function TechnicalQueriesPage() {
  const router = useRouter();
  const headerProjectId = useEngineeringProjectFilter();
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [projectNames, setProjectNames] = useState<Record<string, string>>({});
  const [disciplineNames, setDisciplineNames] = useState<Record<string, string>>({});
  const [view, setView] = useState<TqRegisterViewId>("all");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [disciplineFilter, setDisciplineFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [initiatorFilter, setInitiatorFilter] = useState("");
  const [actionByFilter, setActionByFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [sortKey, setSortKey] = useState<"updated" | "due" | "number">("updated");
  const [composerOpen, setComposerOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [question, setQuestion] = useState("");
  const [responseDue, setResponseDue] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => setCurrentUserId(data.user?.id ?? null))
      .catch(() => setCurrentUserId(null));
  }, []);

  useEffect(() => {
    fetch("/api/engineering/projects")
      .then((r) => parseApiJsonResponse(r))
      .then((parsed) => {
        if (!parsed.ok) return;
        const names: Record<string, string> = {};
        for (const row of asRecordArray(parsed.data)) {
          const id = String(row.id ?? "");
          if (id) names[id] = String(row.project_name ?? row.name ?? "Project");
        }
        setProjectNames(names);
      })
      .catch(() => undefined);
    fetch("/api/engineering/disciplines")
      .then((r) => parseApiJsonResponse(r))
      .then((parsed) => {
        if (!parsed.ok) return;
        const names: Record<string, string> = {};
        for (const row of asRecordArray(parsed.data)) {
          const id = String(row.id ?? "");
          if (id) names[id] = String(row.name ?? "Discipline");
        }
        setDisciplineNames(names);
      })
      .catch(() => undefined);
  }, []);

  const reload = () => {
    setLoadState("loading");
    fetch(withProjectQuery("/api/engineering/technical-queries", headerProjectId))
      .then((r) => parseApiJsonResponse(r))
      .then((parsed) => {
        if (!parsed.ok) {
          setItems([]);
          setLoadState("failed");
          return;
        }
        setItems(asRecordArray(parsed.data));
        setLoadState("loaded");
      })
      .catch(() => {
        setItems([]);
        setLoadState("failed");
      });
  };

  useEffect(() => {
    reload();
  }, [headerProjectId]);

  const rows = useMemo(
    () => items.map((item) => projectTqRegisterRow(item, { currentUserId, projectNames, disciplineNames })),
    [items, currentUserId, projectNames, disciplineNames],
  );

  const signals = tqSignalCounts(rows, currentUserId);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows
      .filter((row) => rowMatchesView(row, view, currentUserId))
      .filter((row) => !q || row.searchText.includes(q))
      .filter((row) => !statusFilter || row.statusKey === statusFilter || row.status === statusFilter)
      .filter((row) => !disciplineFilter || row.disciplineId === disciplineFilter)
      .filter((row) => !projectFilter || row.projectId === projectFilter)
      .filter((row) => !initiatorFilter || (initiatorFilter === "me" && row.initiatorId === currentUserId))
      .filter((row) => !actionByFilter || (actionByFilter === "me" && row.actionById === currentUserId))
      .filter((row) => !priorityFilter || row.priority === priorityFilter)
      .sort((a, b) => {
        if (sortKey === "due") return a.dueSort.localeCompare(b.dueSort);
        if (sortKey === "number") return a.tqNumber.localeCompare(b.tqNumber);
        return b.updatedSort.localeCompare(a.updatedSort);
      });
  }, [
    rows,
    view,
    currentUserId,
    search,
    statusFilter,
    disciplineFilter,
    projectFilter,
    initiatorFilter,
    actionByFilter,
    priorityFilter,
    sortKey,
  ]);

  const activeFilters: Array<{ key: string; label: string; clear: () => void }> = [];
  if (view !== "all") {
    const label = TQ_REGISTER_VIEWS.find((item) => item.id === view)?.label ?? view;
    activeFilters.push({ key: "view", label: `View: ${label}`, clear: () => setView("all") });
  }
  if (search.trim()) activeFilters.push({ key: "search", label: `Search: ${search.trim()}`, clear: () => setSearch("") });
  if (projectFilter) {
    activeFilters.push({
      key: "project",
      label: `Project: ${projectNames[projectFilter] ?? "Selected"}`,
      clear: () => setProjectFilter(""),
    });
  }
  if (disciplineFilter) {
    activeFilters.push({
      key: "discipline",
      label: `Discipline: ${disciplineNames[disciplineFilter] ?? "Selected"}`,
      clear: () => setDisciplineFilter(""),
    });
  }
  if (statusFilter) activeFilters.push({ key: "status", label: `Status: ${statusFilter}`, clear: () => setStatusFilter("") });
  if (priorityFilter) {
    activeFilters.push({ key: "priority", label: `Priority: ${priorityFilter}`, clear: () => setPriorityFilter("") });
  }
  if (initiatorFilter) {
    activeFilters.push({ key: "initiator", label: "Initiator: Me", clear: () => setInitiatorFilter("") });
  }
  if (actionByFilter) {
    activeFilters.push({ key: "actionBy", label: "Action by: Me", clear: () => setActionByFilter("") });
  }

  async function onCreate(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const parsed = await parseApiJsonResponse(
        await fetch("/api/engineering/technical-queries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            question,
            responseDue,
            projectId: headerProjectId ?? undefined,
          }),
        }),
      );
      if (parsed.ok) {
        setTitle("");
        setQuestion("");
        setResponseDue("");
        setComposerOpen(false);
        reload();
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Header title="Technical Query Register" description="Controlled engineering query and RFI workflow" />
      <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8" data-testid="page-main">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <CommandPageTitle
            eyebrow="Engineering OS"
            title="Technical Query Register"
            description="Controlled engineering query and RFI workflow"
          />
          <Button type="button" onClick={() => setComposerOpen(true)} data-testid="tq-new-button">
            <Plus className="mr-2 h-4 w-4" aria-hidden />
            New Technical Query
          </Button>
        </div>

        <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5" data-testid="tq-signal-strip">
          <LiveSignal label="OPEN" value={signalValue(loadState, signals.open)} testId="tq-signal-open" />
          <LiveSignal
            label="AWAITING RESPONSE"
            value={signalValue(loadState, signals.awaiting)}
            testId="tq-signal-awaiting"
          />
          <LiveSignal label="OVERDUE" value={signalValue(loadState, signals.overdue)} testId="tq-signal-overdue" />
          <LiveSignal label="HIGH PRIORITY" value={signalValue(loadState, signals.high)} testId="tq-signal-high" />
          <LiveSignal label="MY ACTIONS" value={signalValue(loadState, signals.mine)} testId="tq-signal-mine" />
        </div>

        {composerOpen ? (
          <CommandPanel title="New Technical Query" accent="cyan" className="mb-4" testId="tq-composer">
            <form className="grid gap-3 md:grid-cols-2" onSubmit={onCreate}>
              <div className="md:col-span-2">
                <label className="mb-1 block text-[0.8125rem] text-[color:var(--eos-text-secondary)]">Title</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-[0.8125rem] text-[color:var(--eos-text-secondary)]">Query</label>
                <textarea
                  className="min-h-24 w-full rounded-md border border-[color:var(--eos-border)] bg-transparent px-3 py-2 text-sm"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-[0.8125rem] text-[color:var(--eos-text-secondary)]">Response due</label>
                <Input type="date" value={responseDue} onChange={(e) => setResponseDue(e.target.value)} />
              </div>
              <div className="flex items-end gap-2">
                <Button type="submit" disabled={saving}>
                  Create technical query
                </Button>
                <Button type="button" variant="outline" onClick={() => setComposerOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CommandPanel>
        ) : null}

        <CommandPanel
          title="Register"
          accent="cyan"
          testId="tq-register-panel"
          meta={`${filtered.length} shown`}
          action={
            <div className="flex flex-wrap items-center gap-2" data-testid="tq-register-filters">
              {TQ_REGISTER_VIEWS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={view === item.id ? "eos-tab-active eos-shell-link h-9 min-h-9 px-3 text-xs" : "eos-shell-link h-9 min-h-9 px-3 text-xs"}
                  onClick={() => setView(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          }
        >
          <div className="mb-3 grid gap-2 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <Input
              aria-label="Search technical queries"
              placeholder="Search number or title"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              <select
                aria-label="Project"
                className="h-9 rounded-md border border-[color:var(--eos-border)] bg-transparent px-2 text-xs"
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
              >
                <option value="">Project</option>
                {Object.entries(projectNames).map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
              <select
                aria-label="Discipline"
                className="h-9 rounded-md border border-[color:var(--eos-border)] bg-transparent px-2 text-xs"
                value={disciplineFilter}
                onChange={(e) => setDisciplineFilter(e.target.value)}
              >
                <option value="">Discipline</option>
                {Object.entries(disciplineNames).map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
              <select
                aria-label="Status"
                className="h-9 rounded-md border border-[color:var(--eos-border)] bg-transparent px-2 text-xs"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Status</option>
                <option value="draft">Draft</option>
                <option value="awaiting_response">Awaiting Response</option>
                <option value="response_submitted">Response Submitted</option>
                <option value="clarification_required">Clarification Required</option>
                <option value="accepted">Accepted</option>
                <option value="closed">Closed</option>
              </select>
              <select
                aria-label="Initiator"
                className="h-9 rounded-md border border-[color:var(--eos-border)] bg-transparent px-2 text-xs"
                value={initiatorFilter}
                onChange={(e) => setInitiatorFilter(e.target.value)}
              >
                <option value="">Initiator</option>
                <option value="me">Me</option>
              </select>
              <select
                aria-label="Action by"
                className="h-9 rounded-md border border-[color:var(--eos-border)] bg-transparent px-2 text-xs"
                value={actionByFilter}
                onChange={(e) => setActionByFilter(e.target.value)}
              >
                <option value="">Action by</option>
                <option value="me">Me</option>
              </select>
              <select
                aria-label="Priority"
                className="h-9 rounded-md border border-[color:var(--eos-border)] bg-transparent px-2 text-xs"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="">Priority</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Normal</option>
                <option value="low">Low</option>
              </select>
              <select
                aria-label="Sort"
                className="h-9 rounded-md border border-[color:var(--eos-border)] bg-transparent px-2 text-xs"
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as "updated" | "due" | "number")}
              >
                <option value="updated">Last activity</option>
                <option value="due">Due</option>
                <option value="number">TQ No.</option>
              </select>
            </div>
          </div>

          {activeFilters.length > 0 ? (
            <div className="mb-3 flex flex-wrap gap-2" data-testid="tq-active-filters">
              {activeFilters.map((filter) => (
                <button
                  key={filter.key}
                  type="button"
                  className="eos-shell-link h-8 min-h-8 px-3 text-xs"
                  onClick={filter.clear}
                >
                  {filter.label} ×
                </button>
              ))}
            </div>
          ) : null}

          {loadState === "failed" ? (
            <p className="text-[0.9375rem] text-[color:var(--eos-warning)]">Technical Query register unavailable.</p>
          ) : filtered.length === 0 ? (
            <EmptyState title="No technical queries" description="No records match the current operational view." />
          ) : (
            <div className="overflow-x-auto">
              <table className="eos-register-matrix" data-testid="tq-register-matrix">
                <thead>
                  <tr>
                    <th>TQ No.</th>
                    <th>Title / Query</th>
                    <th>Project</th>
                    <th>Discipline</th>
                    <th>Status</th>
                    <th>Initiator</th>
                    <th>Action By</th>
                    <th>Due</th>
                    <th>Age</th>
                    <th>Priority</th>
                    <th>Last Activity</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row) => (
                    <TqRegisterRowView key={row.id} row={row} onOpen={() => router.push(row.href)} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CommandPanel>
      </main>
    </>
  );
}

function TqRegisterRowView({ row, onOpen }: { row: TqRegisterRow; onOpen: () => void }) {
  return (
    <tr
      data-testid={`tq-row-${row.tqNumber}`}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
      tabIndex={0}
    >
      <td className="font-semibold">{row.tqNumber}</td>
      <td className="min-w-[18rem] max-w-[28rem]">
        <p className="eos-line-clamp-2 font-medium" title={row.fullTitle}>
          {row.title}
        </p>
        {row.querySummary ? (
          <p className="eos-line-clamp-2 mt-1 text-[color:var(--eos-text-secondary)]" data-testid="tq-row-summary">
            {row.querySummary}
          </p>
        ) : null}
        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[0.75rem] text-[color:var(--eos-text-secondary)]">
          {row.imageCount > 0 ? (
            <span className="inline-flex items-center gap-1" data-testid="tq-image-indicator">
              <ImageIcon className="h-3.5 w-3.5" aria-hidden />
              {row.imageCount} {row.imageCount === 1 ? "image" : "images"}
            </span>
          ) : null}
          {row.attachmentCount > 0 ? (
            <span className="inline-flex items-center gap-1">
              <Paperclip className="h-3.5 w-3.5" aria-hidden />
              {row.attachmentCount} {row.attachmentCount === 1 ? "attachment" : "attachments"}
            </span>
          ) : null}
          {row.isDraft ? <StatusChip status="pending">Draft</StatusChip> : null}
          {row.isOwnedDraft ? (
            <span className="inline-flex gap-2" onClick={(event) => event.stopPropagation()}>
              <Link href={row.href} className="underline-offset-2 hover:underline" data-testid="tq-edit-draft">
                Edit Draft
              </Link>
              <Link href={row.href} className="underline-offset-2 hover:underline" data-testid="tq-submit-draft">
                Submit Technical Query
              </Link>
            </span>
          ) : null}
        </div>
      </td>
      <td>{row.projectLabel}</td>
      <td>{row.disciplineLabel}</td>
      <td>
        <StatusChip status={row.statusChip}>{row.statusLabel}</StatusChip>
      </td>
      <td>{row.initiatorLabel}</td>
      <td>{row.actionByLabel}</td>
      <td>{row.dueLabel}</td>
      <td>{row.ageLabel}</td>
      <td>
        <StatusChip status={row.priorityChip}>{row.priorityLabel}</StatusChip>
      </td>
      <td>{row.lastActivityLabel}</td>
    </tr>
  );
}
