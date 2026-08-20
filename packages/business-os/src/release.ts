/**
 * BOS-15 live GA certification indicators.
 * Live RLS, live providers, and browser E2E stay false unless those tests actually executed.
 * Do not infer live certification from fixtures, SQL inspection, skipped suites, or preflight presence checks.
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
export const BOS_14_CERTIFIED_SHA = "1a52a8fedf065756ce78d1021e2a3bfda1546ea8" as const;
export const BOS_13_VERDICT = "PASS_WITH_LIMITATIONS" as const;
export const BOS_14_VERDICT = "PASS_WITH_LIMITATIONS" as const;
export const BOS_15_VERDICT = "PASS_WITH_LIMITATIONS" as const;

export const bosReleaseCandidate = true as const;
export const bosProductionEligible = false as const;
export const bosLiveRlsCertified = false as const;
export const bosLiveXeroCertified = false as const;
export const bosLiveMicrosoft365Certified = false as const;
export const bosLiveHubSpotCertified = false as const;
export const bosBrowserE2eCertified = false as const;

export const LIVE_RLS_STATUS = "LIVE_RLS_NOT_CERTIFIED" as const;
export const BOS14A_STATUS = "BOS14A_BLOCKED_LIVE_RLS_ENV" as const;
export const BOS15A_STATUS = "BOS15A_PREFLIGHT_COMPLETE" as const;
export const BOS15B_STATUS = "BOS15B_BLOCKED_LIVE_RLS_ENV" as const;
export const BROWSER_E2E_STATUS = "BROWSER_E2E_NOT_CERTIFIED" as const;
export const BOS14C_STATUS = "BOS14C_BLOCKED_BROWSER_ENV" as const;
export const BOS15F_STATUS = "BOS15F_BLOCKED_BROWSER_ENV" as const;
export const BOS15C_STATUS = "BOS15C_XERO_BLOCKED_ENV" as const;
export const BOS15D_STATUS = "BOS15D_MICROSOFT_365_BLOCKED_ENV" as const;
export const BOS15E_STATUS = "BOS15E_HUBSPOT_BLOCKED_ENV" as const;

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

export const BOS15_PROVIDER_STATUS = BOS14B_PROVIDER_STATUS;

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
  "BOS15B_BLOCKED_LIVE_RLS_ENV",
  "BOS15C_XERO_BLOCKED_ENV",
  "BOS15D_MICROSOFT_365_BLOCKED_ENV",
  "BOS15E_HUBSPOT_BLOCKED_ENV",
  "BOS15F_BLOCKED_BROWSER_ENV",
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

export const BOS_15_BROWSER_ROUTES = [
  ...BOS_14_BROWSER_ROUTES,
  "/business/customers/demo",
  "/business/operations/demo",
  "/business/decisions/demo",
  "/business/risk/demo",
  "/business/settings",
] as const;

export const BOS_13_PERFORMANCE_ENVIRONMENT = "cloud-agent-fixture" as const;
export const BOS_13_PERFORMANCE_DATASET_SIZE = 400 as const;
export const BOS_14_PERFORMANCE_ENVIRONMENT = "cloud-agent-fixture" as const;
export const BOS_14_PERFORMANCE_DATASET_SIZE = 1200 as const;
export const BOS_14_PERFORMANCE_CONCURRENCY = 4 as const;

export type Bos15Presence = "present" | "missing";

function envPresence(...keys: string[]): Bos15Presence {
  return keys.some((key) => {
    const value = process.env[key];
    return typeof value === "string" && value.trim().length > 0;
  })
    ? "present"
    : "missing";
}

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

export function bos15EnvironmentPreflight() {
  const supabaseRefs = {
    SUPABASE_TEST_URL: envPresence("SUPABASE_TEST_URL"),
    approvedTestAnonKey: envPresence("SUPABASE_TEST_ANON_KEY", "NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    provisioningServiceCredential: envPresence("SUPABASE_SERVICE_ROLE_KEY"),
    tenantAJwt: envPresence("BOS_RLS_TENANT_A_JWT", "COMMERCE_RLS_TENANT_A_JWT"),
    tenantBJwt: envPresence("BOS_RLS_TENANT_B_JWT", "COMMERCE_RLS_TENANT_B_JWT"),
    tenantAId: envPresence("BOS_RLS_TENANT_A_ID", "COMMERCE_RLS_TENANT_A_ID"),
    tenantBId: envPresence("BOS_RLS_TENANT_B_ID", "COMMERCE_RLS_TENANT_B_ID"),
    workspaceAId: envPresence("BOS_RLS_WORKSPACE_A_ID"),
    workspaceBId: envPresence("BOS_RLS_WORKSPACE_B_ID"),
    workspaceAJwt: envPresence("BOS_RLS_WORKSPACE_A_JWT"),
    workspaceBJwt: envPresence("BOS_RLS_WORKSPACE_B_JWT"),
  };
  const xeroRefs = {
    clientId: envPresence("XERO_CLIENT_ID"),
    clientSecret: envPresence("XERO_CLIENT_SECRET"),
    secretReference: envPresence("XERO_SECRET_ID"),
    organisationTenantId: envPresence("XERO_TENANT_ID"),
    refreshToken: envPresence("XERO_REFRESH_TOKEN"),
  };
  const microsoft365Refs = {
    clientId: envPresence("MS365_CLIENT_ID"),
    clientSecret: envPresence("MS365_CLIENT_SECRET"),
    secretReference: envPresence("MS365_SECRET_ID"),
    entraTenantId: envPresence("MS365_TENANT_ID"),
    testUser: envPresence("MS365_TEST_USER"),
  };
  const hubspotRefs = {
    accessToken: envPresence("HUBSPOT_ACCESS_TOKEN"),
    secretReference: envPresence("HUBSPOT_SECRET_ID"),
    portalId: envPresence("HUBSPOT_PORTAL_ID"),
  };
  const browserRefs = {
    RTB_TEST_BASE_URL: envPresence("RTB_TEST_BASE_URL"),
    PLAYWRIGHT_BASE_URL: envPresence("PLAYWRIGHT_BASE_URL"),
    E2E_BASE_URL: envPresence("E2E_BASE_URL"),
    supabaseUrl: envPresence("SUPABASE_URL", "SUPABASE_TEST_URL", "NEXT_PUBLIC_SUPABASE_URL"),
    supabaseAnonKey: envPresence("SUPABASE_ANON_KEY", "SUPABASE_TEST_ANON_KEY", "NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    testUser: envPresence("RTB_TEST_USER_EMAIL", "E2E_USER_EMAIL"),
  };

  const supabaseAvailable = liveRlsEnvironmentAvailable();
  const xeroAvailable = liveProviderCredentialsAvailable("xero");
  const microsoft365Available = liveProviderCredentialsAvailable("microsoft_365");
  const hubspotAvailable = liveProviderCredentialsAvailable("hubspot");
  const browserAvailable = browserE2eEnvironmentAvailable();

  return {
    identity: {
      repository: "github.com/sberso2026/AI-Platform",
      cursorEnvironment: "unlinked",
      testEnvironment: "cloud-agent-unlinked",
      phase: BUSINESS_OS_PHASE,
      version: BUSINESS_OS_VERSION,
      bos14CertifiedSha: BOS_14_CERTIFIED_SHA,
    },
    supabase: {
      available: supabaseAvailable,
      executed: false,
      classification: supabaseAvailable ? ("AVAILABLE" as const) : ("BLOCKED_ENV" as const),
      refs: supabaseRefs,
    },
    xero: {
      available: xeroAvailable,
      executed: false,
      classification: xeroAvailable ? ("AVAILABLE" as const) : ("BLOCKED_ENV" as const),
      refs: xeroRefs,
    },
    microsoft365: {
      available: microsoft365Available,
      executed: false,
      classification: microsoft365Available ? ("AVAILABLE" as const) : ("BLOCKED_ENV" as const),
      refs: microsoft365Refs,
    },
    hubspot: {
      available: hubspotAvailable,
      executed: false,
      classification: hubspotAvailable ? ("AVAILABLE" as const) : ("BLOCKED_ENV" as const),
      refs: hubspotRefs,
    },
    browser: {
      available: browserAvailable,
      executed: false,
      classification: browserAvailable ? ("AVAILABLE" as const) : ("BLOCKED_ENV" as const),
      refs: browserRefs,
    },
  } as const;
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
  const preflight = bos15EnvironmentPreflight();
  return {
    version: BUSINESS_OS_VERSION,
    phase: BUSINESS_OS_PHASE,
    verdict: BOS_15_VERDICT,
    baselineSha: BOS_14_CERTIFIED_SHA,
    bos12BaselineSha: BOS_12_BASELINE_SHA,
    bos13CertifiedSha: BOS_13_CERTIFIED_SHA,
    bos14CertifiedSha: BOS_14_CERTIFIED_SHA,
    liveRlsStatus: LIVE_RLS_STATUS,
    bos14aStatus: BOS14A_STATUS,
    bos14bStatus: BOS14B_PROVIDER_STATUS,
    bos14cStatus: BOS14C_STATUS,
    bos15aStatus: BOS15A_STATUS,
    bos15bStatus: BOS15B_STATUS,
    bos15cStatus: BOS15C_STATUS,
    bos15dStatus: BOS15D_STATUS,
    bos15eStatus: BOS15E_STATUS,
    bos15fStatus: BOS15F_STATUS,
    bos15ProviderStatus: BOS15_PROVIDER_STATUS,
    browserE2eStatus: BROWSER_E2E_STATUS,
    connectorCertification: BOS_CONNECTOR_CERTIFICATION,
    webTscReconciliation: BOS_13_WEB_TSC_RECONCILIATION,
    productionGaRemainingGates: BOS_PRODUCTION_GA_REMAINING_GATES,
    releaseCandidateReady: bosReleaseCandidate,
    productionGaReady: bosProductionEligible,
    preflight,
    indicators: BOS_RELEASE_INDICATORS,
  } as const;
}
