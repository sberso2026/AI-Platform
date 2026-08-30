/**
 * II-0 platform reuse lock. No second infrastructure stack.
 */
export const INSPECTION_INTELLIGENCE_PLATFORM_REUSE = {
  platformCore: true,
  platformKernel: true,
  platformIntelligence: true,
  engineeringOs: true,
  authIdentity: true,
  rbacRls: true,
  audit: true,
  eventBus: true,
  workflow: true,
  knowledgeGraph: true,
  governedMemory: true,
  aiDirector: true,
  promptRegistry: true,
  modelRegistry: true,
  toolRegistry: true,
  connectorContext: true,
  files: true,
  notifications: true,
  telemetry: true,
  platformCommerce: true,
  secondInfrastructureStackForbidden: true,
} as const;
