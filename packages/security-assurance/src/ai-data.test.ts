import { describe, expect, it } from "vitest";
import {
  AI_DATA_SECURITY_PLANES,
  AI_DATA_SECURITY_SEMANTICS,
  classificationAllowsPublicDisclosure,
  normalizeClassification,
} from "./ai-data-contracts";
import {
  AiDataSecurityReady,
  AiDataSecurityRuntimeImplemented,
  duplicateAiStackDetected,
  getSecurityAssuranceAiDataDeclaration,
  phase15EReady,
  ProviderDataHandlingAssuranceImplemented,
} from "./ai-data-flags";
import { createAiDataSecurityRuntime } from "./domain/ai-data/runtime";
import {
  PHASE_15C_BASELINE_COMMIT,
  SECURITY_ASSURANCE_PUBLIC_CONTRACT_VERSION,
  SECURITY_ASSURANCE_VERSION,
} from "./version";

describe("Phase 15D AI & Data Security Assurance", () => {
  it("declares current package version on Phase 15C baseline", () => {
    expect(SECURITY_ASSURANCE_VERSION).toBe("0.8.0-ga-readiness");
    expect(SECURITY_ASSURANCE_PUBLIC_CONTRACT_VERSION).toBe("0.8.0-ga-readiness");
    expect(PHASE_15C_BASELINE_COMMIT).toBe(
      "897383f5a95cf81847ee866c1c1fdac5012b25a5",
    );
    expect(AiDataSecurityReady).toBe(true);
    expect(AiDataSecurityRuntimeImplemented).toBe(true);
    expect(ProviderDataHandlingAssuranceImplemented).toBe(true);
    expect(duplicateAiStackDetected).toBe(false);
    expect(phase15EReady).toBe(true);
    const d = getSecurityAssuranceAiDataDeclaration();
    expect(d.implementsOwnAiStack).toBe(false);
    expect(d.IsolationAssuranceReady).toBe(true);
    expect(d.AiTrustRuntimeImplemented).toBe(false);
  });

  it("fail-closes unknown classification and never silent public", () => {
    expect(normalizeClassification(undefined)).toBe("unknown");
    expect(normalizeClassification(null)).toBe("unknown");
    expect(classificationAllowsPublicDisclosure("unknown")).toBe(false);
    expect(classificationAllowsPublicDisclosure("public")).toBe(true);
    expect(AI_DATA_SECURITY_SEMANTICS.unknownClassificationNeverSilentPublic).toBe(true);
    expect(AI_DATA_SECURITY_PLANES).toHaveLength(12);
  });

  it("runs plane probes including cross-tenant denial and provider fail-closed", () => {
    const rt = createAiDataSecurityRuntime();
    const assessments = rt.engine.runActiveProbes();
    expect(assessments.length).toBeGreaterThanOrEqual(12);

    const retrieval = assessments.find((a) => a.plane === "RETRIEVAL")!;
    expect(retrieval.result).toBe("pass");

    const context = assessments.find((a) => a.plane === "AI_CONTEXT")!;
    expect(context.result).toBe("pass");

    const providers = assessments.filter((a) => a.plane === "MODEL_PROVIDER");
    expect(providers.some((a) => a.result === "pass")).toBe(true);
    expect(providers.some((a) => a.result === "not_assessed")).toBe(true);

    const prov = rt.engine.listProviderAssessments();
    expect(prov.some((p) => p.approvedStatus === "approved" && p.result === "pass")).toBe(true);
    expect(
      prov.some((p) => p.approvedStatus === "unknown" && p.result === "not_assessed"),
    ).toBe(true);
    expect(prov.every((p) => p.fabricatedPassForbidden)).toBe(true);
  });

  it("treats probe errors as non-PASS and forbids secret persistence", () => {
    const rt = createAiDataSecurityRuntime();
    const errored = rt.engine.runProbe({
      runId: "err-1",
      probeId: "aid-retrieval-deny",
      forceError: true,
    });
    expect(errored.result).toBe("error");
    expect(errored.assessment.errorCannotBecomePass).toBe(true);

    expect(() =>
      rt.engine.recordFlow({
        flowId: "bad",
        plane: "DATA_EGRESS",
        source: "x",
        tenantId: "t",
        workspaceId: "w",
        classification: "internal",
        purpose: "test",
        destination: "y",
        policyRefs: [],
        provenanceRefs: [],
        evidenceRefs: [],
        timestamp: new Date().toISOString(),
        decision: "allow",
        status: "pass",
        containsRawSecret: true as unknown as false,
        containsSensitivePayload: false,
      }),
    ).toThrow(/secret/i);
  });

  it("composes snapshot preserving isolation and without universal score/injection claim", () => {
    const rt = createAiDataSecurityRuntime();
    rt.engine.runActiveProbes();
    const snap = rt.engine.composeSnapshot("aid-s1");
    expect(snap.isolationDimensionPreserved).toBe(true);
    expect(snap.universalScorePresent).toBe(false);
    expect(snap.promptInjectionCompletelyPreventedClaimed).toBe(false);
    expect(snap.knownSensitiveDataLeakageDetected).toBe(false);
    expect(snap.planes).toHaveLength(12);
    expect(rt.foundation.posture.list().length).toBeGreaterThan(0);
    expect(rt.reuses.duplicateAiStack).toBe(false);
    expect(rt.reuses.aiDataReviewAction).toBe("security_assurance.ai_data_review");
  });

  it("does not remediate and findings are not incidents", () => {
    const rt = createAiDataSecurityRuntime();
    expect(rt.engine.automaticRemediationEnabled).toBe(false);
    expect(rt.engine.automaticAuthorizationMutationEnabled).toBe(false);
    expect(rt.engine.automaticRlsMutationEnabled).toBe(false);
    const findings = rt.engine.listFindings();
    expect(findings.every((f) => f.isIncident === false)).toBe(true);
  });
});
