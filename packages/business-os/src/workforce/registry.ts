import type { AIDirectorService } from "@rtb/platform-kernel";
import type { AgentRegistryPort } from "./ports";

export function kernelAgentRegistry(aiDirector: AIDirectorService): AgentRegistryPort {
  return {
    async upsertCatalogAgent(input) {
      return aiDirector.upsertCatalogAgent(input);
    },
    async getAgentBySlug(tenantId, slug) {
      return aiDirector.getAgentBySlug(tenantId, slug);
    },
    async setAgentActive(tenantId, agentId, isActive) {
      await aiDirector.setAgentActive(tenantId, agentId, isActive);
    },
  };
}
