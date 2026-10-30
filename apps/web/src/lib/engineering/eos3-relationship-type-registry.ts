/**
 * EOS-3-DOMAIN-3 — Governed relationship-type registry.
 * Semantics, constraints, directionality. Not an untyped free-form graph.
 */

export type GraphObjectClass =
  | "Project"
  | "WorkPackage"
  | "Facility"
  | "Area"
  | "System"
  | "Subsystem"
  | "Asset"
  | "Component"
  | "Requirement"
  | "EngineeringBasis"
  | "Assumption"
  | "Interface"
  | "Calculation"
  | "Decision"
  | "Change"
  | "Risk"
  | "Deliverable"
  | "Review"
  | "Evidence"
  | "Document"
  | "Action"
  | "TechnicalQuery"
  | "Revision"
  | "Impact"
  | "Baseline"
  | "*";

export type RelationshipOriginPolicy = "HUMAN" | "SYSTEM_DERIVED" | "INFERRED" | "MIGRATED";

export type RelationshipTypeDefinition = {
  type: string;
  engineeringMeaning: string;
  allowedSources: GraphObjectClass[];
  allowedTargets: GraphObjectClass[];
  directional: boolean;
  symmetric: boolean;
  inverseDisplayLabel: string;
  revisionSpecificAllowed: boolean;
  evidenceExpected: boolean;
  mayBeInferred: boolean;
  mustBeExplicitIfMaterial: boolean;
  materialityDefault: "LOW" | "MEDIUM" | "HIGH" | "UNKNOWN";
  /** Legacy EOS 3.2 / Domain-2 type aliases that compose into this vocabulary. */
  legacyAliases?: string[];
};

const ALL: GraphObjectClass[] = ["*"];

function def(
  partial: Omit<RelationshipTypeDefinition, "directional"> & { directional?: boolean },
): RelationshipTypeDefinition {
  return {
    directional: partial.directional ?? !partial.symmetric,
    ...partial,
  };
}

