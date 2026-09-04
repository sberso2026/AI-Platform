"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { CommandPageTitle, CommandPanel, EmptyState, StatusChip } from "@rtb/ui";
import { createClient } from "@/lib/supabase/client";
import { asRecordArray, parseApiJsonResponse } from "@/lib/api/parse-json-response";
import { TqQueryHtml } from "@/components/engineering/tq-query-html";
import {
  formatTqDateTime,
  projectTqRegisterRow,
  stringField,
  tqDetailPanels,
  tqNextAction,
  tqPersonLabel,
} from "@/lib/engineering/tq-register-presentation";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "discussion", label: "Discussion" },
  { id: "evidence", label: "Evidence" },
  { id: "related", label: "Related" },
  { id: "history", label: "History" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function TechnicalQueryDetailPage() {
  const params = useParams();
  const id = String(params.id ?? "");
  const [query, setQuery] = useState<Record<string, unknown> | null>(null);
  const [comments, setComments] = useState<Record<string, unknown>[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabId>("overview");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [projectNames, setProjectNames] = useState<Record<string, string>>({});
  const [disciplineNames, setDisciplineNames] = useState<Record<string, string>>({});

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
          const idValue = String(row.id ?? "");
          if (idValue) names[idValue] = String(row.project_name ?? row.name ?? "Project");
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
          const idValue = String(row.id ?? "");
          if (idValue) names[idValue] = String(row.name ?? "Discipline");
        }
        setDisciplineNames(names);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/engineering/technical-queries/${id}`)
      .then((response) => parseApiJsonResponse<{ query: Record<string, unknown>; comments?: unknown }>(response))
      .then((parsed) => {
        if (!parsed.ok || !parsed.data?.query) {
          setError(parsed.errorMessage ?? "Technical query unavailable.");
          setQuery(null);
          return;
        }
        setError(null);
        setQuery(parsed.data.query);
        setComments(asRecordArray(parsed.data.comments));
      })
      .catch(() => {
        setError("Technical query unavailable.");
        setQuery(null);
      });
  }, [id]);

  const row = useMemo(
    () => (query ? projectTqRegisterRow(query, { currentUserId, projectNames, disciplineNames }) : null),
    [query, currentUserId, projectNames, disciplineNames],
  );
  const panels = query ? tqDetailPanels(query) : null;

  return (
    <>
      <Header title="Technical Query" description="Controlled engineering query and RFI workflow" />
      <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8" data-testid="tq-detail">
        <div className="mb-4">
          <Link href="/engineering/technical-queries" className="eos-shell-link h-9 min-h-9 px-3 text-sm">
            Back to register
          </Link>
        </div>
        {error ? (
          <p className="text-[0.9375rem] text-[color:var(--eos-warning)]">{error}</p>
        ) : !row || !query || !panels ? (
          <p className="text-[color:var(--eos-text-secondary)]">Loading technical query…</p>
        ) : (
          <>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <CommandPageTitle eyebrow={row.tqNumber} title={row.title} description={tqNextAction(row.status, row.overdue)} />
              <div className="flex flex-wrap items-center gap-2">
                <StatusChip status={row.statusChip}>{row.statusLabel}</StatusChip>
                <StatusChip status={row.priorityChip}>{row.priorityLabel}</StatusChip>
                {row.isDraft ? <StatusChip status="pending">Draft</StatusChip> : null}
                <Link href={`/engineering/technical-queries/${id}/print`} className="eos-shell-link h-9 min-h-9 px-3 text-sm">
                  Print preview
                </Link>
              </div>
            </div>

            <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              <Fact label="Initiator" value={row.initiatorLabel} />
              <Fact label="Action By" value={row.actionByLabel} />
              <Fact label="Due" value={row.dueLabel} />
              <Fact label="Project" value={row.projectLabel} />
              <Fact label="Next action" value={tqNextAction(row.status, row.overdue)} />
            </div>

            <div className="mb-4 flex flex-wrap gap-2" data-testid="tq-detail-tabs">
              {TABS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={tab === item.id ? "eos-tab-active eos-shell-link h-9 min-h-9 px-3 text-sm" : "eos-shell-link h-9 min-h-9 px-3 text-sm"}
                  onClick={() => setTab(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {tab === "overview" ? (
              <div className="grid gap-4">
                <CommandPanel title="Query / Information Required" accent="cyan" testId="tq-query-panel">
                  <TqQueryHtml html={panels.query} tqId={id} testId="tq-query-content" />
                </CommandPanel>
                <CommandPanel title="Suggested Solution" testId="tq-suggested-panel">
                  <TqQueryHtml html={panels.suggestedSolution} tqId={id} />
                </CommandPanel>
                <CommandPanel title="Client / Technical Response" testId="tq-response-panel">
                  <TqQueryHtml html={panels.response} tqId={id} />
                </CommandPanel>
                <CommandPanel title="Response Basis" testId="tq-basis-panel">
                  <TqQueryHtml html={panels.responseBasis} tqId={id} />
                </CommandPanel>
                <CommandPanel title="Closeout" testId="tq-closeout-panel">
                  <TqQueryHtml html={panels.closeout} tqId={id} />
                </CommandPanel>
              </div>
            ) : null}

            {tab === "discussion" ? (
              <CommandPanel title="Discussion">
                {comments.length === 0 ? (
                  <EmptyState title="No discussion yet" description="Comments appear here when recorded on this technical query." />
                ) : (
                  <ul className="space-y-3">
                    {comments.map((comment, index) => (
                      <li key={stringField(comment, "id") || String(index)} className="border-b border-[color:var(--eos-border)] pb-3">
                        <p className="text-[0.8125rem] text-[color:var(--eos-text-secondary)]">
                          {tqPersonLabel(stringField(comment, "created_by", "user_id"), currentUserId, "Participant")} ·{" "}
                          {formatTqDateTime(stringField(comment, "created_at"))}
                        </p>
                        <p className="mt-1 whitespace-pre-wrap text-[0.9375rem]">
                          {stringField(comment, "body", "content", "comment", "text") || "—"}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </CommandPanel>
            ) : null}

            {tab === "evidence" ? (
              <CommandPanel title="Evidence">
                {row.imageCount === 0 && row.attachmentCount === 0 ? (
                  <EmptyState title="No evidence published" description="Query images and linked documents appear here when present." />
                ) : (
                  <p className="text-[0.9375rem] text-[color:var(--eos-text-secondary)]">
                    {row.imageCount ? `${row.imageCount} ${row.imageCount === 1 ? "image" : "images"} in query. ` : ""}
                    {row.attachmentCount ? `${row.attachmentCount} linked ${row.attachmentCount === 1 ? "document" : "documents"}.` : ""}
                  </p>
                )}
              </CommandPanel>
            ) : null}

            {tab === "related" ? (
              <CommandPanel title="Related">
                <EmptyState title="No related records published" description="Related items remain on the canonical Technical Query record." />
              </CommandPanel>
            ) : null}

            {tab === "history" ? (
              <CommandPanel title="History">
                <ul className="space-y-2 text-[0.9375rem]">
                  <li>Raised {formatTqDateTime(stringField(query, "created_at"))}</li>
                  <li>Last activity {formatTqDateTime(stringField(query, "updated_at"))}</li>
                  <li>{comments.length} discussion {comments.length === 1 ? "entry" : "entries"}</li>
                </ul>
              </CommandPanel>
            ) : null}
          </>
        )}
      </main>
    </>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="eos-command-panel px-4 py-4">
      <p className="text-[0.8125rem] tracking-[0.08em] text-[color:var(--eos-text-secondary)]">{label}</p>
      <p className="mt-1 text-[1rem] font-medium">{value}</p>
    </div>
  );
}
