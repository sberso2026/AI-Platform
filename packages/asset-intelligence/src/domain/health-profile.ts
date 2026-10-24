/**
 * Phase 10D — Asset Health Profile (dimensional health contract).
 * Does not collapse condition / criticality / reliability into one opaque number.
 */

import type { Provenance } from "../architecture/identity-state";
import type { EvidenceConfidenceAssessment } from "./evidence-confidence";
import type { HealthCompositionMethod } from "./health-composer";

export type HealthProfileLifecycle =
  | "draft"
  | "calculated"
  | "pending_review"
  | "approved"
  | "rejected"
  | "published"
  | "superseded"
  | "archived";

export type AssetHealthProfile = {
  profileId: string;
  assetId: string;
  tenantId: string;
  workspaceId: string;
  snapshotId?: string;
  compositionMethod: HealthCompositionMethod;
  compositionVersion: string;
  conditionStateRef?: string;
  conditionContribution?: number;
  reliabilityStateRef?: string;
  reliabilityContribution?: number | "unavailable";
  evidenceConfidenceRef?: string;
  evidenceConfidence?: EvidenceConfidenceAssessment;
  overallHealth?: number;
  overallHealthClass?: string;
  overallHealthConfidence?: number;
  /** Context only — never a physical-health degradation factor in v2+. */
  criticalityStateRef?: string;
  criticalityContext?: {
    criticalityClass?: string;
    criticalityScore?: number;
    isHealthFactor: false;
  };
  priorityContext?: { reserved: true; engine: "AssetPriorityEngine" };
  limitations: string[];
  calculatedAt: string;
  reviewStatus: HealthProfileLifecycle;
  publishedAt?: string;
  provenance: Provenance;
  silentIdentityMutationForbidden: true;
  accuracyClaimsCertified: false;
  rulClaimsCertified: false;
  probabilityOfFailureCertified: false;
  criticalityIsHealthFactor: false;
};
