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
export const XERO_CONNECTOR_IMPLEMENTED = true as const;
export const XERO_SECURITY_ARCHITECTURE_READY = true as const;
export const XERO_LIVE_CERTIFICATION_EXECUTED = false as const;
export const bosLiveMicrosoft365Certified = false as const;
export const M365_CONNECTOR_IMPLEMENTED = true as const;
export const M365_SECURITY_ARCHITECTURE_READY = true as const;
export const M365_LIVE_CERTIFICATION_EXECUTED = false as const;
export const bosLiveHubSpotCertified = false as const;
export const HUBSPOT_CONNECTOR_IMPLEMENTED = true as const;
export const HUBSPOT_SECURITY_ARCHITECTURE_READY = true as const;
export const HUBSPOT_LIVE_CERTIFICATION_EXECUTED = false as const;
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

export class BosStagingTargetError extends Error {
  readonly code = "BOS_STAGING_TARGET_INVALID" as const;
  constructor(message: string) {
    super(message);
    this.name = "BosStagingTargetError";
  }
}

export class BosLiveRlsEnvironmentError extends Error {
  readonly code = "BOS_LIVE_RLS_ENV_INVALID" as const;
  constructor(message: string) {
    super(message);
    this.name = "BosLiveRlsEnvironmentError";
  }
}

export class BosLiveXeroEnvironmentError extends Error {
  readonly code = "BOS_LIVE_XERO_ENV_INVALID" as const;
  constructor(message: string) {
    super(message);
    this.name = "BosLiveXeroEnvironmentError";
  }
}

export type BosLiveXeroEnvironmentAssessment =
  | { status: "unavailable"; reason: "no_live_configuration" }
  | { status: "available" };

const BOS_LIVE_XERO_KEYS = [
  "XERO_CLIENT_ID",
  "XERO_CLIENT_SECRET",
  "XERO_SECRET_ID",
  "XERO_TENANT_ID",
  "XERO_REFRESH_TOKEN",
] as const;

export class BosLiveMicrosoft365EnvironmentError extends Error {
  readonly code = "BOS_LIVE_M365_ENV_INVALID" as const;
  constructor(message: string) {
    super(message);
    this.name = "BosLiveMicrosoft365EnvironmentError";
  }
}

export type BosLiveMicrosoft365EnvironmentAssessment =
  | { status: "unavailable"; reason: "no_live_configuration" }
  | { status: "available" };

const BOS_LIVE_M365_KEYS = [
  "MS365_CLIENT_ID",
  "MS365_CLIENT_SECRET",
  "MS365_SECRET_ID",
  "MS365_TENANT_ID",
  "MS365_REFRESH_TOKEN",
] as const;

export class BosLiveHubSpotEnvironmentError extends Error {
  readonly code = "BOS_LIVE_HUBSPOT_ENV_INVALID" as const;
  constructor(message: string) {
    super(message);
    this.name = "BosLiveHubSpotEnvironmentError";
  }
}

export type BosLiveHubSpotEnvironmentAssessment =
  | { status: "unavailable"; reason: "no_live_configuration" }
  | { status: "available" };

const BOS_LIVE_HUBSPOT_KEYS = [
  "HUBSPOT_CLIENT_ID",
  "HUBSPOT_CLIENT_SECRET",
  "HUBSPOT_SECRET_ID",
  "HUBSPOT_PORTAL_ID",
  "HUBSPOT_REFRESH_TOKEN",
] as const;

export type BosStagingTargetAssessment =
  | { status: "unavailable"; reason: "no_staging_target_configuration" }
  | { status: "available"; projectRef: string; hostname: string };

export type BosLiveRlsEnvironmentAssessment =
  | { status: "unavailable"; reason: "no_live_configuration" }
  | { status: "available"; projectRef: string; hostname: string };

const BOS_LIVE_RLS_IDENTITY_KEYS = [
  "SUPABASE_TEST_ANON_KEY",
  "BOS_RLS_TENANT_A_JWT",
  "COMMERCE_RLS_TENANT_A_JWT",
  "BOS_RLS_TENANT_B_JWT",
  "COMMERCE_RLS_TENANT_B_JWT",
  "BOS_RLS_TENANT_A_ID",
  "COMMERCE_RLS_TENANT_A_ID",
  "BOS_RLS_TENANT_B_ID",
  "COMMERCE_RLS_TENANT_B_ID",
  "BOS_RLS_WORKSPACE_A_ID",
  "BOS_RLS_WORKSPACE_B_ID",
  "BOS_RLS_WORKSPACE_A_JWT",
  "BOS_RLS_WORKSPACE_B_JWT",
] as const;

