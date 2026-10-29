/**
 * Phase E3 — Canonical Engineering Context & Relationship Model.
 * Derived from existing domain FKs/links; does not own KG/Memory or invent SoR copies.
 */

import {
  E0ForbidsDuplicatePiIiOwnership,
  E0ForbidsForcedExternalDependency,
  E0PreservesCertifiedModuleOwnership,
  EngineeringIntelligenceLayerContractLocked,
  ExternalRecordNotEqualEngineeringOsRecord,
  PreferReferencesMappingsProvenance,
  NoMandatorySapM365CopilotDependency,
  supportsZeroConnectorNativeDeployment,
} from "../phase-e0/contracts";
import {
  PhaseE1DoesNotOwnKgOrMemory,
  PhaseE1DoesNotOwnPiIiAiLogic,
  PhaseE1ExperienceFoundationComplete,
} from "../phase-e1/contracts";
import {
  PhaseE2ComposesExistingSearch,
  PhaseE2GroundedSearchComplete,
  PhaseE2NativeZeroConnector,
  PhaseE2NoFabricatedEvidence,
} from "../phase-e2/contracts";

export const ENGINEERING_OS_EVOLUTION_PHASE_E3 = "E3" as const;
export const ENGINEERING_OS_EVOLUTION_CONTRACT_VERSION_E3 = "0.1.0-e3" as const;

export const PhaseE3CanonicalContextComplete = true as const;
export const PhaseE3NoMajorDbMigration = true as const;
export const PhaseE3NoSecondKnowledgeGraph = true as const;
export const PhaseE3DoesNotOwnKgInfrastructure = true as const;
export const PhaseE3DoesNotOwnPiIiAiLogic = true as const;
export const PhaseE3DoesNotOwnConnectors = true as const;
export const PhaseE3DerivedFromExistingDomainLinks = true as const;
export const PhaseE3NoFabricatedFutureDomains = true as const;
export const PhaseE3InferredDistinctFromConfirmed = true as const;
export const PhaseE3ContextImprovesE2WithoutReplacing = true as const;

/** Implemented canonical object types (current baseline). */
export const EngineeringCanonicalObjectTypes = [
  "PROJECT",
  "ASSET",
  "DOCUMENT",
  "DECISION",
  "ACTION",
  "RISK",
  "ISSUE",
  "TECHNICAL_QUERY",
  "LESSON",
] as const;
export type EngineeringCanonicalObjectType =
  | (typeof EngineeringCanonicalObjectTypes)[number]
  | string; // extensible registry without fake instances

/** Future-registrable types — taxonomy only; no fabricated instances. */
export const EngineeringFutureObjectTypes = [
  "DRAWING",
  "REQUIREMENT",
  "CALCULATION",
  "RFI",
  "INSPECTION",
  "FINDING",
  "DEFECT",
  "MEASUREMENT",
  "INTERVENTION",
  "WORK_ORDER_REFERENCE",
  "EQUIPMENT",
  "LOCATION",
] as const;

export const EngineeringMappingStatuses = [
  "MATCHED",
  "PROBABLE_MATCH",
  "UNRESOLVED",
  "CONFLICTING",
] as const;
export type EngineeringMappingStatus = (typeof EngineeringMappingStatuses)[number];

export const EngineeringRelationshipStates = [
  "CONFIRMED",
  "INFERRED",
  "PROPOSED",
  "CONFLICTING",
  "UNKNOWN",
] as const;
export type EngineeringRelationshipState =
  (typeof EngineeringRelationshipStates)[number];

export const EngineeringRelationshipTypes = [
  "BELONGS_TO_PROJECT",
  "RELATES_TO",
  "REFERENCES",
  "AFFECTS",
  "DERIVED_FROM",
  "SUPPORTED_BY",
  "RESULTED_IN",
  "RESOLVES",
  "ADDRESSES",
  "HAS_ACTION",
  "HAS_DECISION",
  "HAS_RISK",
  "HAS_ISSUE",
  "HAS_TECHNICAL_QUERY",
  "HAS_DOCUMENT",
  "HAS_ASSET",
  "HAS_LESSON",
  "PARENT_OF",
] as const;
export type EngineeringRelationshipType =
  | (typeof EngineeringRelationshipTypes)[number]
  | string;

export const EngineeringProvenanceMechanisms = [
  "RULE",
  "MODEL",
  "RETRIEVAL",
  "USER",
  "IMPORT",
  "SYSTEM",
] as const;
export type EngineeringProvenanceMechanism =
  (typeof EngineeringProvenanceMechanisms)[number];

