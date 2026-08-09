/**
 * Internal adversarial finding model (INTERNAL only — not external pen-test findings).
 */
export type InternalSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";

export type InternalFindingStatus =
  | "open"
  | "fixed"
  | "accepted_risk"
  | "not_reproducible"
  | "deferred_non_blocking";

export type InternalSecurityFinding = {
  findingId: string;
  surface: string;
  attackVector: string;
  severity: InternalSeverity;
  exploitability: "confirmed" | "theoretical" | "tooling_only";
  tenantImpact: "none" | "single_tenant" | "cross_tenant" | "platform";
  dataImpact: "none" | "metadata" | "customer_data" | "secrets";
  evidence: string;
  status: InternalFindingStatus;
  remediation: string;
  regressionTest: string;
};

/** Seed register — open CRITICAL/HIGH must be empty for 16C.1 PASS. */
export const INTERNAL_SECURITY_FINDINGS: InternalSecurityFinding[] = [
  {
    findingId: "IAS-001",
    surface: "enterprise_sso",
    attackVector: "password_fallback_when_sso_required",
    severity: "HIGH",
    exploitability: "confirmed",
    tenantImpact: "single_tenant",
    dataImpact: "none",
    evidence: "passwordFallbackAllowed(required policy)=false; regression suite denies fallback",
    status: "fixed",
    remediation: "Preserve fail-closed passwordFallbackAllowed for required SSO modes",
    regressionTest: "runInternalAdversarialSuite / sso.password_fallback_denied",
  },
  {
    findingId: "IAS-002",
    surface: "tenant_isolation",
    attackVector: "cross_tenant_resource_idor",
    severity: "CRITICAL",
    exploitability: "confirmed",
    tenantImpact: "cross_tenant",
    dataImpact: "customer_data",
    evidence: "authorizeResourceAccess denies principal.tenantId !== resource.tenantId for all surfaces",
    status: "fixed",
    remediation: "Fail-closed tenant check on adversarial authorization helper + suite matrix",
    regressionTest: "runInternalAdversarialSuite / tenant.cross_tenant_matrix",
  },
  {
    findingId: "IAS-003",
    surface: "oidc",
    attackVector: "issuer_audience_state_nonce_replay",
    severity: "CRITICAL",
    exploitability: "confirmed",
    tenantImpact: "platform",
    dataImpact: "none",
    evidence: "completeFederatedLogin fail-closes issuer/audience/state/nonce/replay (16B engine)",
    status: "fixed",
    remediation: "Retain OIDC fail-closed validation; covered by adversarial SSO negatives",
    regressionTest: "runInternalAdversarialSuite / sso.oidc_negatives",
  },
  {
    findingId: "IAS-004",
    surface: "ai_context",
    attackVector: "cross_tenant_prompt_context_leak",
    severity: "HIGH",
    exploitability: "confirmed",
    tenantImpact: "cross_tenant",
    dataImpact: "customer_data",
    evidence: "evaluateAiContextAccess denies foreign tenant memory/context ids",
    status: "fixed",
    remediation: "Tenant-bound AI context gate in adversarial suite",
    regressionTest: "runInternalAdversarialSuite / ai.cross_tenant_context",
  },
  {
    findingId: "IAS-005",
    surface: "execution_host",
    attackVector: "cross_tenant_job_access",
    severity: "HIGH",
    exploitability: "confirmed",
    tenantImpact: "cross_tenant",
    dataImpact: "customer_data",
    evidence: "evaluateExecutionHostAccess denies foreign tenant job/workspace",
    status: "fixed",
    remediation: "Execution-host negative matrix in adversarial suite",
    regressionTest: "runInternalAdversarialSuite / execution.cross_tenant",
  },
  {
    findingId: "IAS-006",
    surface: "security_assurance",
    attackVector: "viewer_internal_finding_disclosure",
    severity: "MEDIUM",
    exploitability: "confirmed",
    tenantImpact: "single_tenant",
    dataImpact: "metadata",
    evidence: "viewer denied security_assurance surface",
    status: "fixed",
    remediation: "Role gate for internal assurance surfaces",
    regressionTest: "runInternalAdversarialSuite / assurance.disclosure_negatives",
  },
  {
    findingId: "IAS-007",
    surface: "files",
    attackVector: "path_traversal_object_id_tamper",
    severity: "HIGH",
    exploitability: "confirmed",
    tenantImpact: "cross_tenant",
    dataImpact: "customer_data",
    evidence: "sanitizeArtifactPath rejects traversal; authorize rejects foreign object ids",
    status: "fixed",
    remediation: "Path sanitize + object tenant binding checks",
    regressionTest: "runInternalAdversarialSuite / files.path_and_idor",
  },
  {
    findingId: "IAS-INFO-001",
    surface: "program",
    attackVector: "s07_deferral_misinterpretation",
    severity: "INFO",
    exploitability: "theoretical",
    tenantImpact: "none",
    dataImpact: "none",
    evidence: "S07Status=DEFERRED; S07RequirementWaived=false; ExternalPenTestStillRequiredForTier1=true",
    status: "fixed",
    remediation: "Document deferral ≠ waiver; preserve 16C S07 closure criteria",
    regressionTest: "flags + S07_EXTERNAL_PEN_TEST_DEFERRAL.md",
  },
];

export function listOpenCriticalHigh(
  findings: InternalSecurityFinding[] = INTERNAL_SECURITY_FINDINGS,
): InternalSecurityFinding[] {
  return findings.filter(
    (f) =>
      (f.severity === "CRITICAL" || f.severity === "HIGH") && f.status === "open",
  );
}

export function summarizeInternalFindings(
  findings: InternalSecurityFinding[] = INTERNAL_SECURITY_FINDINGS,
) {
  const openCriticalHigh = listOpenCriticalHigh(findings);
  return {
    total: findings.length,
    openCriticalHigh: openCriticalHigh.length,
    KnownCriticalInternalSecurityFindingOpen: openCriticalHigh.some(
      (f) => f.severity === "CRITICAL",
    ),
    KnownHighInternalSecurityFindingOpen: openCriticalHigh.some(
      (f) => f.severity === "HIGH",
    ),
    internalOnly: true,
    substitutesForExternalPenTest: false,
  };
}
