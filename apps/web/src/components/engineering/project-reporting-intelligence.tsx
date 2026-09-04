"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  SectionHeader,
} from "@rtb/ui";

const REPORT_TYPES = [
  { id: "project_status_report", label: "Project Status Report" },
  { id: "executive_project_brief", label: "Executive Project Brief" },
  { id: "management_attention_report", label: "Management Attention Report" },
] as const;

type ReportTypeId = (typeof REPORT_TYPES)[number]["id"];

type EvidenceRef = {
  sourceDomain: string;
  entityType: string;
  entityId: string;
  sourceTimestamp?: string;
  storesCanonicalCopy: false;
  label?: string;
};

type ReportSection = {
  id: string;
  title: string;
  sourceClassification: string;
  state: string;
  availability: string;
  freshness?: string;
  body: string;
  evidence: EvidenceRef[];
  limitations: string[];
  unknownPreserved: boolean;
};

type AttentionItem = {
  id: string;
  kind: string;
  severity: string;
  reasonCode: string;
  explanation: string;
  sourceClassification: string;
  freshness?: string;
};

type ReportSnapshot = {
  snapshotId: string;
  reportType: ReportTypeId;
  generatedAt: string;
  projectId: string;
  projectCode: string;
  projectName: string;
  overallHealth: string;
  sections: ReportSection[];
  managementAttention: AttentionItem[];
  connectorContext: {
    availability: string;
    degraded: boolean;
    conflictCount: number;
    canonicality: string;
  };
  narrative: {
    kind: "AI_SUMMARY";
    available: boolean;
    text?: string;
    provider?: string;
    model?: string;
    skippedReason?: string;
  };
  limitations: string[];
  evidence: EvidenceRef[];
  persisted: false;
  readOnly: true;
};

type ListedProject = {
  id: string;
  project_code: string;
  project_name: string;
};

