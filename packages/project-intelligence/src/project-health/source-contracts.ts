/**
 * Read-only composition ports. PI never owns these records.
 */

import type { ProjectHealthEvidenceReference, ProjectHealthSourceDomain } from "./types";

export type CanonicalEntityRef = {
  id: string;
  entityType: string;
  storesCanonicalCopy: false;
};

export type BoundCollection<T> =
  | { bound: false }
  | { bound: true; items: readonly T[]; sourceTimestamp?: string };

export type ProjectIdentityRef = {
  projectId: string;
  tenantId?: string;
  workspaceId?: string;
  projectCode?: string;
  projectName?: string;
  phase?: string;
  status?: string;
  storesCanonicalCopy: false;
};

export type CanonicalRegisterItemRef = CanonicalEntityRef & {
  status: string;
  priority?: string;
  score?: number;
  open: boolean;
  dueAt?: string;
  sourceTimestamp?: string;
};

export type CanonicalDocumentRef = CanonicalEntityRef & {
  entityType: "document";
  sourceTimestamp?: string;
};

export type CanonicalAssetRef = CanonicalEntityRef & {
  entityType: "asset";
  sourceTimestamp?: string;
};

export type ProjectCoreSnapshot = {
  project: ProjectIdentityRef | null;
  risks: BoundCollection<CanonicalRegisterItemRef>;
  issues: BoundCollection<CanonicalRegisterItemRef>;
  decisions: BoundCollection<CanonicalRegisterItemRef>;
  actions: BoundCollection<CanonicalRegisterItemRef>;
  technicalQueries: BoundCollection<CanonicalRegisterItemRef>;
  documents: BoundCollection<CanonicalDocumentRef>;
  assets: BoundCollection<CanonicalAssetRef>;
};

export type ProjectCoreSource = {
  readonly sourceDomain: "engineering_core";
  readonly mutatesCanonicalState: false;
  load(input: {
    tenantId: string;
    workspaceId: string;
    projectId: string;
  }): Promise<ProjectCoreSnapshot>;
};

export type PublishedControlsOutput = {
  assessmentId: string;
  projectId: string;
  published: boolean;
  abstained: boolean;
  posture?: string;
  assessedAt?: string;
  publishedAt?: string;
  version?: string | number;
  storesCanonicalCopy: false;
};

export type ProjectControlsSnapshot = {
  schedule: PublishedControlsOutput | null;
  cost: PublishedControlsOutput | null;
  progress: PublishedControlsOutput | null;
  change: PublishedControlsOutput | null;
  forecast: PublishedControlsOutput | null;
  invokedScheduleEngine: false;
  invokedCostEngine: false;
  invokedProgressEngine: false;
  invokedChangeEngine: false;
  invokedForecastEngine: false;
  invokedEarnedValueEngine: false;
};

export type ProjectControlsSource = {
  readonly sourceDomain: "project_controls";
  readonly mutatesCanonicalState: false;
  readonly invokesControlsEngine: false;
  load(input: {
    tenantId: string;
    workspaceId: string;
    projectId: string;
  }): Promise<ProjectControlsSnapshot>;
};

export type KnowledgeFindingRef = CanonicalEntityRef & {
  entityType: "finding";
  status: string;
  severity?: string;
  category?: string;
  open: boolean;
  sourceTimestamp?: string;
};

export type ProjectKnowledgeSnapshot = {
  findings: BoundCollection<KnowledgeFindingRef>;
  inspectionFindings: BoundCollection<KnowledgeFindingRef>;
};

export type ProjectKnowledgeSource = {
  readonly sourceDomain: Extract<
    ProjectHealthSourceDomain,
    "project_intelligence" | "inspection_intelligence"
  >;
  readonly mutatesCanonicalState: false;
  load(input: {
    tenantId: string;
    workspaceId: string;
    projectId: string;
  }): Promise<ProjectKnowledgeSnapshot>;
};

export type ProjectHealthSourceBundle = {
  core: ProjectCoreSource;
  controls: ProjectControlsSource;
  knowledge: ProjectKnowledgeSource;
};

export function evidenceFromCanonical(
  sourceDomain: ProjectHealthSourceDomain,
  item: CanonicalEntityRef & { sourceTimestamp?: string },
  sourceVersion?: string,
): ProjectHealthEvidenceReference {
  return {
    sourceDomain,
    entityType: item.entityType,
    entityId: item.id,
    sourceTimestamp: item.sourceTimestamp,
    sourceVersion,
    storesCanonicalCopy: false,
  };
}

export function evidenceFromControls(
  output: PublishedControlsOutput,
  entityType: string,
): ProjectHealthEvidenceReference {
  return {
    sourceDomain: "project_controls",
    entityType,
    entityId: output.assessmentId,
    sourceTimestamp: output.publishedAt ?? output.assessedAt,
    sourceVersion: output.version === undefined ? undefined : String(output.version),
    storesCanonicalCopy: false,
  };
}
