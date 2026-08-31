import { AI_INSPECTION_ENGINEER_CAPABILITY } from "./capability";
import type { EngineerContext, EngineerRecordSummary } from "./types";

export type EngineerContextPack = {
  projectId?: string;
  session?: Record<string, unknown>;
  planTitle?: string;
  observations?: Array<Record<string, unknown>>;
  measurements?: Array<Record<string, unknown>>;
  evidence?: Array<Record<string, unknown>>;
  defects?: Array<Record<string, unknown>>;
  recommendations?: Array<Record<string, unknown>>;
  correctiveActions?: Array<Record<string, unknown>>;
  assessments?: Array<Record<string, unknown>>;
  conditionRatings?: Array<Record<string, unknown>>;
  verifications?: Array<Record<string, unknown>>;
  history?: Array<Record<string, unknown>>;
  report?: Record<string, unknown>;
  indicators?: EngineerContext["indicators"];
  missingContinuity?: boolean;
  incompatibleMeasurements?: boolean;
  historyIncomplete?: boolean;
};

export function emptyEngineerContext(projectId?: string): EngineerContext {
  return {
    capability: AI_INSPECTION_ENGINEER_CAPABILITY,
    generatedAt: new Date().toISOString(),
    tenantBound: true,
    workspaceBound: true,
    projectId,
    observations: [],
    measurements: [],
    evidence: [],
    defects: [],
    recommendations: [],
    correctiveActions: [],
    assessments: [],
    conditionRatings: [],
    verifications: [],
    history: [],
    indicators: {},
    unknowns: ["No inspection session is bound. Available inspection records are UNKNOWN."],
    limitations: ["Context is limited to records the authenticated user can already read."],
    readOnly: true,
    mutationEnabled: false,
  };
}

