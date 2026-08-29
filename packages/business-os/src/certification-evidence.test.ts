import { describe, expect, it } from "vitest";
import { BUSINESS_CAPABILITY_IDS } from "@rtb/types";
import {
  BOS_16_CERTIFIED_BASELINE_SHA,
  BOS_CERTIFICATION_GATES,
  BOS_DEDICATED_STAGING_PROJECT_REF,
  BOS_SHARED_HOST_PROJECT_REF,
  type CertificationEvidenceRecord,
  assessBosBrowserPreflightHonesty,
  bosProviderFeatureStatus,
  evaluateCertificationGate,
  evidenceMaySatisfyGate,
} from "./certification-evidence";
import {
  BOS_16_BOUNDARY_NOTE,
  BOS_CERTIFICATION_STATIC_FLAG_MIGRATION,
  CERTIFICATION_MANIFEST_IMPLEMENTED,
  CERTIFICATION_SECOND_STACK_DETECTED,
  assessBosPreGaReadiness,
  bosBrowserCertificationState,
  buildBosReleaseManifest,
  currentBosCertificationEvidence,
  getBosCertificationManifest,
} from "./certification-manifest";
import {
  AI_WORKFORCE_REGRESSION_PASS,
  BOS15_BROWSER_PREFLIGHT_RECONCILED,
  BOS16_PRE_GA_INTERNAL_STAGE_COMPLETE,
  HUBSPOT_LIVE_CERTIFICATION_EXECUTED,
  LIVE_RLS_EVIDENCE_PASS,
  M365_LIVE_CERTIFICATION_EXECUTED,
  PRE_GA_INTERNAL_READINESS_PASS,
  XERO_LIVE_CERTIFICATION_EXECUTED,
  XERO_LIVE_EVIDENCE_PASS,
  bosBrowserE2eCertified,
  bosLiveHubSpotCertified,
  bosLiveMicrosoft365Certified,
  bosLiveRlsCertified,
  bosLiveXeroCertified,
  bosProductionEligible,
  bosReleaseCandidate,
} from "./release";
import {
  duplicateAgentRuntimeDetected,
  duplicateIntegrationStackDetected,
  duplicateKnowledgeGraphDetected,
  implementsOwnAiStack,
} from "./version";

const NOW = "2026-08-29T09:45:20.000Z";
const DESCENDANT_SHA = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

function evidence(
  overrides: Partial<CertificationEvidenceRecord> & Pick<CertificationEvidenceRecord, "gateId" | "evidenceType" | "executionMode">,
): CertificationEvidenceRecord {
  return {
    certification_id: overrides.certification_id ?? `probe.${overrides.gateId}`,
    product: "business-os",
    version: "0.13.3",
    commitSha: overrides.commitSha ?? BOS_16_CERTIFIED_BASELINE_SHA,
    environmentId: overrides.environmentId ?? "fixture",
    environmentClass: overrides.environmentClass ?? "fixture",
    stagingProjectRef: overrides.stagingProjectRef,
    gateId: overrides.gateId,
    evidenceType: overrides.evidenceType,
    executionMode: overrides.executionMode,
    result: overrides.result ?? "pass",
    executedAt: overrides.executedAt ?? NOW,
    suiteId: overrides.suiteId ?? "honesty",
    artifactRef: overrides.artifactRef ?? "probe",
    limitations: overrides.limitations ?? ["probe"],
    supersedes: overrides.supersedes,
  };
}

