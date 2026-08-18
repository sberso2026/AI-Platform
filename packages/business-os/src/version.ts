/**
 * BOS-0 Foundation version and platform-reuse contracts.
 */
export const BUSINESS_OS_VERSION = "0.1.0" as const;
export const BUSINESS_OS_STATUS = "foundation" as const;
export const BUSINESS_OS_PHASE = "BOS-0" as const;

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

export const BUSINESS_OS_FEATURE_KEY = "business_os" as const;
export const BUSINESS_OS_ID = "business" as const;
export const BUSINESS_OS_PRODUCT_SLUG = "business-os" as const;

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
    catalogStatus: "coming_soon" as const,
  } as const;
}
