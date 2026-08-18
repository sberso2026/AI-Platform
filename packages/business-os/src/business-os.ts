import type { SupabaseClient } from "@rtb/database";
import type { PlatformKernel } from "@rtb/platform-kernel";
import { AuditService } from "@rtb/platform-core";
import { BusinessCapabilityRegistry } from "./capabilities";
import { BusinessOsStatusService } from "./status";
import { assertSharedAiStackOnly } from "./ai-framework";
import { OwnerCommandService } from "./owner-command/service";
import { FinancialIntelligenceService } from "./finance/service";
import { GrowthIntelligenceService } from "./growth/service";

export interface BusinessOS {
  status: BusinessOsStatusService;
  capabilities: BusinessCapabilityRegistry;
  ownerCommand: OwnerCommandService;
  financialIntelligence: FinancialIntelligenceService;
  growthIntelligence: GrowthIntelligenceService;
}

export function createBusinessOS(
  supabase: SupabaseClient,
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
  const audit = new AuditService(supabase);
  const ownerCommand = new OwnerCommandService(supabase, kernel, audit);
  const financialIntelligence = new FinancialIntelligenceService(
    supabase,
    kernel,
    audit,
    ownerCommand,
  );
  const growthIntelligence = new GrowthIntelligenceService(supabase, kernel, audit, ownerCommand);
  return { status, capabilities, ownerCommand, financialIntelligence, growthIntelligence };
}

