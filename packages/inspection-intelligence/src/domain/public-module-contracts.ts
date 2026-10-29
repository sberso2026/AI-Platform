/**
 * Phase 9K — frozen public module contracts v1 (logical APIs for external consumers).
 */
export const PUBLIC_MODULE_CONTRACT_VERSION = "1.0.0" as const;
export const PUBLIC_MODULE_CONTRACT_COMPATIBILITY = ">=1.0.0 <2.0.0" as const;
export const PUBLIC_MODULE_CONTRACT_OWNER = "inspection_intelligence" as const;

export type ContractKind =
  | "api"
  | "command"
  | "query"
  | "event"
  | "reporting"
  | "ai"
  | "search"
  | "observation_feed"
  | "asset_reference";

export type PublicModuleContract = {
  contractId: string;
  kind: ContractKind;
  version: typeof PUBLIC_MODULE_CONTRACT_VERSION;
  owner: typeof PUBLIC_MODULE_CONTRACT_OWNER;
  compatibilityRange: string;
  deprecated: boolean;
  deprecationNotice: string | null;
  description: string;
  requestSchema: string;
  responseSchema: string;
  errorSchema: string;
  permissions: readonly string[];
  tenantWorkspaceContextRequired: true;
  authorityRequired: boolean;
  idempotencyKeyRequired: boolean;
  auditRequired: boolean;
  tenantIsolated: true;
  emitsEvidencePayload: false;
  silentMutationForbidden: true;
  privatePersistenceExposed: false;
};

function base(
  partial: Omit<
    PublicModuleContract,
    | "version"
    | "owner"
    | "compatibilityRange"
    | "deprecated"
    | "deprecationNotice"
    | "tenantWorkspaceContextRequired"
    | "tenantIsolated"
    | "emitsEvidencePayload"
    | "silentMutationForbidden"
    | "privatePersistenceExposed"
    | "errorSchema"
  > & { deprecationNotice?: string | null },
): PublicModuleContract {
  return {
    version: PUBLIC_MODULE_CONTRACT_VERSION,
    owner: PUBLIC_MODULE_CONTRACT_OWNER,
    compatibilityRange: PUBLIC_MODULE_CONTRACT_COMPATIBILITY,
    deprecated: false,
    deprecationNotice: partial.deprecationNotice ?? null,
    tenantWorkspaceContextRequired: true,
    tenantIsolated: true,
    emitsEvidencePayload: false,
    silentMutationForbidden: true,
    privatePersistenceExposed: false,
    errorSchema: "ii.error.v1",
    ...partial,
  };
}

