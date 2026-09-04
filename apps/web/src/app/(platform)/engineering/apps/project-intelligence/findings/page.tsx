"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { EmptyState } from "@rtb/ui";
import { PiErrorState, PiLoadingSkeleton } from "@/components/engineering/pi-page-chrome";
import { PI_BASE_PATH, withPiProjectQuery } from "@/components/engineering/pi-project-context";
import { findingStatusLabel, humanizeToken } from "@/components/engineering/pi-ux";

type FindingRow = {
  id: string;
  title: string;
  status: string;
  severity: string;
  priority: string | null;
  open: boolean;
  conflict: string;
  updatedAt: string | null;
  createdAt: string | null;
};

type Filter = "open" | "critical" | "high" | "overdue" | "new" | "resolved" | "patterns";

export default function FindingsIntelligencePage() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId") ?? "";
  const [findings, setFindings] = useState<FindingRow[]>([]);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("open");

  useEffect(() => {
    const url = projectId
      ? `/api/engineering/project-intelligence/findings?projectId=${encodeURIComponent(projectId)}`
      : "/api/engineering/project-intelligence/findings";
    fetch(url)
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error?.message ?? "Unable to load findings");
        setFindings(payload.data ?? []);
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load findings"))
      .finally(() => setLoading(false));
  }, [projectId]);

  const visible = useMemo(() => {
    const now = Date.now();
    return findings.filter((finding) => {
      if (filter === "open") return finding.open;
      if (filter === "critical") return finding.severity === "critical";
      if (filter === "high") return finding.severity === "high" || finding.severity === "critical";
      if (filter === "resolved") return !finding.open;
      if (filter === "patterns") return finding.conflict !== "none";
      if (filter === "new") {
        return finding.createdAt ? now - Date.parse(finding.createdAt) < 7 * 86400000 : false;
      }
      if (filter === "overdue") {
        return finding.open && finding.priority === "overdue";
      }
      return true;
    });
  }, [filter, findings]);

  if (loading) {
    return (
      <section>
        <h2 className="text-2xl font-semibold text-slate-900">Findings</h2>
        <div className="mt-4">
          <PiLoadingSkeleton label="Loading findings…" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <h2 className="text-2xl font-semibold text-slate-900">Findings</h2>
        <div className="mt-4">
          <PiErrorState title="Findings unavailable" description={error} />
        </div>
      </section>
    );
  }

  return (
    <section data-testid="findings-intelligence-ready">
      <div data-testid="project-intelligence-findings-ready">
        <p className="text-sm font-medium text-cyan-700">Engineering drill-down</p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-900">Findings</h2>
        <p className="mt-2 max-w-2xl text-slate-600">
          Highest-priority findings from documents, meetings, and inspections. Findings never mutate
          Engineering Core without human approval.
        </p>

        <div className="mt-6 flex flex-wrap gap-2" data-testid="findings-priority-filters">
          {(["open", "critical", "high", "overdue", "new", "resolved", "patterns"] as const).map((item) => (
            <button
              key={item}
              type="button"
              className={`rounded-full border px-3 py-1.5 text-sm capitalize ${
                filter === item ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white"
              }`}
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>

        {visible.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              title={filter === "open" ? "No open findings." : "No findings in this view."}
              description="Findings appear when document, meeting, or inspection evidence supports them."
            />
          </div>
        ) : (
          <ul className="mt-6 space-y-2">
            {visible.map((finding) => (
              <li key={finding.id} className="rounded-md border border-slate-200 px-4 py-3 text-sm">
                <p className="font-medium text-slate-900">{finding.title}</p>
                <p className="mt-1 text-slate-600">
                  {humanizeToken(finding.severity)} · {findingStatusLabel(finding.status)}
                  {finding.conflict !== "none" ? " · conflicting evidence" : ""}
                </p>
              </li>
            ))}
          </ul>
        )}

        <details className="mt-8 rounded-md border border-slate-200 px-4 py-3 text-sm">
          <summary className="cursor-pointer font-medium text-slate-800">Advanced / Administration</summary>
          <nav className="mt-3 grid gap-3 text-slate-700 sm:grid-cols-2" aria-label="Findings advanced">
            {[
              ["Candidate intake", "Document, meeting, and manual sources"],
              ["Evidence internals", "Citation lineage"],
              ["Duplicates", "Human merge only"],
              ["Conversion proposals", "Core conversion after acceptance"],
              ["Assignments", "Reviewer assignment history"],
              ["Health", "Feature readiness"],
              ["Settings", "Taxonomy and policy"],
            ].map(([title, detail]) => (
              <div key={title} className="rounded-md border border-slate-200 px-4 py-3">
                <p className="font-medium text-slate-900">{title}</p>
                <p className="mt-1 text-slate-600">{detail}</p>
              </div>
            ))}
          </nav>
        </details>

        <div className="mt-6 flex flex-wrap gap-4 text-sm">
          <Link className="text-cyan-700 hover:underline" href={withPiProjectQuery(`${PI_BASE_PATH}/engineering`, projectId)}>
            Engineering
          </Link>
          <Link
            className="text-cyan-700 hover:underline"
            href={withPiProjectQuery(`${PI_BASE_PATH}/meetings`, projectId)}
            data-testid="findings-meeting-intelligence-link"
          >
            Meetings
          </Link>
          <Link className="text-cyan-700 hover:underline" href={withPiProjectQuery(`${PI_BASE_PATH}/reports`, projectId)}>
            Reports
          </Link>
        </div>
      </div>
    </section>
  );
}
