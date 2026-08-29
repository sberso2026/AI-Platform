/**
 * BOS v1.0 GA feature-scope freeze (A10).
 * Product/catalog ownership stays on existing Business OS + Commerce coming_soon.
 * This is a release-scope projection, not a second catalog or certification stack.
 */
import { BUSINESS_CAPABILITY_IDS, type BusinessCapabilityId } from "@rtb/types";
import { defaultBusinessCapabilityRegistry } from "./capabilities";
import { NoVendorHardDependency } from "./version";
import type { BosCertificationGateId } from "./certification-evidence";

export const BOS_V1_GA_SCOPE_DEFINED = true as const;
export const BOS_V1_BOUNDARY_NOTE =
  "BOS-16A11 qualifies BOS Core v1.0 against the A10 freeze. Do not declare GA, set productionEligible, create a GA tag, or start BOS-17." as const;

export type BosV1FeatureReleaseClass = "GA_REQUIRED" | "PREVIEW" | "BETA" | "EXCLUDED";
export type BosV1ProviderId = "xero" | "microsoft_365" | "hubspot";

export const BOS_V1_CORE_CAPABILITY_IDS = [
  "owner_command",
  "financial_intelligence",
  "growth_intelligence",
  "revenue_execution",
  "customer_intelligence",
  "profit_intelligence",
  "work_operations",
  "decision_action",
  "business_risk",
  "business_context",
  "ai_workforce",
] as const satisfies readonly BusinessCapabilityId[];

export const BOS_V1_EXCLUDED_CAPABILITY_IDS = [
  "market_intelligence",
  "lead_generation",
  "lead_enrichment",
  "lead_scoring",
  "opportunity_intelligence",
  "proposal_intelligence",
  "pricing_intelligence",
] as const satisfies readonly BusinessCapabilityId[];

export const BOS_V1_PREVIEW_PROVIDERS = ["xero", "microsoft_365", "hubspot"] as const satisfies readonly BosV1ProviderId[];

/** v1.0 GA certified live-provider set is empty: Preview connectors are not production-certified. */
export const BOS_GA_CERTIFIED_PROVIDERS = [] as const satisfies readonly BosV1ProviderId[];

export const BOS_V1_CORE_GA_GATES = [
  "internal_architecture",
  "ai_workforce_regression",
  "live_rls",
  "browser_e2e",
] as const satisfies readonly BosCertificationGateId[];

export const BOS_V1_PROVIDER_PROMOTION_STEPS = [
  "PREVIEW",
  "controlled_live_uat",
  "live_provider_certification_evidence",
  "security_regression",
  "browser_live_flow_evidence",
  "release_manifest_promotion",
  "CERTIFIED",
] as const;

export type BosV1FeatureRecord = {
  featureId: string;
  releaseClass: BosV1FeatureReleaseClass;
  implemented: boolean;
  liveProvider: boolean;
  requiredForCore: boolean;
  gaMandatory: boolean;
  productStatus: "GA_REQUIRED" | "PREVIEW" | "EXCLUDED" | "NOT_AVAILABLE";
  knownLimitations: readonly string[];
};

export const BOS_V1_FEATURE_SET: readonly BosV1FeatureRecord[] = [
  ...BOS_V1_CORE_CAPABILITY_IDS.map((id) => ({
    featureId: id,
    releaseClass: "GA_REQUIRED" as const,
    implemented: true,
    liveProvider: false,
    requiredForCore: true,
    gaMandatory: true,
    productStatus: "GA_REQUIRED" as const,
    knownLimitations: [] as const,
  })),
  ...BOS_V1_EXCLUDED_CAPABILITY_IDS.map((id) => ({
    featureId: id,
    releaseClass: "EXCLUDED" as const,
    implemented: false,
    liveProvider: false,
    requiredForCore: false,
    gaMandatory: false,
    productStatus: "EXCLUDED" as const,
    knownLimitations: ["Registered capability; excluded from v1.0 GA scope."] as const,
  })),
  ...BOS_V1_PREVIEW_PROVIDERS.map((id) => ({
    featureId: `connector.${id}`,
    releaseClass: "PREVIEW" as const,
    implemented: true,
    liveProvider: true,
    requiredForCore: false,
    gaMandatory: false,
    productStatus: "PREVIEW" as const,
    knownLimitations: [
      "Preview. Live-provider certification evidence is absent. Not a BOS Core GA gate.",
    ] as const,
  })),
];

export function bosV1CapabilityReleaseClass(id: BusinessCapabilityId): BosV1FeatureReleaseClass {
  if ((BOS_V1_CORE_CAPABILITY_IDS as readonly string[]).includes(id)) return "GA_REQUIRED";
  return "EXCLUDED";
}

export function bosV1ProviderProductStatus(_provider: BosV1ProviderId): "PREVIEW" {
  return "PREVIEW";
}