export const EngineeringContextStates = [
  "RESOLVED",
  "PARTIAL",
  "AMBIGUOUS",
  "CONFLICTING",
  "INSUFFICIENT",
  "UNKNOWN",
] as const;
export type EngineeringContextState = (typeof EngineeringContextStates)[number];

export type EngineeringProvenance = {
  sourceType: string;
  sourceId?: string | null;
  mechanism: EngineeringProvenanceMechanism;
  actorId?: string | null;
  ruleOrVersion?: string | null;
  timestamp: string;
  evidenceReferences?: string[];
  note?: string;
};

export type EngineeringObjectReference = {
  objectType: EngineeringCanonicalObjectType;
  objectId: string;
  tenantId: string;
  workspaceId?: string | null;
  projectId?: string | null;
  canonicalKey?: string | null;
  displayName?: string | null;
  status?: string | null;
  authority?: "ENGINEERING_OS" | "EXTERNAL" | "UNKNOWN";
  sourceSystem?: string | null;
  externalIdentifiers?: Array<{ system: string; id: string }>;
  provenance: EngineeringProvenance;
  lastUpdated?: string | null;
};

export type ExternalIdentityMapping = {
  mappingId: string;
  tenantId: string;
  workspaceId?: string | null;
  canonicalObjectType: EngineeringCanonicalObjectType;
  canonicalObjectId: string;
  sourceSystem: string;
  externalObjectType?: string | null;
  externalId: string;
  externalPath?: string | null;
  mappingStatus: EngineeringMappingStatus;
  confidence?: number | null;
  provenance: EngineeringProvenance;
  verifiedAt?: string | null;
  verifiedBy?: string | null;
  lastSeenAt?: string | null;
  metadata?: Record<string, unknown>;
};

export type EngineeringRelationshipEndpoint = {
  objectType: EngineeringCanonicalObjectType;
  objectId: string;
};

