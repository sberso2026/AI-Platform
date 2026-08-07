/**
 * Phase 9J — versioned public module contracts for external consumers.
 * No new transport stack; contracts describe existing platform surfaces.
 */

export const PUBLIC_MODULE_CONTRACT_VERSION = "1.0.0" as const;
export const PUBLIC_MODULE_CONTRACT_COMPATIBILITY = ">=1.0.0 <2.0.0" as const;

export type ContractKind =
  | "api"
  | "command"
  | "query"
  | "event"
  | "reporting"
  | "ai"
  | "search";

export type PublicModuleContract = {
  id: string;
  kind: ContractKind;
  version: string;
  compatibilityRange: string;
  deprecated: boolean;
  deprecationNotice: string | null;
  description: string;
  authorityRequired: boolean;
  idempotencyKeyRequired: boolean;
  tenantIsolated: true;
  emitsEvidencePayload: false;
  silentMutationForbidden: true;
};

export const INSPECTION_PUBLIC_MODULE_CONTRACTS: readonly PublicModuleContract[] = [
  {
    id: "ii.api.slice",
    kind: "api",
    version: PUBLIC_MODULE_CONTRACT_VERSION,
    compatibilityRange: PUBLIC_MODULE_CONTRACT_COMPATIBILITY,
    deprecated: false,
    deprecationNotice: null,
    description: "HTTP slice status API under /api/engineering/inspection-intelligence/slice",
    authorityRequired: true,
    idempotencyKeyRequired: false,
    tenantIsolated: true,
    emitsEvidencePayload: false,
    silentMutationForbidden: true,
  },
  {
    id: "ii.command.session.write",
    kind: "command",
    version: PUBLIC_MODULE_CONTRACT_VERSION,
    compatibilityRange: PUBLIC_MODULE_CONTRACT_COMPATIBILITY,
    deprecated: false,
    deprecationNotice: null,
    description: "Write intents for inspection sessions with audit and idempotency",
    authorityRequired: true,
    idempotencyKeyRequired: true,
    tenantIsolated: true,
    emitsEvidencePayload: false,
    silentMutationForbidden: true,
  },
  {
    id: "ii.query.session.read",
    kind: "query",
    version: PUBLIC_MODULE_CONTRACT_VERSION,
    compatibilityRange: PUBLIC_MODULE_CONTRACT_COMPATIBILITY,
    deprecated: false,
    deprecationNotice: null,
    description: "Tenant/workspace-isolated session read models",
    authorityRequired: true,
    idempotencyKeyRequired: false,
    tenantIsolated: true,
    emitsEvidencePayload: false,
    silentMutationForbidden: true,
  },
  {
    id: "ii.event.inspection",
    kind: "event",
    version: PUBLIC_MODULE_CONTRACT_VERSION,
    compatibilityRange: PUBLIC_MODULE_CONTRACT_COMPATIBILITY,
    deprecated: false,
    deprecationNotice: null,
    description: "engineering.inspection.* identifiers/status/governance metadata only",
    authorityRequired: false,
    idempotencyKeyRequired: false,
    tenantIsolated: true,
    emitsEvidencePayload: false,
    silentMutationForbidden: true,
  },
  {
    id: "ii.reporting.preparation",
    kind: "reporting",
    version: PUBLIC_MODULE_CONTRACT_VERSION,
    compatibilityRange: PUBLIC_MODULE_CONTRACT_COMPATIBILITY,
    deprecated: false,
    deprecationNotice: null,
    description: "Report prep inputs/outputs; no silent mutation of published reports",
    authorityRequired: true,
    idempotencyKeyRequired: false,
    tenantIsolated: true,
    emitsEvidencePayload: false,
    silentMutationForbidden: true,
  },
  {
    id: "ii.ai.vision.advisory",
    kind: "ai",
    version: PUBLIC_MODULE_CONTRACT_VERSION,
    compatibilityRange: PUBLIC_MODULE_CONTRACT_COMPATIBILITY,
    deprecated: false,
    deprecationNotice: null,
    description: "Advisory vision envelopes with provider/policy pins and abstention",
    authorityRequired: true,
    idempotencyKeyRequired: true,
    tenantIsolated: true,
    emitsEvidencePayload: false,
    silentMutationForbidden: true,
  },
  {
    id: "ii.ai.predictive.advisory",
    kind: "ai",
    version: PUBLIC_MODULE_CONTRACT_VERSION,
    compatibilityRange: PUBLIC_MODULE_CONTRACT_COMPATIBILITY,
    deprecated: false,
    deprecationNotice: null,
    description: "Advisory predictive envelopes; fail-closed providers; no RUL claims",
    authorityRequired: true,
    idempotencyKeyRequired: false,
    tenantIsolated: true,
    emitsEvidencePayload: false,
    silentMutationForbidden: true,
  },
  {
    id: "ii.search.sessions",
    kind: "search",
    version: PUBLIC_MODULE_CONTRACT_VERSION,
    compatibilityRange: PUBLIC_MODULE_CONTRACT_COMPATIBILITY,
    deprecated: false,
    deprecationNotice: null,
    description: "Discoverable session fields; no cross-tenant leakage",
    authorityRequired: true,
    idempotencyKeyRequired: false,
    tenantIsolated: true,
    emitsEvidencePayload: false,
    silentMutationForbidden: true,
  },
] as const;

export function listPublicModuleContracts(): readonly PublicModuleContract[] {
  return INSPECTION_PUBLIC_MODULE_CONTRACTS;
}

export function getPublicModuleContract(id: string): PublicModuleContract | undefined {
  return INSPECTION_PUBLIC_MODULE_CONTRACTS.find((c) => c.id === id);
}

export function assertPublicContractsMachineCheckable(): {
  ok: true;
  contractCount: number;
  kinds: ContractKind[];
} {
  const kinds = [...new Set(INSPECTION_PUBLIC_MODULE_CONTRACTS.map((c) => c.kind))];
  const required: ContractKind[] = [
    "api",
    "command",
    "query",
    "event",
    "reporting",
    "ai",
    "search",
  ];
  for (const kind of required) {
    if (!kinds.includes(kind)) throw new Error(`missing_contract_kind:${kind}`);
  }
  for (const c of INSPECTION_PUBLIC_MODULE_CONTRACTS) {
    if (c.emitsEvidencePayload) throw new Error(`evidence_in_contract:${c.id}`);
    if (!c.silentMutationForbidden) throw new Error(`silent_mutation_allowed:${c.id}`);
    if (!c.tenantIsolated) throw new Error(`tenant_isolation_missing:${c.id}`);
  }
  return { ok: true, contractCount: INSPECTION_PUBLIC_MODULE_CONTRACTS.length, kinds };
}