/** Domain-3 vocabulary + Domain-2 context + selected legacy engineering edges. */
export const EOS3_RELATIONSHIP_TYPE_REGISTRY: RelationshipTypeDefinition[] = [
  def({
    type: "REQUIRES",
    engineeringMeaning: "Source depends on target as a required input or predecessor.",
    allowedSources: ["WorkPackage", "Calculation", "Deliverable", "Decision", "System", "Asset"],
    allowedTargets: [
      "WorkPackage",
      "Assumption",
      "Evidence",
      "Document",
      "Requirement",
      "Calculation",
      "Asset",
      "System",
    ],
    symmetric: false,
    inverseDisplayLabel: "is required by",
    revisionSpecificAllowed: true,
    evidenceExpected: false,
    mayBeInferred: true,
    mustBeExplicitIfMaterial: true,
    materialityDefault: "HIGH",
    legacyAliases: ["DEPENDS_ON"],
  }),
  def({
    type: "PRODUCES",
    engineeringMeaning: "Source produces the target engineering output.",
    allowedSources: ["WorkPackage", "Calculation", "Decision", "Change"],
    allowedTargets: ["Deliverable", "Evidence", "Document", "Decision", "Calculation"],
    symmetric: false,
    inverseDisplayLabel: "is produced by",
    revisionSpecificAllowed: true,
    evidenceExpected: false,
    mayBeInferred: true,
    mustBeExplicitIfMaterial: false,
    materialityDefault: "MEDIUM",
  }),
  def({
    type: "CONSUMES",
    engineeringMeaning: "Source consumes the target as an engineering input.",
    allowedSources: ["WorkPackage", "Calculation", "Decision", "Deliverable"],
    allowedTargets: ["Assumption", "Evidence", "Document", "Requirement", "Calculation", "Interface"],
    symmetric: false,
    inverseDisplayLabel: "is consumed by",
    revisionSpecificAllowed: true,
    evidenceExpected: false,
    mayBeInferred: true,
    mustBeExplicitIfMaterial: true,
    materialityDefault: "MEDIUM",
  }),
  def({
    type: "SUPPORTS",
    engineeringMeaning: "Source supports or underpins the target.",
    allowedSources: ["Evidence", "Document", "Assumption", "Calculation", "Asset", "System", "Requirement"],
    allowedTargets: [
      "Assumption",
      "Calculation",
      "Decision",
      "Deliverable",
      "Requirement",
      "Asset",
      "WorkPackage",
    ],
    symmetric: false,
    inverseDisplayLabel: "is supported by",
    revisionSpecificAllowed: true,
    evidenceExpected: false,
    mayBeInferred: true,
    mustBeExplicitIfMaterial: false,
    materialityDefault: "MEDIUM",
    legacyAliases: ["ASSUMPTION_SUPPORTS_CALCULATION", "ASSUMPTION_SUPPORTS_DECISION", "ASSUMPTION_SUPPORTS_REQUIREMENT", "EVIDENCE_SUPPORTS_OBJECT", "CALCULATION_HAS_EVIDENCE"],
  }),
  def({
    type: "JUSTIFIES",
    engineeringMeaning: "Source provides justification for the target.",
    allowedSources: ["Evidence", "Calculation", "Decision", "EngineeringBasis"],
    allowedTargets: ["Decision", "Deliverable", "Change", "Requirement"],
    symmetric: false,
    inverseDisplayLabel: "is justified by",
    revisionSpecificAllowed: true,
    evidenceExpected: true,
    mayBeInferred: false,
    mustBeExplicitIfMaterial: true,
    materialityDefault: "HIGH",
  }),
  def({
    type: "ASSUMES",
    engineeringMeaning: "Source relies on the stated assumption (revision-aware).",
    allowedSources: ["Calculation", "Decision", "Deliverable", "WorkPackage"],
    allowedTargets: ["Assumption"],
    symmetric: false,
    inverseDisplayLabel: "is assumed by",
    revisionSpecificAllowed: true,
    evidenceExpected: false,
    mayBeInferred: true,
    mustBeExplicitIfMaterial: true,
    materialityDefault: "HIGH",
    legacyAliases: ["DECISION_USES_ASSUMPTION"],
  }),
  def({
    type: "AFFECTS",
    engineeringMeaning: "Source explicitly affects the target engineering object or asset.",
    allowedSources: ["Change", "Decision", "WorkPackage", "Impact"],
    allowedTargets: ["Asset", "System", "Component", "Requirement", "Calculation", "Deliverable", "WorkPackage", "Assumption"],
    symmetric: false,
    inverseDisplayLabel: "is affected by",
    revisionSpecificAllowed: true,
    evidenceExpected: false,
    mayBeInferred: false,
    mustBeExplicitIfMaterial: true,
    materialityDefault: "HIGH",
    legacyAliases: ["CHANGE_AFFECTS_OBJECT", "IMPACT_ON_OBJECT"],
  }),
  def({
    type: "SUPERSEDES",
    engineeringMeaning: "Source relationship or object supersedes the target historically.",
    allowedSources: ALL,
    allowedTargets: ALL,
    symmetric: false,
    inverseDisplayLabel: "is superseded by",
    revisionSpecificAllowed: true,
    evidenceExpected: false,
    mayBeInferred: false,
    mustBeExplicitIfMaterial: true,
    materialityDefault: "MEDIUM",
  }),
  def({
    type: "REVIEWS",
    engineeringMeaning: "Source review examines the target.",
    allowedSources: ["Review"],
    allowedTargets: ["Deliverable", "Calculation", "Decision", "Requirement", "Change", "WorkPackage"],
    symmetric: false,
    inverseDisplayLabel: "is reviewed by",
    revisionSpecificAllowed: true,
    evidenceExpected: false,
    mayBeInferred: false,
    mustBeExplicitIfMaterial: true,
    materialityDefault: "HIGH",
    legacyAliases: ["REVIEW_OF_OBJECT", "REVIEW_OF_REVISION"],
  }),
  def({
    type: "APPROVES",
    engineeringMeaning: "Source records human approval of the target (does not auto-grant authority).",
    allowedSources: ["Review", "Decision"],
    allowedTargets: ["Deliverable", "Calculation", "Decision", "Change", "Baseline"],
    symmetric: false,
    inverseDisplayLabel: "is approved by",
    revisionSpecificAllowed: true,
    evidenceExpected: true,
    mayBeInferred: false,
    mustBeExplicitIfMaterial: true,
    materialityDefault: "HIGH",
  }),
  def({
    type: "IMPLEMENTS",
    engineeringMeaning: "Source implements the target requirement or design intent.",
    allowedSources: ["Deliverable", "Calculation", "Asset", "WorkPackage"],
    allowedTargets: ["Requirement", "Decision", "EngineeringBasis"],
    symmetric: false,
    inverseDisplayLabel: "is implemented by",
    revisionSpecificAllowed: true,
    evidenceExpected: false,
    mayBeInferred: true,
    mustBeExplicitIfMaterial: false,
    materialityDefault: "MEDIUM",
  }),
  def({
    type: "MODIFIES",
    engineeringMeaning: "Source proposes or executes modification of the target.",
    allowedSources: ["WorkPackage", "Change"],
    allowedTargets: ["Asset", "System", "Component", "Area", "Facility"],
    symmetric: false,
    inverseDisplayLabel: "is modified by",
    revisionSpecificAllowed: false,
    evidenceExpected: false,
    mayBeInferred: true,
    mustBeExplicitIfMaterial: true,
    materialityDefault: "HIGH",
  }),
  def({
    type: "BLOCKS",
    engineeringMeaning: "Source blocks progress of the target.",
    allowedSources: ["WorkPackage", "Assumption", "Interface", "Decision", "Review", "Change"],
    allowedTargets: ["WorkPackage", "Deliverable", "Calculation", "Decision"],
    symmetric: false,
    inverseDisplayLabel: "is blocked by",
    revisionSpecificAllowed: false,
    evidenceExpected: false,
    mayBeInferred: true,
    mustBeExplicitIfMaterial: true,
    materialityDefault: "HIGH",
  }),
  def({
    type: "APPLIES_TO",
    engineeringMeaning: "Source applies to the target context or object.",
    allowedSources: ["Requirement", "Calculation", "Decision", "Assumption", "Change", "Review", "Evidence"],
    allowedTargets: ["Asset", "System", "WorkPackage", "Component", "Facility", "Area", "Deliverable"],
    symmetric: false,
    inverseDisplayLabel: "has applied",
    revisionSpecificAllowed: true,
    evidenceExpected: false,
    mayBeInferred: true,
    mustBeExplicitIfMaterial: false,
    materialityDefault: "MEDIUM",
    legacyAliases: ["REQUIREMENT_ALLOCATED_TO_SYSTEM"],
  }),
  def({
    type: "DERIVED_FROM",
    engineeringMeaning: "Source was derived from the target.",
    allowedSources: ALL,
    allowedTargets: ALL,
    symmetric: false,
    inverseDisplayLabel: "is derivation source for",
    revisionSpecificAllowed: true,
    evidenceExpected: false,
    mayBeInferred: true,
    mustBeExplicitIfMaterial: false,
    materialityDefault: "LOW",
  }),
  def({
    type: "CONTAINS",
    engineeringMeaning: "Source contains the target (organizational or physical).",
    allowedSources: ["Project", "WorkPackage", "Facility", "Area", "System", "Subsystem", "Asset"],
    allowedTargets: ["WorkPackage", "Facility", "Area", "System", "Subsystem", "Asset", "Component"],
    symmetric: false,
    inverseDisplayLabel: "is contained in",
    revisionSpecificAllowed: false,
    evidenceExpected: false,
    mayBeInferred: true,
    mustBeExplicitIfMaterial: false,
    materialityDefault: "LOW",
    legacyAliases: ["SYSTEM_CONTAINS_DISCIPLINE_OBJECT", "SYSTEM_PARENT_OF_SYSTEM"],
  }),
  // Domain-2 context types remain first-class
  def({
    type: "LOCATED_IN",
    engineeringMeaning: "Source is located in the target location context.",
    allowedSources: ["Area", "Asset", "Component", "System", "Subsystem"],
    allowedTargets: ["Facility", "Area"],
    symmetric: false,
    inverseDisplayLabel: "contains location of",
    revisionSpecificAllowed: false,
    evidenceExpected: false,
    mayBeInferred: true,
    mustBeExplicitIfMaterial: false,
    materialityDefault: "LOW",
  }),
  def({
    type: "PART_OF_SYSTEM",
    engineeringMeaning: "Source is part of the functional system.",
    allowedSources: ["Asset", "Component", "Subsystem", "Interface"],
    allowedTargets: ["System", "Subsystem"],
    symmetric: false,
    inverseDisplayLabel: "includes as part",
    revisionSpecificAllowed: false,
    evidenceExpected: false,
    mayBeInferred: true,
    mustBeExplicitIfMaterial: false,
    materialityDefault: "MEDIUM",
  }),
  def({
    type: "PART_OF_ASSET",
    engineeringMeaning: "Source is a physical constituent of the asset.",
    allowedSources: ["Component"],
    allowedTargets: ["Asset"],
    symmetric: false,
    inverseDisplayLabel: "includes component",
    revisionSpecificAllowed: false,
    evidenceExpected: false,
    mayBeInferred: true,
    mustBeExplicitIfMaterial: false,
    materialityDefault: "MEDIUM",
  }),
  def({
    type: "CONNECTED_TO",
    engineeringMeaning: "Source is connected to target (symmetric).",
    allowedSources: ["Asset", "System", "Component", "Interface"],
    allowedTargets: ["Asset", "System", "Component", "Interface"],
    symmetric: true,
    directional: false,
    inverseDisplayLabel: "connected to",
    revisionSpecificAllowed: false,
    evidenceExpected: false,
    mayBeInferred: true,
    mustBeExplicitIfMaterial: false,
    materialityDefault: "MEDIUM",
  }),
  def({
    type: "SERVES",
    engineeringMeaning: "Source serves the target functionally.",
    allowedSources: ["System", "Asset", "Subsystem"],
    allowedTargets: ["System", "Asset", "Facility", "Area"],
    symmetric: false,
    inverseDisplayLabel: "is served by",
    revisionSpecificAllowed: false,
    evidenceExpected: false,
    mayBeInferred: true,
    mustBeExplicitIfMaterial: false,
    materialityDefault: "LOW",
  }),
  def({
    type: "ASSOCIATED_WITH",
    engineeringMeaning: "Soft association without stronger semantic claim.",
    allowedSources: ALL,
    allowedTargets: ALL,
    symmetric: true,
    directional: false,
    inverseDisplayLabel: "associated with",
    revisionSpecificAllowed: false,
    evidenceExpected: false,
    mayBeInferred: true,
    mustBeExplicitIfMaterial: false,
    materialityDefault: "LOW",
  }),
];