describe("BOS-16A9 certification evidence honesty", () => {
  it("does not let fixture Xero, M365, or HubSpot satisfy live provider gates", () => {
    for (const [gateId, evidenceType] of [
      ["xero_live", "provider_live"],
      ["microsoft365_live", "provider_live"],
      ["hubspot_live", "provider_live"],
    ] as const) {
      const row = evidence({
        gateId,
        evidenceType,
        executionMode: "fixture",
        result: "pass",
      });
      expect(evidenceMaySatisfyGate(row, BOS_CERTIFICATION_GATES[gateId])).toBe(false);
      expect(
        evaluateCertificationGate({
          gateId,
          evidence: [row],
          currentCommitSha: BOS_16_CERTIFIED_BASELINE_SHA,
        }).state,
      ).not.toBe("pass");
    }
  });

  it("does not let browser fixture success satisfy a provider live gate", () => {
    const row = evidence({
      gateId: "xero_live",
      evidenceType: "browser_e2e",
      executionMode: "browser",
      result: "pass",
    });
    expect(
      evaluateCertificationGate({
        gateId: "xero_live",
        evidence: [row],
        currentCommitSha: BOS_16_CERTIFIED_BASELINE_SHA,
      }).state,
    ).not.toBe("pass");
  });

  it("does not let security architecture PASS satisfy a provider live gate", () => {
    for (const gateId of ["xero_live", "microsoft365_live", "hubspot_live"] as const) {
      const row = evidence({
        gateId,
        evidenceType: "provider_security_architecture",
        executionMode: "static",
        result: "pass",
      });
      expect(
        evaluateCertificationGate({
          gateId,
          evidence: [row],
          currentCommitSha: BOS_16_CERTIFIED_BASELINE_SHA,
        }).state,
      ).not.toBe("pass");
    }
  });

  it("lets live RLS PASS satisfy the RLS evidence gate and browser E2E PASS satisfy the browser gate", () => {
    const rls = evidence({
      gateId: "live_rls",
      evidenceType: "rls_isolation",
      executionMode: "live",
      environmentClass: "staging",
      stagingProjectRef: BOS_DEDICATED_STAGING_PROJECT_REF,
      result: "pass",
    });
    expect(
      evaluateCertificationGate({
        gateId: "live_rls",
        evidence: [rls],
        currentCommitSha: BOS_16_CERTIFIED_BASELINE_SHA,
      }).state,
    ).toBe("pass");

    const browser = evidence({
      gateId: "browser_e2e",
      evidenceType: "browser_e2e",
      executionMode: "browser",
      result: "pass",
    });
    expect(
      evaluateCertificationGate({
        gateId: "browser_e2e",
        evidence: [browser],
        currentCommitSha: BOS_16_CERTIFIED_BASELINE_SHA,
      }).state,
    ).toBe("pass");
  });

  it("fails closed for missing, failed, blocked, and stale incompatible evidence", () => {
    expect(
      evaluateCertificationGate({
        gateId: "live_rls",
        evidence: [],
        currentCommitSha: BOS_16_CERTIFIED_BASELINE_SHA,
      }).state,
    ).toBe("missing");

    expect(
      evaluateCertificationGate({
        gateId: "live_rls",
        evidence: [
          evidence({
            gateId: "live_rls",
            evidenceType: "rls_isolation",
            executionMode: "live",
            result: "fail",
          }),
        ],
        currentCommitSha: BOS_16_CERTIFIED_BASELINE_SHA,
      }).state,
    ).toBe("fail");

    expect(
      evaluateCertificationGate({
        gateId: "live_rls",
        evidence: [
          evidence({
            gateId: "live_rls",
            evidenceType: "rls_isolation",
            executionMode: "live",
            result: "blocked",
          }),
        ],
        currentCommitSha: BOS_16_CERTIFIED_BASELINE_SHA,
      }).state,
    ).toBe("blocked");

    const stale = evidence({
      gateId: "live_rls",
      evidenceType: "rls_isolation",
      executionMode: "live",
      result: "pass",
      commitSha: BOS_16_CERTIFIED_BASELINE_SHA,
    });
    expect(
      evaluateCertificationGate({
        gateId: "live_rls",
        evidence: [stale],
        currentCommitSha: DESCENDANT_SHA,
      }).state,
    ).toBe("incompatible");
  });

  it("allows certified-ancestor carry-forward only with explicit unaffected-boundary provenance", () => {
    const rls = evidence({
      gateId: "live_rls",
      evidenceType: "rls_isolation",
      executionMode: "live",
      stagingProjectRef: BOS_DEDICATED_STAGING_PROJECT_REF,
      result: "pass",
    });
    expect(
      evaluateCertificationGate({
        gateId: "live_rls",
        evidence: [rls],
        currentCommitSha: DESCENDANT_SHA,
        claims: [
          {
            kind: "certified_ancestor",
            ancestorSha: BOS_16_CERTIFIED_BASELINE_SHA,
            currentSha: DESCENDANT_SHA,
            unaffectedBoundaries: ["tenant_workspace_rls"],
            provenance: "Unrelated certification projection; RLS boundary unchanged.",
          },
        ],
      }).state,
    ).toBe("pass");

    expect(
      evaluateCertificationGate({
        gateId: "live_rls",
        evidence: [rls],
        currentCommitSha: DESCENDANT_SHA,
        claims: [
          {
            kind: "certified_ancestor",
            ancestorSha: BOS_16_CERTIFIED_BASELINE_SHA,
            currentSha: DESCENDANT_SHA,
            unaffectedBoundaries: ["connector_live_provider"],
            provenance: "Wrong boundary must not carry RLS evidence.",
          },
        ],
      }).state,
    ).toBe("incompatible");
  });

  it("keeps known limitations visible and Preview connectors from masquerading as Certified", () => {
    const manifest = getBosCertificationManifest();
    expect(manifest.knownLimitations.some((row) => /Live Xero/.test(row))).toBe(true);
    expect(manifest.providerCertificationState.xero.releaseStatus).toBe("PREVIEW");
    expect(manifest.providerCertificationState.microsoft_365.releaseStatus).toBe("PREVIEW");
    expect(manifest.providerCertificationState.hubspot.releaseStatus).toBe("PREVIEW");
    expect(bosProviderFeatureStatus({
      implemented: true,
      securityArchitectureReady: true,
      liveExecutionPassed: false,
      liveCertified: false,
    })).not.toBe("CERTIFIED");
    expect(manifest.declarations.liveXeroCertified).toBe(false);
    expect(manifest.declarations.liveMicrosoft365Certified).toBe(false);
    expect(manifest.declarations.liveHubSpotCertified).toBe(false);
  });

  it("rejects the shared host as staging evidence", () => {
    const row = evidence({
      gateId: "live_rls",
      evidenceType: "rls_isolation",
      executionMode: "live",
      stagingProjectRef: BOS_SHARED_HOST_PROJECT_REF,
      result: "pass",
    });
    expect(evidenceMaySatisfyGate(row, BOS_CERTIFICATION_GATES.live_rls)).toBe(false);
  });
});

