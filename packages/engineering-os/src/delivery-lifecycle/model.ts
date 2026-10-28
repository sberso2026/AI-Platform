/**
 * EOS 2.1 delivery lifecycle foundation.
 * Stage, maturity, review, approval, and configuration baseline stay separate.
 * This module does not calculate discipline engineering and does not approve work.
 */

export const DELIVERY_STAGES = [
  "not_classified",
  "concept",
  "feasibility",
  "feed",
  "detailed_engineering",
] as const;

export type DeliveryStage = (typeof DELIVERY_STAGES)[number];

/** Named for later phases. This phase rejects transitions into them. */
export const FUTURE_DELIVERY_STAGES = [
  "construction_engineering",
  "commissioning",
  "operations",
  "brownfield_modification",
  "decommissioning",
] as const;

export const MATURITY_STATES = [
  "concept_initial",
  "concept_reviewed",
  "feasibility_developing",
  "feasibility_selected",
  "feed_developing",
  "feed_baselined",
  "detailed_design_in_progress",
  "detailed_design_verified",
  "issued_for_review",
  "issued_for_approval",
  "issued_for_construction",
] as const;

export type MaturityState = (typeof MATURITY_STATES)[number];

export const BASELINE_TYPES = [
  "concept_freeze",
  "feasibility_selection",
  "feed_baseline",
  "detailed_design_freeze",
  "ifc_baseline",
] as const;

export type BaselineType = (typeof BASELINE_TYPES)[number];

export const GATE_CATEGORIES = [
  "design_basis_readiness",
  "requirements_readiness",
  "assumption_status",
  "interface_status",
  "risk_status",
  "decision_status",
  "deliverable_readiness",
  "engineering_review_readiness",
  "configuration_baseline_readiness",
  "change_impact_status",
] as const;

export type GateCategory = (typeof GATE_CATEGORIES)[number];

export const DISCIPLINES = [
  "structural",
  "civil",
  "geotechnical",
  "mechanical",
  "piping",
  "process",
  "electrical",
  "instrumentation_and_control",
] as const;

export type DeliveryDiscipline = (typeof DISCIPLINES)[number];

export const DENIED_TRANSITION_ROLES = ["owner", "admin", "pilot-engineer", "pilot_engineer", "ai"] as const;

const FORWARD: Record<DeliveryStage, DeliveryStage | null> = {
  not_classified: "concept",
  concept: "feasibility",
  feasibility: "feed",
  feed: "detailed_engineering",
  detailed_engineering: null,
};

export type GateCriterion = {
  gateId: string;
  stage: DeliveryStage;
  category: GateCategory;
  criterion: string;
  status: "met" | "unmet" | "exception";
  evidenceRef: string | null;
  owner: string | null;
  exceptionRationale: string | null;
  blocking: boolean;
};

export type StageRefs = {
  designBasis: string[];
  requirements: string[];
  assumptions: string[];
  criteria: string[];
  calculations: string[];
  models: string[];
  interfaces: string[];
  decisions: string[];
  risks: string[];
  changes: string[];
  deliverables: string[];
};

export type DeliveryLifecycle = {
  id: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  stage: DeliveryStage;
  stageStatus: "inactive" | "active";
  stageStartedAt: string | null;
  stageTargetCompletion: string | null;
  maturity: MaturityState | null;
  baselineId: string | null;
  stageOwner: string | null;
  disciplines: DeliveryDiscipline[];
  revision: number;
  provenance: string;
  assumptions: AssumptionLink[];
  requirements: RequirementLink[];
  interfaces: InterfaceLink[];
  changes: ChangeLink[];
  deliverables: DeliverableLink[];
  criteria: GateCriterion[];
};

export type AssumptionLink = {
  id: string;
  introducedStage: DeliveryStage;
  expectedResolutionStage: DeliveryStage;
  status: "open" | "accepted_for_stage" | "blocking_next_stage" | "superseded" | "resolved";
  owner: string | null;
  impactIfWrong: string;
  downstream: string[];
};

export type RequirementLink = {
  id: string;
  introducedStage: DeliveryStage;
  maturity: MaturityState | null;
  verificationMethod: string | null;
  verificationStatus: "unverified" | "verified";
  evidenceRef: string | null;
  discipline: DeliveryDiscipline | "common";
  downstream: string[];
};

export type InterfaceLink = {
  id: string;
  sourceDiscipline: DeliveryDiscipline;
  receivingDiscipline: DeliveryDiscipline;
  parameter: string;
  revision: string;
  status: "proposed" | "issued" | "accepted" | "rejected" | "superseded";
  stage: DeliveryStage;
  acceptance: "pending" | "accepted" | "rejected";
  downstream: string[];
  owner: string | null;
  dueDate: string | null;
};

export type ChangeLink = {
  id: string;
  originatingStage: DeliveryStage;
  affectedBaselineId: string | null;
  affectedStage: DeliveryStage;
  impactedObjects: string[];
  impactStatus: "proposed" | "assessed" | "decided";
  humanDecision: string | null;
  resultingBaselineRevision: number | null;
};

export type DeliverableLink = {
  id: string;
  deliverableType: string;
  discipline: DeliveryDiscipline | "common";
  stage: DeliveryStage;
  maturity: MaturityState | null;
  revision: string;
  status: "current" | "superseded";
  reviewer: string | null;
  approver: string | null;
  linkedObjects: string[];
  baselineId: string | null;
};

export type ConfigurationBaseline = {
  id: string;
  lifecycleId: string;
  baselineType: BaselineType;
  revision: number;
  frozen: true;
  refs: StageRefs;
  unresolvedExceptions: string[];
  createdAt: string;
  createdBy: string;
};