export type EngineeringRelationship = {
  relationshipId: string;
  tenantId: string;
  workspaceId?: string | null;
  projectId?: string | null;
  fromObject: EngineeringRelationshipEndpoint;
  relationshipType: EngineeringRelationshipType;
  toObject: EngineeringRelationshipEndpoint;
  direction: "forward" | "bidirectional";
  status: EngineeringRelationshipState;
  authority?: "ENGINEERING_OS" | "EXTERNAL" | "UNKNOWN";
  confidence?: number | null;
  sourceEvidenceIds?: string[];
  provenance: EngineeringProvenance;
  validFrom?: string | null;
  validTo?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type EngineeringContextAmbiguity = {
  code: string;
  message: string;
  objectIds?: string[];
};

export type EngineeringContextConflict = {
  code: string;
  message: string;
  mappingIds?: string[];
  relationshipIds?: string[];
};

export type EngineeringContextBundle = {
  primaryObjects: EngineeringObjectReference[];
  project?: EngineeringObjectReference | null;
  relatedObjects: EngineeringObjectReference[];
  relationships: EngineeringRelationship[];
  evidenceReferences: string[];
  externalMappings: ExternalIdentityMapping[];
  ambiguities: EngineeringContextAmbiguity[];
  conflicts: EngineeringContextConflict[];
  contextState: EngineeringContextState;
  generatedAt: string;
  limits: {
    maxRelatedObjects: number;
    maxRelationships: number;
    maxDepth: number;
  };
  timingMs?: {
    resolveMs: number;
    objectsLoaded: number;
    relationshipsTraversed: number;
  };
};

export function mapDomainTypeToCanonical(
  domainType: string,
): EngineeringCanonicalObjectType {
  const t = domainType.toLowerCase().replace(/-/g, "_");
  switch (t) {
    case "project":
    case "engineering_project":
      return "PROJECT";
    case "asset":
    case "engineering_asset":
      return "ASSET";
    case "document":
    case "engineering_document":
      return "DOCUMENT";
    case "decision":
    case "engineering_decision":
      return "DECISION";
    case "action":
    case "engineering_action":
      return "ACTION";
    case "risk":
    case "engineering_risk":
      return "RISK";
    case "issue":
    case "engineering_issue":
      return "ISSUE";
    case "technical_query":
    case "tq":
    case "engineering_technical_query":
      return "TECHNICAL_QUERY";
    case "lesson":
    case "engineering_lesson":
      return "LESSON";
    default:
      return domainType.toUpperCase();
  }
}

export function isImplementedCanonicalType(
  type: string,
): type is (typeof EngineeringCanonicalObjectTypes)[number] {
  return (EngineeringCanonicalObjectTypes as readonly string[]).includes(
    type.toUpperCase(),
  );
}

export function createSystemProvenance(
  sourceType: string,
  sourceId?: string | null,
  note?: string,
): EngineeringProvenance {
  return {
    sourceType,
    sourceId: sourceId ?? null,
    mechanism: "SYSTEM",
    actorId: null,
    ruleOrVersion: "e3-domain-fk-v1",
    timestamp: new Date().toISOString(),
    note,
  };
}

export function getPhaseE3Declaration() {
  return {
    evolutionPhase: ENGINEERING_OS_EVOLUTION_PHASE_E3,
    contractVersion: ENGINEERING_OS_EVOLUTION_CONTRACT_VERSION_E3,
    PhaseE3CanonicalContextComplete,
    PhaseE3NoMajorDbMigration,
    PhaseE3NoSecondKnowledgeGraph,
    PhaseE3DoesNotOwnKgInfrastructure,
    PhaseE3DoesNotOwnPiIiAiLogic,
    PhaseE3DoesNotOwnConnectors,
    PhaseE3DerivedFromExistingDomainLinks,
    PhaseE3NoFabricatedFutureDomains,
    PhaseE3InferredDistinctFromConfirmed,
    PhaseE3ContextImprovesE2WithoutReplacing,
    implementedObjectTypes: EngineeringCanonicalObjectTypes,
    futureObjectTypes: EngineeringFutureObjectTypes,
    relationshipTypes: EngineeringRelationshipTypes,
    mappingStatuses: EngineeringMappingStatuses,
    relationshipStates: EngineeringRelationshipStates,
    contextStates: EngineeringContextStates,
  } as const;
}

export function assertPhaseE3Invariants(input: {
  ProjectIntelligenceV1Intact: boolean;
  InspectionIntelligenceV1Intact: boolean;
  AssetIntelligenceV1Intact: boolean;
  ProjectControlsV1Intact: boolean;
  DigitalTwinV1Intact: boolean;
  EngineeringModelInteroperabilityV1Intact: boolean;
  privateCrossModuleCouplingDetected: boolean;
  duplicateAssetOwnershipDetected: boolean;
  EngineeringOSProductBoundaryLocked: boolean;
}): void {
  if (
    !EngineeringIntelligenceLayerContractLocked ||
    !PhaseE1ExperienceFoundationComplete ||
    !PhaseE2GroundedSearchComplete
  ) {
    throw new Error("E3 requires E0/E1/E2 contracts locked");
  }
  if (!E0PreservesCertifiedModuleOwnership || !E0ForbidsDuplicatePiIiOwnership) {
    throw new Error("E3 ownership regression");
  }
  if (
    !PhaseE3NoSecondKnowledgeGraph ||
    !PhaseE3DoesNotOwnKgInfrastructure ||
    !PhaseE1DoesNotOwnKgOrMemory
  ) {
    throw new Error("E3 must not own KG infrastructure");
  }
  if (!PhaseE3DoesNotOwnPiIiAiLogic || !PhaseE1DoesNotOwnPiIiAiLogic) {
    throw new Error("E3 must not own PI/II/AI logic");
  }
  if (
    !PhaseE3DoesNotOwnConnectors ||
    !PhaseE2NativeZeroConnector ||
    !NoMandatorySapM365CopilotDependency ||
    !E0ForbidsForcedExternalDependency
  ) {
    throw new Error("E3 forbids connector hard dependency");
  }
  if (
    !ExternalRecordNotEqualEngineeringOsRecord ||
    !PreferReferencesMappingsProvenance
  ) {
    throw new Error("E3 requires external != canonical SoR principle");
  }
  if (!PhaseE2ComposesExistingSearch || !PhaseE2NoFabricatedEvidence) {
    throw new Error("E3 must preserve E2 grounded search invariants");
  }
  if (!PhaseE3NoFabricatedFutureDomains) {
    throw new Error("E3 must not fabricate future domains");
  }
  if (!input.ProjectIntelligenceV1Intact || !input.InspectionIntelligenceV1Intact) {
    throw new Error("E3 regression: PI/II");
  }
  if (
    !input.AssetIntelligenceV1Intact ||
    !input.ProjectControlsV1Intact ||
    !input.DigitalTwinV1Intact ||
    !input.EngineeringModelInteroperabilityV1Intact
  ) {
    throw new Error("E3 regression: certified modules");
  }
  if (input.privateCrossModuleCouplingDetected || input.duplicateAssetOwnershipDetected) {
    throw new Error("E3 regression: coupling/ownership");
  }
  if (!input.EngineeringOSProductBoundaryLocked) {
    throw new Error("E3 requires product boundary locked");
  }
}
