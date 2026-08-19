import type {
  BusinessAction,
  BusinessDecision,
  BusinessKpi,
  BusinessSignal,
  DeterministicDailyBrief,
} from "@rtb/types";
import type { BusinessHealthSnapshot } from "@rtb/types";

const SEVERITY_RANK: Record<string, number> = {
  critical: 0,
  warning: 1,
  watch: 2,
  info: 3,
};

const IMPACT_RANK: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const DOMAIN_TITLES: Record<string, string> = {
  finance: "Finance",
  growth: "Growth",
  revenue: "Revenue",
  customer: "Customer",
};

function buildDomainSections(kpis: BusinessKpi[]): DeterministicDailyBrief["domainSections"] {
  const byDomain = new Map<string, BusinessKpi[]>();
  for (const kpi of kpis) {
    const domain = typeof kpi.provenance?.domain === "string" ? kpi.provenance.domain : "";
    if (!domain) continue;
    const list = byDomain.get(domain) ?? [];
    list.push(kpi);
    byDomain.set(domain, list);
  }
  return [...byDomain.entries()].map(([id, rows]) => {
    const unknown = rows.filter((k) => k.status === "unknown");
    return {
      id,
      title: DOMAIN_TITLES[id] ?? id,
      containsDemoData: rows.some((k) => k.isDemo),
      lines: [
        unknown.length
          ? `${unknown.length} ${DOMAIN_TITLES[id] ?? id} KPI(s) unknown.`
          : `${DOMAIN_TITLES[id] ?? id} KPIs are populated from ingested records.`,
        ...rows
          .filter((k) => k.status === "warning" || k.status === "critical")
          .slice(0, 6)
          .map((k) => `${k.name}: ${k.status}`),
      ],
    };
  });
}

export function rankSignals(signals: BusinessSignal[]): BusinessSignal[] {
  return [...signals].sort((a, b) => {
    const sev = (SEVERITY_RANK[a.severity] ?? 9) - (SEVERITY_RANK[b.severity] ?? 9);
    if (sev !== 0) return sev;
    const impact =
      (IMPACT_RANK[a.businessImpact ?? "low"] ?? 9) - (IMPACT_RANK[b.businessImpact ?? "low"] ?? 9);
    if (impact !== 0) return impact;
    return new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime();
  });
}

export function isOverdueOrBlocked(action: BusinessAction, today = new Date()): boolean {
  if (action.status === "blocked") return true;
  if (action.status === "completed" || action.status === "cancelled") return false;
  if (!action.dueDate) return false;
  const due = new Date(`${action.dueDate}T23:59:59.000Z`);
  return due.getTime() < today.getTime();
}

export function isDueSoon(action: BusinessAction, today = new Date(), days = 7): boolean {
  if (action.status === "completed" || action.status === "cancelled" || action.status === "blocked") {
    return false;
  }
  if (!action.dueDate) return false;
  const due = new Date(`${action.dueDate}T23:59:59.000Z`);
  const horizon = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
  return due.getTime() >= today.getTime() && due.getTime() <= horizon.getTime();
}

export function buildDeterministicBrief(input: {
  health: BusinessHealthSnapshot;
  kpis: BusinessKpi[];
  signals: BusinessSignal[];
  decisions: BusinessDecision[];
  actions: BusinessAction[];
  generatedAt?: string;
}): DeterministicDailyBrief {
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  const criticalSignals = rankSignals(input.signals.filter((s) => s.status === "open")).filter(
    (s) => s.severity === "critical" || s.severity === "warning",
  );
    const majorKpiChanges = input.kpis.filter(
      (k) => k.status === "warning" || k.status === "critical" || k.status === "unknown",
    );
    const pendingDecisions = input.decisions.filter((d) => d.status === "pending");
  const overdueOrBlockedActions = input.actions.filter((a) => isOverdueOrBlocked(a));
  const containsDemoData =
    input.health.containsDemoData ||
    input.kpis.some((k) => k.isDemo) ||
    input.signals.some((s) => s.isDemo);

  return {
    generatedAt,
    health: {
      overallStatus: input.health.overallStatus,
      score: input.health.score,
      contributingKpiCount: input.health.contributingKpiCount,
      unknownCount: input.health.unknownCount,
    },
    criticalSignals: criticalSignals.slice(0, 8).map((s) => ({
      id: s.id,
      title: s.title,
      severity: s.severity,
    })),
    majorKpiChanges: majorKpiChanges.slice(0, 8).map((k) => ({
      id: k.id,
      name: k.name,
      status: k.status,
    })),
    pendingDecisions: pendingDecisions.slice(0, 8).map((d) => ({
      id: d.id,
      statement: d.statement,
    })),
    overdueOrBlockedActions: overdueOrBlockedActions.slice(0, 8).map((a) => ({
      id: a.id,
      title: a.title,
      status: a.status,
    })),
    containsDemoData,
    evidenceRefs: [
      ...criticalSignals.slice(0, 8).map((s) => ({
        sourceType: "signal",
        sourceRef: s.id,
        title: s.title,
        excerpt: s.summary,
      })),
      ...majorKpiChanges.slice(0, 8).map((k) => ({
        sourceType: "kpi",
        sourceRef: k.id,
        title: k.name,
        excerpt: k.status,
      })),
    ],
    domainSections: buildDomainSections(input.kpis),
  };
}

export function structuredBriefEvidence(brief: DeterministicDailyBrief) {
  return {
    kind: "business_os.daily_brief.evidence",
    generatedAt: brief.generatedAt,
    health: brief.health,
    criticalSignals: brief.criticalSignals,
    majorKpiChanges: brief.majorKpiChanges,
    pendingDecisions: brief.pendingDecisions,
    overdueOrBlockedActions: brief.overdueOrBlockedActions,
    containsDemoData: brief.containsDemoData,
    domainSections: brief.domainSections,
    instructions: [
      "Use only the structured evidence provided.",
      "Do not invent financial figures, causes, or missing records.",
      "Do not claim statutory, financial, or professional certainty.",
      "Do not expose chain-of-thought.",
      "If a field is unknown, say it is unknown.",
      "If containsDemoData is true, say the brief includes demo fixtures.",
    ],
  };
}