export type AuditRecord = {
  action:
    | "lifecycle_created"
    | "stage_transition_requested"
    | "stage_transition"
    | "gate_evaluated"
    | "gate_override"
    | "exception_created"
    | "exception_resolved"
    | "maturity_changed"
    | "baseline_created"
    | "baseline_revision"
    | "discipline_applicability_changed";
  at: string;
  actorId: string;
  detail: Record<string, string | number | boolean | null>;
};

export type ProjectControlEvent = {
  type:
    | "stage_start"
    | "stage_complete"
    | "gate_readiness"
    | "design_maturity"
    | "baseline_created"
    | "baseline_revision"
    | "deliverable_maturity"
    | "engineering_blocker";
  at: string;
  lifecycleId: string;
};

export function emptyLifecycle(input: {
  id: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  actorId: string;
  at: string;
}): { lifecycle: DeliveryLifecycle; audit: AuditRecord } {
  return {
    lifecycle: {
      id: input.id,
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      stage: "not_classified",
      stageStatus: "inactive",
      stageStartedAt: null,
      stageTargetCompletion: null,
      maturity: null,
      baselineId: null,
      stageOwner: null,
      disciplines: [],
      revision: 1,
      provenance: "explicit_classification_required",
      assumptions: [],
      requirements: [],
      interfaces: [],
      changes: [],
      deliverables: [],
      criteria: [],
      },
    audit: {
      action: "lifecycle_created",
      at: input.at,
      actorId: input.actorId,
      detail: { stage: "not_classified", autoClassified: false },
    },
  };
}

export function nextStage(stage: DeliveryStage): DeliveryStage | null {
  return FORWARD[stage];
}

export function isAllowedTransition(from: DeliveryStage, to: string): to is DeliveryStage {
  return nextStage(from) === to;
}

export function roleMayAuthorizeTransition(role: string | null | undefined): boolean {
  if (!role) return false;
  return !DENIED_TRANSITION_ROLES.includes(role as (typeof DENIED_TRANSITION_ROLES)[number]);
}

export function genericCriteria(stage: Exclude<DeliveryStage, "not_classified">): GateCriterion[] {
  const items: Record<Exclude<DeliveryStage, "not_classified">, Array<[GateCategory, string, boolean]>> = {
    concept: [
      ["decision_status", "problem or opportunity defined", true],
      ["decision_status", "candidate options identified", true],
      ["assumption_status", "major constraints recorded", true],
      ["assumption_status", "major assumptions recorded", false],
      ["interface_status", "major interfaces identified", false],
      ["risk_status", "major risks identified", false],
      ["design_basis_readiness", "preliminary design basis exists", true],
      ["engineering_review_readiness", "option evaluation evidence exists", true],
      ["decision_status", "preferred option or continuation basis exists", true],
    ],
    feasibility: [
      ["design_basis_readiness", "feasibility design basis sufficiently developed", true],
      ["engineering_review_readiness", "preliminary sizing or analysis evidence recorded where applicable", false],
      ["risk_status", "technical risks assessed", true],
      ["deliverable_readiness", "constructability considered", false],
      ["interface_status", "major interfaces identified", true],
      ["deliverable_readiness", "preliminary quantities or cost or schedule inputs available where applicable", false],
      ["decision_status", "preferred option selected", true],
      ["assumption_status", "unresolved critical assumptions identified", true],
    ],
    feed: [
      ["design_basis_readiness", "controlled FEED design basis", true],
      ["requirements_readiness", "requirements sufficiently mature", true],
      ["assumption_status", "key assumptions resolved or explicitly carried", true],
      ["interface_status", "major discipline interfaces accepted", true],
      ["engineering_review_readiness", "preliminary models or calculations available", false],
      ["deliverable_readiness", "deliverable register established", true],
      ["decision_status", "major equipment or system configuration selected", true],
      ["change_impact_status", "design changes governed", true],
      ["configuration_baseline_readiness", "FEED baseline candidate available", true],
    ],
    detailed_engineering: [
      ["design_basis_readiness", "current design basis", true],
      ["requirements_readiness", "controlled inputs", true],
      ["engineering_review_readiness", "accepted engineering models", false],
      ["engineering_review_readiness", "calculations linked to current inputs", true],
      ["interface_status", "interface closure or controlled exceptions", true],
      ["deliverable_readiness", "deliverables under revision control", true],
      ["engineering_review_readiness", "review or verification state available", true],
      ["change_impact_status", "unresolved changes assessed", true],
      ["configuration_baseline_readiness", "configuration baseline identifiable", true],
    ],
  };
  return items[stage].map(([category, criterion, blocking], index) => ({
    gateId: `${stage}.${category}.${index + 1}`,
    stage,
    category,
    criterion,
    status: "unmet",
    evidenceRef: null,
    owner: null,
    exceptionRationale: null,
    blocking,
  }));
}

export function evaluateGate(criteria: GateCriterion[]): {
  ready: boolean;
  blockers: GateCriterion[];
  exceptions: GateCriterion[];
} {
  const blockers = criteria.filter((item) => item.blocking && item.status === "unmet");
  const exceptions = criteria.filter((item) => item.status === "exception");
  const blockingExceptions = exceptions.filter((item) => item.blocking && !item.exceptionRationale);
  return {
    ready: blockers.length === 0 && blockingExceptions.length === 0,
    blockers: [...blockers, ...blockingExceptions],
    exceptions,
  };
}

export function assumptionBlocksNextStage(assumption: AssumptionLink): boolean {
  return assumption.status === "blocking_next_stage";
}
