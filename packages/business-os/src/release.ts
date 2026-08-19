/**
 * BOS-13 release-candidate indicators.
 * Live/provider/browser flags stay false unless those tests actually executed.
 * Do not infer live certification from fixtures, SQL inspection, or skipped suites.
 */
import {
  ExternalWritesDisabled,
  NoAutonomousApproval,
  NoVendorHardDependency,
  BUSINESS_OS_PHASE,
  BUSINESS_OS_VERSION,
  canonicalDomainMutationBypass,
  crossTenantAgentAccess,
  crossTenantConnectorAccess,
  directAgentProviderAccess,
  duplicateAgentRuntimeDetected,
  duplicateIntegrationStackDetected,
  duplicateKnowledgeGraphDetected,
  implementsOwnAiStack,
  suppressedIdentityReconstructionBlocked,
  unrestrictedGraphAccess,
} from "./version";

export const BOS_12_BASELINE_SHA = "cc62457fc96ea2daf0bc9d38757562cd1c753f80" as const;
export const BOS_13_VERDICT = "PASS_WITH_LIMITATIONS" as const;

export const bosReleaseCandidate = true as const;
export const bosProductionEligible = false as const;
export const bosLiveRlsCertified = false as const;
export const bosLiveXeroCertified = false as const;
export const bosLiveMicrosoft365Certified = false as const;
export const bosLiveHubSpotCertified = false as const;
export const bosBrowserE2eCertified = false as const;

export const LIVE_RLS_STATUS = "LIVE_RLS_NOT_CERTIFIED" as const;
export const BROWSER_E2E_STATUS = "BROWSER_E2E_NOT_CERTIFIED" as const;

export type ConnectorCertificationLevel =
  | "CONTRACT_CERTIFIED"
  | "SANDBOX_CERTIFIED"
  | "LIVE_PROVIDER_CERTIFIED"
  | "NOT_CERTIFIED";

export const BOS_CONNECTOR_CERTIFICATION = {
  xero: {
    contract: "CONTRACT_CERTIFIED",
    fixture: "SANDBOX_CERTIFIED",
    sandbox: "SANDBOX_CERTIFIED",
    live: "NOT_CERTIFIED",
  },
  microsoft_365: {
    contract: "CONTRACT_CERTIFIED",
    fixture: "SANDBOX_CERTIFIED",
    sandbox: "SANDBOX_CERTIFIED",
    live: "NOT_CERTIFIED",
  },
  hubspot: {
    contract: "CONTRACT_CERTIFIED",
    fixture: "SANDBOX_CERTIFIED",
    sandbox: "SANDBOX_CERTIFIED",
    live: "NOT_CERTIFIED",
  },
} as const satisfies Record<
  "xero" | "microsoft_365" | "hubspot",
  {
    contract: ConnectorCertificationLevel;
    fixture: ConnectorCertificationLevel;
    sandbox: ConnectorCertificationLevel;
    live: ConnectorCertificationLevel;
  }
>;

export const BOS_13_WEB_TSC_RECONCILIATION = [
  {
    file: "apps/web/src/app/(platform)/business/page.tsx",
    error: "busy / setBusy used without useState",
    classification: "PRE_EXISTING_BEFORE_BOS_12",
    introducedBy: "BOS-1",
    status: "RESOLVED",
  },
  {
    file: "apps/web/src/app/(platform)/business/operations/page.tsx",
    error: "StatusChip unknown prop label",
    classification: "PRE_EXISTING_BEFORE_BOS_12",
    introducedBy: "BOS-7",
    status: "RESOLVED",
  },
  {
    file: "apps/web/src/app/(platform)/business/operations/[id]/page.tsx",
    error: "StatusChip unknown prop label",
    classification: "PRE_EXISTING_BEFORE_BOS_12",
    introducedBy: "BOS-7",
    status: "RESOLVED",
  },
] as const;

export const BOS_PRODUCTION_GA_REMAINING_GATES = [
  "LIVE_RLS_NOT_CERTIFIED",
  "LIVE_XERO_NOT_CERTIFIED",
  "LIVE_MICROSOFT_365_NOT_CERTIFIED",
  "LIVE_HUBSPOT_NOT_CERTIFIED",
  "BROWSER_E2E_NOT_CERTIFIED",
  "inherited_engineering_os_web_tsc_baseline_debt",
] as const;

export const BOS_13_PERFORMANCE_ENVIRONMENT = "cloud-agent-fixture" as const;
export const BOS_13_PERFORMANCE_DATASET_SIZE = 400 as const;

export function liveRlsEnvironmentAvailable(): boolean {
  return Boolean(
    process.env.SUPABASE_TEST_URL &&
      process.env.SUPABASE_TEST_ANON_KEY &&
      (process.env.BOS_RLS_TENANT_A_JWT || process.env.COMMERCE_RLS_TENANT_A_JWT) &&
      (process.env.BOS_RLS_TENANT_B_JWT || process.env.COMMERCE_RLS_TENANT_B_JWT) &&
      (process.env.BOS_RLS_TENANT_B_ID || process.env.COMMERCE_RLS_TENANT_B_ID),
  );
}

export function liveProviderCredentialsAvailable(provider: "xero" | "microsoft_365" | "hubspot"): boolean {
  if (provider === "xero") {
    return Boolean(process.env.XERO_CLIENT_ID && process.env.XERO_CLIENT_SECRET && process.env.XERO_SECRET_ID);
  }
  if (provider === "microsoft_365") {
    return Boolean(process.env.MS365_CLIENT_ID && process.env.MS365_CLIENT_SECRET && process.env.MS365_SECRET_ID);
  }
  return Boolean(process.env.HUBSPOT_ACCESS_TOKEN || process.env.HUBSPOT_SECRET_ID);
}

export const BOS_RELEASE_INDICATORS = {
  "bos.releaseCandidate": bosReleaseCandidate,
  "bos.productionEligible": bosProductionEligible,
  "bos.liveRlsCertified": bosLiveRlsCertified,
  "bos.liveXeroCertified": bosLiveXeroCertified,
  "bos.liveMicrosoft365Certified": bosLiveMicrosoft365Certified,
  "bos.liveHubSpotCertified": bosLiveHubSpotCertified,
  "bos.browserE2eCertified": bosBrowserE2eCertified,
  implementsOwnAiStack,
  duplicateIntegrationStackDetected,
  duplicateAgentRuntimeDetected,
  duplicateKnowledgeGraphDetected,
  ExternalWritesDisabled,
  NoVendorHardDependency,
  NoAutonomousApproval,
  directAgentProviderAccess,
  unrestrictedGraphAccess,
  canonicalDomainMutationBypass,
  crossTenantConnectorAccess,
  crossTenantAgentAccess,
  suppressedIdentityReconstructionBlocked,
} as const;

export function getBosReleaseDeclaration() {
  return {
    version: BUSINESS_OS_VERSION,
    phase: BUSINESS_OS_PHASE,
    verdict: BOS_13_VERDICT,
    baselineSha: BOS_12_BASELINE_SHA,
    liveRlsStatus: LIVE_RLS_STATUS,
    browserE2eStatus: BROWSER_E2E_STATUS,
    connectorCertification: BOS_CONNECTOR_CERTIFICATION,
    webTscReconciliation: BOS_13_WEB_TSC_RECONCILIATION,
    productionGaRemainingGates: BOS_PRODUCTION_GA_REMAINING_GATES,
    releaseCandidateReady: bosReleaseCandidate,
    productionGaReady: bosProductionEligible,
    indicators: BOS_RELEASE_INDICATORS,
  } as const;
}
