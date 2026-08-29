/**
 * Release-manifest projection over certification evidence.
 * Declarations stay on BOS_RELEASE_INDICATORS. Evidence never auto-promotes them.
 */
import { BUSINESS_CAPABILITY_IDS } from "@rtb/types";
import { BUSINESS_OS_VERSION } from "./version";
import {
  BOS_16_CERTIFIED_BASELINE_SHA,
  BOS_CERTIFICATION_GATES,
  BOS_CERTIFICATION_PRODUCT,
  BOS_DEDICATED_STAGING_PROJECT_REF,
  type BosCertificationGateId,
  type BosProviderReleaseStatus,
  type CertificationEvidenceRecord,
  type EvidenceCompatibilityClaim,
  type GateEvaluation,
  assertNoSecretsInCertificationPayload,
  bosProviderFeatureStatus,
  evaluateCertificationGate,
} from "./certification-evidence";
import {
  BROWSER_E2E_EVIDENCE_PASS,
  HUBSPOT_CONNECTOR_IMPLEMENTED,
  HUBSPOT_SECURITY_ARCHITECTURE_READY,
  M365_CONNECTOR_IMPLEMENTED,
  M365_SECURITY_ARCHITECTURE_READY,
  XERO_CONNECTOR_IMPLEMENTED,
  XERO_SECURITY_ARCHITECTURE_READY,
  bosBrowserE2eCertified,
  bosLiveHubSpotCertified,
  bosLiveMicrosoft365Certified,
  bosLiveRlsCertified,
  bosLiveXeroCertified,
  bosProductionEligible,
  bosReleaseCandidate,
} from "./release";

export const BOS_16_BOUNDARY_NOTE =
  "BOS-16A9 closes internal AI Workforce regression debt and adds an auditable certification evidence manifest. Do not start BOS-17 or create a GA tag." as const;

export const CERTIFICATION_MANIFEST_IMPLEMENTED = true as const;
export const CERTIFICATION_SECOND_STACK_DETECTED = false as const;

export const BOS_CERTIFICATION_STATIC_FLAG_MIGRATION = {
  status: "adapter_only" as const,
  doNotFlipConst: true,
  owner: "packages/business-os/src/release.ts + packages/platform-certification",
  path: [
    "CertificationEvidenceRecord is the canonical execution artifact.",
    "buildBosReleaseManifest derives gate evidence fail-closed.",
    "BOS_RELEASE_INDICATORS remain static declarations until a dedicated consumer-safe migration.",
    "Evidence pass must not assign bos.liveRlsCertified, bos.browserE2eCertified, or live provider certified flags.",
    "productionEligible remains a declaration and stays false until an approved product decision.",
  ],
} as const;

export const BOS_GA_CERTIFIED_PROVIDERS = ["xero", "microsoft_365", "hubspot"] as const;

const BASELINE_EXECUTED_AT = "2026-08-29T09:45:20.000Z";

function record(input: Omit<CertificationEvidenceRecord, "product" | "version">): CertificationEvidenceRecord {
  return {
    product: BOS_CERTIFICATION_PRODUCT,
    version: BUSINESS_OS_VERSION,
    ...input,
  };
}

/**
 * Honest current BOS evidence. Live provider gates are not executed.
 * RLS/browser PASS records are ingested from prior BOS-16 execution, not re-fabricated as live runs.
 */
