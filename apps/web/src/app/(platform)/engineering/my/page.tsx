"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { EmptyState, SectionHeader } from "@rtb/ui";
import {
  asRecordArray,
  parseApiJsonResponse,
} from "@/lib/api/parse-json-response";
import {
  useEngineeringProjectFilter,
  withProjectQuery,
} from "@/hooks/use-engineering-project-filter";
import { useExperiencePerf } from "@/hooks/use-experience-perf";
import { buildAskHref } from "@/hooks/use-engineering-context";

type Row = Record<string, unknown>;

function labelOf(row: Row, keys: string[]): string {
  for (const k of keys) {
    const v = row[k];
    if (typeof v === "string" && v.trim()) return v;
  }
  return String(row.id ?? "Item");
}

export default function MyEngineeringPage() {
  useExperiencePerf("my");
  const projectId = useEngineeringProjectFilter();
  const [actions, setActions] = useState<Row[]>([]);
  const [tqs, setTqs] = useState<Row[]>([]);
  const [decisions, setDecisions] = useState<Row[]>([]);
  const [risks, setRisks] = useState<Row[]>([]);
  const [issues, setIssues] = useState<Row[]>([]);
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
      fetch(withProjectQuery("/api/engineering/risks", projectId)).then((r) =>
        parseApiJsonResponse(r),
      ),
      fetch(withProjectQuery("/api/engineering/issues", projectId)).then((r) =>
        parseApiJsonResponse(r),
      ),
    ])
      .then(([a, t, d, r, i]) => {
        setActions(asRecordArray(a.data).slice(0, 8));
        setTqs(asRecordArray(t.data).slice(0, 8));
        setDecisions(asRecordArray(d.data).slice(0, 8));
        setRisks(asRecordArray(r.data).slice(0, 8));
        setIssues(asRecordArray(i.data).slice(0, 8));
        if (![a, t, d, r, i].some((x) => x.ok)) {
          setError("Some work queues could not be loaded.");
        }
      })
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "Failed to load My Engineering"),
      )
      .finally(() => setLoading(false));
  }, [projectId]);

  const sections: Array<{
    id: string;
    title: string;
    href: string;
    rows: Row[];
    keys: string[];
  }> = [
    {
      id: "actions",
      title: "Open actions",
      href: "/engineering/actions",
      rows: actions,
      keys: ["title", "action_title", "summary"],
    },
    {
      id: "tqs",
      title: "Open TQs / RFIs",
      href: "/engineering/technical-queries",
      rows: tqs,
      keys: ["title", "query_number", "subject"],
    },
    {
      id: "decisions",
      title: "Recent decisions",
      href: "/engineering/decisions",
      rows: decisions,
      keys: ["title", "decision_title", "summary"],
    },
    {
      id: "risks",
      title: "Risks requiring attention",
      href: "/engineering/risks",
      rows: risks,
      keys: ["title", "risk_title", "summary"],
    },
    {
      id: "issues",
      title: "Issues requiring attention",
      href: "/engineering/issues",
      rows: issues,
      keys: ["title", "issue_title", "summary"],
    },
  ];

  return (
    <>
      <Header
        title="My Engineering"
        description="Personal work surface over existing engineering records"
      />
      <main
        className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8"
        data-testid="my-engineering"
      >
        {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}
        {loading ? (
          <p className="text-sm text-muted-foreground" data-testid="my-engineering-loading">
            Loading your work…
          </p>
        ) : null}

        <div className="mb-6 flex flex-wrap gap-3 text-sm">
          <Link
            href={buildAskHref({ projectId })}
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-800 hover:border-slate-400"
            data-testid="my-ask-link"
          >
            Ask about this work
          </Link>
          <Link
            href="/engineering/explore"
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-800 hover:border-slate-400"
          >
            Open Explore
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {sections.map((section) => (
            <section key={section.id} data-testid={`my-section-${section.id}`}>
              <SectionHeader title={section.title} description="" />
              {section.rows.length === 0 ? (
                <EmptyState
                  title={`No ${section.title.toLowerCase()}`}
                  description="Nothing in this queue for the current scope."
                />
              ) : (
                <ul className="mt-3 space-y-2">
                  {section.rows.map((row) => (
                    <li key={String(row.id)}>
                      <Link
                        href={section.href}
                        className="block rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 hover:border-slate-400"
                      >
                        {labelOf(row, section.keys)}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              <Link
                href={section.href}
                className="mt-2 inline-block text-xs text-slate-600 underline-offset-2 hover:underline"
              >
                Open full register
              </Link>
            </section>
          ))}
        </div>
      </main>
    </>
  );
}
