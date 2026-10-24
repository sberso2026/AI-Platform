/**
 * Phase 11B — Engineering Shared Project Domain reference types.
 *
 * These are *identity* projections. Every type below answers "which thing is
 * this and where does it sit in the hierarchy", never "how is it doing".
 * Status/progress interpretation belongs to consuming intelligence modules.
 */

import { CANONICAL_PROJECT_IDENTITY_OWNERSHIP } from "./version";

export type SharedProjectDomainOwner = typeof CANONICAL_PROJECT_IDENTITY_OWNERSHIP;

/** Every reference carries its owner so a consumer cannot forge identity. */
export type SharedProjectDomainReferenceBase = {
  tenantId: string;
  /** Nullable on `engineering_projects`; reference tables always carry it. */
  workspaceId?: string;
  owner: SharedProjectDomainOwner;
  /** Reference projections are read-only by contract. */
  readonly mutable: false;
};

export type EngineeringProjectPhaseCode =
  | "concept"
  | "feasibility"
  | "design"
  | "detailed_design"
  | "procurement"
  | "construction"
  | "commissioning"
  | "operations"
  | "decommissioning";

export type EngineeringProjectStatus =
  | "draft"
  | "active"
  | "on_hold"
  | "completed"
  | "cancelled"
  | "archived";

/**
 * Canonical project identity. Sourced from `engineering_projects`.
 * Consumers key their own records on `projectId` and nothing else.
 */
export type ProjectReference = SharedProjectDomainReferenceBase & {
  kind: "project";
  projectId: string;
  projectCode: string;
  projectName: string;
  projectPhase: EngineeringProjectPhaseCode;
  status: EngineeringProjectStatus;
  clientName?: string;
  siteName?: string;
  location?: string;
  industry?: string;
  projectType?: string;
  startDate?: string;
  endDate?: string;
  resolvedAt: string;
};

export type PhaseReference = SharedProjectDomainReferenceBase & {
  kind: "phase";
  phaseId: string;
  projectId: string;
  code: string;
  name: string;
  status: string;
  sequence?: number;
  parentPhaseId?: string;
  resolvedAt: string;
};

export type WbsReference = SharedProjectDomainReferenceBase & {
  kind: "wbs_node";
  wbsNodeId: string;
  projectId: string;
  code: string;
  name: string;
  status: string;
  /** Depth in the breakdown, 1-based. Identity only — no rollup arithmetic. */
  level?: number;
  parentWbsNodeId?: string;
  path?: string;
  resolvedAt: string;
};

export type WorkPackageReference = SharedProjectDomainReferenceBase & {
  kind: "work_package";
  workPackageId: string;
  projectId: string;
  wbsNodeId?: string;
  code: string;
  name: string;
  status: string;
  disciplineKey?: string;
  resolvedAt: string;
};

export type ActivityReference = SharedProjectDomainReferenceBase & {
  kind: "activity";
  activityId: string;
  projectId: string;
  workPackageId?: string;
  wbsNodeId?: string;
  code: string;
  name: string;
  status: string;
  resolvedAt: string;
};

export type MilestoneReference = SharedProjectDomainReferenceBase & {
  kind: "milestone";
  milestoneId: string;
  projectId: string;
  phaseId?: string;
  code: string;
  name: string;
  status: string;
  /** Declared target date. Not a computed schedule date — no CPM here. */
  targetDate?: string;
  resolvedAt: string;
};

export type CalendarReference = SharedProjectDomainReferenceBase & {
  kind: "calendar";
  calendarId: string;
  projectId?: string;
  code: string;
  name: string;
  /** Identity only. Working-time arithmetic is reserved, never performed here. */
  timezone?: string;
  resolvedAt: string;
};

export type OrganizationReference = SharedProjectDomainReferenceBase & {
  kind: "organization";
  organizationId: string;
  code: string;
  name: string;
  role?: string;
  resolvedAt: string;
};

export type DisciplineReference = SharedProjectDomainReferenceBase & {
  kind: "discipline";
  disciplineId: string;
  disciplineKey: string;
  name: string;
  resolvedAt: string;
};

export type LocationReference = SharedProjectDomainReferenceBase & {
  kind: "location";
  locationId: string;
  projectId?: string;
  code: string;
  name: string;
  resolvedAt: string;
};

export type SharedProjectDomainReference =
  | ProjectReference
  | PhaseReference
  | WbsReference
  | WorkPackageReference
  | ActivityReference
  | MilestoneReference
  | CalendarReference
  | OrganizationReference
  | DisciplineReference
  | LocationReference;

export type SharedProjectDomainReferenceKind = SharedProjectDomainReference["kind"];

export const SHARED_PROJECT_DOMAIN_REFERENCE_KINDS = [
  "project",
  "phase",
  "wbs_node",
  "work_package",
  "activity",
  "milestone",
  "calendar",
  "organization",
  "discipline",
  "location",
] as const;

/**
 * A scope a consumer may attach intelligence to. Consumers persist the scope
 * kind plus the reference id; they never copy the reference payload as truth.
 */
export type ProjectScopeKind =
  | "project"
  | "phase"
  | "wbs_node"
  | "work_package"
  | "activity"
  | "milestone";

export const PROJECT_SCOPE_KINDS = [
  "project",
  "phase",
  "wbs_node",
  "work_package",
  "activity",
  "milestone",
] as const;

export type ProjectScope = {
  kind: ProjectScopeKind;
  projectId: string;
  /** Set for every scope kind except `project`. */
  referenceId?: string;
};

export function isProjectScopeResolvable(scope: ProjectScope): boolean {
  if (!scope.projectId) return false;
  if (scope.kind === "project") return true;
  return Boolean(scope.referenceId);
}

/** Guards a consumer against treating a reference as writable state. */
export function assertReferenceIsReadOnly(reference: SharedProjectDomainReference): void {
  if (reference.owner !== CANONICAL_PROJECT_IDENTITY_OWNERSHIP) {
    throw new Error("project_reference_owner_mismatch");
  }
  if (reference.mutable !== false) {
    throw new Error("project_reference_must_be_read_only");
  }
}
