import { evidenceFromCanonical, evidenceFromControls, type BoundCollection, type CanonicalRegisterItemRef, type KnowledgeFindingRef, type ProjectControlsSnapshot, type ProjectCoreSnapshot, type ProjectKnowledgeSnapshot } from "../project-health/source-contracts";
import type { ProjectHealthDimensionResult, ProjectHealthEvidenceReference } from "../project-health/types";
import type {
  CommandCentreAttentionItem,
  CommandCentreAttentionSeverity,
  CommandCentreAvailability,
  CommandCentreSectionProjection,
} from "./types";

const DIMENSION_EXPLANATIONS: Record<string, string> = {
  schedule_milestone_missed: "Published schedule posture is missed.",
  schedule_milestone_at_risk: "Published schedule posture is at risk.",
  cost_posture_over: "Published cost posture is over tolerance.",
  cost_posture_attention_required: "Published cost posture requires attention.",
  progress_trend_declining: "Published progress trend is declining.",
  open_critical_or_high_score_risk: "An open critical or high-score risk is present.",
  open_elevated_risk: "An open elevated risk is present.",
  open_critical_issue: "An open critical issue is present.",
  open_high_issue: "An open high-priority issue is present.",
  open_critical_finding: "An open critical finding is present.",
  open_quality_finding: "An open quality finding is present.",
  change_status_pending: "Published change context is pending.",
  overdue_open_action: "An open action is overdue.",
  open_action: "An open action remains unresolved.",
  open_decision: "An open decision remains unresolved.",
};

function firstEvidence(
  dimension: ProjectHealthDimensionResult,
  fallbackEntityType: string,
): ProjectHealthEvidenceReference {
  return (
    dimension.evidenceReferences[0] ?? {
      sourceDomain: dimension.source === "none" ? "engineering_core" : dimension.source,
      entityType: fallbackEntityType,
      entityId: dimension.dimension,
      storesCanonicalCopy: false,
    }
  );
}

function explanationFor(reasonCode: string, fallback: string): string {
  return DIMENSION_EXPLANATIONS[reasonCode] ?? fallback;
}

export function buildAttentionItems(input: {
  dimensions: readonly ProjectHealthDimensionResult[];
  core: ProjectCoreSnapshot;
  controls: ProjectControlsSnapshot;
  generatedAt: string;
}): readonly CommandCentreAttentionItem[] {
  const items: CommandCentreAttentionItem[] = [];
  const seen = new Set<string>();

  const push = (
    id: string,
    severity: CommandCentreAttentionSeverity,
    reasonCode: string,
    explanation: string,
    sourceReference: ProjectHealthEvidenceReference,
  ) => {
    if (seen.has(id)) return;
    seen.add(id);
    items.push({ id, severity, reasonCode, explanation, sourceReference });
  };

  for (const dimension of input.dimensions) {
    if (dimension.state === "red" || dimension.state === "amber") {
      const reasonCode = dimension.reasonCodes[0] ?? `${dimension.dimension}_${dimension.state}`;
      push(
        `dimension:${dimension.dimension}:${dimension.state}:${reasonCode}`,
        dimension.state,
        reasonCode,
        explanationFor(
          reasonCode,
          dimension.state === "red"
            ? `${dimension.dimension} is RED from published or register evidence.`
            : `${dimension.dimension} is AMBER from published or register evidence.`,
        ),
        firstEvidence(dimension, `${dimension.dimension}_health`),
      );
    } else if (dimension.state === "unknown") {
      const usefulGap =
        dimension.dimension === "schedule" ||
        dimension.dimension === "cost" ||
        dimension.dimension === "progress" ||
        dimension.dimension === "change";
      if (usefulGap) {
        const reasonCode = dimension.reasonCodes[0] ?? `${dimension.dimension}_unknown`;
        push(
          `gap:${dimension.dimension}:${reasonCode}`,
          "info",
          reasonCode,
          `${dimension.dimension} is UNKNOWN because published evidence is missing or unbound.`,
          firstEvidence(dimension, `${dimension.dimension}_gap`),
        );
      }
    }
  }

  if (input.core.actions.bound) {
    const evaluatedMs = Date.parse(input.generatedAt);
    for (const action of input.core.actions.items) {
      if (!action.open || !action.dueAt) continue;
      if (!Number.isFinite(evaluatedMs) || Date.parse(action.dueAt) >= evaluatedMs) continue;
      push(
        `action:overdue:${action.id}`,
        "red",
        "overdue_open_action",
        "An open action is past its due date.",
        evidenceFromCanonical("engineering_core", action),
      );
    }
  }

  if (input.core.risks.bound) {
    for (const risk of input.core.risks.items) {
      if (!risk.open) continue;
      if (risk.priority === "critical" || (typeof risk.score === "number" && risk.score >= 16)) {
        push(
          `risk:critical:${risk.id}`,
          "red",
          "open_critical_or_high_score_risk",
          "An open critical or high-score risk is present.",
          evidenceFromCanonical("engineering_core", risk),
        );
      }
    }
  }

  if (input.core.decisions.bound) {
    for (const decision of input.core.decisions.items) {
      if (decision.open && (decision.status === "blocked" || decision.priority === "blocked")) {
        push(
          `decision:blocked:${decision.id}`,
          "amber",
          "blocked_decision",
          "A decision is recorded as blocked.",
          evidenceFromCanonical("engineering_core", decision),
        );
      }
    }
  }

  if (input.controls.schedule?.published && input.controls.schedule.posture === "missed") {
    push(
      `schedule:missed:${input.controls.schedule.assessmentId}`,
      "red",
      "schedule_milestone_missed",
      "Published schedule posture is missed.",
      evidenceFromControls(input.controls.schedule, "schedule_assessment"),
    );
  }

  if (input.controls.cost?.published && input.controls.cost.posture === "over") {
    push(
      `cost:over:${input.controls.cost.assessmentId}`,
      "red",
      "cost_posture_over",
      "Published cost posture is over tolerance.",
      evidenceFromControls(input.controls.cost, "cost_state"),
    );
  }

  if (input.controls.progress?.published && input.controls.progress.posture === "declining") {
    push(
      `progress:variance:${input.controls.progress.assessmentId}`,
      "amber",
      "progress_trend_declining",
      "Published progress trend is declining.",
      evidenceFromControls(input.controls.progress, "progress_assessment"),
    );
  }

  if (input.controls.change?.published && input.controls.change.posture === "pending") {
    push(
      `change:pending:${input.controls.change.assessmentId}`,
      "amber",
      "high_impact_change_pending",
      "Published change context is pending.",
      evidenceFromControls(input.controls.change, "change_state"),
    );
  }

  return items;
}

