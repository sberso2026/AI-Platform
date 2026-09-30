/**
 * EOS-A2 governed engineering object-link taxonomy.
 * Historical engineering_object_links.relationship strings are unconstrained.
 * New Decision/Assumption writes must use these codes (relationship_governed = true).
 */

export const GOVERNED_RELATION_TYPES = [
  "CONTAINS",
  "USES",
  "DEPENDS_ON",
  "ALLOCATED_TO",
  "VERIFIED_BY",
  "USED_BY",
  "CONNECTS",
  "AFFECTS",
  "CAUSED_BY",
  "SELECTS",
  "SUPPORTED_BY",
  "BASED_ON",
  "REVIEWS",
  "FOUND_IN",
  "RESOLVES",
  "BASELINES",
  "SUPERSEDES",
  "MAPPED_TO",
  "REPRESENTED_BY",
  "SCOPED_TO",
  "CONSTRAINED_BY",
] as const;

export type GovernedRelationType = (typeof GOVERNED_RELATION_TYPES)[number];

/** Relations EOS-A2 APIs actually write. */
export const A2_WRITABLE_RELATIONS = [
  "BASED_ON",
  "SUPPORTED_BY",
  "SELECTS",
  "USED_BY",
  "SUPERSEDES",
] as const;

export type A2WritableRelation = (typeof A2_WRITABLE_RELATIONS)[number];

export const GOVERNED_LINK_OBJECT_TYPES = [
  "decision",
  "assumption",
  "document",
  "review_package",
  "review_evidence",
  "risk",
  "project",
  "asset",
  "alternative",
  "system",
  "interface",
  "requirement",
  "change",
  "impact",
  "configuration_baseline",
  "optimization_study",
  "optimization_run",
  "optimization_alternative",
  "optimization_constraint",
  "analysis_request",
  "analysis_result",
  "engineering_information",
  "engineering_work_event",
  "deliverable_expectation",
] as const;

export type GovernedLinkObjectType = (typeof GOVERNED_LINK_OBJECT_TYPES)[number];

export function isGovernedRelationType(value: string): value is GovernedRelationType {
  return (GOVERNED_RELATION_TYPES as readonly string[]).includes(value);
}

export function isA2WritableRelation(value: string): value is A2WritableRelation {
  return (A2_WRITABLE_RELATIONS as readonly string[]).includes(value);
}

export function isGovernedLinkObjectType(value: string): value is GovernedLinkObjectType {
  return (GOVERNED_LINK_OBJECT_TYPES as readonly string[]).includes(value);
}

export function assertGovernedRelationWrite(input: {
  relationship: string;
  fromType: string;
  toType: string;
}): asserts input is {
  relationship: A2WritableRelation;
  fromType: GovernedLinkObjectType;
  toType: GovernedLinkObjectType;
} {
  if (!isA2WritableRelation(input.relationship)) {
    throw new Error(
      `Ungoverned relation type: ${input.relationship}. A2 writes must use BASED_ON, SUPPORTED_BY, SELECTS, USED_BY, or SUPERSEDES.`,
    );
  }
  if (!isGovernedLinkObjectType(input.fromType) || !isGovernedLinkObjectType(input.toType)) {
    throw new Error(
      `Object type not allowed for governed links: ${input.fromType} -> ${input.toType}`,
    );
  }
}

/** Relations EOS-A3 APIs write in addition to A2 (no new taxonomy names). */
export const A3_WRITABLE_RELATIONS = [
  "CONTAINS",
  "USES",
  "CONNECTS",
  "AFFECTS",
  "USED_BY",
  "SUPPORTED_BY",
  "BASED_ON",
] as const;

export type A3WritableRelation = (typeof A3_WRITABLE_RELATIONS)[number];

export function isA3WritableRelation(value: string): value is A3WritableRelation {
  return (A3_WRITABLE_RELATIONS as readonly string[]).includes(value);
}

/** Relations EOS-A4 APIs write in addition to A2/A3 (no new taxonomy names). */
export const A4_WRITABLE_RELATIONS = [
  "ALLOCATED_TO",
  "AFFECTS",
  "CAUSED_BY",
  "DEPENDS_ON",
  "USED_BY",
  "VERIFIED_BY",
  "SUPPORTED_BY",
  "BASED_ON",
  "SELECTS",
  "SUPERSEDES",
] as const;

export type A4WritableRelation = (typeof A4_WRITABLE_RELATIONS)[number];

export function isA4WritableRelation(value: string): value is A4WritableRelation {
  return (A4_WRITABLE_RELATIONS as readonly string[]).includes(value);
}

