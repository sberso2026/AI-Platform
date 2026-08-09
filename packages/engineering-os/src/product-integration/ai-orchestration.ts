/**
 * Phase 14B — AI orchestration wiring (single Platform AI Runtime).
 * implementsOwnAiStack = false
 */
import { createEngineeringAiFramework } from "../ai-framework";
import { defaultEngineeringModuleRegistry } from "../module-registry";
import { implementsOwnAiStack } from "../version";

export interface DiscoverableAiCapability {
  moduleKey: string;
  capabilityId: string;
  entitled: boolean;
}

export function discoverEntitledAiCapabilities(
  entitledModules: ReadonlySet<string> | string[],
): DiscoverableAiCapability[] {
  const entitled =
    entitledModules instanceof Set
      ? entitledModules
      : new Set(entitledModules);
  const fw = createEngineeringAiFramework();
  fw.assertSharedStackOnly("engineering_os", implementsOwnAiStack);

  const out: DiscoverableAiCapability[] = [];
  for (const mod of defaultEngineeringModuleRegistry.list()) {
    for (const cap of mod.aiCapabilities ?? []) {
      out.push({
        moduleKey: mod.moduleKey,
        capabilityId: cap,
        entitled: entitled.has(mod.moduleKey) || entitled.has("*"),
      });
    }
  }
  // Tool framework discovery marker (not a second AI stack).
  out.push({
    moduleKey: "engineering_tool_framework",
    capabilityId: "engineering_tool.discover",
    entitled: entitled.has("engineering_tool_framework") || entitled.has("*"),
  });
  return out;
}

export const AI_ORCHESTRATION_SEMANTICS = {
  implementsOwnAiStack: false as const,
  aiOutputIsEngineeringApproval: false as const,
  aiRecommendationIsExecutionPermission: false as const,
  aiExplanationExposesChainOfThought: false as const,
} as const;
