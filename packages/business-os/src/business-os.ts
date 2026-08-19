import type { SupabaseClient } from "@rtb/database";
import type { PlatformKernel } from "@rtb/platform-kernel";
import { AuditService } from "@rtb/platform-core";
import { BusinessCapabilityRegistry } from "./capabilities";
import { BusinessOsStatusService } from "./status";
import { assertSharedAiStackOnly } from "./ai-framework";
import { OwnerCommandService } from "./owner-command/service";
import { FinancialIntelligenceService } from "./finance/service";
import { GrowthIntelligenceService } from "./growth/service";
import { RevenueExecutionService } from "./revenue/service";
import { CustomerIntelligenceService } from "./customers/service";
import { ProfitIntelligenceService } from "./profit/service";
import { WorkOperationsService } from "./operations/service";
import { DecisionActionIntelligenceService } from "./decisions/service";
import { BusinessRiskService } from "./risk/service";

export interface BusinessOS {
  status: BusinessOsStatusService;
  capabilities: BusinessCapabilityRegistry;
  ownerCommand: OwnerCommandService;
  financialIntelligence: FinancialIntelligenceService;
  growthIntelligence: GrowthIntelligenceService;
  revenueExecution: RevenueExecutionService;
  customerIntelligence: CustomerIntelligenceService;
  profitIntelligence: ProfitIntelligenceService;
  workOperations: WorkOperationsService;
  decisionAction: DecisionActionIntelligenceService;
  businessRisk: BusinessRiskService;
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
  const revenueExecution = new RevenueExecutionService(
    supabase,
    kernel,
    audit,
    ownerCommand,
    growthIntelligence,
  );
  const customerIntelligence = new CustomerIntelligenceService(
    supabase,
    kernel,
    audit,
    ownerCommand,
    growthIntelligence,
    revenueExecution,
  );
  const profitIntelligence = new ProfitIntelligenceService(
    supabase,
    kernel,
    audit,
    ownerCommand,
    customerIntelligence,
  );
  const workOperations = new WorkOperationsService(
    supabase,
    kernel,
    audit,
    ownerCommand,
    customerIntelligence,
    growthIntelligence,
    profitIntelligence,
  );
  customerIntelligence.bindOperationsEvidence((scope, customerId) =>
    workOperations.customerEvidence(scope, customerId),
  );
  const decisionAction = new DecisionActionIntelligenceService(supabase, kernel, audit, ownerCommand);
  const businessRisk = new BusinessRiskService(supabase, kernel, audit, ownerCommand);
  return {
    status,
    capabilities,
    ownerCommand,
    financialIntelligence,
    growthIntelligence,
    revenueExecution,
    customerIntelligence,
    profitIntelligence,
    workOperations,
    decisionAction,
    businessRisk,
  };
}