/**
 * Live-RLS attempt is identity/credential presence only.
 * A valid staging target without anon key/JWTs/tenant IDs is not a live-RLS attempt.
 */
const BOS_LIVE_RLS_ATTEMPT_KEYS = BOS_LIVE_RLS_IDENTITY_KEYS;

const BOS_STAGING_PROJECT_REF_PATTERN = /^[a-z0-9]+$/;

function envPresence(...keys: string[]): Bos15Presence {
  return keys.some((key) => {
    const value = process.env[key];
    return typeof value === "string" && value.trim().length > 0;
  })
    ? "present"
    : "missing";
}

function readTrimmedEnv(key: string): string | undefined {
  const value = process.env[key];
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

const PRIVILEGED_JWT_ROLES = new Set(["service_role", "supabase_admin", "anon"]);

function decodeJwtRole(token: string): string | undefined {
  const parts = token.split(".");
  if (parts.length !== 3) return undefined;
  try {
    const json = Buffer.from(parts[1], "base64url").toString("utf8");
    const payload = JSON.parse(json) as { role?: unknown };
    return typeof payload.role === "string" ? payload.role : undefined;
  } catch {
    return undefined;
  }
}

function rejectPrivilegedAccessToken(label: string, token: string): void {
  const serviceRole = readTrimmedEnv("SUPABASE_SERVICE_ROLE_KEY");
  if (serviceRole && token === serviceRole) {
    failClosedBosLiveRls(`${label} rejected: privileged credential cannot certify live RLS`);
  }
  const role = decodeJwtRole(token);
  if (role && PRIVILEGED_JWT_ROLES.has(role)) {
    failClosedBosLiveRls(`${label} rejected: privileged credential cannot certify live RLS`);
  }
}

function bosLiveRlsConfigAttempted(): boolean {
  return BOS_LIVE_RLS_ATTEMPT_KEYS.some((key) => Boolean(readTrimmedEnv(key)));
}

function failClosedBosStagingTarget(message: string): never {
  throw new BosStagingTargetError(message);
}

function failClosedBosLiveRls(message: string): never {
  throw new BosLiveRlsEnvironmentError(message);
}

function incompleteConfigMessage(
  prefix: string,
  required: Record<string, string | undefined>,
): string {
  const present = Object.entries(required)
    .filter(([, value]) => Boolean(value))
    .map(([key]) => key);
  const missing = Object.entries(required)
    .filter(([, value]) => !value)
    .map(([key]) => key);
  return `${prefix} configuration incomplete: present=${present.join(",")} missing=${missing.join(",")}`;
}

function sanitizedStagingUrlError(
  prefix: string,
  stagingRefPresent: boolean,
  stagingRef: string | undefined,
  urlPresent: boolean,
): string {
  if (!urlPresent) {
    return `${prefix} SUPABASE_TEST_URL is missing`;
  }
  if (!stagingRefPresent) {
    return `${prefix} BOS_STAGING_PROJECT_REF is missing`;
  }
  return `${prefix} SUPABASE_TEST_URL rejected for staging ref ${stagingRef}`;
}

function parseBosStagingTargetUrl(
  prefix: string,
  stagingRef: string,
  testUrl: string,
): { hostname: string } {
  let parsed: URL;
  try {
    parsed = new URL(testUrl);
  } catch {
    failClosedBosStagingTarget(sanitizedStagingUrlError(prefix, true, stagingRef, true));
  }

  const hostname = parsed.hostname.toLowerCase();
  const expectedHostname = `${stagingRef}.supabase.co`;
  if (parsed.protocol !== "https:") {
    failClosedBosStagingTarget(`${prefix} SUPABASE_TEST_URL must use HTTPS for staging ref ${stagingRef}`);
  }
  if (parsed.username || parsed.password) {
    failClosedBosStagingTarget(sanitizedStagingUrlError(prefix, true, stagingRef, true));
  }
  if (!hostname.endsWith(".supabase.co") || hostname !== expectedHostname) {
    failClosedBosStagingTarget(
      `${prefix} project-ref mismatch: url_host=${hostname} expected_host=${expectedHostname}`,
    );
  }

  return { hostname };
}

/**
 * Dedicated BOS staging project identity only.
 * Does not require live-RLS anon key, tenant JWTs, tenant IDs, or service role.
 */
export function assessBosStagingTarget(): BosStagingTargetAssessment {
  const stagingRef = readTrimmedEnv("BOS_STAGING_PROJECT_REF");
  const testUrl = readTrimmedEnv("SUPABASE_TEST_URL");
  if (!stagingRef && !testUrl) {
    return { status: "unavailable", reason: "no_staging_target_configuration" };
  }

  const required = {
    BOS_STAGING_PROJECT_REF: stagingRef,
    SUPABASE_TEST_URL: testUrl,
  } as const;
  if (!stagingRef || !testUrl) {
    failClosedBosStagingTarget(incompleteConfigMessage("BOS staging target", required));
  }

  if (!BOS_STAGING_PROJECT_REF_PATTERN.test(stagingRef)) {
    failClosedBosStagingTarget("BOS staging target BOS_STAGING_PROJECT_REF is malformed");
  }

  const { hostname } = parseBosStagingTargetUrl("BOS staging target", stagingRef, testUrl);
  return { status: "available", projectRef: stagingRef, hostname };
}

export function bosStagingTargetAvailable(): boolean {
  return assessBosStagingTarget().status === "available";
}

function requireBosStagingTargetForLiveRls(): Extract<BosStagingTargetAssessment, { status: "available" }> {
  try {
    const target = assessBosStagingTarget();
    if (target.status === "available") {
      return target;
    }
  } catch (error) {
    if (error instanceof BosStagingTargetError) {
      failClosedBosLiveRls(error.message.replaceAll("BOS staging target", "BOS live RLS"));
    }
    throw error;
  }

  failClosedBosLiveRls(
    incompleteConfigMessage("BOS live RLS", {
      BOS_STAGING_PROJECT_REF: undefined,
      SUPABASE_TEST_URL: undefined,
      SUPABASE_TEST_ANON_KEY: readTrimmedEnv("SUPABASE_TEST_ANON_KEY"),
      tenantAJwt: readTrimmedEnv("BOS_RLS_TENANT_A_JWT") ?? readTrimmedEnv("COMMERCE_RLS_TENANT_A_JWT"),
      tenantBJwt: readTrimmedEnv("BOS_RLS_TENANT_B_JWT") ?? readTrimmedEnv("COMMERCE_RLS_TENANT_B_JWT"),
      tenantBId: readTrimmedEnv("BOS_RLS_TENANT_B_ID") ?? readTrimmedEnv("COMMERCE_RLS_TENANT_B_ID"),
    }),
  );
}

/**
 * Live RLS is independent of staging-target presence.
 * Staging-target-only configuration returns unavailable (legitimate skip).
 * Any live-RLS identity/credential key without a complete valid contract fails closed.
 */
export function assessBosLiveRlsEnvironment(): BosLiveRlsEnvironmentAssessment {
  if (!bosLiveRlsConfigAttempted()) {
    return { status: "unavailable", reason: "no_live_configuration" };
  }

  const target = requireBosStagingTargetForLiveRls();
  const anonKey = readTrimmedEnv("SUPABASE_TEST_ANON_KEY");
  const tenantAJwt = readTrimmedEnv("BOS_RLS_TENANT_A_JWT") ?? readTrimmedEnv("COMMERCE_RLS_TENANT_A_JWT");
  const tenantBJwt = readTrimmedEnv("BOS_RLS_TENANT_B_JWT") ?? readTrimmedEnv("COMMERCE_RLS_TENANT_B_JWT");
  const tenantBId = readTrimmedEnv("BOS_RLS_TENANT_B_ID") ?? readTrimmedEnv("COMMERCE_RLS_TENANT_B_ID");

  const required = {
    BOS_STAGING_PROJECT_REF: target.projectRef,
    SUPABASE_TEST_URL: readTrimmedEnv("SUPABASE_TEST_URL"),
    SUPABASE_TEST_ANON_KEY: anonKey,
    tenantAJwt,
    tenantBJwt,
    tenantBId,
  } as const;
  const missing = Object.entries(required)
    .filter(([, value]) => !value)
    .map(([key]) => key);
  if (missing.length > 0) {
    failClosedBosLiveRls(incompleteConfigMessage("BOS live RLS", required));
  }
  if (!tenantAJwt || !tenantBJwt) {
    failClosedBosLiveRls(incompleteConfigMessage("BOS live RLS", required));
  }

  rejectPrivilegedAccessToken("tenantAJwt", tenantAJwt);
  rejectPrivilegedAccessToken("tenantBJwt", tenantBJwt);

  return { status: "available", projectRef: target.projectRef, hostname: target.hostname };
}

export function liveRlsEnvironmentAvailable(): boolean {
  return assessBosLiveRlsEnvironment().status === "available";
}

export function assessBosLiveXeroEnvironment(): BosLiveXeroEnvironmentAssessment {
  if (Object.keys(process.env).some((key) => key.startsWith("NEXT_PUBLIC_XERO_") && readTrimmedEnv(key))) {
    throw new BosLiveXeroEnvironmentError("BOS live Xero NEXT_PUBLIC credential rejected");
  }
  const required = {
    XERO_CLIENT_ID: readTrimmedEnv("XERO_CLIENT_ID"),
    XERO_CLIENT_SECRET: readTrimmedEnv("XERO_CLIENT_SECRET"),
    XERO_SECRET_ID: readTrimmedEnv("XERO_SECRET_ID"),
    XERO_TENANT_ID: readTrimmedEnv("XERO_TENANT_ID"),
    XERO_REFRESH_TOKEN: readTrimmedEnv("XERO_REFRESH_TOKEN"),
  } as const;
  const attempted = BOS_LIVE_XERO_KEYS.some((key) => Boolean(required[key]));
  if (!attempted) {
    return { status: "unavailable", reason: "no_live_configuration" };
  }
  const missing = Object.entries(required)
    .filter(([, value]) => !value)
    .map(([key]) => key);
  if (missing.length > 0) {
    throw new BosLiveXeroEnvironmentError(
      incompleteConfigMessage("BOS live Xero", required as Record<string, string | undefined>),
    );
  }
  return { status: "available" };
}

export function assessBosLiveMicrosoft365Environment(): BosLiveMicrosoft365EnvironmentAssessment {
  if (Object.keys(process.env).some((key) => key.startsWith("NEXT_PUBLIC_MS365_") && readTrimmedEnv(key))) {
    throw new BosLiveMicrosoft365EnvironmentError("BOS live Microsoft 365 NEXT_PUBLIC credential rejected");
  }
  const required = {
    MS365_CLIENT_ID: readTrimmedEnv("MS365_CLIENT_ID"),
    MS365_CLIENT_SECRET: readTrimmedEnv("MS365_CLIENT_SECRET"),
    MS365_SECRET_ID: readTrimmedEnv("MS365_SECRET_ID"),
    MS365_TENANT_ID: readTrimmedEnv("MS365_TENANT_ID"),
    MS365_REFRESH_TOKEN: readTrimmedEnv("MS365_REFRESH_TOKEN"),
  } as const;
  const attempted = BOS_LIVE_M365_KEYS.some((key) => Boolean(required[key]));
  if (!attempted) {
    return { status: "unavailable", reason: "no_live_configuration" };
  }
  const missing = Object.entries(required)
    .filter(([, value]) => !value)
    .map(([key]) => key);
  if (missing.length > 0) {
    throw new BosLiveMicrosoft365EnvironmentError(
      incompleteConfigMessage("BOS live Microsoft 365", required as Record<string, string | undefined>),
    );
  }
  return { status: "available" };
}

export function assessBosLiveHubSpotEnvironment(): BosLiveHubSpotEnvironmentAssessment {
  if (Object.keys(process.env).some((key) => key.startsWith("NEXT_PUBLIC_HUBSPOT_") && readTrimmedEnv(key))) {
    throw new BosLiveHubSpotEnvironmentError("BOS live HubSpot NEXT_PUBLIC credential rejected");
  }
  if (readTrimmedEnv("HUBSPOT_ACCESS_TOKEN") || readTrimmedEnv("HUBSPOT_HAPIKEY")) {
    throw new BosLiveHubSpotEnvironmentError("BOS live HubSpot private-app credential rejected");
  }
  const required = {
    HUBSPOT_CLIENT_ID: readTrimmedEnv("HUBSPOT_CLIENT_ID"),
    HUBSPOT_CLIENT_SECRET: readTrimmedEnv("HUBSPOT_CLIENT_SECRET"),
    HUBSPOT_SECRET_ID: readTrimmedEnv("HUBSPOT_SECRET_ID"),
    HUBSPOT_PORTAL_ID: readTrimmedEnv("HUBSPOT_PORTAL_ID"),
    HUBSPOT_REFRESH_TOKEN: readTrimmedEnv("HUBSPOT_REFRESH_TOKEN"),
  } as const;
  const attempted = BOS_LIVE_HUBSPOT_KEYS.some((key) => Boolean(required[key]));
  if (!attempted) {
    return { status: "unavailable", reason: "no_live_configuration" };
  }
  const missing = Object.entries(required)
    .filter(([, value]) => !value)
    .map(([key]) => key);
  if (missing.length > 0) {
    throw new BosLiveHubSpotEnvironmentError(
      incompleteConfigMessage("BOS live HubSpot", required as Record<string, string | undefined>),
    );
  }
  const portalId = required.HUBSPOT_PORTAL_ID;
  if (portalId && !/^\d+$/.test(portalId)) {
    throw new BosLiveHubSpotEnvironmentError("BOS live HubSpot portal id must be numeric");
  }
  return { status: "available" };
}

export function liveProviderCredentialsAvailable(provider: "xero" | "microsoft_365" | "hubspot"): boolean {
  if (provider === "xero") {
    return assessBosLiveXeroEnvironment().status === "available";
  }
  if (provider === "microsoft_365") {
    return assessBosLiveMicrosoft365Environment().status === "available";
  }
  return assessBosLiveHubSpotEnvironment().status === "available";
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
    BOS_STAGING_PROJECT_REF: envPresence("BOS_STAGING_PROJECT_REF"),
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
    refreshToken: envPresence("MS365_REFRESH_TOKEN"),
    testUser: envPresence("MS365_TEST_USER"),
  };
  const hubspotRefs = {
    clientId: envPresence("HUBSPOT_CLIENT_ID"),
    clientSecret: envPresence("HUBSPOT_CLIENT_SECRET"),
    secretReference: envPresence("HUBSPOT_SECRET_ID"),
    portalId: envPresence("HUBSPOT_PORTAL_ID"),
    refreshToken: envPresence("HUBSPOT_REFRESH_TOKEN"),
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
      executed: XERO_LIVE_CERTIFICATION_EXECUTED,
      classification: xeroAvailable ? ("AVAILABLE" as const) : ("BLOCKED_ENV" as const),
      refs: xeroRefs,
      readiness: {
        connectorImplemented: XERO_CONNECTOR_IMPLEMENTED,
        securityArchitectureReady: XERO_SECURITY_ARCHITECTURE_READY,
        liveCredentialsAvailable: xeroAvailable,
        liveCertificationExecuted: XERO_LIVE_CERTIFICATION_EXECUTED,
      },
    },
    microsoft365: {
      available: microsoft365Available,
      executed: M365_LIVE_CERTIFICATION_EXECUTED,
      classification: microsoft365Available ? ("AVAILABLE" as const) : ("BLOCKED_ENV" as const),
      refs: microsoft365Refs,
      readiness: {
        connectorImplemented: M365_CONNECTOR_IMPLEMENTED,
        securityArchitectureReady: M365_SECURITY_ARCHITECTURE_READY,
        liveCredentialsAvailable: microsoft365Available,
        liveCertificationExecuted: M365_LIVE_CERTIFICATION_EXECUTED,
      },
    },
    hubspot: {
      available: hubspotAvailable,
      executed: HUBSPOT_LIVE_CERTIFICATION_EXECUTED,
      classification: hubspotAvailable ? ("AVAILABLE" as const) : ("BLOCKED_ENV" as const),
      refs: hubspotRefs,
      readiness: {
        connectorImplemented: HUBSPOT_CONNECTOR_IMPLEMENTED,
        securityArchitectureReady: HUBSPOT_SECURITY_ARCHITECTURE_READY,
        liveCredentialsAvailable: hubspotAvailable,
        liveCertificationExecuted: HUBSPOT_LIVE_CERTIFICATION_EXECUTED,
      },
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
