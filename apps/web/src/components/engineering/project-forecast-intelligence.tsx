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
type Readiness =
  | "AVAILABLE"
  | "QUALITATIVE_ONLY"
  | "NOT_PRODUCED"
  | "INSUFFICIENT_DATA"
  | "STALE"
  | "UNAVAILABLE"
  | "UNKNOWN"
  | "FORBIDDEN";

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
  domain: string;
  explanation: string;
  evidenceReference: EvidenceRef;
  asOf?: string;
  publishedAt?: string;
};

export type ForecastView = {
  availability: Availability;
  readiness: Readiness;
  publicationKind: string;
  health: { classification: OverallHealth; headline: string; reasonCodes: string[]; posture?: string };
  domains: Array<{
    domain: string;
    readiness: Readiness;
    publicationKind: string;
    posture?: string;
    headline: string;
  }>;
  trend: { available: boolean; explanation: string; direction?: string };
  attentionItems: AttentionItem[];
  observations: Array<{ id: string; reasonCode: string; explanation: string }>;
  dataQuality: {
    asOf?: string;
    publishedAt?: string;
    freshness: Freshness;
    confidenceClass?: string;
    dataSufficiency?: string;
    forecastProduced: boolean;
    limitations: string[];
  };
  evidenceReferences: EvidenceRef[];
  unsupported: { limitation: string };
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

function stateTestId(prefix: string, freshness: Freshness, availability: Availability, readiness: Readiness): string {
  if (availability === "error" || availability === "unavailable" || availability === "forbidden") {
    return `${prefix}-unavailable`;
  }
  if (readiness === "NOT_PRODUCED") return `${prefix}-not-produced`;
  if (readiness === "INSUFFICIENT_DATA") return `${prefix}-insufficient`;
  if (readiness === "QUALITATIVE_ONLY") return `${prefix}-qualitative`;
  if (availability === "no_data" || freshness === "UNKNOWN" || readiness === "UNKNOWN") return `${prefix}-unknown`;
  if (freshness === "STALE" || readiness === "STALE") return `${prefix}-stale`;
  return `${prefix}-summary`;
}

function AttentionList({ items, testIdPrefix }: { items: AttentionItem[]; testIdPrefix: string }) {
  if (items.length === 0) return <p className="mt-1 text-sm text-slate-600">No attention items.</p>;
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

export function ForecastCommandCentreCard({
  view,
  projectId,
}: {
  view: ForecastView;
  projectId: string;
}) {
  const unavailable =
    view.availability === "error" || view.availability === "unavailable" || view.availability === "forbidden";
  return (
    <Card data-testid="command-centre-section-forecast" data-availability={view.availability}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle>Forecast</CardTitle>
          <Link
            href={`/engineering/apps/project-intelligence/forecasting?projectId=${encodeURIComponent(projectId)}`}
            className="text-xs font-medium text-cyan-700 hover:underline"
          >
            Open Forecasting
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {unavailable ? (
          <EmptyState
            title="Forecast unavailable"
            description={view.health.headline}
            data-testid="command-centre-forecast-unavailable"
          />
        ) : (
          <div
            className="space-y-3"
            data-testid={stateTestId(
              "command-centre-forecast",
              view.dataQuality.freshness,
              view.availability,
              view.readiness,
            )}
          >
            <div className={cn("rounded-md border px-3 py-2", HEALTH_STYLE[view.health.classification])}>
              <p className="text-xs font-semibold" data-testid="command-centre-forecast-health">
                {view.health.classification}
              </p>
              <p className="text-sm">{view.health.headline}</p>
              <p className="text-xs opacity-80">
                Readiness {view.readiness} · freshness {view.dataQuality.freshness}
                {view.dataQuality.confidenceClass ? ` · confidence ${view.dataQuality.confidenceClass}` : ""}
              </p>
            </div>
            <p className="text-sm text-slate-700" data-testid="command-centre-forecast-readiness">
              {view.readiness === "NOT_PRODUCED"
                ? "No published forecast."
                : `Advisory qualitative forecast: ${view.health.posture ?? "unpublished"}.`}
            </p>
            <AttentionList items={view.attentionItems.slice(0, 4)} testIdPrefix="command-centre-forecast" />
            {view.dataQuality.limitations.length > 0 ? (
              <p className="text-xs text-slate-500">Limitations: {view.dataQuality.limitations.slice(0, 4).join(", ")}</p>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ProjectForecastIntelligenceView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("projectId") ?? "";
  const [projects, setProjects] = useState<ListedProject[]>([]);
  const [view, setView] = useState<ForecastView | null>(null);
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
        `/api/engineering/project-intelligence/projects/${encodeURIComponent(projectId)}/forecasting`,
      );
      const body = (await response.json()) as { data?: ForecastView; error?: { message?: string } };
      if (!response.ok) {
        throw new Error(body.error?.message ?? `Forecasting request failed (${response.status})`);
      }
      setView(body.data ?? null);
    } catch (err) {
      setView(null);
      setError(err instanceof Error ? err.message : "Forecast Intelligence unavailable");
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
    <div data-testid="project-intelligence-forecasting" className="space-y-8">
      <label className="block max-w-md text-sm text-slate-700">
        Canonical project
        <select
          data-testid="forecasting-project-select"
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
          title="Select a canonical project"
          description="Forecast Intelligence interprets published Project Controls advisory forecast assessments for one selected project."
          data-testid="forecasting-project-empty"
        />
      ) : null}

      {loading ? <p className="text-sm text-slate-600">Loading Forecast Intelligence…</p> : null}
      {error ? <EmptyState title="Forecasting unavailable" description={error} data-testid="forecasting-error" /> : null}

      {view ? (
        <>
          <SectionHeader
            title="Forecast interpretation"
            description={`Generated ${view.generatedAt}${selectedProject ? ` · ${selectedProject.project_code}` : ""}`}
          />
          <Card data-testid="forecasting-readiness">
            <CardHeader>
              <CardTitle>Forecast readiness</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                data-testid={stateTestId(
                  "forecasting",
                  view.dataQuality.freshness,
                  view.availability,
                  view.readiness,
                )}
              >
                <div className={cn("rounded-md border px-3 py-2", HEALTH_STYLE[view.health.classification])}>
                  <p className="text-xs font-semibold">{view.readiness}</p>
                  <p className="text-sm">{view.health.headline}</p>
                </div>
                <p className="mt-2 text-sm text-slate-700">
                  Publication kind {view.publicationKind}. Forecast produced:{" "}
                  {view.dataQuality.forecastProduced ? "yes" : "no"}.
                </p>
              </div>
            </CardContent>
          </Card>
          <div className="grid gap-4 lg:grid-cols-2">
            {view.domains.map((domain) => (
              <Card key={domain.domain} data-testid={`forecasting-${domain.domain}-summary`}>
                <CardHeader>
                  <CardTitle>{domain.domain === "progress" ? "Progress / completion" : domain.domain} forecast</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-700">{domain.headline}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {domain.readiness} · {domain.publicationKind}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card data-testid="forecasting-trend">
            <CardHeader>
              <CardTitle>Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-700">{view.trend.explanation}</p>
            </CardContent>
          </Card>
          <div data-testid="forecasting-attention">
            <SectionHeader title="Attention" />
            <AttentionList items={view.attentionItems} testIdPrefix="forecasting" />
          </div>
          <Card data-testid="forecasting-quality">
            <CardHeader>
              <CardTitle>Confidence / data quality</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-700">
              <p>Freshness {view.dataQuality.freshness}</p>
              <p>Confidence class {view.dataQuality.confidenceClass ?? "unpublished"}</p>
              <p>Data sufficiency {view.dataQuality.dataSufficiency ?? "unpublished"}</p>
              <p data-testid="forecasting-unsupported">{view.unsupported.limitation}</p>
            </CardContent>
          </Card>
          <Card data-testid="forecasting-observations">
            <CardHeader>
              <CardTitle>Cross-domain observations</CardTitle>
            </CardHeader>
            <CardContent>
              {view.observations.length === 0 ? (
                <p className="text-sm text-slate-600">No paired published forecast and current-state observations.</p>
              ) : (
                <ul className="space-y-2">
                  {view.observations.map((row) => (
                    <li key={row.id} className="rounded-md border border-slate-200 px-3 py-2 text-sm">
                      <p className="font-medium">{row.reasonCode}</p>
                      <p className="text-slate-700">{row.explanation}</p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
          <Card data-testid="forecasting-evidence">
            <CardHeader>
              <CardTitle>Evidence</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1 text-xs text-slate-600">
                {view.evidenceReferences.map((ref) => (
                  <li key={`${ref.entityType}:${ref.entityId}`} data-testid={`forecasting-evidence-${ref.entityId}`}>
                    {ref.sourceDomain}:{ref.entityType}:{ref.entityId}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <p className="text-xs text-slate-500" data-testid="forecasting-limitations">
            Limitations: {view.dataQuality.limitations.join(", ")}
          </p>
        </>
      ) : null}
    </div>
  );
}