describe("BOS-16A9 release manifest and pre-GA readiness", () => {
  it("separates execution evidence from release declarations and stays fail-closed for GA", () => {
    const manifest = getBosCertificationManifest();
    expect(manifest.version).toBe("1.0.0");
    expect(manifest.releaseType).toBe("GA");
    expect(manifest.gaPromoted).toBe(true);
    expect(manifest.qualificationSha).toBe("b89e019d0201e4fa1e848391d03ede03756b4f13");
    expect(CERTIFICATION_SECOND_STACK_DETECTED).toBe(false);
    expect(manifest.capabilityCount).toBe(18);
    expect(manifest.capabilityCount).toBe(BUSINESS_CAPABILITY_IDS.length);
    expect(manifest.rlsCertificationState.state).toBe("pass");
    expect(manifest.browserCertificationState.state).toBe("pass");
    expect(manifest.browserPreflight.evidenceResult).toBe("pass");
    expect(manifest.browserPreflight.certifiedDeclaration).toBe(true);
    expect(manifest.browserPreflight.validPreGaState).toBe(false);
    expect(manifest.browserPreflight.executionMode).toBe("browser");
    expect(manifest.providerCertificationState.xero.liveEvidence.state).not.toBe("pass");
    expect(manifest.providerCertificationState.microsoft_365.liveEvidence.state).not.toBe("pass");
    expect(manifest.providerCertificationState.hubspot.liveEvidence.state).not.toBe("pass");
    expect(manifest.productionEligible).toBe(true);
    expect(manifest.productionEligibilityComputed).toBe(true);
    expect(manifest.coreGaEligibilityComputed).toBe(true);
    expect(manifest.gaReady).toBe(true);
    expect(manifest.preGaInternalReady).toBe(true);
    expect(manifest.declarations.releaseCandidate).toBe(true);
    expect(manifest.declarations.productionEligible).toBe(true);
    expect(manifest.declarations.liveRlsCertified).toBe(true);
    expect(manifest.declarations.browserE2eCertified).toBe(true);
    expect(bosReleaseCandidate).toBe(true);
    expect(bosProductionEligible).toBe(true);
    expect(bosLiveRlsCertified).toBe(true);
    expect(bosBrowserE2eCertified).toBe(true);
    expect(bosLiveXeroCertified).toBe(false);
    expect(bosLiveMicrosoft365Certified).toBe(false);
    expect(bosLiveHubSpotCertified).toBe(false);
    expect(XERO_LIVE_EVIDENCE_PASS).toBe(false);
    expect(XERO_LIVE_CERTIFICATION_EXECUTED).toBe(false);
    expect(M365_LIVE_CERTIFICATION_EXECUTED).toBe(false);
    expect(HUBSPOT_LIVE_CERTIFICATION_EXECUTED).toBe(false);
    expect(LIVE_RLS_EVIDENCE_PASS).toBe(true);
    expect(BOS_CERTIFICATION_STATIC_FLAG_MIGRATION.status).toBe("adapter_only");
    expect(BOS_16_BOUNDARY_NOTE).toContain("Do not start BOS-17");
    expect(JSON.stringify(manifest)).not.toMatch(/eyJ|sk-|Bearer /i);
    expect(JSON.stringify(currentBosCertificationEvidence())).not.toMatch(/wcydlhqiqdwgoaqrlget/);
    expect(implementsOwnAiStack).toBe(false);
    expect(duplicateAgentRuntimeDetected).toBe(false);
    expect(duplicateKnowledgeGraphDetected).toBe(false);
    expect(duplicateIntegrationStackDetected).toBe(false);
  });

  it("produces the expected pre-GA internal readiness assessment without promoting GA", () => {
    const report = assessBosPreGaReadiness();
    expect(report.internalArchitecture).toBe("ready");
    expect(report.aiWorkforceRegression).toBe("pass");
    expect(report.liveRlsEvidence).toBe("pass");
    expect(report.browserE2eEvidence).toBe("pass");
    expect(report.xeroLive).toBe("outstanding");
    expect(report.microsoft365Live).toBe("outstanding");
    expect(report.hubspotLive).toBe("outstanding");
    expect(report.ga).toBe("READY");
    expect(report.productionEligible).toBe(true);
    expect(report.preGaInternalReady).toBe(true);
    expect(PRE_GA_INTERNAL_READINESS_PASS).toBe(true);
    expect(AI_WORKFORCE_REGRESSION_PASS).toBe(true);
    expect(BOS16_PRE_GA_INTERNAL_STAGE_COMPLETE).toBe(true);
  });

  it("does not auto-promote declarations when evidence is green", () => {
    const liveXero = evidence({
      gateId: "xero_live",
      evidenceType: "provider_live",
      executionMode: "live",
      environmentClass: "live-provider",
      result: "pass",
      commitSha: DESCENDANT_SHA,
    });
    const manifest = buildBosReleaseManifest({
      currentCommitSha: DESCENDANT_SHA,
      evidence: [...currentBosCertificationEvidence(DESCENDANT_SHA).filter((row) => row.gateId !== "xero_live"), liveXero],
      gaCertifiedProviders: ["microsoft_365", "hubspot"],
    });
    expect(manifest.providerCertificationState.xero.liveEvidence.state).toBe("pass");
    expect(manifest.declarations.liveXeroCertified).toBe(false);
    expect(manifest.productionEligible).toBe(true);
    expect(manifest.productionEligibilityComputed).toBe(false);
    expect(manifest.gaReady).toBe(false);
  });
});

