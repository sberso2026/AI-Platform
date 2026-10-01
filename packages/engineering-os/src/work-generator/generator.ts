import type { WorkReadinessResolution } from "../information-requirements/readiness";
import type { EngineeringWorkTemplate, EngineeringWorkPlan, GeneratorWorkType, WorkActionContract, WorkPlanContext, WorkPlanContextSnapshot, WorkPlanStatus, WorkReference } from "./types";
import { fingerprintWorkPlanInput } from "./fingerprint";

export type { WorkPlanContextSnapshot };

const ACTION_LABELS: Record<string, string> = {
  OPEN_GOVERNING_SOURCE: "Open Governing Source",
  REQUEST_MISSING_INFORMATION: "Request Missing Information",
  CREATE_ASSUMPTION: "Create / Link Assumption",
  OPEN_CURRENT_DRAWING: "Open Current Drawing",
  PREPARE_CALCULATION: "Prepare Calculation",
  PREPARE_ANALYSIS: "Prepare Analysis",
  PREPARE_DESIGN_REPORT: "Prepare Design Report",
  PREPARE_SPECIFICATION: "Prepare Specification",
  PREPARE_OPTION_STUDY: "Prepare Option Study",
  PREPARE_CONCEPT_STUDY: "Prepare Concept Study",
  PREPARE_PRELIMINARY_SIZING: "Prepare Preliminary Sizing",
  CREATE_REVIEW: "Create Review",
  ASSESS_CHANGE: "Assess Change",
  PREPARE_RFI_TQ_RESPONSE: "Prepare RFI/TQ Response",
  PREPARE_HANDOVER: "Prepare Handover",
  START_ENGINEERING_WORK: "Start Engineering Work",
  REFRESH_CONTEXT: "Refresh Engineering Context",
};

const DEFERRED = new Set([
  "PREPARE_CALCULATION",
  "PREPARE_ANALYSIS",
  "PREPARE_DESIGN_REPORT",
  "PREPARE_SPECIFICATION",
  "PREPARE_OPTION_STUDY",
  "PREPARE_CONCEPT_STUDY",
  "PREPARE_PRELIMINARY_SIZING",
  "PREPARE_RFI_TQ_RESPONSE",
  "PREPARE_HANDOVER",
]);

export function mapReadinessToStart(input: {
  template: EngineeringWorkTemplate;
  readiness: WorkReadinessResolution | null;
  snapshot: WorkPlanContextSnapshot;
  acknowledged: boolean;
}): { readiness: EngineeringWorkPlan["readiness"]; startAllowed: boolean; status: WorkPlanStatus; whyBlocked: string | null; whyConditional: string | null; conditions: string[] } {
  const state = input.readiness?.state ?? "UNKNOWN";
  const conditions: string[] = [];
  if (state === "READY") {
    return { readiness: "READY", startAllowed: true, status: "READY", whyBlocked: null, whyConditional: null, conditions };
  }
  if (state === "BLOCKED_INFORMATION_MISSING" || state === "BLOCKED_INFORMATION_UNACCEPTED" || state === "BLOCKED_INFORMATION_STALE") {
    if (input.template.conditionalStartPolicy === "ALLOW_WITH_ASSUMPTIONS" && input.snapshot.assumptions.length) {
      conditions.push("Work begins on documented assumptions. Missing blocking inputs remain outstanding.");
      const allowed = input.acknowledged;
      return {
        readiness: "READY_WITH_CONDITIONS",
        startAllowed: allowed,
        status: allowed ? "READY" : "DRAFT",
        whyBlocked: allowed ? null : "Conditional start requires acknowledgment of documented assumptions.",
        whyConditional: "Template permits conditional start with governed assumptions.",
        conditions,
      };
    }
    return {
      readiness: state,
      startAllowed: false,
      status: "BLOCKED",
      whyBlocked: input.readiness?.explanation ?? `Blocked: ${state}`,
      whyConditional: null,
      conditions,
    };
  }
  if (state === "READY_WITH_CONDITIONS") {
    conditions.push(...(input.readiness?.explanation ? [input.readiness.explanation] : ["Non-blocking information remains outstanding."]));
    const allowed = !input.template.requireAcknowledgment || input.acknowledged;
    return {
      readiness: "READY_WITH_CONDITIONS",
      startAllowed: allowed,
      status: allowed ? "READY" : "DRAFT",
      whyBlocked: allowed ? null : "Conditional start requires acknowledgment.",
      whyConditional: "Template allows start with conditions.",
      conditions,
    };
  }
  if (input.template.conditionalStartPolicy === "ALLOW_WITH_ASSUMPTIONS") {
    conditions.push("No configured information-requirement profile, or requirements are not yet instantiated. Documented assumptions may carry concept/prefeasibility work.");
    const allowed = !input.template.requireAcknowledgment || input.acknowledged;
    return {
      readiness: "READY_WITH_CONDITIONS",
      startAllowed: allowed,
      status: allowed ? "READY" : "DRAFT",
      whyBlocked: allowed ? null : "Conditional start requires acknowledgment.",
      whyConditional: "Template policy ALLOW_WITH_ASSUMPTIONS maps UNKNOWN readiness to conditional start.",
      conditions,
    };
  }
  return {
    readiness: "BLOCKED",
    startAllowed: false,
    status: "BLOCKED",
    whyBlocked: "Required accepted information is not configured or not satisfied.",
    whyConditional: null,
    conditions,
  };
}