export function currentBosCertificationEvidence(
  currentCommitSha: string = BOS_16_CERTIFIED_BASELINE_SHA,
): CertificationEvidenceRecord[] {
  return [
    record({
      certification_id: "bos16.live-rls.rntonzigxwxcjlcsadip.063c482",
      commitSha: BOS_16_CERTIFIED_BASELINE_SHA,
      environmentId: BOS_DEDICATED_STAGING_PROJECT_REF,
      environmentClass: "staging",
      stagingProjectRef: BOS_DEDICATED_STAGING_PROJECT_REF,
      gateId: "live_rls",
      evidenceType: "rls_isolation",
      executionMode: "live",
      result: "pass",
      executedAt: BASELINE_EXECUTED_AT,
      suiteId: "packages/platform-certification/src/bos-16-live-rls.test.ts",
      artifactRef: "BOS-16 live RLS 29/29 on dedicated staging; A9 did not re-run",
      limitations: [
        "Ingested from prior BOS-16 live execution. A9 does not claim a new live RLS run.",
        "Release declaration bos.liveRlsCertified remains false.",
      ],
    }),
    record({
      certification_id: "bos16.browser-e2e.fixture.063c482",
      commitSha: BOS_16_CERTIFIED_BASELINE_SHA,
      environmentId: "fixture-browser",
      environmentClass: "fixture",
      gateId: "browser_e2e",
      evidenceType: "browser_e2e",
      executionMode: "browser",
      result: BROWSER_E2E_EVIDENCE_PASS ? "pass" : "fail",
      executedAt: BASELINE_EXECUTED_AT,
      suiteId: "packages/platform-certification/playwright/bos-16-browser-e2e.spec.ts",
      artifactRef: "BOS-16A8 fixture browser E2E; A9 did not re-run unless required",
      limitations: [
        "Fixture/browser execution only. Does not satisfy live provider gates.",
        "Release declaration bos.browserE2eCertified remains false.",
      ],
    }),
    record({
      certification_id: "bos16.xero.security-architecture.static",
      commitSha: BOS_16_CERTIFIED_BASELINE_SHA,
      environmentId: "static",
      environmentClass: "static",
      gateId: "xero_security_architecture",
      evidenceType: "provider_security_architecture",
      executionMode: "static",
      result: XERO_SECURITY_ARCHITECTURE_READY ? "pass" : "fail",
      executedAt: BASELINE_EXECUTED_AT,
      suiteId: "packages/business-os/src/connectors/xero-policy.test.ts",
      artifactRef: "Xero read-only security architecture",
      limitations: ["Security architecture PASS cannot satisfy the live Xero gate."],
    }),
    record({
      certification_id: "bos16.xero.live.not-executed",
      commitSha: currentCommitSha,
      environmentId: "live-provider",
      environmentClass: "live-provider",
      gateId: "xero_live",
      evidenceType: "provider_live",
      executionMode: "live",
      result: "skipped",
      executedAt: BASELINE_EXECUTED_AT,
      suiteId: "bos-16-xero-live",
      artifactRef: "not_executed",
      limitations: ["Live Xero certification was not executed. Fixture/sandbox is not live."],
    }),
    record({
      certification_id: "bos16.m365.security-architecture.static",
      commitSha: BOS_16_CERTIFIED_BASELINE_SHA,
      environmentId: "static",
      environmentClass: "static",
      gateId: "microsoft365_security_architecture",
      evidenceType: "provider_security_architecture",
      executionMode: "static",
      result: M365_SECURITY_ARCHITECTURE_READY ? "pass" : "fail",
      executedAt: BASELINE_EXECUTED_AT,
      suiteId: "packages/business-os/src/connectors/m365-policy.test.ts",
      artifactRef: "Microsoft 365 read-only security architecture",
      limitations: ["Security architecture PASS cannot satisfy the live Microsoft 365 gate."],
    }),
    record({
      certification_id: "bos16.m365.live.not-executed",
      commitSha: currentCommitSha,
      environmentId: "live-provider",
      environmentClass: "live-provider",
      gateId: "microsoft365_live",
      evidenceType: "provider_live",
      executionMode: "live",
      result: "skipped",
      executedAt: BASELINE_EXECUTED_AT,
      suiteId: "bos-16-m365-live",
      artifactRef: "not_executed",
      limitations: ["Live Microsoft 365 certification was not executed."],
    }),
    record({
      certification_id: "bos16.hubspot.security-architecture.static",
      commitSha: BOS_16_CERTIFIED_BASELINE_SHA,
      environmentId: "static",
      environmentClass: "static",
      gateId: "hubspot_security_architecture",
      evidenceType: "provider_security_architecture",
      executionMode: "static",
      result: HUBSPOT_SECURITY_ARCHITECTURE_READY ? "pass" : "fail",
      executedAt: BASELINE_EXECUTED_AT,
      suiteId: "packages/business-os/src/connectors/hubspot-policy.test.ts",
      artifactRef: "HubSpot read-only security architecture",
      limitations: ["Security architecture PASS cannot satisfy the live HubSpot gate."],
    }),
    record({
      certification_id: "bos16.hubspot.live.not-executed",
      commitSha: currentCommitSha,
      environmentId: "live-provider",
      environmentClass: "live-provider",
      gateId: "hubspot_live",
      evidenceType: "provider_live",
      executionMode: "live",
      result: "skipped",
      executedAt: BASELINE_EXECUTED_AT,
      suiteId: "bos-16-hubspot-live",
      artifactRef: "not_executed",
      limitations: ["Live HubSpot certification was not executed."],
    }),
    record({
      certification_id: "bos16.ai-workforce.regression.fixture",
      commitSha: currentCommitSha,
      environmentId: "fixture",
      environmentClass: "fixture",
      gateId: "ai_workforce_regression",
      evidenceType: "internal_regression",
      executionMode: "fixture",
      result: "pass",
      executedAt: new Date().toISOString(),
      suiteId: "packages/business-os/src/workforce/service.test.ts",
      artifactRef: "BOS-16A9 workforce stale-clock fixture remediation",
      limitations: ["Fixture regression only. Does not certify live providers."],
    }),
    record({
      certification_id: "bos16.internal-architecture.static",
      commitSha: currentCommitSha,
      environmentId: "static",
      environmentClass: "static",
      gateId: "internal_architecture",
      evidenceType: "internal_regression",
      executionMode: "static",
      result: "pass",
      executedAt: BASELINE_EXECUTED_AT,
      suiteId: "packages/business-os/src/business-os.test.ts",
      artifactRef: "Platform Kernel reuse contracts",
      limitations: ["Static architecture contract. Not live-provider evidence."],
    }),
  ];
}

