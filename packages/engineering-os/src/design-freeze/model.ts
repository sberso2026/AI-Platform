import type { BaselineType } from "../delivery-lifecycle/model";

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

export const ISSUE_PURPOSES = [
  "WORKING",
  "INTERNAL_REVIEW",
  "INTERDISCIPLINE_REVIEW",
  "CLIENT_REVIEW",
  "INFORMATION",
  "APPROVAL",
  "TENDER",
  "PROCUREMENT",
  "CONSTRUCTION",
  "AS_BUILT",
  "ARCHIVE",
] as const;
export type IssuePurpose = (typeof ISSUE_PURPOSES)[number];

export const AI_FREEZE_APPROVAL_AUTHORITY = false as const;
export const AI_DELIVERABLE_APPROVAL_AUTHORITY = false as const;
export const AI_RELEASE_AUTHORITY = false as const;
export const AI_IFC_RELEASE_AUTHORITY = false as const;
export const AI_BASELINE_MUTATION_AUTHORITY = false as const;

export const EXTERNAL_DMS_ADAPTER_OPERATIONS = [
  "register_deliverable",
  "retrieve_revision",
  "retrieve_issue_status",
  "retrieve_checksum",
  "retrieve_transmittal",
  "map_lifecycle",
  "map_issue_purpose",
] as const;

export type RevisionRef = {
  objectId: string;
  revision: string;
  status: string;
  source: string;
  discipline: Discipline;
};

export type FreezeException = {
  id: string;
  discipline: Discipline;
  objectId: string;
  rationale: string;
  condition: string;
  status: "open" | "closed";
};

export type FreezeRecord = {
  id: string;
  freezeType: BaselineType;
  stage: string;
  title: string;
  scope: string;
  disciplines: Discipline[];
  items: RevisionRef[];
  exceptions: FreezeException[];
  frozen: boolean;
  fingerprint: string;
  approvalStatus: "pending" | "approved";
};

export type DeliverableRecord = {
  id: string;
  discipline: Discipline;
  deliverableType: string;
  number: string;
  title: string;
  revision: string;
  stage: string;
  issuePurpose: IssuePurpose;
  engineeringStatus: string;
  reviewStatus: string;
  approvalStatus: string;
  releaseStatus: string;
  current: boolean;
  dependencies: RevisionRef[];
  freshness: "current" | "potentially_stale";
  disposition: string | null;
  checksum: string;
  plannedDate: string | null;
  issuedDate: string | null;
  withdrawnReason: string | null;
  withdrawalAuthority: string | null;
  withdrawalDate: string | null;
  replacementId: string | null;
  baselineId: string | null;
};

export type PackageRecord = {
  id: string;
  packageType: string;
  deliverableIds: string[];
  requiredIds: string[];
  released: boolean;
};

export type TransmittalRecord = {
  id: string;
  packageId: string;
  deliverableIds: string[];
  issuePurpose: IssuePurpose;
  sender: string;
  recipients: string[];
  issueDate: string;
  status: string;
};

export type FreezeAudit = {
  action: string;
  at: string;
  actorId: string;
  actingRole: string;
  detail: Record<string, string | number | boolean | null>;
};

export type FreezeRegister = {
  id: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  projectTitle: string;
  freezes: FreezeRecord[];
  deliverables: DeliverableRecord[];
  packages: PackageRecord[];
  transmittals: TransmittalRecord[];
  audits: FreezeAudit[];
  events: Array<{ type: string; id: string }>;
  a4Replaced: false;
  documentsReplaced: false;
};
