/**
 * BOS-14 production GA closure indicators.
 * Live RLS, live providers, and browser E2E stay false unless those tests actually executed.
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
export const BOS_13_CERTIFIED_SHA = "be2f7e14af2ed10c0a123c84ce9ac51d702474ee" as const;
export const BOS_13_VERDICT = "PASS_WITH_LIMITATIONS" as const;
export const BOS_14_VERDICT = "PASS_WITH_LIMITATIONS" as const;

export const bosReleaseCandidate = true as const;
export const bosProductionEligible = false as const;
export const bosLiveRlsCertified = false as const;
export const bosLiveXeroCertified = false as const;
export const bosLiveMicrosoft365Certified = false as const;
export const bosLiveHubSpotCertified = false as const;
export const bosBrowserE2eCertified = false as const;

export const LIVE_RLS_STATUS = "LIVE_RLS_NOT_CERTIFIED" as const;
export const BOS14A_STATUS = "BOS14A_BLOCKED_LIVE_RLS_ENV" as const;
export const BROWSER_E2E_STATUS = "BROWSER_E2E_NOT_CERTIFIED" as const;
export const BOS14C_STATUS = "BOS14C_BLOCKED_BROWSER_ENV" as const;

export type ConnectorCertificationLevel =
  | "CONTRACT_CERTIFIED"
  | "SANDBOX_CERTIFIED"
  | "LIVE_PROVIDER_CERTIFIED"
  | "BLOCKED_ENV"
  | "FAILED"
  | "NOT_CERTIFIED";

export const BOS14B_PROVIDER_STATUS = {
  xero: "BLOCKED_ENV",
  microsoft_365: "BLOCKED_ENV",
  hubspot: "BLOCKED_ENV",
} as const satisfies Record<"xero" | "microsoft_365" | "hubspot", ConnectorCertificationLevel>;

export const BOS_CONNECTOR_CERTIFICATION = {
  xero: {
    contract: "CONTRACT_CERTIFIED",
    fixture: "SANDBOX_CERTIFIED",
    sandbox: "SANDBOX_CERTIFIED",
    live: "BLOCKED_ENV",
  },
  microsoft_365: {
    contract: "CONTRACT_CERTIFIED",
    fixture: "SANDBOX_CERTIFIED",
    sandbox: "SANDBOX_CERTIFIED",
    live: "BLOCKED_ENV",
  },
  hubspot: {
    contract: "CONTRACT_CERTIFIED",
    fixture: "SANDBOX_CERTIFIED",
    sandbox: "SANDBOX_CERTIFIED",
    live: "BLOCKED_ENV",
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
  "BOS14A_BLOCKED_LIVE_RLS_ENV",
  "BOS14B_XERO_BLOCKED_ENV",
  "BOS14B_MICROSOFT_365_BLOCKED_ENV",
  "BOS14B_HUBSPOT_BLOCKED_ENV",
  "BOS14C_BLOCKED_BROWSER_ENV",
  "inherited_engineering_os_web_tsc_baseline_debt",
] as const;

export const BOS_LIVE_RLS_REPRESENTATIVE_TABLES = [
  "business_os_kpis",
  "business_os_finance_snapshots",
  "business_os_growth_leads",
  "business_os_revenue_proposals",
  "business_os_customers",
  "business_os_profit_facts",
  "business_os_work_items",
  "business_os_decisions",
  "business_os_risks",
  "business_os_context_projection_runs",
  "business_os_connector_staging",
] as const;

export const BOS_14_BROWSER_ROUTES = [
  "/business",
  "/business/finance",
  "/business/growth",
  "/business/revenue",
  "/business/customers",
  "/business/profit",
  "/business/operations",
  "/business/decisions",
  "/business/risk",
  "/business/context",
  "/business/ai-workforce",
  "/business/integrations",
] as const;

export const BOS_13_PERFORMANCE_ENVIRONMENT = "cloud-agent-fixture" as const;
export const BOS_13_PERFORMANCE_DATASET_SIZE = 400 as const;
export const BOS_14_PERFORMANCE_ENVIRONMENT = "cloud-agent-fixture" as const;
export const BOS_14_PERFORMANCE_DATASET_SIZE = 1200 as const;
export const BOS_14_PERFORMANCE_CONCURRENCY = 4 as const;

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

export function browserE2eEnvironmentAvailable(): boolean {
  return Boolean(
    (process.env.RTB_TEST_BASE_URL || process.env.PLAYWRIGHT_BASE_URL || process.env.E2E_BASE_URL) &&
      (process.env.SUPABASE_URL || process.env.SUPABASE_TEST_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) &&
      (process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_TEST_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  );
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
    verdict: BOS_14_VERDICT,
    baselineSha: BOS_12_BASELINE_SHA,
    bos13CertifiedSha: BOS_13_CERTIFIED_SHA,
    liveRlsStatus: LIVE_RLS_STATUS,
    bos14aStatus: BOS14A_STATUS,
    bos14bStatus: BOS14B_PROVIDER_STATUS,
    bos14cStatus: BOS14C_STATUS,
    browserE2eStatus: BROWSER_E2E_STATUS,
    connectorCertification: BOS_CONNECTOR_CERTIFICATION,
    webTscReconciliation: BOS_13_WEB_TSC_RECONCILIATION,
    productionGaRemainingGates: BOS_PRODUCTION_GA_REMAINING_GATES,
    releaseCandidateReady: bosReleaseCandidate,
    productionGaReady: bosProductionEligible,
    indicators: BOS_RELEASE_INDICATORS,
  } as const;
}