const byType = new Map(EOS3_RELATIONSHIP_TYPE_REGISTRY.map((d) => [d.type, d]));
const aliasToCanonical = new Map<string, string>();
for (const d of EOS3_RELATIONSHIP_TYPE_REGISTRY) {
  for (const a of d.legacyAliases ?? []) aliasToCanonical.set(a, d.type);
}

export function resolveRelationshipType(type: string): string {
  return aliasToCanonical.get(type) ?? type;
}

export function getRelationshipTypeDefinition(type: string): RelationshipTypeDefinition | null {
  return byType.get(resolveRelationshipType(type)) ?? byType.get(type) ?? null;
}

export function isRegisteredRelationshipType(type: string): boolean {
  return getRelationshipTypeDefinition(type) != null;
}

export function assertAllowedEndpoint(
  type: string,
  sourceClass: string,
  targetClass: string,
): { ok: true } | { ok: false; reason: string } {
  const defn = getRelationshipTypeDefinition(type);
  if (!defn) return { ok: false, reason: "unregistered_relationship_type" };
  const srcOk =
    defn.allowedSources.includes("*") ||
    defn.allowedSources.includes(sourceClass as GraphObjectClass);
  const tgtOk =
    defn.allowedTargets.includes("*") ||
    defn.allowedTargets.includes(targetClass as GraphObjectClass);
  if (!srcOk) return { ok: false, reason: `source_class_not_allowed:${sourceClass}` };
  if (!tgtOk) return { ok: false, reason: `target_class_not_allowed:${targetClass}` };
  return { ok: true };
}

export function inverseDisplay(type: string, sourceLabel: string, targetLabel: string): string {
  const defn = getRelationshipTypeDefinition(type);
  const inv = defn?.inverseDisplayLabel ?? "related to";
  return `${targetLabel} ${inv} ${sourceLabel}`;
}

export function auditDigitalThreadCompatibility(): {
  existingDigitalThreadAudited: true;
  duplicateDigitalThreadCreated: false;
  existingCapabilities: string[];
  compositionStrategy: string;
} {
  return {
    existingDigitalThreadAudited: true,
    duplicateDigitalThreadCreated: false,
    existingCapabilities: [
      "Eos3CanonicalRelationship in object store (typed edges)",
      "eos3-digital-thread query helpers (requirementsDrivingObject, traceDigitalThread)",
      "Domain-1 Work Package dependency foundation (REQUIRES/DEPENDS_ON/AFFECTS)",
      "Domain-2 Asset/System typed context relationships",
    ],
    compositionStrategy:
      "Domain-3 graph edge store is the relational adjacency model. Domain-1 dependencies and Domain-2 context edges are composed into graph edges by reference (same stable IDs). Digital thread remains structured-canonical-state authority; Domain-3 does not create a second Digital Thread or clone object payloads.",
  };
}
