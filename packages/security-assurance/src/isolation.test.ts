import { describe, expect, it } from "vitest";
import { ISOLATION_SEMANTICS, ISOLATION_TARGET_PLANES } from "./isolation-contracts";
import {
  IsolationAssuranceReady,
  IsolationAssuranceRuntimeImplemented,
  knownCrossTenantLeakageDetected,
  knownCrossWorkspaceLeakageDetected,
  automaticAuthorizationMutationEnabled,
  automaticRlsMutationEnabled,
  getSecurityAssuranceIsolationDeclaration,
  phase15DReady,
} from "./isolation-flags";
import { createIsolationAssuranceRuntime } from "./domain/isolation/runtime";
import {
  PHASE_15B_BASELINE_COMMIT,
  SECURITY_ASSURANCE_PUBLIC_CONTRACT_VERSION,
  SECURITY_ASSURANCE_VERSION,
} from "./version";

describe("Phase 15C Isolation Assurance", () => {
  it("declares 0.3.0-isolation-assurance on Phase 15B baseline", () => {
    expect(SECURITY_ASSURANCE_VERSION).toBe("0.8.0-ga-readiness");
    expect(SECURITY_ASSURANCE_PUBLIC_CONTRACT_VERSION).toBe("0.8.0-ga-readiness");
    expect(PHASE_15B_BASELINE_COMMIT).toBe(
      "c0e96eaa03c76146bbeb6eb68bdc8c49f5efdf0f",
    );
    expect(IsolationAssuranceRuntimeImplemented).toBe(true);
    expect(IsolationAssuranceReady).toBe(true);
    expect(knownCrossTenantLeakageDetected).toBe(false);
    expect(knownCrossWorkspaceLeakageDetected).toBe(false);
    expect(automaticAuthorizationMutationEnabled).toBe(false);
    expect(automaticRlsMutationEnabled).toBe(false);
    expect(phase15DReady).toBe(true);
    const d = getSecurityAssuranceIsolationDeclaration();
    expect(d.implementsOwnAiStack).toBe(false);
    expect(d.duplicateKnowledgeGraphDetected).toBe(false);
  });

  it("locks isolation semantics", () => {
    expect(ISOLATION_SEMANTICS.isolationConfiguredNeqVerified).toBe(true);
    expect(ISOLATION_SEMANTICS.failedProbeNeverFallbackPass).toBe(true);
    expect(ISOLATION_SEMANTICS.assuranceEvidenceNeqEnforcement).toBe(true);
    expect(ISOLATION_TARGET_PLANES).toContain("CACHE");
  });

  it("registers versioned probes and rejects unrestricted executables", () => {
    const rt = createIsolationAssuranceRuntime();
    expect(rt.probes.list("active").length).toBeGreaterThanOrEqual(11);
    expect(() => rt.probes.registerExecutable(() => null)).toThrow(/forbidden/i);
    const db = rt.probes.listByPlane("DATABASE");
    expect(db.every((p) => p.version === "1.0.0")).toBe(true);
    expect(db.every((p) => p.mutatesRls === false)).toBe(true);
  });

  it("runs plane probes with cross-tenant/workspace denials and CACHE N/A", () => {
    const rt = createIsolationAssuranceRuntime();
    const runs = rt.engine.runActiveProbes("ci");
    expect(runs.length).toBe(rt.probes.list("active").length);

    const dbDeny = runs.find((r) => r.probeRef === "iso-db-cross-tenant-deny")!;
    expect(dbDeny.result).toBe("pass");
    expect(dbDeny.actualOutcome).toBe("deny");
    expect(dbDeny.dataDisclosure).toBe("none");
    expect(dbDeny.fallbackToPassForbidden).toBe(true);

    const wsDeny = runs.find((r) => r.probeRef === "iso-db-cross-workspace-deny")!;
    expect(wsDeny.result).toBe("pass");

    const cache = runs.find((r) => r.targetPlane === "CACHE")!;
    expect(cache.result).toBe("not_applicable");

    for (const plane of [
      "API",
      "FILES",
      "SEARCH",
      "KNOWLEDGE_GRAPH",
      "AI_CONTEXT",
      "BACKGROUND_JOB",
      "EVENT",
      "EXECUTION_HOST",
      "SOLVER_WORKSPACE",
    ] as const) {
      const planeRuns = runs.filter((r) => r.targetPlane === plane);
      expect(planeRuns.length).toBeGreaterThan(0);
      expect(planeRuns.every((r) => r.result === "pass")).toBe(true);
    }
  });

  it("treats probe errors as non-PASS and never fallback", () => {
    const rt = createIsolationAssuranceRuntime();
    const errored = rt.engine.runProbe({
      runId: "err-1",
      probeId: "iso-db-cross-tenant-deny",
      forceError: true,
    });
    expect(errored.result).toBe("error");
    expect(errored.result).not.toBe("pass");
  });

  it("composes assessment, snapshot, release gate, and posture without universal score", () => {
    const rt = createIsolationAssuranceRuntime();
    rt.engine.runActiveProbes("release_gate");
    const assessment = rt.engine.assess({
      assessmentId: "iso-a1",
      scope: "platform",
    });
    expect(assessment.result).toBe("pass");
    expect(assessment.governedReviewAction).toBe("security_assurance.isolation_review");

    const snap = rt.engine.composeSnapshot("iso-s1");
    expect(snap.universalScorePresent).toBe(false);
    expect(snap.knownCrossTenantLeakageDetected).toBe(false);
    expect(snap.knownCrossWorkspaceLeakageDetected).toBe(false);
    expect(snap.planes.find((p) => p.plane === "CACHE")?.result).toBe("not_applicable");

    const gate = rt.evaluateReleaseGate(snap);
    expect(gate.passed).toBe(true);

    const posture = rt.foundation.posture.list();
    expect(posture.length).toBeGreaterThan(0);
    expect(posture[0]!.universalScorePresent).toBe(false);
    expect(posture[0]!.dimensions.some((d) => d.dimensionId === "isolation")).toBe(true);
  });

  it("does not remediate or mutate authorization", () => {
    const rt = createIsolationAssuranceRuntime();
    expect(rt.engine.automaticRemediationEnabled).toBe(false);
    expect(rt.engine.automaticAuthorizationMutationEnabled).toBe(false);
    expect(rt.engine.automaticRlsMutationEnabled).toBe(false);
    expect(rt.reuses.enforcementAuthority).toBe(false);
    expect(rt.executionModes).toEqual(
      expect.arrayContaining(["on_demand", "ci", "scheduled", "release_gate"]),
    );
  });
});
