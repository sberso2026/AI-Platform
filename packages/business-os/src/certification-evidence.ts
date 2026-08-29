/**
 * Canonical BOS certification evidence model.
 * Owned with existing Business OS release + Platform Certification consumers.
 * Evidence is not a release declaration. Do not infer live-provider PASS from fixtures.
 */

export const BOS_CERTIFICATION_PRODUCT = "business-os" as const;
export const BOS_DEDICATED_STAGING_PROJECT_REF = "rntonzigxwxcjlcsadip" as const;
export const BOS_SHARED_HOST_PROJECT_REF = "wcydlhqiqdwgoaqrlget" as const;
export const BOS_16_CERTIFIED_BASELINE_SHA = "063c4826472423b5115bb23857e3593949a5a66e" as const;

export type CertificationExecutionMode = "static" | "fixture" | "sandbox" | "live" | "browser";
export type CertificationEvidenceResult = "pass" | "fail" | "blocked" | "skipped";
export type CertificationEnvironmentClass = "local" | "staging" | "fixture" | "live-provider" | "static";
export type CertificationEvidenceType =
  | "rls_isolation"
  | "browser_e2e"
  | "provider_live"
  | "provider_security_architecture"
  | "internal_regression"
  | "connector_fixture";

export type BosCertificationGateId =
  | "live_rls"
  | "browser_e2e"
  | "xero_live"
  | "microsoft365_live"
  | "hubspot_live"
  | "xero_security_architecture"
  | "microsoft365_security_architecture"
  | "hubspot_security_architecture"
  | "ai_workforce_regression"
  | "internal_architecture";

export type BosSecurityBoundary =
  | "tenant_workspace_rls"
  | "browser_e2e_fixture"
  | "connector_live_provider"
  | "connector_security_architecture"
  | "workforce_authority"
  | "internal_architecture";

export type BosProviderReleaseStatus = "NOT_AVAILABLE" | "PREVIEW" | "BETA" | "CERTIFIED";

export type CertificationEvidenceRecord = {
  certification_id: string;
  product: typeof BOS_CERTIFICATION_PRODUCT;
  version: string;
  commitSha: string;
  environmentId: string;
  environmentClass: CertificationEnvironmentClass;
  stagingProjectRef?: string;
  gateId: BosCertificationGateId;
  evidenceType: CertificationEvidenceType;
  executionMode: CertificationExecutionMode;
  result: CertificationEvidenceResult;
  executedAt: string;
  suiteId: string;
  artifactRef: string;
  limitations: readonly string[];
  supersedes?: string;
};

export type EvidenceCompatibilityClaim = {
  kind: "fresh" | "certified_ancestor";
  ancestorSha?: string;
  currentSha: string;
  unaffectedBoundaries: readonly BosSecurityBoundary[];
  provenance: string;
};

export type BosCertificationGateDefinition = {
  id: BosCertificationGateId;
  securityBoundary: BosSecurityBoundary;
  requiredExecutionModes: readonly CertificationExecutionMode[];
  acceptedEvidenceTypes: readonly CertificationEvidenceType[];
  liveProvider: boolean;
  provider?: "xero" | "microsoft_365" | "hubspot";
  mandatoryForPreGaInternal: boolean;
  mandatoryForProduction: boolean;
};