export function assertA4GovernedRelationWrite(input: {
  relationship: string;
  fromType: string;
  toType: string;
}): asserts input is {
  relationship: A4WritableRelation;
  fromType: GovernedLinkObjectType;
  toType: GovernedLinkObjectType;
} {
  if (
    !isA4WritableRelation(input.relationship) &&
    !isA3WritableRelation(input.relationship) &&
    !isA2WritableRelation(input.relationship)
  ) {
    throw new Error(
      `Ungoverned relation type: ${input.relationship}. A4 writes must use ALLOCATED_TO, AFFECTS, CAUSED_BY, DEPENDS_ON, USED_BY, VERIFIED_BY, SUPPORTED_BY, BASED_ON, SELECTS, SUPERSEDES, or prior A2/A3 verbs.`,
    );
  }
  if (!isGovernedLinkObjectType(input.fromType) || !isGovernedLinkObjectType(input.toType)) {
    throw new Error(
      `Object type not allowed for governed links: ${input.fromType} -> ${input.toType}`,
    );
  }
}

export function assertA3GovernedRelationWrite(input: {
  relationship: string;
  fromType: string;
  toType: string;
}): asserts input is {
  relationship: A3WritableRelation;
  fromType: GovernedLinkObjectType;
  toType: GovernedLinkObjectType;
} {
  if (!isA3WritableRelation(input.relationship) && !isA2WritableRelation(input.relationship)) {
    throw new Error(
      `Ungoverned relation type: ${input.relationship}. A3 writes must use the A1 taxonomy (CONTAINS, USES, CONNECTS, AFFECTS, USED_BY, SUPPORTED_BY, BASED_ON, or A2 verbs).`,
    );
  }
  if (!isGovernedLinkObjectType(input.fromType) || !isGovernedLinkObjectType(input.toType)) {
    throw new Error(
      `Object type not allowed for governed links: ${input.fromType} -> ${input.toType}`,
    );
  }
}

/** Legacy afterCreate uses "contains". Do not rewrite those rows in A2. */
export const LEGACY_UNGOVERNED_RELATION_EXAMPLE = "contains";

export const A5_WRITABLE_RELATIONS = [
  "SCOPED_TO",
  "CONSTRAINED_BY",
  "SUPPORTED_BY",
  "BASED_ON",
  "USED_BY",
] as const;

export type A5WritableRelation = (typeof A5_WRITABLE_RELATIONS)[number];

export function isA5WritableRelation(value: string): value is A5WritableRelation {
  return (A5_WRITABLE_RELATIONS as readonly string[]).includes(value);
}

export function assertA5GovernedRelationWrite(input: {
  relationship: string;
  fromType: string;
  toType: string;
}): asserts input is {
  relationship: A5WritableRelation;
  fromType: GovernedLinkObjectType;
  toType: GovernedLinkObjectType;
} {
  if (
    !isA5WritableRelation(input.relationship) &&
    !isA4WritableRelation(input.relationship) &&
    !isA3WritableRelation(input.relationship) &&
    !isA2WritableRelation(input.relationship)
  ) {
    throw new Error(
      `Ungoverned relation type: ${input.relationship}. A5 writes must use SCOPED_TO, CONSTRAINED_BY, SUPPORTED_BY, BASED_ON, USED_BY, or prior governed verbs.`,
    );
  }
  if (!isGovernedLinkObjectType(input.fromType) || !isGovernedLinkObjectType(input.toType)) {
    throw new Error(`Object type not allowed for governed links: ${input.fromType} -> ${input.toType}`);
  }
}

export const A7B_WRITABLE_RELATIONS = [
  "DEPENDS_ON",
  "USES",
  "USED_BY",
  "SUPERSEDES",
  "VERIFIED_BY",
  "SUPPORTED_BY",
  "BASED_ON",
  "REVIEWS",
  "AFFECTS",
] as const;

export type A7BWritableRelation = (typeof A7B_WRITABLE_RELATIONS)[number];

export function isA7BWritableRelation(value: string): value is A7BWritableRelation {
  return (A7B_WRITABLE_RELATIONS as readonly string[]).includes(value);
}

export function assertA7BGovernedRelationWrite(input: {
  relationship: string;
  fromType: string;
  toType: string;
}): asserts input is {
  relationship: A7BWritableRelation;
  fromType: GovernedLinkObjectType;
  toType: GovernedLinkObjectType;
} {
  if (
    !isA7BWritableRelation(input.relationship) &&
    !isA5WritableRelation(input.relationship) &&
    !isA4WritableRelation(input.relationship) &&
    !isA3WritableRelation(input.relationship) &&
    !isA2WritableRelation(input.relationship)
  ) {
    throw new Error(
      `Ungoverned relation type: ${input.relationship}. A7B writes must use DEPENDS_ON, USES, USED_BY, SUPERSEDES, VERIFIED_BY, SUPPORTED_BY, BASED_ON, REVIEWS, AFFECTS, or prior governed verbs.`,
    );
  }
  if (!isGovernedLinkObjectType(input.fromType) || !isGovernedLinkObjectType(input.toType)) {
    throw new Error(`Object type not allowed for governed links: ${input.fromType} -> ${input.toType}`);
  }
}
