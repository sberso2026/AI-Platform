/**
 * Governed deterministic reporting over canonical inspection_* rows.
 * Persists to existing inspection_reporting_outputs. No AI narrative. No PDF stack.
 */
import { INSPECTION_REPORTING_DATA_MODELS, type InspectionReportingOutputKind } from "./reporting-preparation";
import { computeDeterministicIntelligence } from "./deterministic-intelligence";

export const II_PDF_EXPORT_AVAILABLE = false as const;

export type ReportAuthorityState = "draft" | "reviewed" | "approved" | "published";

const AUTHORITY: Record<ReportAuthorityState, ReportAuthorityState[]> = {
  draft: ["reviewed"],
  reviewed: ["approved"],
  approved: ["published"],
  published: [],
};

export const II_GOVERNED_REPORT_TYPES = [
  {
    reportKey: "inspection.session_summary",
    kind: "session_summary" as InspectionReportingOutputKind,
    title: "Inspection Summary",
    composition: "summary" as const,
  },
  {
    reportKey: "inspection.close_out_certificate",
    kind: "close_out_certificate" as InspectionReportingOutputKind,
    title: "Inspection Report",
    composition: "full" as const,
  },
  {
    reportKey: "inspection.defect_register",
    kind: "defect_register" as InspectionReportingOutputKind,
    title: "Defect / Corrective Action Summary",
    composition: "defects" as const,
  },
  {
    reportKey: "inspection.condition_rating_snapshot",
    kind: "condition_rating_snapshot" as InspectionReportingOutputKind,
    title: "Condition Assessment Summary",
    composition: "condition" as const,
  },
] as const;

export type GovernedReportType = (typeof II_GOVERNED_REPORT_TYPES)[number];

export function nextReportAuthorityStates(from: ReportAuthorityState): readonly ReportAuthorityState[] {
  return AUTHORITY[from] ?? [];
}

export function assertReportAuthorityTransition(from: ReportAuthorityState, to: ReportAuthorityState): void {
  if (!(AUTHORITY[from] ?? []).includes(to)) {
    throw new Error(`invalid_report_authority_transition:${from}->${to}`);
  }
}

export type ReportWorkspace = {
  session: Record<string, unknown>;
  plan?: Record<string, unknown> | null;
  template?: Record<string, unknown> | null;
  observations: Array<Record<string, unknown>>;
  measurements: Array<Record<string, unknown>>;
  evidence: Array<Record<string, unknown>>;
  defects: Array<Record<string, unknown>>;
  recommendations: Array<Record<string, unknown>>;
  correctiveActions: Array<Record<string, unknown>>;
  assessments: Array<Record<string, unknown>>;
  conditionRatings: Array<Record<string, unknown>>;
  verifications: Array<Record<string, unknown>>;
};

function ids(rows: Array<Record<string, unknown>>, key = "id"): string[] {
  return rows.map((row) => String(row[key] ?? row.id ?? "")).filter(Boolean);
}

function targetProvenance(session: Record<string, unknown>) {
  const targets = Array.isArray(session.targets) ? session.targets : [];
  return targets.map((target) => {
    const row = target as { id?: string; kind?: string; canonicalId?: string; snapshot?: { label?: string } };
    return {
      targetId: row.id,
      kind: row.kind,
      canonicalId: row.canonicalId,
      label: row.snapshot?.label,
    };
  });
}

