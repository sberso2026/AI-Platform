/**
 * Production-safe Secure Compute fixture harness.
 * Controlled tenants A/B — does not mutate auth/RLS/policies/runtime.
 * Evidence contains refs/status only (no secrets).
 */

import type { SecureComputePlane, SecureComputeResult } from "../../secure-compute-contracts";

export type SecureComputeFixtureOutcome = {
  decision: "allow" | "deny" | "unknown";
  result: SecureComputeResult;
  targetRef: string;
  attributable?: boolean;
  isolationBoundary?: "process" | "job" | "sandbox" | "host" | "unknown";
  policyDecisionRef?: string;
  artefactHashRef?: string;
  limitations?: string;
};

const TENANT_A = "tenant_a";
const TENANT_B = "tenant_b";
const WORKSPACE_A = "workspace_a";
const WORKSPACE_B = "workspace_b";

const HARNESS: Record<string, () => SecureComputeFixtureOutcome> = {
  "identity.attributable": () => ({
    decision: "allow",
    result: "pass",
    targetRef: `workload:${TENANT_A}/job-1`,
    attributable: true,
  }),
  "identity.missing_fail_closed": () => ({
    decision: "unknown",
    result: "not_assessed",
    targetRef: "workload:missing-identity",
    attributable: false,
    limitations: "Missing workload identity — never PASS",
  }),
  "scope.cross_tenant_deny": () => ({
    decision: "deny",
    result: "pass",
    targetRef: `exec:${TENANT_B}/denied`,
  }),
  "scope.cross_workspace_deny": () => ({
    decision: "deny",
    result: "pass",
    targetRef: `exec:${TENANT_A}/${WORKSPACE_B}/denied`,
  }),
  "authz.role_insufficient_deny": () => ({
    decision: "deny",
    result: "pass",
    targetRef: `authz:${TENANT_A}/insufficient-role`,
    policyDecisionRef: "policy:deny-insufficient-role",
  }),
  "authz.policy_linked": () => ({
    decision: "allow",
    result: "pass",
    targetRef: `authz:${TENANT_A}/${WORKSPACE_A}/allowed`,
    policyDecisionRef: "policy:allow-exec-v1",
  }),
  "runtime.isolation_assessed": () => ({
    decision: "allow",
    result: "pass",
    targetRef: "runtime:process-boundary",
    isolationBoundary: "process",
    limitations: "Assesses existing process/job/sandbox boundaries only",
  }),
  "filesystem.scope_where_supported": () => ({
    decision: "allow",
    result: "pass",
    targetRef: `fs:${TENANT_A}/${WORKSPACE_A}/authorized`,
  }),
  "network.egress_unknown": () => ({
    decision: "unknown",
    result: "not_assessed",
    targetRef: "network:policy-unknown",
    limitations: "Unknown network policy => not_assessed",
  }),
  "secret.authorised_ref": () => ({
    decision: "allow",
    result: "pass",
    targetRef: "secret:sm-ref-only",
  }),
  "resource.limits_semantics": () => ({
    decision: "allow",
    result: "partial",
    targetRef: "resource:cpu-mem-time",
    limitations: "Some resource controls NOT_APPLICABLE where unsupported",
  }),
  "timeout.error_not_pass": () => ({
    decision: "deny",
    result: "pass",
    targetRef: "timeout:cancelled",
    limitations: "Timeout/error handling evidenced; errors never PASS",
  }),
  "artefact.hash_preserved": () => ({
    decision: "allow",
    result: "pass",
    targetRef: "artefact:tool-v1",
    artefactHashRef: "sha256:fixture-artefact-hash",
  }),
  "provenance.linked": () => ({
    decision: "allow",
    result: "pass",
    targetRef: `prov:${TENANT_A}/exec-1`,
    policyDecisionRef: "policy:allow-exec-v1",
  }),
  "output.scope_preserved": () => ({
    decision: "allow",
    result: "pass",
    targetRef: `output:${TENANT_A}/${WORKSPACE_A}/result-1`,
  }),
  "temp.cleanup_where_supported": () => ({
    decision: "allow",
    result: "pass",
    targetRef: "temp:ephemeral-cleanup",
    limitations: "Cleanup assessed where infrastructure supports it",
  }),
  "logging.no_secret_persist": () => ({
    decision: "allow",
    result: "pass",
    targetRef: "log:redacted-compute-evidence",
  }),
  "host.posture_unknown": () => ({
    decision: "unknown",
    result: "not_assessed",
    targetRef: "host:posture-unknown",
    limitations: "Host security posture not fully evidenced — not_assessed",
  }),
  "background.job_scope": () => ({
    decision: "allow",
    result: "pass",
    targetRef: `bgjob:${TENANT_A}/${WORKSPACE_A}/job-1`,
  }),
  "tee.not_applicable": () => ({
    decision: "unknown",
    result: "not_applicable",
    targetRef: "tee:absent",
    limitations: "TEE/confidential computing NOT_APPLICABLE — no fabricated claim",
  }),
};

export function runSecureComputeHarness(harnessKey: string): SecureComputeFixtureOutcome {
  const runner = HARNESS[harnessKey];
  if (!runner) throw new Error(`Unknown secure-compute harness key: ${harnessKey}`);
  return runner();
}

export function secureComputePlaneHarnessKeys(plane: SecureComputePlane): string[] {
  const map: Record<SecureComputePlane, string[]> = {
    WORKLOAD_IDENTITY: ["identity.attributable", "identity.missing_fail_closed"],
    TENANT_WORKSPACE_SCOPE: ["scope.cross_tenant_deny", "scope.cross_workspace_deny"],
    EXECUTION_AUTHORIZATION: ["authz.role_insufficient_deny", "authz.policy_linked"],
    RUNTIME_ISOLATION: ["runtime.isolation_assessed"],
    FILESYSTEM_SCOPE: ["filesystem.scope_where_supported"],
    NETWORK_EGRESS: ["network.egress_unknown"],
    SECRET_ACCESS: ["secret.authorised_ref"],
    RESOURCE_LIMITS: ["resource.limits_semantics"],
    EXECUTION_TIMEOUT: ["timeout.error_not_pass"],
    ARTEFACT_INTEGRITY: ["artefact.hash_preserved"],
    EXECUTION_PROVENANCE: ["provenance.linked"],
    OUTPUT_HANDLING: ["output.scope_preserved"],
    TEMPORARY_DATA: ["temp.cleanup_where_supported"],
    LOGGING_TELEMETRY: ["logging.no_secret_persist"],
    HOST_POSTURE: ["host.posture_unknown", "tee.not_applicable"],
  };
  return map[plane];
}

export function listSecureComputeHarnessKeys(): string[] {
  return Object.keys(HARNESS);
}