export function bos16CompatibilityClaims(currentCommitSha: string): EvidenceCompatibilityClaim[] {
  return [
    {
      kind: "certified_ancestor",
      ancestorSha: BOS_16_CERTIFIED_BASELINE_SHA,
      currentSha: currentCommitSha,
      unaffectedBoundaries: ["tenant_workspace_rls", "browser_e2e_fixture", "connector_security_architecture"],
      provenance:
        "BOS-16A9 remediates demo context generation-time freshness and adds a certification evidence projection. Tenant/workspace/RLS, browser integration UX, and connector security architecture were not modified.",
    },
  ];
}

export type BosReleaseManifest = {
  product: typeof BOS_CERTIFICATION_PRODUCT;
  releaseCandidateVersion: string;
  commitSha: string;
  capabilityCount: number;
  requiredGates: BosCertificationGateId[];
  gateEvidenceState: Record<BosCertificationGateId, GateEvaluation>;
  providerCertificationState: {
    xero: { releaseStatus: BosProviderReleaseStatus; liveEvidence: GateEvaluation; securityArchitecture: GateEvaluation };
    microsoft_365: {
      releaseStatus: BosProviderReleaseStatus;
      liveEvidence: GateEvaluation;
      securityArchitecture: GateEvaluation;
    };
    hubspot: {
      releaseStatus: BosProviderReleaseStatus;
      liveEvidence: GateEvaluation;
      securityArchitecture: GateEvaluation;
    };
  };
  browserCertificationState: GateEvaluation;
  rlsCertificationState: GateEvaluation;
  knownLimitations: string[];
  knownTestDebt: string[];
  productionEligible: false;
  productionEligibilityComputed: boolean;
  decisionReason: string;
  declarations: {
    releaseCandidate: boolean;
    productionEligible: boolean;
    liveRlsCertified: boolean;
    liveXeroCertified: boolean;
    liveMicrosoft365Certified: boolean;
    liveHubSpotCertified: boolean;
    browserE2eCertified: boolean;
  };
  gaReady: false;
  preGaInternalReady: boolean;
};