export function summarizeRow(input: {
  id: string;
  kind: string;
  status?: string;
  summary: string;
  at?: string;
}): EngineerRecordSummary {
  return {
    id: input.id,
    kind: input.kind,
    status: input.status,
    summary: input.summary.slice(0, 240),
    at: input.at,
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function rowId(row: Record<string, unknown>): string {
  return String(row.id ?? row.rating_id ?? "");
}

function mapRows(
  rows: Array<Record<string, unknown>> | undefined,
  kind: string,
  summary: (row: Record<string, unknown>) => string,
  at?: (row: Record<string, unknown>) => string | undefined,
  status?: (row: Record<string, unknown>) => string | undefined,
): EngineerRecordSummary[] {
  return (rows ?? []).slice(0, 40).map((row) =>
    summarizeRow({
      id: rowId(row),
      kind,
      status: status?.(row) ?? (row.status ? String(row.status) : undefined),
      summary: summary(row),
      at: at?.(row),
    }),
  );
}

function defectSummary(row: Record<string, unknown>): string {
  const taxonomy = asRecord(row.taxonomy);
  const title = String(row.title ?? row.id ?? "defect");
  const status = String(row.status ?? "unknown");
  const severity = taxonomy.severity ? `severity ${String(taxonomy.severity)}` : "unset severity";
  return `${title} (${status}; ${severity})`;
}

function measurementSummary(row: Record<string, unknown>): string {
  return `${String(row.measurement_type ?? "measurement")} = ${JSON.stringify(row.observed_value)} ${String(row.unit ?? "")}`.trim();
}

function ratingSummary(row: Record<string, unknown>): string {
  const payload = asRecord(row.payload);
  const observed = asRecord(payload.observed);
  const value =
    observed.ordinalCode ??
    (typeof observed.numericScore === "number" ? `numeric ${observed.numericScore}` : "unknown value");
  const assessor = payload.assessorUserId ? ` recorded by ${String(payload.assessorUserId)}` : "";
  const at = payload.assessedAt ? ` on ${String(payload.assessedAt)}` : "";
  return `Condition rating ${String(value)} (${String(row.scheme_id ?? payload.schemeId ?? "unknown scheme")})${assessor}${at}`;
}

function reportFromRow(row: Record<string, unknown>): EngineerContext["report"] {
  const payload = asRecord(row.payload);
  const authority = asRecord(payload.authority);
  const sections = asRecord(payload.sections);
  const limitations = [
    ...(Array.isArray(payload.limitations) ? payload.limitations.map(String) : []),
    ...(Array.isArray(sections.limitations) ? sections.limitations.map(String) : []),
  ];
  return {
    id: rowId(row),
    reportKey: String(row.report_key ?? payload.reportKey ?? "unknown"),
    title: payload.title ? String(payload.title) : undefined,
    authority: authority.state ? String(authority.state) : undefined,
    limitations,
  };
}

export function deriveUnknowns(context: Pick<
  EngineerContext,
  | "session"
  | "observations"
  | "measurements"
  | "evidence"
  | "defects"
  | "conditionRatings"
  | "report"
  | "history"
>): string[] {
  const unknowns: string[] = [];
  if (!context.session) unknowns.push("No inspection session is selected. Session identity is UNKNOWN.");
  if (context.session && context.observations.length === 0) {
    unknowns.push("No observations are recorded for this session.");
  }
  if (context.session && context.measurements.length === 0) {
    unknowns.push("No measurements are recorded. Measurement values remain UNKNOWN.");
  }
  if (context.session && context.evidence.length === 0) {
    unknowns.push("No evidence is registered. Evidence completeness is unset, not a failed result.");
  }
  if (context.defects.some((row) => !row.status || /unknown/i.test(row.status))) {
    unknowns.push("One or more defects have unset or unknown status.");
  }
  if (context.defects.some((row) => /unset severity|unknown severity/i.test(row.summary))) {
    unknowns.push("One or more defects have unset severity.");
  }
  if (context.session && context.conditionRatings.length === 0) {
    unknowns.push("No condition rating is recorded. Unrated remains unrated.");
  }
  if (context.report?.limitations.length) {
    unknowns.push(...context.report.limitations);
  }
  return unknowns;
}

export function assembleEngineerContext(pack: EngineerContextPack = {}): EngineerContext {
  const session = pack.session
    ? {
        id: String(pack.session.id),
        status: String(pack.session.status ?? "unknown"),
        planId: pack.session.plan_id ? String(pack.session.plan_id) : undefined,
        planTitle: pack.planTitle,
        startedAt: pack.session.started_at ? String(pack.session.started_at) : undefined,
        completedAt: pack.session.completed_at ? String(pack.session.completed_at) : undefined,
        targets: Array.isArray(pack.session.targets)
          ? pack.session.targets.map((target) => {
              const row = asRecord(target);
              const snapshot = asRecord(row.snapshot);
              return {
                kind: row.kind ? String(row.kind) : undefined,
                canonicalId: row.canonicalId ? String(row.canonicalId) : undefined,
                label: snapshot.label ? String(snapshot.label) : undefined,
              };
            })
          : [],
      }
    : undefined;

  const context: EngineerContext = {
    capability: AI_INSPECTION_ENGINEER_CAPABILITY,
    generatedAt: new Date().toISOString(),
    tenantBound: true,
    workspaceBound: true,
    projectId: pack.projectId,
    session,
    observations: mapRows(pack.observations, "inspection_observation", (row) => String(row.body ?? row.checklist_item_type ?? "observation"), (row) => row.recorded_at ? String(row.recorded_at) : undefined),
    measurements: mapRows(pack.measurements, "inspection_measurement", measurementSummary, (row) => row.recorded_at ? String(row.recorded_at) : undefined),
    evidence: mapRows(pack.evidence, "inspection_evidence", (row) => `${String(row.kind ?? "evidence")} file ${String(row.file_id ?? "unset")}`, (row) => {
      const provenance = asRecord(row.provenance);
      return provenance.capturedAt ? String(provenance.capturedAt) : row.created_at ? String(row.created_at) : undefined;
    }),
    defects: mapRows(pack.defects, "inspection_defect", defectSummary, (row) => row.created_at ? String(row.created_at) : undefined),
    recommendations: mapRows(pack.recommendations, "inspection_recommendation", (row) => String(row.action ?? row.title ?? "recommendation")),
    correctiveActions: mapRows(pack.correctiveActions, "inspection_corrective_action", (row) => `${String(row.description ?? row.id)} (${String(row.status ?? "unknown")})`),
    assessments: mapRows(pack.assessments, "inspection_assessment", (row) => String(row.title ?? row.body ?? "assessment")),
    conditionRatings: mapRows(pack.conditionRatings, "inspection_condition_rating", ratingSummary, (row) => {
      const payload = asRecord(row.payload);
      return payload.assessedAt ? String(payload.assessedAt) : undefined;
    }),
    verifications: mapRows(pack.verifications, "inspection_verification", (row) => `${String(row.kind ?? "verification")} ${String(row.status ?? "unknown")}`),
    history: (pack.history ?? []).slice(0, 40).map((row) =>
      summarizeRow({
        id: rowId(row),
        kind: String(row.kind ?? "history"),
        status: row.status ? String(row.status) : undefined,
        summary: String(row.summary ?? row.kind ?? "history"),
        at: row.at ? String(row.at) : undefined,
      }),
    ),
    indicators: pack.indicators ?? {},
    report: pack.report ? reportFromRow(pack.report) : undefined,
    unknowns: [],
    limitations: ["Context is limited to records the authenticated user can already read."],
    readOnly: true,
    mutationEnabled: false,
  };

  const unknowns = deriveUnknowns(context);
  if (pack.incompatibleMeasurements) {
    unknowns.push("Measurements are incompatible for like-for-like comparison. Numeric delta remains UNKNOWN.");
  }
  if (pack.missingContinuity || pack.historyIncomplete) {
    unknowns.push("Historical records are incomplete. Continuity is not inferred.");
  }
  return { ...context, unknowns };
}