export function bosV1ProviderPromotionPath(provider: BosV1ProviderId) {
  return {
    provider,
    currentStatus: "PREVIEW" as const,
    independent: true,
    steps: BOS_V1_PROVIDER_PROMOTION_STEPS,
    requiresLiveEvidence: true,
    cannotPromotePeerProviders: true,
  };
}

export function bosV1LiveGateId(provider: BosV1ProviderId): BosCertificationGateId {
  if (provider === "xero") return "xero_live";
  if (provider === "microsoft_365") return "microsoft365_live";
  return "hubspot_live";
}

export function assertBosProviderPromotion(input: {
  requestedStatus: "PREVIEW" | "CERTIFIED" | "BETA" | "NOT_AVAILABLE";
  liveExecutionPassed: boolean;
}): void {
  if (input.requestedStatus === "CERTIFIED" && !input.liveExecutionPassed) {
    throw new Error("provider_certified_without_live_evidence");
  }
}

export function assertNoPeerProviderPromotion(input: {
  promoted: BosV1ProviderId;
  before: Record<BosV1ProviderId, "PREVIEW" | "CERTIFIED">;
  after: Record<BosV1ProviderId, "PREVIEW" | "CERTIFIED">;
}): void {
  for (const provider of BOS_V1_PREVIEW_PROVIDERS) {
    if (provider === input.promoted) continue;
    if (input.before[provider] !== input.after[provider]) {
      throw new Error("peer_provider_promotion_forbidden");
    }
  }
}

export const BOS_CORE_VENDOR_NEUTRAL_PASS = true as const;
export const BOS_CORE_NO_VENDOR_HARD_DEPENDENCY_PASS = NoVendorHardDependency;
export const BOS_GA_REQUIRED_GATES_DEFINED = true as const;
export const BOS_PREVIEW_PROMOTION_GATES_DEFINED = true as const;
export const BOS_PRODUCTION_ELIGIBILITY_SCOPE_PASS = true as const;

export const BOS_V1_OUTSTANDING_CORE_GA_BLOCKERS = [
  "A11 qualification executed; explicit GA promotion/tag is still required",
  "bos.productionEligible remains false until explicit GA promotion",
  "bos.liveRlsCertified remains false; A11 refreshed evidence, declaration is not promoted",
  "bos.browserE2eCertified remains false; A11 refreshed evidence, declaration is not promoted",
] as const;

export const BOS_V1_OUTSTANDING_PREVIEW_PROMOTION_GATES = [
  "xero: live UAT + live-provider evidence + security regression + browser live-flow + release-manifest promotion",
  "microsoft_365: live UAT + live-provider evidence + security regression + browser live-flow + release-manifest promotion",
  "hubspot: live UAT + live-provider evidence + security regression + browser live-flow + release-manifest promotion",
] as const;

export const BOS_V1_RELEASE_SCOPE = {
  version: "v1.0",
  coreCapabilities: BOS_V1_CORE_CAPABILITY_IDS,
  previewIntegrations: BOS_V1_PREVIEW_PROVIDERS,
  excludedCapabilities: BOS_V1_EXCLUDED_CAPABILITY_IDS,
  mandatoryCoreGates: BOS_V1_CORE_GA_GATES,
  outstandingCoreGaBlockers: BOS_V1_OUTSTANDING_CORE_GA_BLOCKERS,
  outstandingPreviewPromotionGates: BOS_V1_OUTSTANDING_PREVIEW_PROMOTION_GATES,
  gaCertifiedProviders: BOS_GA_CERTIFIED_PROVIDERS,
  noVendorHardDependency: NoVendorHardDependency,
  capabilityCount: BUSINESS_CAPABILITY_IDS.length,
  commerceCatalogUnchanged: "coming_soon" as const,
} as const;

export const BOS_V1_FINAL_QUALIFICATION_PLAN = [
  "run full clean release regression",
  "refresh live RLS execution if release policy requires freshness",
  "repeat browser suite for stability",
  "validate deployment/runtime configuration",
  "evaluate certification manifest",
  "evaluate release manifest",
  "determine productionEligible against BOS Core GA feature set",
  "only then perform explicit GA promotion/tag",
] as const;

export const BOS_V1_FINAL_QUALIFICATION_READY = true as const;

export function assertBosV1ScopeIntegrity(): void {
  if (BUSINESS_CAPABILITY_IDS.length !== 18) throw new Error("capability_count_must_remain_18");
  if (BOS_V1_CORE_CAPABILITY_IDS.length + BOS_V1_EXCLUDED_CAPABILITY_IDS.length !== 18) {
    throw new Error("v1_feature_set_must_cover_all_registered_capabilities");
  }
  for (const id of BOS_V1_CORE_CAPABILITY_IDS) {
    if (!defaultBusinessCapabilityRegistry.isImplemented(id)) throw new Error(`core_capability_not_implemented:${id}`);
  }
  if (BOS_GA_CERTIFIED_PROVIDERS.length !== 0) throw new Error("v1_must_not_ga_certify_preview_providers");
  if (NoVendorHardDependency !== true) throw new Error("vendor_hard_dependency_forbidden");
}
