/**
 * Phase 10B — Intelligence Source Registry (fail-closed consumption gate).
 */

export type IntelligenceSourceOwnership =
  | "inspection_intelligence"
  | "project_intelligence"
  | "engineering_os_shared_domain"
  | "asset_intelligence"
  | "shm"
  | "digital_twin"
  | "maintenance"
  | "external";

export type TrustTier = "frozen_public_contract" | "shared_contract" | "read_only_identity" | "future";

export type AllowedStateKind =
  | "condition"
  | "health_index"
  | "criticality"
  | "reliability"
  | "failure"
  | "risk_intelligence";

export type IntelligenceSourceEntry = {
  sourceKey: string;
  contractFamily: string;
  contractVersion: string;
  ownership: IntelligenceSourceOwnership;
  trustTier: TrustTier;
  allowedStateKinds: readonly AllowedStateKind[];
  evidenceDuplicationForbidden: true;
  writeBackToSharedDomainIdentityForbidden: true;
  status: "active" | "reserved_future";
};

export const INTELLIGENCE_SOURCE_REGISTRY: readonly IntelligenceSourceEntry[] = [
  {
    sourceKey: "inspection_intelligence.public_contracts",
    contractFamily: "ii.public_module_contracts",
    contractVersion: "1.0.0",
    ownership: "inspection_intelligence",
    trustTier: "frozen_public_contract",
    allowedStateKinds: ["condition", "health_index"],
    evidenceDuplicationForbidden: true,
    writeBackToSharedDomainIdentityForbidden: true,
    status: "active",
  },
  {
    sourceKey: "manual.engineering_assessment",
    contractFamily: "asset_intelligence.manual_assessment",
    contractVersion: "1",
    ownership: "asset_intelligence",
    trustTier: "shared_contract",
    allowedStateKinds: ["criticality", "health_index", "reliability", "failure"],
    evidenceDuplicationForbidden: true,
    writeBackToSharedDomainIdentityForbidden: true,
    status: "active",
  },
  {
    sourceKey: "asset_intelligence.review",
    contractFamily: "asset_intelligence.governed_review",
    contractVersion: "1",
    ownership: "asset_intelligence",
    trustTier: "shared_contract",
    allowedStateKinds: ["criticality", "health_index", "reliability", "failure"],
    evidenceDuplicationForbidden: true,
    writeBackToSharedDomainIdentityForbidden: true,
    status: "active",
  },
  {
    sourceKey: "shared_domain.asset_identity",
    contractFamily: "engineering_os.shared_domain.asset_identity",
    contractVersion: "read-only",
    ownership: "engineering_os_shared_domain",
    trustTier: "read_only_identity",
    allowedStateKinds: [],
    evidenceDuplicationForbidden: true,
    writeBackToSharedDomainIdentityForbidden: true,
    status: "active",
  },
  {
    sourceKey: "project_intelligence.shared_contracts",
    contractFamily: "pi.shared_contracts",
    contractVersion: "reserved",
    ownership: "project_intelligence",
    trustTier: "shared_contract",
    allowedStateKinds: ["condition", "health_index"],
    evidenceDuplicationForbidden: true,
    writeBackToSharedDomainIdentityForbidden: true,
    status: "reserved_future",
  },
  {
    sourceKey: "shm.signals",
    contractFamily: "shm.signals",
    contractVersion: "reserved",
    ownership: "shm",
    trustTier: "future",
    allowedStateKinds: ["condition", "health_index", "reliability"],
    evidenceDuplicationForbidden: true,
    writeBackToSharedDomainIdentityForbidden: true,
    status: "reserved_future",
  },
  {
    sourceKey: "twin.state_refs",
    contractFamily: "digital_twin.state_refs",
    contractVersion: "reserved",
    ownership: "digital_twin",
    trustTier: "future",
    allowedStateKinds: ["condition", "health_index"],
    evidenceDuplicationForbidden: true,
    writeBackToSharedDomainIdentityForbidden: true,
    status: "reserved_future",
  },
  {
    sourceKey: "maintenance.feedback",
    contractFamily: "maintenance.feedback",
    contractVersion: "reserved",
    ownership: "maintenance",
    trustTier: "future",
    allowedStateKinds: ["condition", "health_index", "criticality"],
    evidenceDuplicationForbidden: true,
    writeBackToSharedDomainIdentityForbidden: true,
    status: "reserved_future",
  },
] as const;

export function getIntelligenceSource(sourceKey: string): IntelligenceSourceEntry | undefined {
  return INTELLIGENCE_SOURCE_REGISTRY.find((s) => s.sourceKey === sourceKey);
}

export function assertRegisteredActiveSource(
  sourceKey: string,
  stateKind: AllowedStateKind,
): IntelligenceSourceEntry {
  const entry = getIntelligenceSource(sourceKey);
  if (!entry) {
    throw new Error(`unregistered_intelligence_source:${sourceKey}`);
  }
  if (entry.status !== "active") {
    throw new Error(`inactive_intelligence_source:${sourceKey}`);
  }
  if (entry.allowedStateKinds.length > 0 && !entry.allowedStateKinds.includes(stateKind)) {
    throw new Error(`source_forbids_state_kind:${sourceKey}:${stateKind}`);
  }
  return entry;
}

export const FORBIDDEN_II_CONSUMPTION = [
  "ii_private_tables",
  "ii_repository_imports_as_integration",
  "ii_private_schema_knowledge",
  "shared_domain_identity_writeback",
] as const;
