export const RELEASE_STATES = [
  "DEVELOPMENT",
  "STAGING_ONLY",
  "STAGING_VALIDATED",
  "RELEASE_CANDIDATE",
  "PRODUCTION_APPROVED",
  "PRODUCTION_APPLIED",
  "SUPERSEDED",
  "BLOCKED",
] as const;

export type ReleaseState = (typeof RELEASE_STATES)[number];

export const DRIFT_CLASSES = [
  "EXPECTED_FEATURE_DRIFT",
  "SECURITY_BACKPORT",
  "RELEASE_CANDIDATE_NOT_PROMOTED",
  "SUPERSEDED",
  "UNKNOWN_DRIFT",
  "MISSING_DEPENDENCY",
  "NONE",
] as const;

export type DriftClass = (typeof DRIFT_CLASSES)[number];

export const PROVENANCE_DISPOSITIONS = ["RECOVERED", "SUPERSEDED", "RETIRED", "BLOCKED"] as const;
export type ProvenanceDisposition = (typeof PROVENANCE_DISPOSITIONS)[number];

export const PROVENANCE_RECOVERY_CLASSES = [
  "RECOVERED_EXACT",
  "RECOVERED_FROM_TRUSTED_HISTORY",
  "EQUIVALENT_STATE_PROVEN",
  "SUPERSEDED_WITH_EVIDENCE",
  "FORMALLY_RETIRED",
  "UNRESOLVED_BLOCKED",
] as const;
export type ProvenanceRecoveryClass = (typeof PROVENANCE_RECOVERY_CLASSES)[number];

export type MigrationProvenance = {
  disposition: ProvenanceDisposition;
  recoveryClass: ProvenanceRecoveryClass;
  sourceCommit?: string | null;
  sourcePath?: string | null;
  historicalPath?: string | null;
  checksum?: string | null;
  originalFilename?: string | null;
  hostedLedgerName?: string | null;
  sourceBranch?: string | null;
  supersedingMigration?: string | null;
  securityRelevant?: boolean;
  securityRelevanceNotes?: string;
  currentSchemaRelevance?: string;
  confidence?: "HIGH" | "MEDIUM" | "LOW";
  evidence?: string;
};

export const STAGING_PROJECT_REF = "rntonzigxwxcjlcsadip";
export const PRODUCTION_PROJECT_REF = "wcydlhqiqdwgoaqrlget";
export const INSPECTION_PROJECT_REF = "hlqwihvksjgkshipoacd";
export const INTRANET_PRODUCTION_PROJECT_REF = "vspyrlgvkpcsprzvrorb";

export type MigrationRecord = {
  id: string;
  file: string | null;
  historicalFile: string | null;
  module: string;
  releaseState: ReleaseState;
  driftClass: DriftClass;
  stagingApplied: boolean;
  productionApplied: boolean;
  productionEligible: boolean;
  securityCritical: boolean;
  destructive: boolean;
  featureDependent: boolean;
  dependsOn: string[];
  supersededBy: string | null;
  backports: string[];
  notes: string;
  provenance: MigrationProvenance | null;
};

export type ManifestOverride = Partial<
  Omit<MigrationRecord, "id" | "stagingApplied" | "productionApplied">
> & { id: string };

export type ReleaseManifest = {
  version: 1;
  environments: {
    staging: { projectRef: string; name: string };
    production: { projectRef: string; name: string };
  };
  ledgers: {
    capturedAt: string;
    staging: string[];
    production: string[];
  };
  overrides: ManifestOverride[];
};

export type PromotionDecision =
  | { ok: true }
  | { ok: false; code: string; detail: string };
