"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  SectionHeader,
  cn,
} from "@rtb/ui";

type OverallHealth = "GREEN" | "AMBER" | "RED" | "UNKNOWN";
type Availability = "ok" | "no_data" | "unavailable" | "forbidden" | "stale" | "error";
type Freshness = "CURRENT" | "STALE" | "UNKNOWN" | "UNAVAILABLE";

type EvidenceRef = {
  sourceDomain: string;
  entityType: string;
  entityId: string;
  sourceTimestamp?: string;
  storesCanonicalCopy: false;
};

type AttentionItem = {
  id: string;
  severity: "red" | "amber" | "info";
  reasonCode: string;
  explanation: string;
  evidenceReference: EvidenceRef;
  asOf?: string;
};

type DataQuality = {
  asOf?: string;
  publishedAt?: string;
  source: "project_controls";
  freshness: Freshness;
  completeness?: string;
  missing: string[];
  limitations: string[];
};

export type CostProgressView = {
  cost: {
    availability: Availability;
    health: { classification: OverallHealth; posture?: string; headline: string; reasonCodes: string[] };
    attentionItems: AttentionItem[];
    dataQuality: DataQuality;
    money: {
      currencyCode?: string;
      currencies: string[];
      compatible: boolean;
      amountsPublished: false;
      mixedCurrenciesAggregated: false;
      limitation?: string;
    };
    metrics: { summary: string; varianceAttribution?: string; currencyCode?: string };
    evidenceReferences: EvidenceRef[];
  };
  progress: {
    availability: Availability;
    health: {
      classification: OverallHealth;
      band?: string;
      trendDirection?: string;
      headline: string;
      reasonCodes: string[];
    };
    attentionItems: AttentionItem[];
    dataQuality: DataQuality;
    metrics: {
      summary: string;
      indicatedCompletion?: number;
      plannedProgressPublished: false;
    };
    evidenceReferences: EvidenceRef[];
  };
  consistency:
    | { available: false; explanation: string }
    | {
        available: true;
        consistent: boolean;
        reasonCode: string;
        explanation: string;
      };
  earnedValue: { published: false; limitation: string };
  generatedAt: string;
};

type ListedProject = {
  id: string;
  project_code: string;
  project_name: string;
};

const HEALTH_STYLE: Record<OverallHealth, string> = {
  GREEN: "border-emerald-300 bg-emerald-50 text-emerald-950",
  AMBER: "border-amber-300 bg-amber-50 text-amber-950",
  RED: "border-red-300 bg-red-50 text-red-950",
  UNKNOWN: "border-dashed border-slate-400 bg-slate-100 text-slate-800",
};

function stateTestId(prefix: string, freshness: Freshness, availability: Availability): string {
  if (availability === "error" || availability === "unavailable" || availability === "forbidden") {
    return `${prefix}-unavailable`;
  }
  if (availability === "no_data" || freshness === "UNKNOWN") return `${prefix}-unknown`;
  if (freshness === "STALE") return `${prefix}-stale`;
  return `${prefix}-summary`;
}

function AttentionList({
  items,
  testIdPrefix,
}: {
  items: AttentionItem[];
  testIdPrefix: string;
}) {
  if (items.length === 0) {
    return <p className="mt-1 text-sm text-slate-600">No attention items.</p>;
  }
  return (
    <ul className="mt-2 space-y-2" data-testid={`${testIdPrefix}-attention`}>
      {items.map((item) => (
        <li
          key={item.id}
          data-testid={`${testIdPrefix}-attention-${item.reasonCode}`}
          className="rounded-md border border-slate-200 px-3 py-2 text-sm"
        >
          <p className="font-medium">
            {item.severity.toUpperCase()} · {item.reasonCode}
          </p>
          <p className="text-slate-700">{item.explanation}</p>
        </li>
      ))}
    </ul>
  );
}