describe("BOS-16A9.1 browser availability vs evidence vs declaration", () => {
  it("treats available=true + evidence PASS + declaration false as valid pre-GA state", () => {
    const view = assessBosBrowserPreflightHonesty({
      available: true,
      evidenceResult: "pass",
      certifiedDeclaration: false,
    });
    expect(view.validPreGaState).toBe(true);
    expect(view.mandatoryEvidenceFailClosed).toBe(false);
    expect(view.newExecutionBlocked).toBe(false);
    expect(view.certifiedDeclaration).toBe(false);
    expect(BOS15_BROWSER_PREFLIGHT_RECONCILED).toBe(true);
    expect(bosBrowserE2eCertified).toBe(true);
    expect(bosBrowserCertificationState({ available: true }).validPreGaState).toBe(false);
  });

  it("fails closed when available=true but mandatory browser evidence is missing or failed", () => {
    expect(
      assessBosBrowserPreflightHonesty({
        available: true,
        evidenceResult: "missing",
        certifiedDeclaration: false,
      }).mandatoryEvidenceFailClosed,
    ).toBe(true);
    expect(
      assessBosBrowserPreflightHonesty({
        available: true,
        evidenceResult: "fail",
        certifiedDeclaration: false,
      }).validPreGaState,
    ).toBe(false);
    expect(
      assessBosBrowserPreflightHonesty({
        available: true,
        evidenceResult: "blocked",
        certifiedDeclaration: false,
      }).mandatoryEvidenceFailClosed,
    ).toBe(true);
    expect(
      evaluateCertificationGate({
        gateId: "browser_e2e",
        evidence: [],
        currentCommitSha: BOS_16_CERTIFIED_BASELINE_SHA,
      }).state,
    ).toBe("missing");
    expect(
      evaluateCertificationGate({
        gateId: "browser_e2e",
        evidence: [
          evidence({
            gateId: "browser_e2e",
            evidenceType: "browser_e2e",
            executionMode: "browser",
            result: "fail",
          }),
        ],
        currentCommitSha: BOS_16_CERTIFIED_BASELINE_SHA,
      }).state,
    ).toBe("fail");
  });

  it("blocks a required new browser execution when the environment is unavailable", () => {
    const view = assessBosBrowserPreflightHonesty({
      available: false,
      evidenceResult: "pass",
      certifiedDeclaration: false,
      requiredForNewExecution: true,
    });
    expect(view.newExecutionBlocked).toBe(true);
    expect(view.validPreGaState).toBe(true);
  });

  it("fails closed on blocked or stale incompatible browser evidence", () => {
    expect(
      evaluateCertificationGate({
        gateId: "browser_e2e",
        evidence: [
          evidence({
            gateId: "browser_e2e",
            evidenceType: "browser_e2e",
            executionMode: "browser",
            result: "blocked",
          }),
        ],
        currentCommitSha: BOS_16_CERTIFIED_BASELINE_SHA,
      }).state,
    ).toBe("blocked");
    expect(
      evaluateCertificationGate({
        gateId: "browser_e2e",
        evidence: [
          evidence({
            gateId: "browser_e2e",
            evidenceType: "browser_e2e",
            executionMode: "browser",
            result: "pass",
          }),
        ],
        currentCommitSha: DESCENDANT_SHA,
      }).state,
    ).toBe("incompatible");
  });

  it("does not let browser evidence satisfy live-provider gates or auto-promote the declaration", () => {
    const browserPass = evidence({
      gateId: "xero_live",
      evidenceType: "browser_e2e",
      executionMode: "browser",
      result: "pass",
    });
    expect(
      evaluateCertificationGate({
        gateId: "xero_live",
        evidence: [browserPass],
        currentCommitSha: BOS_16_CERTIFIED_BASELINE_SHA,
      }).state,
    ).not.toBe("pass");
    expect(bosBrowserCertificationState({ available: true }).certifiedDeclaration).toBe(true);
    expect(getBosCertificationManifest().declarations.browserE2eCertified).toBe(true);
    expect(bosBrowserE2eCertified).toBe(true);
  });
});