export const BOS_CERTIFICATION_GATES: Record<BosCertificationGateId, BosCertificationGateDefinition> = {
  live_rls: {
    id: "live_rls",
    securityBoundary: "tenant_workspace_rls",
    requiredExecutionModes: ["live"],
    acceptedEvidenceTypes: ["rls_isolation"],
    liveProvider: false,
    mandatoryForPreGaInternal: true,
    mandatoryForProduction: true,
  },
  browser_e2e: {
    id: "browser_e2e",
    securityBoundary: "browser_e2e_fixture",
    requiredExecutionModes: ["browser"],
    acceptedEvidenceTypes: ["browser_e2e"],
    liveProvider: false,
    mandatoryForPreGaInternal: true,
    mandatoryForProduction: true,
  },
  xero_live: {
    id: "xero_live",
    securityBoundary: "connector_live_provider",
    requiredExecutionModes: ["live"],
    acceptedEvidenceTypes: ["provider_live"],
    liveProvider: true,
    provider: "xero",
    mandatoryForPreGaInternal: false,
    mandatoryForProduction: true,
  },
  microsoft365_live: {
    id: "microsoft365_live",
    securityBoundary: "connector_live_provider",
    requiredExecutionModes: ["live"],
    acceptedEvidenceTypes: ["provider_live"],
    liveProvider: true,
    provider: "microsoft_365",
    mandatoryForPreGaInternal: false,
    mandatoryForProduction: true,
  },
  hubspot_live: {
    id: "hubspot_live",
    securityBoundary: "connector_live_provider",
    requiredExecutionModes: ["live"],
    acceptedEvidenceTypes: ["provider_live"],
    liveProvider: true,
    provider: "hubspot",
    mandatoryForPreGaInternal: false,
    mandatoryForProduction: true,
  },
  xero_security_architecture: {
    id: "xero_security_architecture",
    securityBoundary: "connector_security_architecture",
    requiredExecutionModes: ["static", "fixture"],
    acceptedEvidenceTypes: ["provider_security_architecture"],
    liveProvider: false,
    provider: "xero",
    mandatoryForPreGaInternal: true,
    mandatoryForProduction: true,
  },
  microsoft365_security_architecture: {
    id: "microsoft365_security_architecture",
    securityBoundary: "connector_security_architecture",
    requiredExecutionModes: ["static", "fixture"],
    acceptedEvidenceTypes: ["provider_security_architecture"],
    liveProvider: false,
    provider: "microsoft_365",
    mandatoryForPreGaInternal: true,
    mandatoryForProduction: true,
  },
  hubspot_security_architecture: {
    id: "hubspot_security_architecture",
    securityBoundary: "connector_security_architecture",
    requiredExecutionModes: ["static", "fixture"],
    acceptedEvidenceTypes: ["provider_security_architecture"],
    liveProvider: false,
    provider: "hubspot",
    mandatoryForPreGaInternal: true,
    mandatoryForProduction: true,
  },
  ai_workforce_regression: {
    id: "ai_workforce_regression",
    securityBoundary: "workforce_authority",
    requiredExecutionModes: ["fixture"],
    acceptedEvidenceTypes: ["internal_regression"],
    liveProvider: false,
    mandatoryForPreGaInternal: true,
    mandatoryForProduction: true,
  },
  internal_architecture: {
    id: "internal_architecture",
    securityBoundary: "internal_architecture",
    requiredExecutionModes: ["static", "fixture"],
    acceptedEvidenceTypes: ["internal_regression"],
    liveProvider: false,
    mandatoryForPreGaInternal: true,
    mandatoryForProduction: true,
  },
};

export type GateEvidenceState = "pass" | "fail" | "blocked" | "missing" | "incompatible" | "skipped";

export type GateEvaluation = {
  gateId: BosCertificationGateId;
  state: GateEvidenceState;
  reason: string;
  evidenceId: string | null;
};

function normalizeSha(sha: string): string {
  return sha.trim().toLowerCase();
}

export function evidenceCompatibleWithCommit(input: {
  evidence: CertificationEvidenceRecord;
  currentCommitSha: string;
  claim?: EvidenceCompatibilityClaim;
  gateBoundary: BosSecurityBoundary;
}): boolean {
  if (normalizeSha(input.evidence.commitSha) === normalizeSha(input.currentCommitSha)) {
    return true;
  }
  const claim = input.claim;
  if (!claim || claim.kind !== "certified_ancestor") return false;
  if (!claim.provenance.trim()) return false;
  if (normalizeSha(claim.currentSha) !== normalizeSha(input.currentCommitSha)) return false;
  if (!claim.ancestorSha || normalizeSha(claim.ancestorSha) !== normalizeSha(input.evidence.commitSha)) {
    return false;
  }
  return claim.unaffectedBoundaries.includes(input.gateBoundary);
}

export function evidenceMaySatisfyGate(
  evidence: CertificationEvidenceRecord,
  gate: BosCertificationGateDefinition,
): boolean {
  if (evidence.gateId !== gate.id) return false;
  if (evidence.result !== "pass") return false;
  if (!(gate.requiredExecutionModes as readonly string[]).includes(evidence.executionMode)) return false;
  if (!(gate.acceptedEvidenceTypes as readonly string[]).includes(evidence.evidenceType)) return false;
  if (gate.liveProvider && evidence.executionMode !== "live") return false;
  if (evidence.stagingProjectRef === BOS_SHARED_HOST_PROJECT_REF) return false;
  return true;
}

