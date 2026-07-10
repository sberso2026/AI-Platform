import type { SupabaseClient } from "@rtb/database";
import { CapabilityRegistryService } from "./capability-registry/capability-registry-service";
import { CostEngineService } from "./cost-engine/cost-engine-service";
import { EvaluationFrameworkService } from "./evaluation/evaluation-framework-service";
import { FeatureFlagService } from "./feature-flags/feature-flag-service";
import { ModelRegistryService } from "./model-registry/model-registry-service";
import { ObservabilityService } from "./observability/observability-service";
import { PolicyEngineService } from "./policy-engine/policy-engine-service";
import { PromptRegistryService } from "./prompt-registry/prompt-registry-service";
import { SecretManagementService } from "./secret-management/secret-management-service";
import { ToolRegistryService } from "./tool-registry/tool-registry-service";

export interface PlatformIntelligence {
  tools: ToolRegistryService;
  capabilities: CapabilityRegistryService;
  policies: PolicyEngineService;
  prompts: PromptRegistryService;
  models: ModelRegistryService;
  costs: CostEngineService;
  observability: ObservabilityService;
  features: FeatureFlagService;
  secrets: SecretManagementService;
  evaluations: EvaluationFrameworkService;
}

export function createPlatformIntelligence(supabase: SupabaseClient): PlatformIntelligence {
  return {
    tools: new ToolRegistryService(supabase),
    capabilities: new CapabilityRegistryService(supabase),
    policies: new PolicyEngineService(supabase),
    prompts: new PromptRegistryService(supabase),
    models: new ModelRegistryService(supabase),
    costs: new CostEngineService(supabase),
    observability: new ObservabilityService(supabase),
    features: new FeatureFlagService(supabase),
    secrets: new SecretManagementService(supabase),
    evaluations: new EvaluationFrameworkService(supabase),
  };
}
