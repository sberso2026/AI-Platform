/**
 * BOS-0 Foundation version and platform-reuse contracts.
 * BOS-13 is production validation / release-candidate certification, not a new domain.
 */
export const BUSINESS_OS_VERSION = "0.13.1" as const;
export const BUSINESS_OS_STATUS = "preview" as const;
export const BUSINESS_OS_PHASE = "BOS-13" as const;

/** Business OS consumes Platform Kernel / Intelligence. Independent AI stacks are forbidden. */
export const implementsOwnAiStack = false as const;

export const ReadFirst = true as const;
export const ExternalWritesDisabled = true as const;
export const NoVendorHardDependency = true as const;
export const AdvisoryUnlessCertifiedGoverned = true as const;
export const NoAutonomousApproval = true as const;
export const duplicateKnowledgeGraphDetected = false as const;
export const duplicateToolRegistryDetected = false as const;
export const duplicateAssistantStackDetected = false as const;
export const duplicateWorkflowEngineDetected = false as const;
export const duplicateEventBusDetected = false as const;
export const duplicateAgentRuntimeDetected = false as const;
export const duplicateIntegrationStackDetected = false as const;
export const autonomousApprovalEnabled = false as const;
export const directProviderAccess = false as const;
export const unrestrictedGraphAccess = false as const;
export const canonicalDomainMutationBypass = false as const;
export const crossTenantAgentAccess = false as const;
export const agentRegistryMismatchBlocksExecution = true as const;
export const suppressedIdentityReconstructionBlocked = true as const;
export const crossTenantConnectorAccess = false as const;
export const directAgentProviderAccess = false as const;
export const unrestrictedExternalProxy = false as const;

export const BUSINESS_OS_FEATURE_KEY = "business_os" as const;
export const BUSINESS_OS_ID = "business" as const;
export const BUSINESS_OS_PRODUCT_SLUG = "business-os" as const;

/**
 * Explicit BOS-0 preview contract on current platform:
 * intelligence feature flag `business_os` (default off, experimental) + RBAC.
 * Missing coming_soon commerce installation is not a commercial entitlement.
 * Do not use ProductLifecycleStatus.preview or ReleaseChannel for GA access.
 */
export const BUSINESS_OS_PREVIEW_ACCESS = {
  mode: "feature_flag_foundation" as const,
  catalogStatus: "coming_soon" as const,
  commercialEntitlementRequired: false,
  usesCommercePreviewLifecycle: false,
  usesReleaseChannel: false,
  featureDefaultEnabled: false,
  featureIsExperimental: true,
};

export function getBusinessOsFoundationDeclaration() {
  return {
    version: BUSINESS_OS_VERSION,
    status: BUSINESS_OS_STATUS,
    phase: BUSINESS_OS_PHASE,
    osId: BUSINESS_OS_ID,
    productSlug: BUSINESS_OS_PRODUCT_SLUG,
    featureKey: BUSINESS_OS_FEATURE_KEY,
    implementsOwnAiStack,
    ReadFirst,
    ExternalWritesDisabled,
    NoVendorHardDependency,
    AdvisoryUnlessCertifiedGoverned,
    NoAutonomousApproval,
    duplicateKnowledgeGraphDetected,
    duplicateToolRegistryDetected,
    duplicateAssistantStackDetected,
    duplicateWorkflowEngineDetected,
    duplicateEventBusDetected,
    duplicateAgentRuntimeDetected,
    duplicateIntegrationStackDetected,
    autonomousApprovalEnabled,
    directProviderAccess,
    unrestrictedGraphAccess,
    canonicalDomainMutationBypass,
    crossTenantAgentAccess,
    agentRegistryMismatchBlocksExecution,
    suppressedIdentityReconstructionBlocked,
    crossTenantConnectorAccess,
    directAgentProviderAccess,
    unrestrictedExternalProxy,
    catalogStatus: BUSINESS_OS_PREVIEW_ACCESS.catalogStatus,
    previewAccess: BUSINESS_OS_PREVIEW_ACCESS,
  } as const;
}
