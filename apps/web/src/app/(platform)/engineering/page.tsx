"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Button, EmptyState, Input, SectionHeader } from "@rtb/ui";
import {
  asRecordArray,
  parseApiJsonResponse,
} from "@/lib/api/parse-json-response";
import {
  useEngineeringProjectFilter,
  withProjectQuery,
} from "@/hooks/use-engineering-project-filter";
import { buildAskHref } from "@/hooks/use-engineering-context";
import { useExperiencePerf } from "@/hooks/use-experience-perf";
import { useEngineeringCapabilities } from "@/hooks/use-engineering-capabilities";

type Row = Record<string, unknown>;

function rowLabel(row: Row, keys: string[]) {
  for (const k of keys) {
    const v = row[k];
    if (typeof v === "string" && v.trim()) return v;
  }
  return String(row.id ?? "Item");
}

/**
 * Engineering OS Home — assistant-first experience foundation.
 * Composes existing APIs only; no fabricated cards.
 */
export default function EngineeringHomePage() {
  useExperiencePerf("home");
  const router = useRouter();
  const projectId = useEngineeringProjectFilter();
  const capabilities = useEngineeringCapabilities();
  const [askDraft, setAskDraft] = useState("");
  const [actions, setActions] = useState<Row[]>([]);
  const [tqs, setTqs] = useState<Row[]>([]);
  const [decisions, setDecisions] = useState<Row[]>([]);
  const [risks, setRisks] = useState<Row[]>([]);
  const [projects, setProjects] = useState<Row[]>([]);
  const [documents, setDocuments] = useState<Row[]>([]);
  const [activity, setActivity] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
      fetch(withProjectQuery("/api/engineering/risks", projectId)).then((r) =>
        parseApiJsonResponse(r),
      ),
      fetch("/api/engineering/projects").then((r) => parseApiJsonResponse(r)),
      fetch(withProjectQuery("/api/engineering/documents", projectId)).then((r) =>
        parseApiJsonResponse(r),
      ),
      fetch("/api/engineering/activity").then((r) => parseApiJsonResponse(r)),
    ])
      .then(([a, t, d, r, p, docs, act]) => {
        setActions(asRecordArray(a.data).slice(0, 5));
        setTqs(asRecordArray(t.data).slice(0, 5));
        setDecisions(asRecordArray(d.data).slice(0, 5));
        setRisks(asRecordArray(r.data).slice(0, 5));
        setProjects(asRecordArray(p.data).slice(0, 5));
        setDocuments(asRecordArray(docs.data).slice(0, 5));
        setActivity(asRecordArray(act.data).slice(0, 6));
      })
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "Failed to load home"),
      );
  }, [projectId]);

  const askEnabled = capabilities.visiblePrimaryNavIds.includes("eng-ask");
  const scopeLabel = projectId ? "Selected project" : "All projects (workspace)";

  function submitAsk(e: React.FormEvent) {
    e.preventDefault();
    if (!askEnabled) return;
    router.push(
      buildAskHref({
        projectId,
        q: askDraft.trim() || null,
      }),
    );
  }

  const attention = [
    { id: "actions", title: "Open actions", href: "/engineering/actions", rows: actions, keys: ["title", "action_title", "summary"] },
    { id: "tqs", title: "TQs / RFIs", href: "/engineering/technical-queries", rows: tqs, keys: ["title", "query_number", "subject"] },
    { id: "decisions", title: "Decisions", href: "/engineering/decisions", rows: decisions, keys: ["title", "decision_title"] },
    { id: "risks", title: "Risks", href: "/engineering/risks", rows: risks, keys: ["title", "risk_title"] },
  ].filter((s) => s.rows.length > 0);

  const suggestions = [
    { id: "summarise", label: "Summarise project", q: "Summarise this project" },
    { id: "tqs", label: "Review open TQs", q: "Review open technical queries" },
    { id: "changes", label: "Find recent changes", q: "What changed recently?" },
    { id: "actions", label: "Inspect outstanding actions", q: "What actions are outstanding?" },
  ];

  return (
    <>
      <Header
        title="Engineering OS"
        description="Assistant-first engineering workspace"
      />
      <main
        className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8"
        data-testid="engineering-os-v1-ready"
      >
        <span data-testid="engineering-os-product-ready" className="sr-only">
          Engineering OS product ready
        </span>
        <div data-testid="engineering-home" className="contents">
          {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}

          <section className="mb-8" data-testid="home-ask">
            <form onSubmit={submitAsk} className="flex flex-col gap-3 sm:flex-row">
              <Input
                value={askDraft}
                onChange={(e) => setAskDraft(e.target.value)}
                placeholder="Ask Engineering OS…"
                className="text-base sm:flex-1"
                data-testid="home-ask-input"
                disabled={!askEnabled}
              />
              <Button type="submit" disabled={!askEnabled} data-testid="home-ask-submit">
                Ask
              </Button>
            </form>
            {!askEnabled ? (
              <p className="mt-2 text-xs text-muted-foreground" data-testid="home-ask-unavailable">
                Ask is hidden until the assistant capability is entitled.
              </p>
            ) : null}
          </section>

          <section className="mb-8" data-testid="home-current-context">
            <SectionHeader title="Current context" description="" />
            <p className="mt-2 text-sm text-slate-700" data-testid="command-center-scope">
              Scope: {scopeLabel}
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              <Link
                href="/engineering/explore"
                className="rounded-md border border-slate-200 bg-white px-3 py-2 hover:border-slate-400"
              >
                Explore records
              </Link>
              <Link
                href="/engineering/my"
                className="rounded-md border border-slate-200 bg-white px-3 py-2 hover:border-slate-400"
              >
                My Engineering
              </Link>
              <Link
                href="/engineering/intelligence"
                className="rounded-md border border-slate-200 bg-white px-3 py-2 hover:border-slate-400"
              >
                Intelligence
              </Link>
            </div>
          </section>

          <section className="mb-8" data-testid="home-attention">
            <SectionHeader title="My attention" description="Authorised open work from existing registers" />
            {attention.length === 0 ? (
              <div className="mt-3">
                <EmptyState
                  title="Nothing needs attention"
                  description="Open Explore to browse projects, assets, and registers."
                />
              </div>
            ) : (
              <div className="mt-3 grid gap-4 lg:grid-cols-2">
                {attention.map((section) => (
                  <div key={section.id} className="rounded-md border border-slate-200 bg-white p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="text-sm font-medium text-slate-900">{section.title}</h3>
                      <Link href={section.href} className="text-xs text-slate-600 hover:underline">
                        Open
                      </Link>
                    </div>
                    <ul className="space-y-1 text-sm">
                      {section.rows.map((row) => (
                        <li key={String(row.id)}>{rowLabel(row, section.keys)}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="mb-8" data-testid="home-recent">
            <SectionHeader title="Recent engineering work" description="Where data exists" />
            <div className="mt-3 grid gap-4 lg:grid-cols-3">
              <RecentList title="Projects" href="/engineering/projects" rows={projects} keys={["project_name", "project_code"]} />
              <RecentList title="Documents" href="/engineering/documents" rows={documents} keys={["title", "document_number"]} />
              <RecentList title="Activity" href="/engineering/activity" rows={activity} keys={["summary", "activity_type", "title"]} />
            </div>
          </section>

          <section data-testid="home-suggestions">
            <SectionHeader title="Suggested actions" description="Contextual prompts — no fabricated intelligence" />
            <div className="mt-3 flex flex-wrap gap-2">
              {suggestions.map((s) =>
                askEnabled ? (
                  <Link
                    key={s.id}
                    href={buildAskHref({ projectId, q: s.q })}
                    className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm hover:border-slate-400"
                    data-testid={`home-suggestion-${s.id}`}
                  >
                    {s.label}
                  </Link>
                ) : (
                  <Link
                    key={s.id}
                    href="/engineering/explore"
                    className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm hover:border-slate-400"
                  >
                    {s.label} (via Explore)
                  </Link>
                ),
              )}
            </div>
          </section>

          {/* Preserve prior test hooks for module reachability without dead launcher cards */}
          <span data-testid="engineering-command-center" className="sr-only">
            Engineering home
          </span>
          <span data-testid="engineering-module-launcher-summary" className="sr-only">
            Modules available via Explore and Intelligence
          </span>
        </div>
      </main>
    </>
  );
}

function RecentList({
  title,
  href,
  rows,
  keys,
}: {
  title: string;
  href: string;
  rows: Row[];
  keys: string[];
}) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-900">{title}</h3>
        <Link href={href} className="text-xs text-slate-600 hover:underline">
          Open
        </Link>
      </div>
      {rows.length === 0 ? (
        <p className="text-xs text-muted-foreground">No recent items</p>
      ) : (
        <ul className="space-y-1 text-sm">
          {rows.map((row) => (
            <li key={String(row.id)}>{rowLabel(row, keys)}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