function countOpen(bound: BoundCollection<CanonicalRegisterItemRef | KnowledgeFindingRef>): number {
  if (!bound.bound) return 0;
  return bound.items.filter((item) => item.open).length;
}

export function projectRegisterSection(input: {
  title: string;
  availability: CommandCentreAvailability;
  bound: BoundCollection<CanonicalRegisterItemRef>;
  extraCounts?: Record<string, number>;
  limitations?: readonly string[];
}): CommandCentreSectionProjection {
  if (input.availability === "error" || input.availability === "unavailable" || input.availability === "forbidden") {
    return {
      availability: input.availability,
      title: input.title,
      summary: `${input.title} is ${input.availability}.`,
      counts: {},
      evidenceReferences: [],
      limitations: input.limitations ?? [`${input.title.toLowerCase()}_${input.availability}`],
    };
  }
  if (!input.bound.bound) {
    return {
      availability: "no_data",
      title: input.title,
      summary: `${input.title} register is not bound.`,
      counts: {},
      evidenceReferences: [],
      limitations: input.limitations ?? [`${input.title.toLowerCase()}_unbound`],
    };
  }
  const open = countOpen(input.bound);
  return {
    availability: input.availability,
    title: input.title,
    summary: `${open} open ${input.title.toLowerCase()} item${open === 1 ? "" : "s"}.`,
    counts: { open, total: input.bound.items.length, ...input.extraCounts },
    evidenceReferences: input.bound.items.slice(0, 8).map((item) => evidenceFromCanonical("engineering_core", item)),
    limitations: input.limitations ?? [],
    freshness: input.bound.sourceTimestamp,
  };
}

