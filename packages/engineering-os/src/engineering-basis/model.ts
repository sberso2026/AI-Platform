/**
 * EOS 2.2 common design basis and requirements.
 * Design basis, requirements, criteria, assumptions, and engineering inputs stay separate.
 * This module does not calculate discipline engineering and does not approve work.
 * EOS-A4 engineering_requirements rows are not rewritten or auto-classified.
 */

import type { DeliveryDiscipline, DeliveryStage } from "../delivery-lifecycle/model";

export const BASIS_LEVELS = ["project", "discipline", "system", "asset"] as const;
export type BasisLevel = (typeof BASIS_LEVELS)[number];

export const BASIS_INHERITANCE = ["inherit", "specialize", "override", "add", "not_applicable"] as const;
export type BasisInheritance = (typeof BASIS_INHERITANCE)[number];

export const BASIS_CATEGORIES = [
  "project_objective",
  "design_life",
  "design_capacity",
  "operating_condition",
  "environmental_condition",
  "site_condition",
  "load_action_basis",
  "material_basis",
  "reliability_target",
  "safety_requirement",
  "performance_criterion",
  "maintainability_requirement",
  "constructability_requirement",
  "availability_requirement",
  "inspection_requirement",
  "corrosion_exposure",
  "jurisdiction",
  "engineering_standard",
  "client_standard",
  "statutory_requirement",
  "project_specific_requirement",
  "exclusion",
  "constraint",
  "assumption",
  "design_criterion",
] as const;
export type BasisCategory = (typeof BASIS_CATEGORIES)[number];

export const BASIS_STATUSES = ["draft", "under_review", "accepted_for_stage", "approved", "superseded", "withdrawn"] as const;
export type BasisStatus = (typeof BASIS_STATUSES)[number];

export const BASIS_REQUIREMENT_TYPES = [
  "functional",
  "performance",
  "safety",
  "regulatory",
  "statutory",
  "client",
  "engineering",
  "environmental",
  "operational",
  "maintenance",
  "reliability",
  "constructability",
  "interface",
  "verification",
  "quality",
  "cybersecurity",
] as const;
export type BasisRequirementType = (typeof BASIS_REQUIREMENT_TYPES)[number];

export const BASIS_REQUIREMENT_STATUSES = [
  "draft",
  "proposed",
  "accepted",
  "verified",
  "deferred",
  "superseded",
  "rejected",
  "not_applicable",
] as const;
export type BasisRequirementStatus = (typeof BASIS_REQUIREMENT_STATUSES)[number];

export const BASIS_VERIFICATION_METHODS = [
  "calculation",
  "analysis_model",
  "inspection",
  "test",
  "review",
  "demonstration",
  "document_review",
  "vendor_evidence",
  "field_verification",
  "combined",
] as const;
export type BasisVerificationMethod = (typeof BASIS_VERIFICATION_METHODS)[number];

export const ASSUMPTION_STATUSES = ["open", "accepted_for_stage", "validated", "resolved", "superseded", "rejected"] as const;
export type BasisAssumptionStatus = (typeof ASSUMPTION_STATUSES)[number];

export const FRESHNESS_STATES = ["current", "potentially_stale", "superseded", "requires_review"] as const;
export type Freshness = (typeof FRESHNESS_STATES)[number];

export const SOURCE_KINDS = [
  "client_specification",
  "project_specification",
  "legislation",
  "regulation",
  "engineering_standard",
  "corporate_standard",
  "design_brief",
  "equipment_datasheet",
  "vendor_document",
  "approved_drawing",
  "approved_model",
  "survey",
  "geotechnical_report",
  "operating_data",
  "historical_asset_data",
  "technical_query_response",
  "engineering_decision",
  "approved_change",
] as const;
export type SourceKind = (typeof SOURCE_KINDS)[number];

export const JURISDICTION_PROFILES = [
  "australia",
  "eu",
  "uk",
  "us",
  "middle_east",
  "asia_pacific",
  "client_project",
] as const;
export type JurisdictionProfile = (typeof JURISDICTION_PROFILES)[number];

export const DENIED_BASIS_APPROVAL_ROLES = ["owner", "admin", "pilot-engineer", "pilot_engineer", "ai"] as const;

export const CHAIN_TYPES = [
  "source",
  "requirement",
  "basis",
  "criterion",
  "assumption",
  "input",
  "design_case",
  "calculation",
  "deliverable",
  "verification",
  "standard",
  "interface",
  "change",
] as const;
export type ChainType = (typeof CHAIN_TYPES)[number];

export type BasisAudit = {
  action: string;
  at: string;
  actorId: string;
  detail: Record<string, string | number | boolean | null>;
};

export type TraceLink = {
  id: string;
  fromType: ChainType;
  fromId: string;
  toType: ChainType;
  toId: string;
  relationship: string;
};

export type EngineeringSource = {
  id: string;
  kind: SourceKind;
  title: string;
  revision: string;
  locator: string | null;
  provenance: string;
};

export type DesignBasisItem = {
  id: string;
  level: BasisLevel;
  discipline: DeliveryDiscipline | "common" | null;
  category: BasisCategory;
  title: string;
  statement: string;
  unit: string | null;
  sourceId: string | null;
  sourceRevision: string | null;
  stage: DeliveryStage;
  status: BasisStatus;
  revision: number;
  effectiveAt: string | null;
  owner: string | null;
  reviewer: string | null;
  authorityState: "none" | "reviewed" | "approved";
  provenance: string;
  parentId: string | null;
  inheritance: BasisInheritance;
  overrideRationale: string | null;
  supersedesId: string | null;
  approvalGranted: false;
};

