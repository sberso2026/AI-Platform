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
  assessBosBrowserPreflightHonesty,
  assertBosProviderCertifiedProjection,
  assertNoSecretsInCertificationPayload,
  bosProviderFeatureStatus,
  evaluateCertificationGate,
} from "./certification-evidence";
import {
  BOS_GA_CERTIFIED_PROVIDERS,
  BOS_V1_CORE_GA_GATES,
  BOS_V1_FEATURE_SET,
  BOS_V1_FINAL_QUALIFICATION_PLAN,
  BOS_V1_PROVIDER_PROMOTION_STEPS,
  BOS_V1_RELEASE_SCOPE,
  assertBosV1ScopeIntegrity,
  bosV1LiveGateId,
  bosV1ProviderProductStatus,
  bosV1ProviderPromotionPath,
} from "./release-scope";
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
  browserE2eEnvironmentAvailable,
} from "./release";

export const BOS_16_BOUNDARY_NOTE =
  "BOS-16A11 qualifies BOS Core v1.0 against the A10 freeze. Do not start BOS-17 or create a GA tag." as const;

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

const BASELINE_EXECUTED_AT = "2026-08-29T09:45:20.000Z";
const A11_EXECUTED_AT = "2026-08-29T13:04:56.000Z";

function record(input: Omit<CertificationEvidenceRecord, "product" | "version">): CertificationEvidenceRecord {
  return {
    product: BOS_CERTIFICATION_PRODUCT,
    version: BUSINESS_OS_VERSION,
    ...input,
  };
}

/**
 * Honest current BOS evidence. Live provider gates are not executed.
 * A11 refreshed live RLS and fixture browser E2E against the A10 freeze SHA.
 */
