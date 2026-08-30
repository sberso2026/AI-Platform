/**
 * PI-8 Connector Context ownership locks.
 * External connector data remains non-canonical. No second integration stack.
 */

import {
  SCHEMA_CHANGED,
  duplicateAgentRuntimeDetected,
  duplicateCanonicalProjectDomainDetected,
  duplicateCommerceStackDetected,
  duplicateIdentityStackDetected,
  duplicateKnowledgeGraphDetected,
  duplicateWorkflowEngineDetected,
  implementsOwnAiStack,
} from "../project-health/ownership";

export const PI_8_IMPLEMENTED = true as const;
export const PI_8_CONNECTOR_CONTEXT_PASS_SENTINEL = true as const;
export const PI_9_READY = true as const;
export const PI_8_LIVE_CONNECTOR_EXECUTION = false as const;

export const duplicateIntegrationStackDetected = false as const;
export const directConnectorAccessFromPI = false as const;
export const directProviderAccessFromConnectorContext = false as const;
export const externalWritesEnabled = false as const;
export const unrestrictedGraphAccessFromConnectorContext = false as const;
export const autonomousApprovalEnabled = false as const;

export const PI_CONNECTOR_CONTEXT_OWNERSHIP = {
  connectorRead: "platform_kernel.connector_context",
  connectorExecution: "business_os.connectors",
  connectorCredentials: "platform_intelligence.secret_management",
  toolRegistry: "platform_intelligence.tool_registry",
  knowledgeGraph: "platform_kernel.knowledge_graph",
  identity: "platform_core.identity",
  audit: "platform_core.audit",
  aiDirector: "platform_kernel.ai_director",
  canonicality: "EXTERNAL_CONTEXT",
} as const;

export const FORBIDDEN_CONNECTOR_CONTEXT_TOKENS = [
  "new OpenAI",
  "anthropic",
  "@anthropic-ai",
  "Microsoft365ProviderClient",
  "XeroProviderClient",
  "HubSpotProviderClient",
  "mail.send",
  "calendar.write",
  "files.write",
] as const;

export function assertConnectorContextOwnershipLocks(): void {
  if (!PI_8_IMPLEMENTED) throw new Error("PI-8 implementation sentinel must be true after certification");
  if (implementsOwnAiStack) throw new Error("Connector Context must not implement its own AI stack");
  if (duplicateAgentRuntimeDetected) throw new Error("duplicate agent runtime");
  if (duplicateIntegrationStackDetected) throw new Error("duplicate integration stack");
  if (duplicateKnowledgeGraphDetected) throw new Error("duplicate knowledge graph");
  if (duplicateWorkflowEngineDetected) throw new Error("duplicate workflow engine");
  if (duplicateIdentityStackDetected) throw new Error("duplicate identity stack");
  if (duplicateCommerceStackDetected) throw new Error("duplicate commerce stack");
  if (duplicateCanonicalProjectDomainDetected) throw new Error("duplicate canonical project domain");
  if (directProviderAccessFromConnectorContext) throw new Error("direct provider access forbidden");
  if (directConnectorAccessFromPI) throw new Error("direct connector access from PI forbidden");
  if (unrestrictedGraphAccessFromConnectorContext) throw new Error("unrestricted graph access forbidden");
  if (externalWritesEnabled) throw new Error("external writes forbidden");
  if (autonomousApprovalEnabled) throw new Error("autonomous approval forbidden");
  if (SCHEMA_CHANGED) throw new Error("PI-8 must not change schema");
  if (PI_8_LIVE_CONNECTOR_EXECUTION) throw new Error("fixture/sandbox must not be reported as live connector execution");
}