describe("BOS-16A10 Core vs Preview honesty", () => {
  it("does not treat missing live provider evidence as Xero/M365/HubSpot Certified", () => {
    const manifest = getBosCertificationManifest();
    expect(manifest.providerCertificationState.xero.releaseStatus).toBe("PREVIEW");
    expect(manifest.providerCertificationState.microsoft_365.releaseStatus).toBe("PREVIEW");
    expect(manifest.providerCertificationState.hubspot.releaseStatus).toBe("PREVIEW");
    expect(manifest.providerCertificationState.xero.liveEvidence.state).not.toBe("pass");
    expect(manifest.featureEvidence.find((row) => row.featureId === "connector.xero")?.evidencePresent).toBe(false);
    expect(manifest.featureEvidence.find((row) => row.featureId === "connector.microsoft_365")?.gaMandatory).toBe(
      false,
    );
    expect(JSON.stringify(manifest)).not.toMatch(/LIVE_PROVIDER_CERTIFIED/);
  });

  it("does not block BOS Core eligibility when Preview live evidence is absent", () => {
    const manifest = getBosCertificationManifest();
    expect(manifest.coreGaEligibilityComputed).toBe(true);
    expect(manifest.productionEligibilityComputed).toBe(true);
    expect(manifest.productionEligible).toBe(true);
    expect(manifest.releaseScope.gaCertifiedProviders).toEqual([]);
    expect(manifest.requiredCoreGates).not.toContain("xero_live");
    expect(manifest.requiredCoreGates).not.toContain("microsoft365_live");
    expect(manifest.requiredCoreGates).not.toContain("hubspot_live");
  });

  it("fails closed when a Preview connector is projected CERTIFIED without live evidence", () => {
    expect(() =>
      bosProviderFeatureStatus({
        implemented: true,
        securityArchitectureReady: true,
        liveExecutionPassed: false,
        liveCertified: true,
      }),
    ).toThrow("provider_certified_without_live_evidence");
  });

  it("fails production eligibility when a Core gate is missing, while Preview live skip stays Preview", () => {
    const missingRls = buildBosReleaseManifest({
      currentCommitSha: BOS_16_CERTIFIED_BASELINE_SHA,
      evidence: currentBosCertificationEvidence().filter((row) => row.gateId !== "live_rls"),
    });
    expect(missingRls.coreGaEligibilityComputed).toBe(false);
    expect(missingRls.productionEligibilityComputed).toBe(false);
    expect(missingRls.productionEligible).toBe(true);
    expect(missingRls.gaReady).toBe(false);
    expect(missingRls.providerCertificationState.xero.releaseStatus).toBe("PREVIEW");

    const promotedWithoutEvidence = buildBosReleaseManifest({
      currentCommitSha: BOS_16_CERTIFIED_BASELINE_SHA,
      evidence: currentBosCertificationEvidence(),
      gaCertifiedProviders: ["xero"],
    });
    expect(promotedWithoutEvidence.coreGaEligibilityComputed).toBe(true);
    expect(promotedWithoutEvidence.productionEligibilityComputed).toBe(false);
    expect(promotedWithoutEvidence.providerCertificationState.xero.releaseStatus).toBe("PREVIEW");
    expect(promotedWithoutEvidence.providerCertificationState.microsoft_365.releaseStatus).toBe("PREVIEW");
    expect(promotedWithoutEvidence.providerCertificationState.hubspot.releaseStatus).toBe("PREVIEW");
  });
});
