/**
 * EOS 3.2 canonical engineering object families.
 * Prefer compatible extension over duplicate tables; identity is not a UI label.
 */

export const EOS3_OBJECT_TYPES = [
  "Project",
  "WorkPackage",
  "EngineeringBasis",
  "Requirement",
  "System",
  "DisciplineObject",
  "Revision",
  "Interface",
  "Change",
  "Impact",
  "Decision",
  "Assumption",
  "Calculation",
  "Review",
  "Evidence",
  "Deliverable",
  "Baseline",
  "Asset",
  "Inspection",
  "OptimizationRun",
] as const;

export type Eos3ObjectType = (typeof EOS3_OBJECT_TYPES)[number];

export type Eos3ObjectImplementationStatus =
  | "INHERITED_COMPATIBLE"
  | "EXTENDED"
  | "NEW_EOS3_OBJECT"
  | "DEFERRED"
  | "DEPRECATED";

export const EOS3_OBJECT_IMPLEMENTATION_STATUS: Record<
  Eos3ObjectType,
  Eos3ObjectImplementationStatus
> = {
  Project: "EXTENDED",
  WorkPackage: "NEW_EOS3_OBJECT",
  EngineeringBasis: "EXTENDED",
  Requirement: "EXTENDED",
  System: "EXTENDED",
  DisciplineObject: "EXTENDED",
  Revision: "EXTENDED",
  Interface: "EXTENDED",
  Change: "EXTENDED",
  Impact: "EXTENDED",
  Decision: "EXTENDED",
  Assumption: "EXTENDED",
  Calculation: "EXTENDED",
  Review: "EXTENDED",
  Evidence: "EXTENDED",
  Deliverable: "EXTENDED",
  Baseline: "EXTENDED",
  Asset: "EXTENDED",
  Inspection: "EXTENDED",
  OptimizationRun: "NEW_EOS3_OBJECT",
};

export type Eos3StableObjectIdentity = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  generation: 3;
  objectType: Eos3ObjectType;
  stableObjectId: string;
  revisionLineageId: string | null;
};

export type Eos3CanonicalObject = Eos3StableObjectIdentity & {
  id: string;
  displayName: string;
  lifecycleState: string;
  lifecycleProfileKey: string | null;
  jurisdictionProfileRef: string | null;
  sourceOwnerId: string | null;
  disciplineType: string | null;
  currentRevisionId: string | null;
  governedState: "CURRENT" | "STALE" | "IMPACT_CANDIDATE" | "FROZEN" | "SUPERSEDED";
  payload: Record<string, unknown>;
  provenance: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type Eos3ObjectRevision = {
  id: string;
  objectId: string;
  revisionIdentifier: string;
  priorRevisionId: string | null;
  isCurrent: boolean;
  actorId: string | null;
  authority: string | null;
  source: string;
  changeRationale: string | null;
  lifecycleState: string;
  payload: Record<string, unknown>;
  provenance: Record<string, unknown>;
  createdAt: string;
  immutable: true;
};

export type QualificationStatus = "NOT_IMPLEMENTED" | "IMPLEMENTED" | "VALIDATED" | "QUALIFIED" | "QUALIFIED_BOUNDED";

export function assertImplementedNotQualified(
  status: QualificationStatus,
): { implemented: boolean; validated: boolean; qualified: boolean } {
  const implemented = status !== "NOT_IMPLEMENTED";
  const validated = status === "VALIDATED" || status === "QUALIFIED" || status === "QUALIFIED_BOUNDED";
  const qualified = status === "QUALIFIED" || status === "QUALIFIED_BOUNDED";
  return { implemented, validated, qualified };
}

export function newStableIdentity(input: {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  objectType: Eos3ObjectType;
  stableObjectId: string;
  revisionLineageId?: string | null;
}): Eos3StableObjectIdentity {
  if (!input.stableObjectId || input.stableObjectId.trim() === "") {
    throw new Error("stable_object_id_required");
  }
  if (input.stableObjectId === input.objectType) {
    throw new Error("ui_label_not_primary_identity");
  }
  return {
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    generation: 3,
    objectType: input.objectType,
    stableObjectId: input.stableObjectId,
    revisionLineageId: input.revisionLineageId ?? null,
  };
}
