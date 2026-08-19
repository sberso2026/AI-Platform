import type { PlatformKernel } from "@rtb/platform-kernel";
import type { BusinessCapabilityDefinition } from "@rtb/types";
import { BUSINESS_OS_RUNTIME_MANIFEST } from "./manifest";
import { BusinessCapabilityRegistry } from "./capabilities";
import {
  BUSINESS_OS_FEATURE_KEY,
  BUSINESS_OS_ID,
  BUSINESS_OS_PRODUCT_SLUG,
  BUSINESS_OS_VERSION,
  getBusinessOsFoundationDeclaration,
  implementsOwnAiStack,
} from "./version";

export interface BusinessOsStatusSnapshot {
  osId: typeof BUSINESS_OS_ID;
  name: string;
  version: string;
  phase: "BOS-8";
  foundationState: "preview";
  catalogStatus: "coming_soon";
  productSlug: typeof BUSINESS_OS_PRODUCT_SLUG;
  featureKey: typeof BUSINESS_OS_FEATURE_KEY;
  implementsOwnAiStack: false;
  capabilities: BusinessCapabilityDefinition[];
  noAutonomousApproval: true;
  externalWritesDisabled: true;
}

export class BusinessOsStatusService {
  constructor(
    private readonly kernel: PlatformKernel,
    private readonly capabilities: BusinessCapabilityRegistry,
  ) {}

  snapshot(): BusinessOsStatusSnapshot {
    const declaration = getBusinessOsFoundationDeclaration();
    return {
      osId: BUSINESS_OS_ID,
      name: BUSINESS_OS_RUNTIME_MANIFEST.name,
      version: BUSINESS_OS_VERSION,
      phase: "BOS-8",
      foundationState: "preview",
      catalogStatus: declaration.catalogStatus,
      productSlug: BUSINESS_OS_PRODUCT_SLUG,
      featureKey: BUSINESS_OS_FEATURE_KEY,
      implementsOwnAiStack,
      capabilities: this.capabilities.list(),
      noAutonomousApproval: true,
      externalWritesDisabled: true,
    };
  }

  /** Kernel wiring — Owner Command Centre persistence lives in BOS tables, not a second stack. */
  configuration() {
    return {
      featureKey: BUSINESS_OS_FEATURE_KEY,
      catalogStatus: "coming_soon" as const,
      kernelServices: {
        aiDirector: true,
        eventBus: true,
        workflow: true,
        jobs: true,
        knowledgeGraph: true,
        memory: true,
        notifications: true,
        intelligence: {
          tools: true,
          capabilities: true,
          policies: true,
          prompts: true,
          models: true,
          features: true,
          secrets: true,
          evaluations: true,
          costs: true,
          observability: true,
        },
      },
      implementsOwnAiStack,
    };
  }
}
