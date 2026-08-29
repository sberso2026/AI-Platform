/**
 * BOS Core v1.0 GA. Preview connectors remain Preview. Do not start BOS-17.
 */
export const BUSINESS_OS_VERSION = "1.0.0" as const;
export const BUSINESS_OS_STATUS = "ga" as const;
export const BUSINESS_OS_PHASE = "BOS-15" as const;

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
 * BOS Core v1.0 GA catalog contract. Feature-flag gating remains for runtime enablement.
 * Commerce lifecycle is active; Preview connectors are not certified.
 */
export const BUSINESS_OS_PREVIEW_ACCESS = {
  mode: "feature_flag_foundation" as const,
  catalogStatus: "available" as const,
  commercialEntitlementRequired: false,
  usesCommercePreviewLifecycle: false,
  usesReleaseChannel: false,
  featureDefaultEnabled: false,
  featureIsExperimental: false,
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
