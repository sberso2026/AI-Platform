/**
 * EOS 3.13R human General Availability authorization binding.
 * GA_READINESS != GA_AUTHORIZATION; GA_AUTHORIZATION != EXTERNAL_CUSTOMER_RELEASE
 * HUMAN_GO != ENGINEERING_APPROVAL
 */

import { createHash } from "node:crypto";

export const EOS_3_GA_HUMAN_GO = "ISSUED" as const;

export const EOS_3_GA_RELEASE_AUTHORITY = {
  designated: true as const,
  name: "Silvestre Berso",
  role: "Founder, RTB Engineering & Analytics",
  scope: "EOS_3_GENERAL_AVAILABILITY_SOFTWARE_RELEASE_ONLY" as const,
};

/** Frozen GA candidate from EOS 3.13 readiness gate. */
export const EOS_3_GA_AUTHORIZED_CANDIDATE = {
  functionalRuntimeCommit: "429e0452319641b717864c50ce6a40507548a7a9",
  productionDeploymentAtAuthorization: "dpl_8fKpNWQDpXzoaNT7jQXvV8heeZjd",
  productionMigrationLedger: 170,
  candidateFingerprint: "sha256:c5d2bef972bd4a8b108d32b8d762da58a6fe4a301977ac724630479ab25af158",
} as const;

export const EOS_3_GA_AUTHORIZED_CONTROLS = {
  accessModel: "EXPLICIT_ENTITLEMENT_AND_ENROLLMENT",
  accessDefault: "DENY",
  publicSelfServiceSignup: false,
  externalCustomerRelease: "NOT_AUTHORIZED",
  externalCustomerHold: "ACTIVE",
  liveLlm: "NOT_SUPPORTED",
  realConnectors: "NOT_SUPPORTED",
  spaceGassGlobalQualification: false,
  externalSolverGlobalQualification: false,
  d1: "QUALIFIED_BOUNDED",
  nonD1: "NOT_QUALIFIED",
  aiEngineeringAuthority: false,
  aiFinalDecisionAuthority: false,
  aiDeliverableApprovalAuthority: false,
  aiReleaseIfcAuthority: false,
  aiMigrationAuthority: false,
  aiSolverQualificationAuthority: false,
} as const;

export function createEos3GaAuthorizationFingerprint(authorizedAtIso: string): string {
  const payload = {
    candidateFingerprint: EOS_3_GA_AUTHORIZED_CANDIDATE.candidateFingerprint,
    runtimeCommit: EOS_3_GA_AUTHORIZED_CANDIDATE.functionalRuntimeCommit,
    schemaLedger: EOS_3_GA_AUTHORIZED_CANDIDATE.productionMigrationLedger,
    claimMatrixVersion: "EOS_3_13_GA_CLAIM_MATRIX_v1",
    limitationsRegisterVersion: "EOS_3_13_GA_LIMITATIONS_REGISTER_v1",
    defectDisposition: {
      critical: 0,
      high: 0,
      medium: 2,
      low: 2,
      d001: "OPEN_ACCEPTED_FOR_GA",
      d002: "OPEN_ACCEPTED_FOR_GA",
    },
    accessModel: EOS_3_GA_AUTHORIZED_CONTROLS.accessModel,
    accessDefault: EOS_3_GA_AUTHORIZED_CONTROLS.accessDefault,
    releaseAuthority: EOS_3_GA_RELEASE_AUTHORITY,
    externalCustomerHold: EOS_3_GA_AUTHORIZED_CONTROLS.externalCustomerHold,
    humanGo: EOS_3_GA_HUMAN_GO,
    authorizationDecision: "GO",
    authorizedAt: authorizedAtIso,
  };
  return "sha256:" + createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

/**
 * Production EOS 3 access under GA requires issued human GA GO and explicit enrollment.
 * Enrollment state PILOT remains the auditable enrolled marker for controlled workspace rollout
 * (no public self-service; no auto EOS 2 enablement).
 */
export function eos3ProductionGaAccessAllowed(enrollmentState: string | null | undefined): boolean {
  return EOS_3_GA_HUMAN_GO === "ISSUED" && enrollmentState === "PILOT";
}