export function projectControlsSection(input: {
  title: string;
  entityType: string;
  availability: CommandCentreAvailability;
  output: ProjectControlsSnapshot["schedule"];
  noDataSummary: string;
}): CommandCentreSectionProjection {
  if (input.availability === "error" || input.availability === "unavailable" || input.availability === "forbidden") {
    return {
      availability: input.availability,
      title: input.title,
      summary: `${input.title} is ${input.availability}.`,
      counts: {},
      evidenceReferences: [],
      limitations: [`${input.title.toLowerCase()}_${input.availability}`],
    };
  }
  if (!input.output) {
    return {
      availability: "no_data",
      title: input.title,
      summary: input.noDataSummary,
      counts: {},
      evidenceReferences: [],
      limitations: [`absent_project_controls_${input.entityType}`],
    };
  }
  const evidence = [evidenceFromControls(input.output, input.entityType)];
  const limitations: string[] = [];
  if (!input.output.published) limitations.push("unpublished_controls_state");
  if (input.output.abstained) limitations.push("controls_abstained");
  if (input.availability === "stale") limitations.push("stale_published_output");
  return {
    availability: input.availability,
    title: input.title,
    summary: input.output.published
      ? `${input.title} posture: ${input.output.posture ?? "unpublished"}.`
      : `${input.title} is unpublished.`,
    posture: input.output.posture,
    counts: { published: input.output.published ? 1 : 0 },
    evidenceReferences: evidence,
    limitations,
    freshness: input.output.publishedAt ?? input.output.assessedAt,
  };
}

export function projectKnowledgeSection(input: {
  availability: CommandCentreAvailability;
  knowledge: ProjectKnowledgeSnapshot;
}): CommandCentreSectionProjection {
  if (input.availability === "error" || input.availability === "unavailable" || input.availability === "forbidden") {
    return {
      availability: input.availability,
      title: "Knowledge",
      summary: `Knowledge is ${input.availability}.`,
      counts: {},
      evidenceReferences: [],
      limitations: [`knowledge_${input.availability}`],
    };
  }
  if (!input.knowledge.findings.bound) {
    return {
      availability: "no_data",
      title: "Knowledge",
      summary: "No findings evidence.",
      counts: {},
      evidenceReferences: [],
      limitations: ["pi_findings_unbound"],
    };
  }
  const open = countOpen(input.knowledge.findings);
  const items = input.knowledge.findings.items;
  return {
    availability: input.availability,
    title: "Knowledge",
    summary: items.length === 0 ? "No findings evidence." : `${open} open finding${open === 1 ? "" : "s"}.`,
    counts: { open, total: items.length },
    evidenceReferences: items.slice(0, 8).map((item) => evidenceFromCanonical("project_intelligence", item)),
    limitations: input.knowledge.inspectionFindings.bound ? [] : ["inspection_findings_unbound"],
    freshness: input.knowledge.findings.sourceTimestamp,
  };
}

export function projectQualitySection(input: {
  availability: CommandCentreAvailability;
  issues: BoundCollection<CanonicalRegisterItemRef>;
  knowledge: ProjectKnowledgeSnapshot;
}): CommandCentreSectionProjection {
  if (input.availability === "error" || input.availability === "unavailable") {
    return {
      availability: input.availability,
      title: "Quality",
      summary: `Quality is ${input.availability}.`,
      counts: {},
      evidenceReferences: [],
      limitations: [`quality_${input.availability}`],
    };
  }
  const issueOpen = countOpen(input.issues);
  const findingOpen = countOpen(input.knowledge.findings);
  const inspectionOpen = countOpen(input.knowledge.inspectionFindings);
  if (!input.issues.bound && !input.knowledge.findings.bound && !input.knowledge.inspectionFindings.bound) {
    return {
      availability: "no_data",
      title: "Quality",
      summary: "Quality sources are not bound.",
      counts: {},
      evidenceReferences: [],
      limitations: ["issues_and_findings_not_bound"],
    };
  }
  const evidence: ProjectHealthEvidenceReference[] = [];
  if (input.issues.bound) {
    evidence.push(...input.issues.items.slice(0, 4).map((item) => evidenceFromCanonical("engineering_core", item)));
  }
  if (input.knowledge.findings.bound) {
    evidence.push(
      ...input.knowledge.findings.items.slice(0, 4).map((item) => evidenceFromCanonical("project_intelligence", item)),
    );
  }
  return {
    availability: input.availability,
    title: "Quality",
    summary: `${issueOpen} open issues, ${findingOpen} open findings.`,
    counts: { openIssues: issueOpen, openFindings: findingOpen, openInspectionFindings: inspectionOpen },
    evidenceReferences: evidence,
    limitations: [
      ...(input.issues.bound ? [] : ["canonical_issues_unbound"]),
      ...(input.knowledge.findings.bound ? [] : ["pi_findings_unbound"]),
      ...(input.knowledge.inspectionFindings.bound ? [] : ["inspection_findings_unbound"]),
    ],
    freshness: input.issues.bound
      ? input.issues.sourceTimestamp
      : input.knowledge.findings.bound
        ? input.knowledge.findings.sourceTimestamp
        : undefined,
  };
}
