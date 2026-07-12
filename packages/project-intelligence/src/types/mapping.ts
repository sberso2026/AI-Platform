export enum MappingStatus {
  Discovered = "discovered",
  Candidate = "candidate",
  Matched = "matched",
  Conflict = "conflict",
  PendingReview = "pending_review",
  Approved = "approved",
  Migrated = "migrated",
  Verified = "verified",
  Failed = "failed",
  RolledBack = "rolled_back",
  Retired = "retired",
}

export interface ProjectMapping {
  id: string;
  tenantId: string;
  workspaceId: string;
  engineeringProjectId: string;
  legacyProjectIntelligenceProjectId: string;
  status: MappingStatus;
  confidenceScore: number;
  matchMethod?: string;
  conflictState?: string;
  migrationSource?: string;
  migrationVersion?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  lastSyncAt?: string;
  lastSyncStatus?: string;
  legacySourceSystem?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface MappingEvidence {
  source: string;
  field: string;
  value: string;
  weight?: number;
}