function downloadMarkdown(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function ProjectReportingIntelligenceView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("projectId") ?? "";
  const reportType = (searchParams.get("reportType") as ReportTypeId | null) ?? "project_status_report";
  const [projects, setProjects] = useState<ListedProject[]>([]);
  const [snapshot, setSnapshot] = useState<ReportSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/engineering/projects")
      .then(async (response) => {
        const body = (await response.json()) as { data?: ListedProject[]; error?: { message?: string } };
        if (!response.ok) throw new Error(body.error?.message ?? "Unable to list projects");
        if (!cancelled) setProjects(Array.isArray(body.data) ? body.data : []);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Unable to list projects");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const replaceQuery = useCallback(
    (next: { projectId?: string; reportType?: string }) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next.projectId !== undefined) {
        if (next.projectId) params.set("projectId", next.projectId);
        else params.delete("projectId");
      }
      if (next.reportType !== undefined) params.set("reportType", next.reportType);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const generate = useCallback(
    async (projectId: string, type: ReportTypeId) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/engineering/project-intelligence/projects/${encodeURIComponent(projectId)}/reports`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reportType: type, includeAi: true }),
          },
        );
        const body = (await response.json()) as { data?: ReportSnapshot; error?: { message?: string } };
        if (!response.ok) {
          throw new Error(body.error?.message ?? `Report request failed (${response.status})`);
        }
        setSnapshot(body.data ?? null);
      } catch (err) {
        setSnapshot(null);
        setError(err instanceof Error ? err.message : "Project report unavailable");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const exportMarkdown = useCallback(async () => {
    if (!selectedId || !snapshot) return;
    setExporting(true);
    try {
      const response = await fetch(
        `/api/engineering/project-intelligence/projects/${encodeURIComponent(selectedId)}/reports`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reportType: snapshot.reportType, includeAi: false, export: "markdown" }),
        },
      );
      if (!response.ok) {
        const body = (await response.json()) as { error?: { message?: string } };
        throw new Error(body.error?.message ?? "Export failed");
      }
      const text = await response.text();
      downloadMarkdown(`${snapshot.projectCode}-${snapshot.reportType}.md`, text);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export unavailable");
    } finally {
      setExporting(false);
    }
  }, [selectedId, snapshot]);

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedId),
    [projects, selectedId],
  );

  useEffect(() => {
    if (!selectedId) return;
    void generate(selectedId, reportType);
  }, [generate, reportType, selectedId]);

  return (
    <div data-testid="project-intelligence-project-reporting" className="space-y-8">
      <p className="rounded-md border border-cyan-200 bg-cyan-50 px-3 py-2 text-sm text-cyan-950" data-testid="reporting-advisory-banner">
        Advisory only. Reports are point-in-time snapshots. They do not approve work or replace
        Primavera, ERP, or document systems of record.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm text-slate-700">
          Canonical project
          <select
            data-testid="reporting-project-select"
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
            value={selectedId}
            onChange={(event) => {
              setSnapshot(null);
              replaceQuery({ projectId: event.target.value });
            }}
          >
            <option value="">Select a project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.project_code} — {project.project_name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm text-slate-700">
          Report type
          <select
            data-testid="reporting-type-select"
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
            value={reportType}
            onChange={(event) => {
              setSnapshot(null);
              replaceQuery({ reportType: event.target.value });
            }}
          >
            {REPORT_TYPES.map((type) => (
              <option key={type.id} value={type.id}>
                {type.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          data-testid="reporting-generate"
          className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white disabled:opacity-50"
          disabled={!selectedId || loading}
          onClick={() => void generate(selectedId, reportType)}
        >
          {snapshot ? "Refresh snapshot" : "Generate snapshot"}
        </button>
        <button
          type="button"
          data-testid="reporting-export"
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 disabled:opacity-50"
          disabled={!snapshot || exporting}
          onClick={() => void exportMarkdown()}
        >
          Export markdown
        </button>
      </div>

      {!selectedId ? (
        <EmptyState
          title="Select a canonical project"
          description="Project Reporting Intelligence assembles a deterministic snapshot for one selected project."
          data-testid="reporting-project-empty"
        />
      ) : null}

      {loading ? <p className="text-sm text-slate-600">Assembling deterministic report snapshot…</p> : null}
      {error ? <EmptyState title="Report unavailable" description={error} data-testid="reporting-error" /> : null}

      {snapshot ? (
        <>
          <SectionHeader
            title={`${REPORT_TYPES.find((type) => type.id === snapshot.reportType)?.label ?? "Report"}`}
            description={`Generated ${snapshot.generatedAt}${selectedProject ? ` · ${selectedProject.project_code}` : ""} · snapshot ${snapshot.snapshotId}`}
          />
          <p className="text-xs text-slate-500" data-testid="reporting-snapshot-meta">
            Point-in-time snapshot. Persisted: no. Read-only: yes. Overall health {snapshot.overallHealth}.
          </p>
          <Card data-testid="reporting-ai-status">
            <CardHeader>
              <CardTitle>AI-assisted narrative</CardTitle>
            </CardHeader>
            <CardContent>
              {snapshot.narrative.available ? (
                <div data-testid="reporting-ai-available">
                  <p className="text-sm text-slate-700">
                    AI_SUMMARY from {snapshot.narrative.provider ?? "Platform AI Director"} /{" "}
                    {snapshot.narrative.model ?? "registered model"}. Not canonical project state.
                  </p>
                  <p className="mt-2 text-sm text-slate-800">{snapshot.narrative.text}</p>
                </div>
              ) : (
                <p className="text-sm text-slate-700" data-testid="reporting-ai-unavailable">
                  AI narrative unavailable ({snapshot.narrative.skippedReason ?? "not_attached"}). Deterministic
                  report remains available.
                </p>
              )}
            </CardContent>
          </Card>
          <div data-testid="reporting-sections" className="space-y-4">
            {snapshot.sections.map((section) => (
              <Card key={section.id} data-testid={`reporting-section-${section.id}`}>
                <CardHeader>
                  <CardTitle>{section.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-slate-700">
                  <p className="text-xs text-slate-500">
                    {section.state} · {section.availability}
                    {section.freshness ? ` · ${section.freshness}` : ""}
                  </p>
                  <p data-testid={`reporting-section-${section.id}-body`}>{section.body}</p>
                  {section.limitations.length ? (
                    <p className="text-xs text-slate-500">Limitations: {section.limitations.join("; ")}</p>
                  ) : null}
                  {section.evidence.length ? (
                    <ul className="text-xs text-slate-500">
                      {section.evidence.map((ref) => (
                        <li key={`${ref.entityType}:${ref.entityId}`}>
                          {ref.sourceDomain}:{ref.entityType}:{ref.entityId}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
          <Card data-testid="reporting-attention">
            <CardHeader>
              <CardTitle>Management attention</CardTitle>
            </CardHeader>
            <CardContent>
              {snapshot.managementAttention.length === 0 ? (
                <p className="text-sm text-slate-600">No supported attention items.</p>
              ) : (
                <ul className="space-y-2">
                  {snapshot.managementAttention.map((item) => (
                    <li key={item.id} className="rounded-md border border-slate-200 px-3 py-2 text-sm" data-testid={`reporting-attention-${item.kind}`}>
                      <p className="font-medium">
                        {item.kind} · {item.severity.toUpperCase()} · {item.reasonCode}
                      </p>
                      <p className="text-slate-700">{item.explanation}</p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
          <p className="text-xs text-slate-500" data-testid="reporting-limitations">
            Limitations: {snapshot.limitations.join("; ")}
          </p>
        </>
      ) : null}
    </div>
  );
}