export const INSPECTION_PUBLIC_MODULE_CONTRACTS: readonly PublicModuleContract[] = [
  base({
    contractId: "ii.api.slice",
    kind: "api",
    description: "HTTP slice status API",
    requestSchema: "ii.api.slice.request.v1",
    responseSchema: "ii.api.slice.response.v1",
    permissions: ["inspection.read"],
    authorityRequired: true,
    idempotencyKeyRequired: false,
    auditRequired: false,
  }),
  base({
    contractId: "ii.command.session.write",
    kind: "command",
    description: "Write intents for inspection sessions",
    requestSchema: "ii.command.session.write.request.v1",
    responseSchema: "ii.command.session.write.response.v1",
    permissions: ["inspection.write"],
    authorityRequired: true,
    idempotencyKeyRequired: true,
    auditRequired: true,
  }),
  base({
    contractId: "ii.query.session.read",
    kind: "query",
    description: "Tenant/workspace-isolated session read models",
    requestSchema: "ii.query.session.read.request.v1",
    responseSchema: "ii.query.session.read.response.v1",
    permissions: ["inspection.read"],
    authorityRequired: true,
    idempotencyKeyRequired: false,
    auditRequired: false,
  }),
  base({
    contractId: "ii.event.inspection",
    kind: "event",
    description: "engineering.inspection.* identifiers/status/governance only",
    requestSchema: "ii.event.envelope.v1",
    responseSchema: "ii.event.ack.v1",
    permissions: ["inspection.read"],
    authorityRequired: false,
    idempotencyKeyRequired: false,
    auditRequired: true,
  }),
  base({
    contractId: "ii.reporting.preparation",
    kind: "reporting",
    description: "Report prep inputs/outputs; no silent mutation",
    requestSchema: "ii.reporting.preparation.request.v1",
    responseSchema: "ii.reporting.preparation.response.v1",
    permissions: ["inspection.report"],
    authorityRequired: true,
    idempotencyKeyRequired: true,
    auditRequired: true,
  }),
  base({
    contractId: "ii.ai.vision.advisory",
    kind: "ai",
    description: "Advisory vision envelopes with provider/policy pins and abstention",
    requestSchema: "ii.ai.vision.request.v1",
    responseSchema: "ii.ai.vision.response.v1",
    permissions: ["inspection.review"],
    authorityRequired: true,
    idempotencyKeyRequired: true,
    auditRequired: true,
  }),
  base({
    contractId: "ii.ai.predictive.advisory",
    kind: "ai",
    description: "Advisory predictive envelopes; fail-closed; no RUL claims",
    requestSchema: "ii.ai.predictive.request.v1",
    responseSchema: "ii.ai.predictive.response.v1",
    permissions: ["inspection.review"],
    authorityRequired: true,
    idempotencyKeyRequired: false,
    auditRequired: true,
  }),
  base({
    contractId: "ii.search.sessions",
    kind: "search",
    description: "Discoverable session fields; no cross-tenant leakage",
    requestSchema: "ii.search.sessions.request.v1",
    responseSchema: "ii.search.sessions.response.v1",
    permissions: ["inspection.read"],
    authorityRequired: true,
    idempotencyKeyRequired: false,
    auditRequired: false,
  }),
  base({
    contractId: "ii.observation.feed",
    kind: "observation_feed",
    description: "Cross-module observation feed (consume-only)",
    requestSchema: "ii.observation.feed.request.v1",
    responseSchema: "ii.observation.feed.response.v1",
    permissions: ["inspection.read"],
    authorityRequired: true,
    idempotencyKeyRequired: false,
    auditRequired: true,
  }),
  base({
    contractId: "ii.asset.reference",
    kind: "asset_reference",
    description: "AssetReference projection for cross-module consumers (no asset ownership)",
    requestSchema: "ii.asset.reference.request.v1",
    responseSchema: "ii.asset.reference.response.v1",
    permissions: ["inspection.read"],
    authorityRequired: true,
    idempotencyKeyRequired: false,
    auditRequired: true,
  }),
] as const;

export function listPublicModuleContracts(): readonly PublicModuleContract[] {
  return INSPECTION_PUBLIC_MODULE_CONTRACTS;
}

export function getPublicModuleContract(id: string): PublicModuleContract | undefined {
  return INSPECTION_PUBLIC_MODULE_CONTRACTS.find((c) => c.contractId === id);
}

export function assertPublicContractsMachineCheckable(): {
  ok: true;
  contractCount: number;
  kinds: ContractKind[];
  frozenVersion: typeof PUBLIC_MODULE_CONTRACT_VERSION;
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
    "observation_feed",
    "asset_reference",
  ];
  for (const kind of required) {
    if (!kinds.includes(kind)) throw new Error(`missing_contract_kind:${kind}`);
  }
  for (const c of INSPECTION_PUBLIC_MODULE_CONTRACTS) {
    if (c.version !== "1.0.0") throw new Error(`contract_not_frozen:${c.contractId}`);
    if (c.emitsEvidencePayload) throw new Error(`evidence_in_contract:${c.contractId}`);
    if (c.privatePersistenceExposed) throw new Error(`private_schema_exposed:${c.contractId}`);
    if (!c.silentMutationForbidden) throw new Error(`silent_mutation_allowed:${c.contractId}`);
  }
  return {
    ok: true,
    contractCount: INSPECTION_PUBLIC_MODULE_CONTRACTS.length,
    kinds,
    frozenVersion: PUBLIC_MODULE_CONTRACT_VERSION,
  };
}
