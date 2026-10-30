/** Typed EOS 3.2 canonical relationships — prefer typed edges over unconstrained graphs. */

import type { Eos3ObjectType } from "./eos3-canonical-objects";

export const EOS3_RELATIONSHIP_TYPES = [
  "REQUIREMENT_ALLOCATED_TO_SYSTEM",
  "REQUIREMENT_ALLOCATED_TO_DISCIPLINE_OBJECT",
  "SYSTEM_CONTAINS_DISCIPLINE_OBJECT",
  "SYSTEM_PARENT_OF_SYSTEM",
  "OBJECT_HAS_REVISION",
  "REVISION_OF_OBJECT",
  "REVISION_DEPENDS_ON_INTERFACE",
  "INTERFACE_SOURCE_REVISION",
  "INTERFACE_RECEIVER",
  "INTERFACE_TRACES_REQUIREMENT",
  "INTERFACE_TRACES_SYSTEM",
  "CHANGE_AFFECTS_OBJECT",
  "CHANGE_PRODUCES_IMPACT",
  "IMPACT_ON_OBJECT",
  "ASSUMPTION_SUPPORTS_CALCULATION",
  "ASSUMPTION_SUPPORTS_DECISION",
  "ASSUMPTION_SUPPORTS_REQUIREMENT",
  "CALCULATION_HAS_EVIDENCE",
  "REVIEW_OF_OBJECT",
  "REVIEW_OF_REVISION",
  "DECISION_HAS_EVIDENCE",
  "DECISION_USES_ASSUMPTION",
  "DELIVERABLE_SNAPSHOT_OF_REVISION",
  "BASELINE_INCLUDES_REVISION",
  "BASELINE_INCLUDES_DELIVERABLE",
  "ASSET_ORIGINATED_FROM_SYSTEM",
  "ASSET_ORIGINATED_FROM_OBJECT",
  "ASSET_ORIGINATED_FROM_PROJECT",
  "INSPECTION_OF_ASSET",
  "INSPECTION_OF_OBJECT",
  "OPTIMIZATION_RUN_USES_CALCULATION",
  "OPTIMIZATION_RUN_INFORMS_DECISION",
  "ENGINEERING_BASIS_RELATES_TO",
  "EVIDENCE_SUPPORTS_OBJECT",
  // EOS-3-DOMAIN-2 Asset/System context edges (Phase-3 graph compatible)
  "LOCATED_IN",
  "PART_OF_SYSTEM",
  "PART_OF_ASSET",
  "SUPPORTS",
  "CONNECTED_TO",
  "SERVES",
  "CONTAINS",
  "ASSOCIATED_WITH",
] as const;

export type Eos3RelationshipType = (typeof EOS3_RELATIONSHIP_TYPES)[number];

export type Eos3CanonicalRelationship = {
  id: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  relationshipType: Eos3RelationshipType;
  fromObjectId: string;
  toObjectId: string;
  fromRevisionId: string | null;
  toRevisionId: string | null;
  metadata: Record<string, unknown>;
  provenance: Record<string, unknown>;
  createdAt: string;
};

export const EOS3_DIGITAL_THREAD_PATH: Eos3ObjectType[] = [
  "Requirement",
  "System",
  "DisciplineObject",
  "Revision",
  "Interface",
  "Change",
  "Impact",
  "Calculation",
  "Review",
  "Decision",
  "Deliverable",
  "Baseline",
  "Asset",
  "Inspection",
];

export function isTypedRelationship(type: string): type is Eos3RelationshipType {
  return (EOS3_RELATIONSHIP_TYPES as readonly string[]).includes(type);
}
