export const DISCIPLINES = [
  "process",
  "mechanical",
  "piping",
  "structural",
  "civil",
  "geotechnical",
  "electrical",
  "instrumentation_and_control",
] as const;
export type Discipline = (typeof DISCIPLINES)[number];

export const CHANGE_STATUSES = [
  "draft",
  "submitted",
  "under_screening",
  "impact_assessment_required",
  "impact_assessment_in_progress",
  "impact_assessed",
  "approved_for_implementation",
  "rejected",
  "implemented",
  "verification_required",
  "verified",
  "closed",
  "cancelled",
] as const;
export type ChangeStatus = (typeof CHANGE_STATUSES)[number];

export const MATERIALITY = [
  "UNASSESSED",
  "NO_MATERIAL_IMPACT",
  "POTENTIAL_IMPACT",
  "MATERIAL_IMPACT",
  "INFORMATION_ONLY",
  "UNKNOWN_REQUIRES_REVIEW",
] as const;
export type Materiality = (typeof MATERIALITY)[number];

export const SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
export type Severity = (typeof SEVERITIES)[number];

export const AI_CHANGE_APPROVAL_AUTHORITY = false as const;
export const AI_IMPACT_FINALIZATION_AUTHORITY = false as const;
export const AI_AUTOMATIC_RECALCULATION_AUTHORITY = false as const;
export const AI_AUTOMATIC_DELIVERABLE_REVISION_AUTHORITY = false as const;
export const AI_AUTOMATIC_BASELINE_UPDATE_AUTHORITY = false as const;
export const AUTOMATIC_ENGINEERING_RECALCULATION = false as const;

export type ChangeRecord = {
  id: string;
  title: string;
  description: string;
  origin: string;
  initiatingDiscipline: Discipline;
  stage: string;
  category: string;
  driver: string;
  sourceObjectType: string;
  sourceObjectId: string;
  previousRevision: string;
  newRevision: string;
  changedField: string;
  previousValue: string | null;
  newValue: string | null;
  unit: string | null;
  reason: string;
  owner: string;
  criticality: Severity;
  baselineId: string | null;
  status: ChangeStatus;
  provenance: string;
  supersedesId: string | null;
  exceptionId: string | null;
  tqId: string | null;
  decisionId: string | null;
  actionId: string | null;
  history: Array<{ revision: string; value: string; unit: string | null }>;
  materialityClass: "editorial" | "administrative" | "material" | "unknown";
};

export type ImpactNode = {
  id: string;
  objectType: string;
  discipline: Discipline;
  categories: string[];
  previousResult: string | null;
};

export type CandidateImpact = {
  id: string;
  changeId: string;
  objectType: string;
  objectId: string;
  discipline: Discipline;
  path: string[];
  depth: number;
  direct: boolean;
  categories: string[];
  classification: "CANDIDATE_IMPACT";
  materiality: Materiality;
  severity: Severity | null;
  confidence: "CONFIRMED_DEPENDENCY";
  reason: string;
  evidence: string;
  requiredAction: string | null;
  actionConfirmed: boolean;
  resolution: string | null;
  freshness: "potentially_stale";
  previousResult: string | null;
  recalculated: false;
  deliverableRevised: false;
};

export type ChangeAudit = {
  action: string;
  at: string;
  actorId: string;
  actingRole: string;
  detail: Record<string, string | number | boolean | null>;
};

export type ChangeBaseline = {
  id: string;
  type: string;
  frozen: true;
  items: Array<{ objectId: string; revision: string; value: string }>;
};

export type RequirementRecord = {
  id: string;
  governingInputId: string;
  evidenceId: string;
  status: "verified" | "reverification_required";
};

export type ChangeRegister = {
  id: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  projectTitle: string;
  changes: ChangeRecord[];
  nodes: ImpactNode[];
  edges: Array<{ fromId: string; toId: string }>;
  impacts: CandidateImpact[];
  baselines: ChangeBaseline[];
  requirements: RequirementRecord[];
  events: Array<{ type: string; changeId: string }>;
  audits: ChangeAudit[];
  a4Replaced: false;
  d1kReplaced: false;
  recalculated: false;
};