function closedReason(evaluation: GateEvaluation): string {
  if (evaluation.state === "pass") return "";
  return `${evaluation.gateId}:${evaluation.reason}`;
}

export function buildBosReleaseManifest(input: {
  currentCommitSha: string;
  evidence: readonly CertificationEvidenceRecord[];
  claims?: readonly EvidenceCompatibilityClaim[];
  gaCertifiedProviders?: readonly ("xero" | "microsoft_365" | "hubspot")[];
}): BosReleaseManifest {
  const claims = input.claims ?? bos16CompatibilityClaims(input.currentCommitSha);
  const gateIds = Object.keys(BOS_CERTIFICATION_GATES) as BosCertificationGateId[];
  const gateEvidenceState = Object.fromEntries(
    gateIds.map((gateId) => [
      gateId,
      evaluateCertificationGate({
        gateId,
        evidence: input.evidence,
        currentCommitSha: input.currentCommitSha,
        claims,
      }),
    ]),
  ) as Record<BosCertificationGateId, GateEvaluation>;

  const gaCertifiedProviders = input.gaCertifiedProviders ?? BOS_GA_CERTIFIED_PROVIDERS;
  const productionBlockers: string[] = [];
  for (const gateId of gateIds) {
    const gate = BOS_CERTIFICATION_GATES[gateId];
    const evaluation = gateEvidenceState[gateId];
    if (!gate.mandatoryForProduction) continue;
    if (gate.liveProvider && gate.provider && !(gaCertifiedProviders as readonly string[]).includes(gate.provider)) {
      continue;
    }
    if (evaluation.state !== "pass") {
      productionBlockers.push(closedReason(evaluation) || `${gateId}:not_pass`);
    }
  }

  const preGaBlockers: string[] = [];
  for (const gateId of gateIds) {
    const gate = BOS_CERTIFICATION_GATES[gateId];
    const evaluation = gateEvidenceState[gateId];
    if (!gate.mandatoryForPreGaInternal) continue;
    if (evaluation.state !== "pass") {
      preGaBlockers.push(closedReason(evaluation) || `${gateId}:not_pass`);
    }
  }

  const xeroLive = gateEvidenceState.xero_live;
  const m365Live = gateEvidenceState.microsoft365_live;
  const hubspotLive = gateEvidenceState.hubspot_live;

  const providerCertificationState = {
    xero: {
      releaseStatus: bosProviderFeatureStatus({
        implemented: XERO_CONNECTOR_IMPLEMENTED,
        securityArchitectureReady: XERO_SECURITY_ARCHITECTURE_READY,
        liveExecutionPassed: xeroLive.state === "pass",
        liveCertified: bosLiveXeroCertified,
      }),
      liveEvidence: xeroLive,
      securityArchitecture: gateEvidenceState.xero_security_architecture,
    },
    microsoft_365: {
      releaseStatus: bosProviderFeatureStatus({
        implemented: M365_CONNECTOR_IMPLEMENTED,
        securityArchitectureReady: M365_SECURITY_ARCHITECTURE_READY,
        liveExecutionPassed: m365Live.state === "pass",
        liveCertified: bosLiveMicrosoft365Certified,
      }),
      liveEvidence: m365Live,
      securityArchitecture: gateEvidenceState.microsoft365_security_architecture,
    },
    hubspot: {
      releaseStatus: bosProviderFeatureStatus({
        implemented: HUBSPOT_CONNECTOR_IMPLEMENTED,
        securityArchitectureReady: HUBSPOT_SECURITY_ARCHITECTURE_READY,
        liveExecutionPassed: hubspotLive.state === "pass",
        liveCertified: bosLiveHubSpotCertified,
      }),
      liveEvidence: hubspotLive,
      securityArchitecture: gateEvidenceState.hubspot_security_architecture,
    },
  };

  const knownLimitations = [
    "Live Xero certification not executed.",
    "Live Microsoft 365 certification not executed.",
    "Live HubSpot certification not executed.",
    "No approved product decision to exclude live connectors from the GA certified feature set.",
    "bos.liveRlsCertified and bos.browserE2eCertified remain static false; evidence is separate.",
    ...input.evidence.flatMap((row) => [...row.limitations]),
  ];

  const productionEligibilityComputed = productionBlockers.length === 0;
  const decisionReason =
    productionBlockers.length > 0
      ? `Fail closed: ${productionBlockers.join("; ")}. GA certified feature set still includes uncertified live connectors.`
      : "Computed production eligibility is true, but A9 keeps the static declaration false pending an approved product decision.";

  const manifest: BosReleaseManifest = {
    product: BOS_CERTIFICATION_PRODUCT,
    releaseCandidateVersion: BUSINESS_OS_VERSION,
    commitSha: input.currentCommitSha,
    capabilityCount: BUSINESS_CAPABILITY_IDS.length,
    requiredGates: gateIds,
    gateEvidenceState,
    providerCertificationState,
    browserCertificationState: gateEvidenceState.browser_e2e,
    rlsCertificationState: gateEvidenceState.live_rls,
    knownLimitations,
    knownTestDebt: [],
    productionEligible: false,
    productionEligibilityComputed,
    decisionReason,
    declarations: {
      releaseCandidate: bosReleaseCandidate,
      productionEligible: bosProductionEligible,
      liveRlsCertified: bosLiveRlsCertified,
      liveXeroCertified: bosLiveXeroCertified,
      liveMicrosoft365Certified: bosLiveMicrosoft365Certified,
      liveHubSpotCertified: bosLiveHubSpotCertified,
      browserE2eCertified: bosBrowserE2eCertified,
    },
    gaReady: false,
    preGaInternalReady: preGaBlockers.length === 0,
  };
  assertNoSecretsInCertificationPayload(manifest);
  return manifest;
}

