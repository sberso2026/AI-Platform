/**
 * Derive canonical EngineeringRelationship edges from known domain FKs / object links.
 * Never invent edges from keyword co-occurrence.
 */

import type {
  EngineeringObjectReference,
  EngineeringProvenance,
  EngineeringRelationship,
  EngineeringRelationshipState,
  EngineeringRelationshipType,
} from "./contracts";
import { createSystemProvenance, mapDomainTypeToCanonical } from "./contracts";

export type DomainLinkHint = {
  fromType: string;
  fromId: string;
  toType: string;
  toId: string;
  /** Prefer explicit semantic type; RELATES_TO only when link is generic. */
  relationshipType?: EngineeringRelationshipType;
  status?: EngineeringRelationshipState;
  projectId?: string | null;
  sourceId?: string | null;
  revoked?: boolean;
};

export type DomainRecordHint = {
  objectType: string;
  objectId: string;
  tenantId: string;
  workspaceId?: string | null;
  projectId?: string | null;
  displayName?: string | null;
  status?: string | null;
  lastUpdated?: string | null;
  /** Explicit parent project when FK present. */
  belongsToProjectId?: string | null;
  /** Predecessor / revision chain when metadata supports it. */
  predecessorDocumentId?: string | null;
  /** Linked decision for an action, etc. */
  linkedDecisionId?: string | null;
  linkedDocumentId?: string | null;
  linkedAssetId?: string | null;
  originatingObjectType?: string | null;
  originatingObjectId?: string | null;
};

function edgeId(
  tenantId: string,
  type: string,
  fromType: string,
  fromId: string,
  toType: string,
  toId: string,
): string {
  return `rel:${tenantId}:${type}:${fromType}:${fromId}:${toType}:${toId}`;
}

function mkRel(input: {
  tenantId: string;
  workspaceId?: string | null;
  projectId?: string | null;
  fromType: string;
  fromId: string;
  toType: string;
  toId: string;
  relationshipType: EngineeringRelationshipType;
  status: EngineeringRelationshipState;
  provenance: EngineeringProvenance;
  confidence?: number | null;
}): EngineeringRelationship {
  const now = input.provenance.timestamp;
  return {
    relationshipId: edgeId(
      input.tenantId,
      input.relationshipType,
      input.fromType,
      input.fromId,
      input.toType,
      input.toId,
    ),
    tenantId: input.tenantId,
    workspaceId: input.workspaceId ?? null,
    projectId: input.projectId ?? null,
    fromObject: {
      objectType: mapDomainTypeToCanonical(input.fromType),
      objectId: input.fromId,
    },
    relationshipType: input.relationshipType,
    toObject: {
      objectType: mapDomainTypeToCanonical(input.toType),
      objectId: input.toId,
    },
    direction: "forward",
    status: input.status,
    authority: "ENGINEERING_OS",
    confidence: input.confidence ?? (input.status === "CONFIRMED" ? 1 : null),
    provenance: input.provenance,
    createdAt: now,
    updatedAt: now,
  };
}

/** Project-owned membership edges from FK. */
export function deriveBelongsToProject(
  record: DomainRecordHint,
): EngineeringRelationship | null {
  const projectId = record.belongsToProjectId ?? record.projectId;
  if (!projectId) return null;
  const canonical = mapDomainTypeToCanonical(record.objectType);
  if (canonical === "PROJECT") return null;
  return mkRel({
    tenantId: record.tenantId,
    workspaceId: record.workspaceId,
    projectId,
    fromType: record.objectType,
    fromId: record.objectId,
    toType: "PROJECT",
    toId: projectId,
    relationshipType: "BELONGS_TO_PROJECT",
    status: "CONFIRMED",
    provenance: createSystemProvenance(
      "domain_fk",
      `${record.objectType}:${record.objectId}`,
      "project_id / engineering_project_id",
    ),
  });
}