function actionsFor(template: EngineeringWorkTemplate, snapshot: WorkPlanContextSnapshot, startAllowed: boolean): WorkActionContract[] {
  const missing = snapshot.gaps.some((row) => row.kind === "missing");
  const codes = ["OPEN_GOVERNING_SOURCE", "REFRESH_CONTEXT", ...template.actionCodes, "START_ENGINEERING_WORK"];
  if (missing) codes.unshift("REQUEST_MISSING_INFORMATION");
  if (template.conditionalStartPolicy === "ALLOW_WITH_ASSUMPTIONS") codes.splice(1, 0, "CREATE_ASSUMPTION");
  const unique = [...new Set(codes)];
  return unique.map((code) => {
    let availability: WorkActionContract["availability"] = "ENABLED";
    let reason = "Available now.";
    if (DEFERRED.has(code)) {
      availability = "DEFERRED_IMPLEMENTATION";
      reason = "Artifact generation is EOS-A11B. A11A prepares context only.";
    } else if (code === "CREATE_REVIEW" || code === "ASSESS_CHANGE") {
      availability = "AVAILABLE_CONTRACT";
      reason = "Review/change contracts exist; A11A does not execute them as a new workflow engine.";
    } else if (code === "START_ENGINEERING_WORK") {
      availability = startAllowed ? "ENABLED" : "DISABLED";
      reason = startAllowed ? "Governed start is allowed." : "Start is blocked until missing/unaccepted/stale information is resolved or a permitted assumption is acknowledged.";
    } else if (code === "REQUEST_MISSING_INFORMATION" && !missing) {
      availability = "DISABLED";
      reason = "No missing required information.";
    }
    return { code, label: ACTION_LABELS[code] ?? code, availability, reason };
  });
}