export function CostCommandCentreCard({
  view,
  projectId,
}: {
  view: CostProgressView["cost"];
  projectId: string;
}) {
  const unavailable =
    view.availability === "error" ||
    view.availability === "unavailable" ||
    view.availability === "forbidden";
  return (
    <Card data-testid="command-centre-section-cost" data-availability={view.availability}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle>Cost</CardTitle>
          <Link
            href={`/engineering/apps/project-intelligence/cost-progress?projectId=${encodeURIComponent(projectId)}`}
            className="text-xs font-medium text-cyan-700 hover:underline"
          >
            Open Cost & Progress
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {unavailable ? (
          <EmptyState
            title="Cost unavailable"
            description={view.health.headline}
            data-testid="command-centre-cost-unavailable"
          />
        ) : (
          <div className="space-y-3" data-testid={stateTestId("command-centre-cost", view.dataQuality.freshness, view.availability)}>
            <div className={cn("rounded-md border px-3 py-2", HEALTH_STYLE[view.health.classification])}>
              <p className="text-xs font-semibold" data-testid="command-centre-cost-health">
                {view.health.classification}
              </p>
              <p className="text-sm">{view.health.headline}</p>
              <p className="text-xs opacity-80">Freshness: {view.dataQuality.freshness}</p>
            </div>
            <p className="text-sm text-slate-700">{view.metrics.summary}</p>
            <p className="text-xs text-slate-600" data-testid="command-centre-cost-currency">
              Currency: {view.money.currencyCode ?? "not published"}
              {view.money.compatible ? "" : " · incompatible currencies not aggregated"}
            </p>
            <AttentionList items={view.attentionItems.slice(0, 4)} testIdPrefix="command-centre-cost" />
            {view.dataQuality.limitations.length > 0 ? (
              <p className="text-xs text-slate-500">Limitations: {view.dataQuality.limitations.join(", ")}</p>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ProgressCommandCentreCard({
  view,
  projectId,
}: {
  view: CostProgressView["progress"];
  projectId: string;
}) {
  const unavailable =
    view.availability === "error" ||
    view.availability === "unavailable" ||
    view.availability === "forbidden";
  return (
    <Card data-testid="command-centre-section-progress" data-availability={view.availability}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle>Progress</CardTitle>
          <Link
            href={`/engineering/apps/project-intelligence/cost-progress?projectId=${encodeURIComponent(projectId)}`}
            className="text-xs font-medium text-cyan-700 hover:underline"
          >
            Open Cost & Progress
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {unavailable ? (
          <EmptyState
            title="Progress unavailable"
            description={view.health.headline}
            data-testid="command-centre-progress-unavailable"
          />
        ) : (
          <div
            className="space-y-3"
            data-testid={stateTestId("command-centre-progress", view.dataQuality.freshness, view.availability)}
          >
            <div className={cn("rounded-md border px-3 py-2", HEALTH_STYLE[view.health.classification])}>
              <p className="text-xs font-semibold" data-testid="command-centre-progress-health">
                {view.health.classification}
              </p>
              <p className="text-sm">{view.health.headline}</p>
              <p className="text-xs opacity-80">Freshness: {view.dataQuality.freshness}</p>
            </div>
            <p className="text-sm text-slate-700">{view.metrics.summary}</p>
            <AttentionList items={view.attentionItems.slice(0, 4)} testIdPrefix="command-centre-progress" />
            {view.dataQuality.limitations.length > 0 ? (
              <p className="text-xs text-slate-500">Limitations: {view.dataQuality.limitations.join(", ")}</p>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ProjectCostProgressIntelligenceView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("projectId") ?? "";
  const [projects, setProjects] = useState<ListedProject[]>([]);
  const [view, setView] = useState<CostProgressView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

  const loadView = useCallback(async (projectId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/engineering/project-intelligence/projects/${encodeURIComponent(projectId)}/cost-progress`,
      );
      const body = (await response.json()) as { data?: CostProgressView; error?: { message?: string } };
      if (!response.ok) {
        throw new Error(body.error?.message ?? `Cost & Progress request failed (${response.status})`);
      }
      setView(body.data ?? null);
    } catch (err) {
      setView(null);
      setError(err instanceof Error ? err.message : "Cost & Progress Intelligence unavailable");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setView(null);
      return;
    }
    void loadView(selectedId);
  }, [selectedId, loadView]);

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedId),
    [projects, selectedId],
  );

  return (
    <div data-testid="project-intelligence-cost-progress" className="space-y-8">
      <label className="block max-w-md text-sm text-slate-700">
        Canonical project
        <select
          data-testid="cost-progress-project-select"
          className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
          value={selectedId}
          onChange={(event) => {
            const next = event.target.value;
            const params = new URLSearchParams(searchParams.toString());
            if (next) params.set("projectId", next);
            else params.delete("projectId");
            const query = params.toString();
            router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
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

      {!selectedId ? (
        <EmptyState
          title="Select a project"
          description="Cost Intelligence requires a selected project and published cost evidence. It does not replace ERP or cost-control systems."
          data-testid="cost-progress-project-empty"
        />
      ) : null}

      {loading ? <p className="text-sm text-slate-600">Loading Cost & Progress Intelligence…</p> : null}
      {error ? (
        <EmptyState title="Cost & Progress unavailable" description={error} data-testid="cost-progress-error" />
      ) : null}

      {view ? (
        <>
          <SectionHeader
            title="Published cost and progress interpretation"
            description={`Generated ${view.generatedAt}${selectedProject ? ` · ${selectedProject.project_code}` : ""}`}
          />
          <div className="grid gap-4 lg:grid-cols-2">
            <Card data-testid="cost-progress-cost-summary">
              <CardHeader>
                <CardTitle>Cost summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="space-y-3"
                  data-testid={stateTestId("cost-progress-cost", view.cost.dataQuality.freshness, view.cost.availability)}
                >
                  <div className={cn("rounded-md border px-3 py-2", HEALTH_STYLE[view.cost.health.classification])}>
                    <p className="text-xs font-semibold">{view.cost.health.classification}</p>
                    <p className="text-sm">{view.cost.health.headline}</p>
                  </div>
                  <p className="text-sm text-slate-700">{view.cost.metrics.summary}</p>
                  <p className="text-xs text-slate-600" data-testid="cost-progress-currency">
                    Currency: {view.cost.money.currencyCode ?? "not published"}
                    {view.cost.money.compatible ? "" : " · incompatible currencies not aggregated"}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card data-testid="cost-progress-progress-summary">
              <CardHeader>
                <CardTitle>Progress summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="space-y-3"
                  data-testid={stateTestId(
                    "cost-progress-progress",
                    view.progress.dataQuality.freshness,
                    view.progress.availability,
                  )}
                >
                  <div className={cn("rounded-md border px-3 py-2", HEALTH_STYLE[view.progress.health.classification])}>
                    <p className="text-xs font-semibold">{view.progress.health.classification}</p>
                    <p className="text-sm">{view.progress.health.headline}</p>
                  </div>
                  <p className="text-sm text-slate-700">{view.progress.metrics.summary}</p>
                </div>
              </CardContent>
            </Card>
          </div>
          <div data-testid="cost-progress-cost-attention">
            <SectionHeader title="Cost attention" />
            <AttentionList items={view.cost.attentionItems} testIdPrefix="cost-progress-cost" />
          </div>
          <div data-testid="cost-progress-progress-attention">
            <SectionHeader title="Progress attention" />
            <AttentionList items={view.progress.attentionItems} testIdPrefix="cost-progress-progress" />
          </div>
          <Card data-testid="cost-progress-consistency">
            <CardHeader>
              <CardTitle>Cost vs Progress signals</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-700">{view.consistency.explanation}</p>
            </CardContent>
          </Card>
          <Card data-testid="cost-progress-metrics">
            <CardHeader>
              <CardTitle>Published metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-700">
              <p>{view.cost.metrics.summary}</p>
              <p>{view.progress.metrics.summary}</p>
              <p data-testid="cost-progress-eva">
                Earned-value metrics: {view.earnedValue.published ? "published" : view.earnedValue.limitation}
              </p>
            </CardContent>
          </Card>
          <Card data-testid="cost-progress-quality">
            <CardHeader>
              <CardTitle>Data quality</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-700">
              <p>
                Cost freshness {view.cost.dataQuality.freshness}
                {view.cost.dataQuality.asOf ? ` · as of ${view.cost.dataQuality.asOf}` : ""}
              </p>
              <p>
                Progress freshness {view.progress.dataQuality.freshness}
                {view.progress.dataQuality.asOf ? ` · as of ${view.progress.dataQuality.asOf}` : ""}
              </p>
            </CardContent>
          </Card>
          <Card data-testid="cost-progress-evidence">
            <CardHeader>
              <CardTitle>Evidence</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1 text-xs text-slate-600">
                {[...view.cost.evidenceReferences, ...view.progress.evidenceReferences].map((ref) => (
                  <li key={`${ref.entityType}:${ref.entityId}`}>
                    {ref.sourceDomain}:{ref.entityType}:{ref.entityId}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <p className="text-xs text-slate-500" data-testid="cost-progress-limitations">
            Limitations: {[...view.cost.dataQuality.limitations, ...view.progress.dataQuality.limitations].join(", ")}
          </p>
        </>
      ) : null}
    </div>
  );
}
