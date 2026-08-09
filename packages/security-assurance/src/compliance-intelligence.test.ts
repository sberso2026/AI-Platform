import { describe, expect, it } from "vitest";
import {
  COMPLIANCE_FRAMEWORK_IDS,
  COMPLIANCE_INTELLIGENCE_SEMANTICS,
} from "./compliance-intelligence-contracts";
import {
  ComplianceIntelligenceReady,
  ComplianceFrameworkRegistryImplemented,
  automaticCertificationEnabled,
  automaticComplianceClaimEnabled,
  duplicateSecurityControlRegistryDetected,
  getSecurityAssuranceComplianceIntelligenceDeclaration,
  phase15GReady,
} from "./compliance-intelligence-flags";
import { createComplianceIntelligenceRuntime } from "./domain/compliance-intelligence/runtime";
import {
  PHASE_15E_BASELINE_COMMIT,
  SECURITY_ASSURANCE_PUBLIC_CONTRACT_VERSION,
  SECURITY_ASSURANCE_VERSION,
} from "./version";

describe("Phase 15F Compliance Intelligence Foundation", () => {
  it("declares 0.7.0-customer-assurance on Phase 15E baseline", () => {
    expect(SECURITY_ASSURANCE_VERSION).toBe("0.7.0-customer-assurance");
    expect(SECURITY_ASSURANCE_PUBLIC_CONTRACT_VERSION).toBe(
      "0.7.0-customer-assurance",
    );
    expect(PHASE_15E_BASELINE_COMMIT).toBe(
      "aa5150fc4acf287b50c973220c40d62b7f91687f",
    );
    expect(ComplianceIntelligenceReady).toBe(true);
    expect(ComplianceFrameworkRegistryImplemented).toBe(true);
    expect(automaticCertificationEnabled).toBe(false);
    expect(automaticComplianceClaimEnabled).toBe(false);
    expect(duplicateSecurityControlRegistryDetected).toBe(false);
    expect(phase15GReady).toBe(true);
    const d = getSecurityAssuranceComplianceIntelligenceDeclaration();
    expect(d.ComplianceIntelligenceImplemented).toBe(true);
    expect(d.SecureComputeAssuranceReady).toBe(true);
    expect(d.IsolationAssuranceReady).toBe(true);
  });

  it("registers frameworks/versions and many-to-many control mappings", () => {
    const rt = createComplianceIntelligenceRuntime();
    expect(rt.engine.listFrameworks()).toHaveLength(4);
    expect(rt.engine.listFrameworkVersions()).toHaveLength(4);
    expect(COMPLIANCE_FRAMEWORK_IDS).toHaveLength(4);

    const s01Frameworks = rt.engine.frameworksForControl("RTB-SEC-S01");
    expect(s01Frameworks).toEqual(
      expect.arrayContaining(["ISO27001_2022", "NIST_CSF_2_0", "ESSENTIAL_EIGHT"]),
    );
    expect(COMPLIANCE_INTELLIGENCE_SEMANTICS.soleControlNeverInfersCompliance).toBe(
      true,
    );
    expect(
      rt.engine.listControlMappings().every((m) => m.soleControlInfersCompliance === false),
    ).toBe(true);
    expect(rt.engine.listControlMappings().every((m) => m.certified === false)).toBe(
      true,
    );
  });

  it("assesses supported, external-assurance, not-applicable, and stale evidence", () => {
    const rt = createComplianceIntelligenceRuntime();
    const assessments = rt.engine.runFoundationAssessments();
    expect(assessments.length).toBeGreaterThanOrEqual(4);

    const iso = assessments.find((a) => a.requirementId === "req-iso-a5-access")!;
    expect(iso.status).toBe("supported");
    expect(iso.certificationClaimed).toBe(false);
    expect(iso.freshness).toBe("current");

    const soc2 = assessments.find((a) => a.requirementId === "req-soc2-cc6")!;
    expect(soc2.status).toBe("requires_external_assurance");

    const pen = assessments.find((a) => a.requirementId === "req-iso-ext-pen")!;
    expect(pen.status).toBe("requires_external_assurance");

    const na = assessments.find((a) => a.requirementId === "req-nist-na-demo")!;
    expect(na.status).toBe("not_applicable");

    // Stale evidence must not remain silent current PASS
    rt.engine.recordEvidenceMapping({
      evidenceMappingId: "emap-stale-iso",
      requirementId: "req-iso-a5-access",
      controlId: "RTB-SEC-S01",
      assessorSource: "stale-test",
      forceStale: true,
      evidence: {
        evidenceId: "ev-comp-stale-iso",
        controlId: "RTB-SEC-S01",
        sourceType: "platform_runtime",
        sourceRef: "compliance_seed:stale",
        scope: "platform",
        collector: "test",
        collectedAt: new Date().toISOString(),
        effectiveAt: new Date().toISOString(),
        freshness: "stale",
        integrityRef: "sha256:stale",
        classification: "INTERNAL",
        provenance: {
          observed: true,
          inferred: false,
          fabricated: false,
          sourceCategory: "platform_runtime",
        },
        status: "stale",
        containsSensitivePayload: false,
      },
    });
    const staleAssess = rt.engine.assessRequirement("req-iso-a5-access");
    expect(staleAssess.status).toBe("partially_supported");
    expect(staleAssess.freshness).toBe("stale");

    const unsupported = rt.engine.assessRequirement("req-nist-pr-aa", {
      forceUnsupported: true,
    });
    expect(unsupported.status).toBe("unsupported");
  });

  it("treats missing evidence as fail-closed and gaps as non-incidents", () => {
    const rt = createComplianceIntelligenceRuntime();
    // Assess a mapped requirement with no evidence seeded
    const missing = rt.engine.assessRequirement("req-e8-mfa");
    expect(missing.status).toBe("not_assessed");
    expect(missing.freshness).toBe("missing");

    const gaps = rt.engine.listGaps();
    expect(gaps.every((g) => g.isIncident === false)).toBe(true);
    expect(rt.engine.listFindings().every((f) => f.isIncident === false)).toBe(true);
    expect(rt.engine.listFindings().every((f) => f.certificationClaimed === false)).toBe(
      true,
    );
  });

  it("preserves prior dimensions and forbids certification claims in snapshot", () => {
    const rt = createComplianceIntelligenceRuntime();
    rt.engine.runFoundationAssessments();
    const snap = rt.engine.composeSnapshot("comp-snap-1");
    expect(snap.isolationDimensionPreserved).toBe(true);
    expect(snap.aiDataDimensionPreserved).toBe(true);
    expect(snap.secureComputeDimensionPreserved).toBe(true);
    expect(snap.universalScorePresent).toBe(false);
    expect(snap.certificationClaimed).toBe(false);
    expect(snap.iso27001CertifiedClaimed).toBe(false);
    expect(snap.soc2CompliantClaimed).toBe(false);
    expect(snap.frameworks).toHaveLength(4);
    // Never label a framework globally compliant
    expect(snap.frameworks.every((f) => f.overallStatus !== "supported")).toBe(true);
    expect(rt.reuses.duplicateSecurityControlRegistry).toBe(false);
    expect(rt.reuses.certificationAuthority).toBe(false);
    expect(rt.engine.automaticRemediationEnabled).toBe(false);
  });

  it("reuses existing FrameworkMappingRegistry without duplication", () => {
    const rt = createComplianceIntelligenceRuntime();
    expect(rt.foundation.mappings.list().length).toBeGreaterThan(0);
    expect(rt.reuses.frameworkMappingRegistry).toBe(true);
    expect(COMPLIANCE_INTELLIGENCE_SEMANTICS.noDuplicateControlRegistry).toBe(true);
    expect(COMPLIANCE_INTELLIGENCE_SEMANTICS.mappingNeqCertification).toBe(true);
  });
});