export function deriveRecordRelationships(
  record: DomainRecordHint,
): EngineeringRelationship[] {
  const out: EngineeringRelationship[] = [];
  const belongs = deriveBelongsToProject(record);
  if (belongs) out.push(belongs);

  const projectId = record.belongsToProjectId ?? record.projectId ?? null;
  const base = {
    tenantId: record.tenantId,
    workspaceId: record.workspaceId,
    projectId,
  };

  if (record.linkedDecisionId) {
    const fromCanonical = mapDomainTypeToCanonical(record.objectType);
    out.push(
      mkRel({
        ...base,
        fromType: record.objectType,
        fromId: record.objectId,
        toType: "DECISION",
        toId: record.linkedDecisionId,
        relationshipType:
          fromCanonical === "ACTION" ? "RESULTED_IN" : "REFERENCES",
        status: "CONFIRMED",
        provenance: createSystemProvenance(
          "domain_fk",
          `${record.objectType}:${record.objectId}`,
          "linkedDecisionId",
        ),
      }),
    );
    if (fromCanonical === "ACTION") {
      out.push(
        mkRel({
          ...base,
          fromType: "DECISION",
          fromId: record.linkedDecisionId,
          toType: "ACTION",
          toId: record.objectId,
          relationshipType: "HAS_ACTION",
          status: "CONFIRMED",
          provenance: createSystemProvenance(
            "domain_fk",
            `${record.objectType}:${record.objectId}`,
            "linkedDecisionId→HAS_ACTION",
          ),
        }),
      );
    }
  }

  if (record.linkedDocumentId) {
    out.push(
      mkRel({
        ...base,
        fromType: record.objectType,
        fromId: record.objectId,
        toType: "DOCUMENT",
        toId: record.linkedDocumentId,
        relationshipType: "REFERENCES",
        status: "CONFIRMED",
        provenance: createSystemProvenance(
          "domain_fk",
          `${record.objectType}:${record.objectId}`,
          "linkedDocumentId",
        ),
      }),
    );
  }

  if (record.linkedAssetId) {
    out.push(
      mkRel({
        ...base,
        fromType: record.objectType,
        fromId: record.objectId,
        toType: "ASSET",
        toId: record.linkedAssetId,
        relationshipType: "HAS_ASSET",
        status: "CONFIRMED",
        provenance: createSystemProvenance(
          "domain_fk",
          `${record.objectType}:${record.objectId}`,
          "linkedAssetId",
        ),
      }),
    );
  }

  if (record.predecessorDocumentId) {
    out.push(
      mkRel({
        ...base,
        fromType: record.objectType,
        fromId: record.objectId,
        toType: "DOCUMENT",
        toId: record.predecessorDocumentId,
        relationshipType: "DERIVED_FROM",
        status: "CONFIRMED",
        provenance: createSystemProvenance(
          "domain_metadata",
          `${record.objectType}:${record.objectId}`,
          "predecessorDocumentId",
        ),
      }),
    );
  }

  if (record.originatingObjectType && record.originatingObjectId) {
    const fromCanonical = mapDomainTypeToCanonical(record.objectType);
    let relationshipType: EngineeringRelationshipType = "RELATES_TO";
    if (fromCanonical === "ACTION") relationshipType = "HAS_ACTION";
    else if (fromCanonical === "DECISION") relationshipType = "HAS_DECISION";
    else if (fromCanonical === "RISK") relationshipType = "HAS_RISK";
    else if (fromCanonical === "ISSUE") relationshipType = "HAS_ISSUE";
    else if (fromCanonical === "TECHNICAL_QUERY")
      relationshipType = "HAS_TECHNICAL_QUERY";
    else if (fromCanonical === "DOCUMENT") relationshipType = "HAS_DOCUMENT";
    else if (fromCanonical === "LESSON") relationshipType = "HAS_LESSON";

    // Edge is owned by the originating object → this record.
    out.push(
      mkRel({
        ...base,
        fromType: record.originatingObjectType,
        fromId: record.originatingObjectId,
        toType: record.objectType,
        toId: record.objectId,
        relationshipType,
        status: "CONFIRMED",
        provenance: createSystemProvenance(
          "domain_fk",
          `${record.objectType}:${record.objectId}`,
          "originating_object",
        ),
      }),
    );
  }

  return out;
}

export function deriveFromObjectLinks(
  tenantId: string,
  workspaceId: string | null | undefined,
  links: DomainLinkHint[],
): EngineeringRelationship[] {
  return links
    .filter((l) => !l.revoked)
    .map((l) =>
      mkRel({
        tenantId,
        workspaceId,
        projectId: l.projectId,
        fromType: l.fromType,
        fromId: l.fromId,
        toType: l.toType,
        toId: l.toId,
        relationshipType: l.relationshipType ?? "RELATES_TO",
        status: l.status ?? "CONFIRMED",
        provenance: createSystemProvenance(
          "engineering_object_links",
          l.sourceId ?? `${l.fromType}:${l.fromId}->${l.toType}:${l.toId}`,
          l.relationshipType
            ? "explicit link semantics"
            : "generic link — RELATES_TO only",
        ),
        confidence: l.status === "INFERRED" ? null : 1,
      }),
    );
}

export function toObjectReference(
  record: DomainRecordHint,
): EngineeringObjectReference {
  return {
    objectType: mapDomainTypeToCanonical(record.objectType),
    objectId: record.objectId,
    tenantId: record.tenantId,
    workspaceId: record.workspaceId ?? null,
    projectId: record.belongsToProjectId ?? record.projectId ?? null,
    displayName: record.displayName ?? null,
    status: record.status ?? null,
    authority: "ENGINEERING_OS",
    sourceSystem: "engineering_os",
    provenance: createSystemProvenance(
      "domain_record",
      `${record.objectType}:${record.objectId}`,
    ),
    lastUpdated: record.lastUpdated ?? null,
  };
}

/**
 * Ambient capture helper: when a create operation already knows links, emit edges.
 * Callers must not invent semantics beyond known FKs.
 */
export function ambientRelationshipsFromCreate(event: {
  tenantId: string;
  workspaceId?: string | null;
  created: DomainRecordHint;
}): EngineeringRelationship[] {
  return deriveRecordRelationships(event.created);
}

/** Keyword co-occurrence must never produce relationships. */
export function refuseKeywordFabrication(): EngineeringRelationship[] {
  return [];
}