export function composeGovernedReport(input: {
  reportKey: string;
  workspace: ReportWorkspace;
  actorUserId: string;
  generatedAt?: string;
}) {
  const type = II_GOVERNED_REPORT_TYPES.find((item) => item.reportKey === input.reportKey);
  if (!type) throw new Error(`unsupported_report_key:${input.reportKey}`);
  const model = INSPECTION_REPORTING_DATA_MODELS.find((item) => item.reportKey === type.reportKey);
  if (!model) throw new Error(`v1_report_model_missing:${type.reportKey}`);
  const { workspace } = input;
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  const indicators = computeDeterministicIntelligence({
    defects: workspace.defects,
    correctiveActions: workspace.correctiveActions,
    verifications: workspace.verifications,
    sessions: [workspace.session],
    evidence: workspace.evidence,
    conditionRatings: workspace.conditionRatings,
  });
  const closed = String(workspace.session.status) === "closed";
  const limitations: string[] = [];
  if (!workspace.session.completed_at && !closed) {
    limitations.push("Session completedAt is unset.");
  }
  if (workspace.conditionRatings.length === 0) {
    limitations.push("No condition rating recorded. Unrated remains unrated.");
  }
  if (workspace.measurements.some((row) => String(row.evaluation_status) === "unknown")) {
    limitations.push("One or more measurements remain evaluation_status unknown.");
  }
  if (type.kind === "close_out_certificate" && !closed) {
    limitations.push("Close-out certificate composed while session is not closed. closedAt remains UNKNOWN.");
  }

  const identity = {
    sessionId: String(workspace.session.id),
    planId: workspace.session.plan_id ? String(workspace.session.plan_id) : undefined,
    planTitle: workspace.plan?.title ? String(workspace.plan.title) : undefined,
    templateId: workspace.plan?.template_id ? String(workspace.plan.template_id) : undefined,
    packId: workspace.template?.pack_id ? String(workspace.template.pack_id) : undefined,
    status: String(workspace.session.status ?? "unknown"),
    startedAt: workspace.session.started_at ? String(workspace.session.started_at) : undefined,
    completedAt: workspace.session.completed_at ? String(workspace.session.completed_at) : undefined,
  };
  const provenance = {
    target: targetProvenance(workspace.session),
    session: { sessionId: identity.sessionId, status: identity.status },
    observation: ids(workspace.observations),
    measurement: ids(workspace.measurements),
    defect: ids(workspace.defects),
    evidence: ids(workspace.evidence),
    assessment: ids(workspace.assessments),
    conditionRating: workspace.conditionRatings.map((row) => String(row.rating_id ?? row.id ?? "")),
    verification: ids(workspace.verifications),
    recommendation: ids(workspace.recommendations),
    correctiveAction: ids(workspace.correctiveActions),
  };

  const fullSections = {
    identity,
    target: provenance.target,
    scope: {
      templateId: identity.templateId,
      packId: identity.packId,
      checklistItemTypes: workspace.template?.checklist_item_types ?? workspace.plan?.checklist_item_types,
    },
    session: workspace.session,
    observations: workspace.observations,
    measurements: workspace.measurements,
    evidence: workspace.evidence,
    defects: workspace.defects,
    recommendations: workspace.recommendations,
    correctiveActions: workspace.correctiveActions,
    assessments: workspace.assessments,
    conditionRatings: workspace.conditionRatings,
    verifications: workspace.verifications,
    deterministicIndicators: indicators,
    limitations,
    provenance,
  };

  const sections =
    type.composition === "summary"
      ? {
          identity,
          target: provenance.target,
          session: { id: identity.sessionId, status: identity.status, startedAt: identity.startedAt, completedAt: identity.completedAt },
          deterministicIndicators: indicators,
          limitations,
          provenance,
        }
      : type.composition === "defects"
        ? {
            identity,
            defects: workspace.defects,
            recommendations: workspace.recommendations,
            correctiveActions: workspace.correctiveActions,
            verifications: workspace.verifications.filter((row) => row.kind === "defect" || row.kind === "corrective_action"),
            limitations,
            provenance: {
              session: provenance.session,
              defect: provenance.defect,
              recommendation: provenance.recommendation,
              correctiveAction: provenance.correctiveAction,
              verification: provenance.verification,
            },
          }
        : type.composition === "condition"
          ? {
              identity,
              assessments: workspace.assessments,
              conditionRatings: workspace.conditionRatings,
              evidence: workspace.evidence,
              limitations,
              provenance: {
                session: provenance.session,
                assessment: provenance.assessment,
                conditionRating: provenance.conditionRating,
                evidence: provenance.evidence,
              },
            }
          : fullSections;

  return {
    reportKey: type.reportKey,
    kind: type.kind,
    title: type.title,
    entityType: model.entityType,
    entityId: identity.sessionId,
    generatedAt,
    mobileReady: false as const,
    pdfAvailable: II_PDF_EXPORT_AVAILABLE,
    authority: {
      state: "draft" as ReportAuthorityState,
      actorUserId: input.actorUserId,
      at: generatedAt,
    },
    v1Model: {
      reportKey: model.reportKey,
      requiredFields: model.requiredFields,
      workflowStateRequired: model.workflowStateRequired,
    },
    sections,
    aiNarrative: false,
  };
}

export function renderReportMarkdown(snapshot: ReturnType<typeof composeGovernedReport>): string {
  const lines = [
    `# ${snapshot.title}`,
    "",
    `Report key: ${snapshot.reportKey}`,
    `Generated at: ${snapshot.generatedAt}`,
    `Authority: ${snapshot.authority.state} (actor ${snapshot.authority.actorUserId})`,
    `PDF export: unavailable`,
    `AI narrative: none`,
    "",
    "## Snapshot",
    "```json",
    JSON.stringify(snapshot.sections, null, 2),
    "```",
    "",
    "## Provenance",
    "```json",
    JSON.stringify(
      "provenance" in snapshot.sections ? (snapshot.sections as { provenance?: unknown }).provenance : {},
      null,
      2,
    ),
    "```",
  ];
  return lines.join("\n");
}