export function evaluateCertificationGate(input: {
  gateId: BosCertificationGateId;
  evidence: readonly CertificationEvidenceRecord[];
  currentCommitSha: string;
  claims?: readonly EvidenceCompatibilityClaim[];
}): GateEvaluation {
  const gate = BOS_CERTIFICATION_GATES[input.gateId];
  const candidates = input.evidence.filter((row) => row.gateId === gate.id);
  if (candidates.length === 0) {
    return { gateId: gate.id, state: "missing", reason: "missing_evidence", evidenceId: null };
  }

  const matchingClaim = (evidence: CertificationEvidenceRecord): EvidenceCompatibilityClaim | undefined =>
    input.claims?.find(
      (claim) =>
        claim.kind === "fresh" ||
        (claim.kind === "certified_ancestor" &&
          normalizeSha(claim.ancestorSha ?? "") === normalizeSha(evidence.commitSha) &&
          normalizeSha(claim.currentSha) === normalizeSha(input.currentCommitSha)),
    );

  const failed = candidates.find((row) => row.result === "fail");
  if (failed && evidenceCompatibleWithCommit({
    evidence: failed,
    currentCommitSha: input.currentCommitSha,
    claim: matchingClaim(failed),
    gateBoundary: gate.securityBoundary,
  })) {
    return { gateId: gate.id, state: "fail", reason: "failed_evidence", evidenceId: failed.certification_id };
  }

  const blocked = candidates.find((row) => row.result === "blocked");
  if (blocked && evidenceCompatibleWithCommit({
    evidence: blocked,
    currentCommitSha: input.currentCommitSha,
    claim: matchingClaim(blocked),
    gateBoundary: gate.securityBoundary,
  })) {
    return { gateId: gate.id, state: "blocked", reason: "blocked_evidence", evidenceId: blocked.certification_id };
  }

  const compatiblePass = candidates.find((row) => {
    if (!evidenceMaySatisfyGate(row, gate)) return false;
    return evidenceCompatibleWithCommit({
      evidence: row,
      currentCommitSha: input.currentCommitSha,
      claim: matchingClaim(row),
      gateBoundary: gate.securityBoundary,
    });
  });
  if (compatiblePass) {
    return { gateId: gate.id, state: "pass", reason: "validated_evidence", evidenceId: compatiblePass.certification_id };
  }

  const modeMismatch = candidates.find((row) => row.result === "pass" && !evidenceMaySatisfyGate(row, gate));
  if (modeMismatch) {
    return {
      gateId: gate.id,
      state: "missing",
      reason: "execution_mode_cannot_satisfy_gate",
      evidenceId: modeMismatch.certification_id,
    };
  }

  const incompatible = candidates.find((row) => row.result === "pass");
  if (incompatible) {
    return {
      gateId: gate.id,
      state: "incompatible",
      reason: "stale_incompatible_evidence",
      evidenceId: incompatible.certification_id,
    };
  }

  const skipped = candidates.find((row) => row.result === "skipped");
  if (skipped) {
    return { gateId: gate.id, state: "skipped", reason: "not_executed", evidenceId: skipped.certification_id };
  }

  return { gateId: gate.id, state: "missing", reason: "missing_pass_evidence", evidenceId: null };
}

export function bosProviderFeatureStatus(input: {
  implemented: boolean;
  securityArchitectureReady: boolean;
  liveExecutionPassed: boolean;
  liveCertified: boolean;
}): BosProviderReleaseStatus {
  if (input.liveCertified && input.liveExecutionPassed) return "CERTIFIED";
  if (!input.implemented) return "NOT_AVAILABLE";
  if (input.securityArchitectureReady) return "PREVIEW";
  return "PREVIEW";
}

export function assertNoSecretsInCertificationPayload(payload: unknown): void {
  const serialized = JSON.stringify(payload);
  if (/eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/i.test(serialized)) {
    throw new Error("certification_secret_leakage");
  }
  if (/(sk-|Bearer |client_secret|refresh_token)/i.test(serialized)) {
    throw new Error("certification_secret_leakage");
  }
}