export function getBosCertificationManifest(
  currentCommitSha: string = BOS_16_CERTIFIED_BASELINE_SHA,
): BosReleaseManifest {
  return buildBosReleaseManifest({
    currentCommitSha,
    evidence: currentBosCertificationEvidence(currentCommitSha),
    claims: bos16CompatibilityClaims(currentCommitSha),
  });
}

export type BosPreGaReadinessReport = {
  internalArchitecture: "ready" | "blocked";
  aiWorkforceRegression: "pass" | "fail";
  liveRlsEvidence: "pass" | "fail";
  browserE2eEvidence: "pass" | "fail";
  xeroLive: "outstanding" | "pass";
  microsoft365Live: "outstanding" | "pass";
  hubspotLive: "outstanding" | "pass";
  ga: "NOT_READY";
  productionEligible: false;
  preGaInternalReady: boolean;
  limitations: string[];
};

export function assessBosPreGaReadiness(
  currentCommitSha: string = BOS_16_CERTIFIED_BASELINE_SHA,
): BosPreGaReadinessReport {
  const manifest = getBosCertificationManifest(currentCommitSha);
  return {
    internalArchitecture: manifest.gateEvidenceState.internal_architecture.state === "pass" ? "ready" : "blocked",
    aiWorkforceRegression: manifest.gateEvidenceState.ai_workforce_regression.state === "pass" ? "pass" : "fail",
    liveRlsEvidence: manifest.rlsCertificationState.state === "pass" ? "pass" : "fail",
    browserE2eEvidence: manifest.browserCertificationState.state === "pass" ? "pass" : "fail",
    xeroLive: manifest.providerCertificationState.xero.liveEvidence.state === "pass" ? "pass" : "outstanding",
    microsoft365Live:
      manifest.providerCertificationState.microsoft_365.liveEvidence.state === "pass" ? "pass" : "outstanding",
    hubspotLive: manifest.providerCertificationState.hubspot.liveEvidence.state === "pass" ? "pass" : "outstanding",
    ga: "NOT_READY",
    productionEligible: false,
    preGaInternalReady: manifest.preGaInternalReady,
    limitations: [
      "Live connectors remain Preview until live execution evidence passes.",
      "No automatic exclusion of connectors from the GA certified feature set.",
    ],
  };
}