export type BasisRequirement = {
  id: string;
  title: string;
  statement: string;
  requirementType: BasisRequirementType;
  discipline: DeliveryDiscipline | "common" | null;
  applicability: string | null;
  sourceId: string | null;
  sourceRevision: string | null;
  sourceLocator: string | null;
  rationale: string | null;
  introducedStage: DeliveryStage;
  requiredByStage: DeliveryStage | null;
  criticality: "low" | "medium" | "high" | "critical";
  status: BasisRequirementStatus;
  verificationMethod: BasisVerificationMethod | null;
  verificationStatus: "unverified" | "verified" | "conditional";
  owner: string | null;
  reviewer: string | null;
  revision: number;
  supersedesId: string | null;
  legacyRequirementId: string | null;
  provenance: string;
  label: "RECORD" | "PROPOSED";
};

export type DesignCriterion = {
  id: string;
  title: string;
  statement: string;
  unit: string | null;
  sourceId: string | null;
  basisItemId: string | null;
  stage: DeliveryStage;
  applicability: string | null;
  status: BasisStatus;
  revision: number;
  provenance: string;
};

export type BasisAssumption = {
  id: string;
  description: string;
  sourceId: string | null;
  introducedStage: DeliveryStage;
  targetResolutionStage: DeliveryStage;
  owner: string | null;
  status: BasisAssumptionStatus;
  confidence: "low" | "medium" | "high" | null;
  impactIfWrong: string;
  blocksNextStage: boolean;
  basisItemId: string | null;
  requirementId: string | null;
};

export type EngineeringInput = {
  id: string;
  name: string;
  value: string;
  unit: string | null;
  dataType: "number" | "text" | "category";
  sourceId: string | null;
  sourceRevision: string | null;
  effectiveAt: string | null;
  uncertainty: string | null;
  stage: DeliveryStage;
  status: "current" | "superseded";
  discipline: DeliveryDiscipline | "common" | null;
  owner: string | null;
  provenance: string;
  revision: number;
  supersedesId: string | null;
  interfaceUse: {
    sourceDiscipline: DeliveryDiscipline;
    receivingDiscipline: DeliveryDiscipline;
    parameter: string;
  } | null;
};

export type DesignCase = { id: string; title: string; stage: DeliveryStage; inputIds: string[] };

export type CalculationRef = {
  id: string;
  title: string;
  inputIds: string[];
  freshness: Freshness;
  revision: number;
};

export type DeliverableRef = {
  id: string;
  title: string;
  basisItemIds: string[];
  freshness: Freshness;
  revision: number;
};

export type VerificationRecord = {
  id: string;
  requirementId: string;
  method: BasisVerificationMethod;
  evidenceId: string;
  result: string;
  reviewer: string;
  at: string;
  revision: number;
  stage: DeliveryStage;
  outcome: "pass" | "fail" | "conditional";
  comments: string | null;
  provenance: string;
  freshness: Freshness;
};

export type StandardReference = {
  id: string;
  identifier: string;
  edition: string;
  jurisdiction: JurisdictionProfile | null;
  applicability: string;
  clauseMetadata: string | null;
  interpretation: string | null;
  status: "current" | "superseded";
  supersedesId: string | null;
};

export type BasisReview = {
  id: string;
  subjectType: "basis" | "requirement";
  subjectId: string;
  revision: number;
  reviewer: string;
  role: string;
  outcome: string;
  comments: string | null;
  at: string;
  approvalGranted: boolean;
};

export type BasisChange = {
  id: string;
  targets: Array<{ type: ChainType; id: string }>;
  decision: string | null;
  approved: false;
};

export type EngineeringBasisGraph = {
  id: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  stage: DeliveryStage;
  jurisdictionProfile: JurisdictionProfile | null;
  baselineId: string | null;
  sources: EngineeringSource[];
  basisItems: DesignBasisItem[];
  requirements: BasisRequirement[];
  criteria: DesignCriterion[];
  assumptions: BasisAssumption[];
  inputs: EngineeringInput[];
  designCases: DesignCase[];
  calculations: CalculationRef[];
  deliverables: DeliverableRef[];
  verifications: VerificationRecord[];
  standards: StandardReference[];
  links: TraceLink[];
  reviews: BasisReview[];
  changes: BasisChange[];
  audits: BasisAudit[];
};

export function emptyBasisGraph(input: {
  id: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  stage?: DeliveryStage;
}): EngineeringBasisGraph {
  return {
    id: input.id,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    stage: input.stage ?? "not_classified",
    jurisdictionProfile: null,
    baselineId: null,
    sources: [],
    basisItems: [],
    requirements: [],
    criteria: [],
    assumptions: [],
    inputs: [],
    designCases: [],
    calculations: [],
    deliverables: [],
    verifications: [],
    standards: [],
    links: [],
    reviews: [],
    changes: [],
    audits: [],
  };
}

export function roleMayApproveBasis(role: string | null | undefined, canApprove: boolean | undefined): boolean {
  if (canApprove !== true || !role) return false;
  return !DENIED_BASIS_APPROVAL_ROLES.includes(role as (typeof DENIED_BASIS_APPROVAL_ROLES)[number]);
}
