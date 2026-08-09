import { describe, expect, it } from "vitest";
import {
  SECURE_COMPUTE_PLANES,
  SECURE_COMPUTE_SEMANTICS,
  isWorkloadAttributable,
} from "./secure-compute-contracts";
import {
  SecureComputeAssuranceReady,
  SecureComputeAssuranceRuntimeImplemented,
  duplicateSandboxDetected,
  getSecurityAssuranceSecureComputeDeclaration,
  phase15FReady,
  WorkloadIdentityAssuranceImplemented,
} from "./secure-compute-flags";
import { createSecureComputeAssuranceRuntime } from "./domain/secure-compute/runtime";
import {
  PHASE_15D_BASELINE_COMMIT,
  SECURITY_ASSURANCE_PUBLIC_CONTRACT_VERSION,
  SECURITY_ASSURANCE_VERSION,
} from "./version";

describe("Phase 15E Secure Compute Assurance", () => {
  it("declares 0.6.0-compliance-intelligence on Phase 15D baseline", () => {
    expect(SECURITY_ASSURANCE_VERSION).toBe("0.6.0-compliance-intelligence");
    expect(SECURITY_ASSURANCE_PUBLIC_CONTRACT_VERSION).toBe("0.6.0-compliance-intelligence");
    expect(PHASE_15D_BASELINE_COMMIT).toBe(
      "ef8efd2b4b30082e9c26ac867c65c51e3e39d207",
    );
    expect(SecureComputeAssuranceReady).toBe(true);
    expect(SecureComputeAssuranceRuntimeImplemented).toBe(true);
    expect(WorkloadIdentityAssuranceImplemented).toBe(true);
    expect(duplicateSandboxDetected).toBe(false);
    expect(phase15FReady).toBe(true);
    const d = getSecurityAssuranceSecureComputeDeclaration();
    expect(d.AiDataSecurityReady).toBe(true);
    expect(d.IsolationAssuranceReady).toBe(true);
    expect(d.duplicateExecutionHostDetected).toBe(false);
    expect(d.automaticRuntimeMutationEnabled).toBe(false);
  });

  it("fail-closes missing workload identity", () => {
    expect(
      isWorkloadAttributable({
        workloadId: "",
        attributable: false,
      }),
    ).toBe(false);
    expect(
      isWorkloadAttributable({
        workloadId: "wl-1",
        userId: "u-1",
        attributable: true,
      }),
    ).toBe(true);
    expect(SECURE_COMPUTE_SEMANTICS.missingIdentityNeverPass).toBe(true);
    expect(SECURE_COMPUTE_PLANES).toHaveLength(15);
  });

  it("runs plane probes including denials and unknown host posture", () => {
    const rt = createSecureComputeAssuranceRuntime();
    const assessments = rt.engine.runActiveProbes();
    expect(assessments.length).toBeGreaterThanOrEqual(15);

    const tenant = assessments.find((a) => a.plane === "TENANT_WORKSPACE_SCOPE")!;
    expect(["pass", "partial"].includes(tenant.result)).toBe(true);

    const identity = assessments.filter((a) => a.plane === "WORKLOAD_IDENTITY");
    expect(identity.some((a) => a.result === "pass")).toBe(true);
    expect(identity.some((a) => a.result === "not_assessed")).toBe(true);

    const host = assessments.filter((a) => a.plane === "HOST_POSTURE");
    expect(host.some((a) => a.result === "not_assessed")).toBe(true);
    expect(host.some((a) => a.result === "not_applicable")).toBe(true);

    expect(rt.reuses.duplicateExecutionHost).toBe(false);
    expect(rt.reuses.teeImplementation).toBe(false);
    expect(rt.reuses.enforcementAuthority).toBe(false);
  });

  it("treats probe errors as non-PASS and forbids secret persistence", () => {
    const rt = createSecureComputeAssuranceRuntime();
    const errored = rt.engine.runProbe({
      runId: "err-1",
      probeId: "sc-tenant-deny",
      forceError: true,
    });
    expect(errored.result).toBe("error");
    expect(errored.assessment.errorCannotBecomePass).toBe(true);
    expect(errored.assessment.fallbackToPassForbidden).toBe(true);

    expect(() =>
      rt.engine.recordContext({
        executionId: "bad",
        tenantId: "t",
        workspaceId: "w",
        requesterIdentity: "u",
        workload: { workloadId: "wl", attributable: true, userId: "u" },
        runtimeHostRef: "host",
        authorizationPolicyRefs: [],
        inputEvidenceRefs: [],
        outputEvidenceRefs: [],
        startedAt: new Date().toISOString(),
        status: "pass",
        evidenceFreshness: "current",
        containsRawSecret: true as false,
      }),
    ).toThrow(/Raw secrets/);
  });

  it("preserves provenance/integrity and findings != incidents", () => {
    const rt = createSecureComputeAssuranceRuntime();
    rt.engine.runActiveProbes();
    const integ = rt.engine.listIntegrityAssessments();
    expect(integ.length).toBeGreaterThan(0);
    expect(integ.every((i) => i.fabricatedIntegrityForbidden)).toBe(true);

    const authz = rt.engine.listAuthzAssessments();
    expect(authz.some((a) => a.policyDecisionRef)).toBe(true);

    const snap = rt.engine.composeSnapshot("sc-snap-1");
    expect(snap.isolationDimensionPreserved).toBe(true);
    expect(snap.aiDataDimensionPreserved).toBe(true);
    expect(snap.universalScorePresent).toBe(false);
    expect(snap.confidentialComputingClaimed).toBe(false);
    expect(snap.teeClaimed).toBe(false);
    expect(snap.planes).toHaveLength(15);

    expect(rt.engine.listFindings().every((f) => f.isIncident === false)).toBe(true);
    expect(rt.engine.automaticRemediationEnabled).toBe(false);
  });

  it("records control evidence freshness as current when observed", () => {
    const rt = createSecureComputeAssuranceRuntime();
    rt.engine.runProbe({ runId: "fresh-1", probeId: "sc-provenance" });
    const ev = rt.engine.listControlEvidence();
    expect(ev.some((e) => e.freshness === "current" && e.observed && !e.fabricated)).toBe(
      true,
    );
  });
});