export function generateEngineeringWorkPlan(input: {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  workType: GeneratorWorkType;
  template: EngineeringWorkTemplate;
  snapshot: WorkPlanContextSnapshot;
  readiness: WorkReadinessResolution | null;
  discipline?: string | null;
  systemId?: string | null;
  assetId?: string | null;
  relatedObjectType?: string | null;
  relatedObjectId?: string | null;
  relatedDeliverableId?: string | null;
  relatedInterfaceId?: string | null;
  relatedChangeId?: string | null;
  generatedBy?: string | null;
  acknowledged?: boolean;
  supersedesPlanId?: string | null;
  now?: string;
}): EngineeringWorkPlan {
  const started = Date.now();
  const now = input.now ?? new Date().toISOString();
  const mapped = mapReadinessToStart({
    template: input.template,
    readiness: input.readiness,
    snapshot: input.snapshot,
    acknowledged: Boolean(input.acknowledged),
  });
  const context: WorkPlanContext = {
    information: input.snapshot.information,
    gaps: input.snapshot.gaps,
    requirements: input.snapshot.requirements,
    assumptions: input.snapshot.assumptions,
    interfaces: input.snapshot.interfaces,
    decisions: input.snapshot.decisions,
    analyses: input.snapshot.analyses,
    deliverable: input.snapshot.deliverable ?? null,
    handoverPackage: input.snapshot.handoverPackage ?? null,
    expectedOutputs: input.template.expectedOutputs.map((outputType) => ({
      outputType,
      title: outputType.replaceAll("_", " ").toLowerCase(),
      generated: false as const,
    })),
    actions: actionsFor(input.template, input.snapshot, mapped.startAllowed),
    conditions: mapped.conditions,
  };
  const fingerprint = fingerprintWorkPlanInput({
    projectId: input.projectId,
    templateCode: input.template.code,
    templateVersion: input.template.version,
    workType: input.workType,
    lifecycleStage: input.template.lifecycleStage,
    systemId: input.systemId,
    snapshot: input.snapshot,
  });
  return {
    id: crypto.randomUUID(),
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    workType: input.workType,
    templateCode: input.template.code,
    templateVersion: input.template.version,
    discipline: input.discipline ?? input.template.disciplines[0] ?? null,
    systemId: input.systemId ?? null,
    assetId: input.assetId ?? null,
    lifecycleStage: input.template.lifecycleStage,
    relatedObjectType: input.relatedObjectType ?? null,
    relatedObjectId: input.relatedObjectId ?? null,
    relatedDeliverableId: input.relatedDeliverableId ?? null,
    relatedInterfaceId: input.relatedInterfaceId ?? null,
    relatedChangeId: input.relatedChangeId ?? null,
    status: mapped.status,
    readiness: mapped.readiness,
    startAllowed: mapped.startAllowed,
    conditionsAcknowledged: Boolean(input.acknowledged),
    staleness: "CURRENT",
    inputFingerprint: fingerprint,
    context,
    explanations: {
      whyBlocked: mapped.whyBlocked,
      whyConditional: mapped.whyConditional,
      templateProvenance: `${input.template.code}@${input.template.version}`,
      engineeringApproved: false,
      optionWinnerSelected: false,
    },
    generatedAt: now,
    generatedBy: input.generatedBy ?? null,
    supersedesPlanId: input.supersedesPlanId ?? null,
    startedAt: null,
    completedAt: null,
    createdAt: now,
    updatedAt: now,
    metrics: {
      informationReferencesEvaluated: input.snapshot.information.length,
      requirementsEvaluated: input.snapshot.requirements.length,
      threadRelationshipsTraversed: input.snapshot.threadRelationshipCount ?? 0,
      readinessEvaluations: input.readiness ? 1 : 0,
      durationMs: Date.now() - started,
    },
  };
}

export function diffWorkPlans(previous: EngineeringWorkPlan, next: EngineeringWorkPlan) {
  const collect = (rows: WorkReference[]) => new Set(rows.map((row) => `${row.objectType}:${row.objectId}`));
  const added = (before: Set<string>, after: WorkReference[]) => after.filter((row) => !before.has(`${row.objectType}:${row.objectId}`)).map((row) => row.title);
  const prevReq = collect(previous.context.requirements);
  return {
    newInformation: added(new Set(previous.context.information.map((row) => row.title)), next.context.information.map((row) => ({ objectType: "information", objectId: row.title, title: row.title, whyIncluded: row.whyIncluded }))),
    supersededInformation: previous.context.information.filter((row) => row.freshness === "SUPERSEDED" || next.context.gaps.some((gap) => gap.kind === "stale" && gap.title === row.title)).map((row) => row.title),
    newRequirement: added(prevReq, next.context.requirements),
    changedInterface: added(collect(previous.context.interfaces), next.context.interfaces),
    newDecision: added(collect(previous.context.decisions), next.context.decisions),
    changedReadiness: previous.readiness !== next.readiness,
    previousFingerprint: previous.inputFingerprint,
    nextFingerprint: next.inputFingerprint,
  };
}