export function currentBosCertificationEvidence(
  currentCommitSha: string = BOS_16_CERTIFIED_BASELINE_SHA,
): CertificationEvidenceRecord[] {
  return [
    record({
      certification_id: "bos16.live-rls.rntonzigxwxcjlcsadip.a11",
      commitSha: BOS_16_CERTIFIED_BASELINE_SHA,
      environmentId: BOS_DEDICATED_STAGING_PROJECT_REF,
      environmentClass: "staging",
      stagingProjectRef: BOS_DEDICATED_STAGING_PROJECT_REF,
      gateId: "live_rls",
      evidenceType: "rls_isolation",
      executionMode: "live",
      result: "pass",
      executedAt: A11_EXECUTED_AT,
      suiteId: "packages/platform-certification/src/bos-16-live-rls.test.ts",
      artifactRef: "BOS-16A11 fresh live RLS on dedicated staging; user JWTs not service-role",
      supersedes: "bos16.live-rls.rntonzigxwxcjlcsadip.063c482",
      limitations: [
        "A11 refreshed live RLS against rntonzigxwxcjlcsadip using Platform identity sign-in.",
        "Release declaration bos.liveRlsCertified remains false.",
      ],
    }),
    record({
      certification_id: "bos16.browser-e2e.fixture.a11",
      commitSha: BOS_16_CERTIFIED_BASELINE_SHA,
      environmentId: "fixture-browser",
      environmentClass: "fixture",
      gateId: "browser_e2e",
      evidenceType: "browser_e2e",
      executionMode: "browser",
      result: BROWSER_E2E_EVIDENCE_PASS ? "pass" : "fail",
      executedAt: A11_EXECUTED_AT,
      suiteId: "packages/platform-certification/playwright/bos-16-browser-e2e.spec.ts",
      artifactRef: "BOS-16A11 fixture browser E2E including Core GA flows; repeat-each=2; HubSpot 2/2",
      supersedes: "bos16.browser-e2e.fixture.063c482",
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
      executedAt: A11_EXECUTED_AT,
      suiteId: "packages/business-os/src/workforce/service.test.ts",
      artifactRef: "BOS-16A11 AI Workforce fixture regression",
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
        "BOS-16A11 qualifies BOS Core v1.0 against the A10 freeze SHA. Tenant/workspace/RLS, browser integration UX, and connector security architecture remain compatible with the certified ancestor.",
    },
  ];
}

export type BosReleaseManifest = {
  product: typeof BOS_CERTIFICATION_PRODUCT;
  releaseCandidateVersion: string;
  commitSha: string;
  capabilityCount: number;
  requiredGates: BosCertificationGateId[];
  requiredCoreGates: readonly BosCertificationGateId[];
  coreGateEvidence: ReadonlyArray<{
    gateId: BosCertificationGateId;
    gaMandatory: true;
    evidencePresent: boolean;
    state: GateEvaluation["state"];
  }>;
  featureEvidence: ReadonlyArray<{
    featureId: string;
    releaseStatus: string;
    gaMandatory: boolean;
    evidencePresent: boolean;
    promotionRequirements: readonly string[];
    knownLimitations: readonly string[];
  }>;
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
  browserPreflight: ReturnType<typeof assessBosBrowserPreflightHonesty>;
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
  featureSet: typeof BOS_V1_FEATURE_SET;
  releaseScope: typeof BOS_V1_RELEASE_SCOPE;
  coreGaEligibilityComputed: boolean;
  previewPromotion: {
    xero: ReturnType<typeof bosV1ProviderPromotionPath>;
    microsoft_365: ReturnType<typeof bosV1ProviderPromotionPath>;
    hubspot: ReturnType<typeof bosV1ProviderPromotionPath>;
  };
  qualificationPlan: typeof BOS_V1_FINAL_QUALIFICATION_PLAN;
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
  assertBosV1ScopeIntegrity();
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

  const xeroStatus = bosProviderFeatureStatus({
    implemented: XERO_CONNECTOR_IMPLEMENTED,
    securityArchitectureReady: XERO_SECURITY_ARCHITECTURE_READY,
    liveExecutionPassed: xeroLive.state === "pass",
    liveCertified: bosLiveXeroCertified,
  });
  const m365Status = bosProviderFeatureStatus({
    implemented: M365_CONNECTOR_IMPLEMENTED,
    securityArchitectureReady: M365_SECURITY_ARCHITECTURE_READY,
    liveExecutionPassed: m365Live.state === "pass",
    liveCertified: bosLiveMicrosoft365Certified,
  });
  const hubspotStatus = bosProviderFeatureStatus({
    implemented: HUBSPOT_CONNECTOR_IMPLEMENTED,
    securityArchitectureReady: HUBSPOT_SECURITY_ARCHITECTURE_READY,
    liveExecutionPassed: hubspotLive.state === "pass",
    liveCertified: bosLiveHubSpotCertified,
  });
  assertBosProviderCertifiedProjection({ status: xeroStatus, liveExecutionPassed: xeroLive.state === "pass" });
  assertBosProviderCertifiedProjection({ status: m365Status, liveExecutionPassed: m365Live.state === "pass" });
  assertBosProviderCertifiedProjection({ status: hubspotStatus, liveExecutionPassed: hubspotLive.state === "pass" });

  const providerCertificationState = {
    xero: {
      releaseStatus: bosV1ProviderProductStatus("xero"),
      liveEvidence: xeroLive,
      securityArchitecture: gateEvidenceState.xero_security_architecture,
    },
    microsoft_365: {
      releaseStatus: bosV1ProviderProductStatus("microsoft_365"),
      liveEvidence: m365Live,
      securityArchitecture: gateEvidenceState.microsoft365_security_architecture,
    },
    hubspot: {
      releaseStatus: bosV1ProviderProductStatus("hubspot"),
      liveEvidence: hubspotLive,
      securityArchitecture: gateEvidenceState.hubspot_security_architecture,
    },
  };

  const knownLimitations = [
    "Live Xero certification not executed; Xero remains Preview.",
    "Live Microsoft 365 certification not executed; Microsoft 365 remains Preview.",
    "Live HubSpot certification not executed; HubSpot remains Preview.",
    "A11 product decision: BOS Core is the v1.0 GA feature set; live connectors are Preview and not Core GA gates.",
    "bos.productionEligible remains false until explicit GA promotion after A11 qualification.",
    "bos.liveRlsCertified and bos.browserE2eCertified remain static false; evidence is separate.",
    ...input.evidence.flatMap((row) => [...row.limitations]),
  ];

  const productionEligibilityComputed = productionBlockers.length === 0;
  const coreGaEligibilityComputed = BOS_V1_CORE_GA_GATES.every(
    (gateId) => gateEvidenceState[gateId].state === "pass",
  );
  const decisionReason =
    productionBlockers.length > 0
      ? `Fail closed: ${productionBlockers.join("; ")}.`
      : "BOS Core GA gates currently pass with Preview connectors excluded from the certified feature set. A11 keeps bos.productionEligible=false pending explicit GA promotion.";

  const coreGateEvidence = BOS_V1_CORE_GA_GATES.map((gateId) => ({
    gateId,
    gaMandatory: true as const,
    evidencePresent: gateEvidenceState[gateId].state === "pass",
    state: gateEvidenceState[gateId].state,
  }));

  const featureEvidence = BOS_V1_FEATURE_SET.map((feature) => {
    if (feature.liveProvider) {
      const provider = feature.featureId.replace("connector.", "") as "xero" | "microsoft_365" | "hubspot";
      const live = gateEvidenceState[bosV1LiveGateId(provider)];
      return {
        featureId: feature.featureId,
        releaseStatus: feature.productStatus,
        gaMandatory: feature.gaMandatory,
        evidencePresent: live.state === "pass",
        promotionRequirements: [...BOS_V1_PROVIDER_PROMOTION_STEPS],
        knownLimitations: feature.knownLimitations,
      };
    }
    return {
      featureId: feature.featureId,
      releaseStatus: feature.productStatus,
      gaMandatory: feature.gaMandatory,
      evidencePresent: feature.implemented,
      promotionRequirements: [] as string[],
      knownLimitations: feature.knownLimitations,
    };
  });

  const manifest: BosReleaseManifest = {
    product: BOS_CERTIFICATION_PRODUCT,
    releaseCandidateVersion: BUSINESS_OS_VERSION,
    commitSha: input.currentCommitSha,
    capabilityCount: BUSINESS_CAPABILITY_IDS.length,
    requiredGates: gateIds,
    requiredCoreGates: BOS_V1_CORE_GA_GATES,
    coreGateEvidence,
    featureEvidence,
    gateEvidenceState,
    providerCertificationState,
    browserCertificationState: gateEvidenceState.browser_e2e,
    browserPreflight: assessBosBrowserPreflightHonesty({
      available: browserE2eEnvironmentAvailable(),
      evidenceResult: gateEvidenceState.browser_e2e.state,
      certifiedDeclaration: bosBrowserE2eCertified,
    }),
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
    featureSet: BOS_V1_FEATURE_SET,
    releaseScope: BOS_V1_RELEASE_SCOPE,
    coreGaEligibilityComputed,
    previewPromotion: {
      xero: bosV1ProviderPromotionPath("xero"),
      microsoft_365: bosV1ProviderPromotionPath("microsoft_365"),
      hubspot: bosV1ProviderPromotionPath("hubspot"),
    },
    qualificationPlan: BOS_V1_FINAL_QUALIFICATION_PLAN,
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

export function bosBrowserCertificationState(options?: {
  available?: boolean;
  requiredForNewExecution?: boolean;
  currentCommitSha?: string;
}) {
  const currentCommitSha = options?.currentCommitSha ?? BOS_16_CERTIFIED_BASELINE_SHA;
  const evidence = evaluateCertificationGate({
    gateId: "browser_e2e",
    evidence: currentBosCertificationEvidence(currentCommitSha),
    currentCommitSha,
    claims: bos16CompatibilityClaims(currentCommitSha),
  });
  return assessBosBrowserPreflightHonesty({
    available: options?.available ?? browserE2eEnvironmentAvailable(),
    evidenceResult: evidence.state,
    certifiedDeclaration: bosBrowserE2eCertified,
    requiredForNewExecution: options?.requiredForNewExecution,
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
      "Live connectors remain Preview until live execution evidence passes and an explicit promotion occurs.",
      "A11 qualified BOS Core as the v1.0 GA feature set; productionEligible stays false until explicit GA promotion.",
    ],
  };
}
