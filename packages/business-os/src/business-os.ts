import type { SupabaseClient } from "@rtb/database";
import type { PlatformKernel } from "@rtb/platform-kernel";
import { BusinessCapabilityRegistry } from "./capabilities";
import { BusinessOsStatusService } from "./status";
import { assertSharedAiStackOnly } from "./ai-framework";

export interface BusinessOS {
  status: BusinessOsStatusService;
  capabilities: BusinessCapabilityRegistry;
}

export function createBusinessOS(
  _supabase: SupabaseClient,
  kernel: PlatformKernel,
): BusinessOS {
  assertSharedAiStackOnly("business-os");
  if (!kernel?.aiDirector || !kernel.intelligence?.features || !kernel.eventBus) {
    throw new Error(
      "Business OS requires Platform Kernel (AI Director, intelligence feature flags, event bus)",
    );
  }
  const capabilities = new BusinessCapabilityRegistry();
  const status = new BusinessOsStatusService(kernel, capabilities);
  return { status, capabilities };
}
