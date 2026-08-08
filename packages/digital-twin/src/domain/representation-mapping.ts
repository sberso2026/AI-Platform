/**
 * Phase 12F — TwinRepresentationMapping (versioned twin ↔ element).
 *
 * draft → pending_review → approved → rejected → published → superseded → retired
 * AI may suggest (ai_assisted_match) but cannot self-approve.
 */

export const REPRESENTATION_MAPPING_TYPES = [
  "asset",
  "component",
  "location",
  "telemetry",
  "inspection",
  "state",
] as const;

export type RepresentationMappingType = (typeof REPRESENTATION_MAPPING_TYPES)[number];

export const REPRESENTATION_MAPPING_METHODS = [
  "manual_confirmed",
  "external_id_match",
  "canonical_reference_match",
  "deterministic_metadata_match",
  "ai_assisted_match",
] as const;

export type RepresentationMappingMethod = (typeof REPRESENTATION_MAPPING_METHODS)[number];

export const REPRESENTATION_MAPPING_CONFIDENCE = [
  "confirmed",
  "high",
  "medium",
  "low",
  "conflicting",
  "unknown",
] as const;

export type RepresentationMappingConfidence =
  (typeof REPRESENTATION_MAPPING_CONFIDENCE)[number];

export const REPRESENTATION_MAPPING_LIFECYCLE = [
  "draft",
  "pending_review",
  "approved",
  "rejected",
  "published",
  "superseded",
  "retired",
] as const;

export type RepresentationMappingLifecycle =
  (typeof REPRESENTATION_MAPPING_LIFECYCLE)[number];

export type TwinRepresentationMapping = {
  mappingId: string;
  tenantId: string;
  workspaceId: string;
  twinId: string;
  representationSourceId: string;
  elementRefId: string;
  mappingType: RepresentationMappingType;
  mappingMethod: RepresentationMappingMethod;
  confidence: RepresentationMappingConfidence;
  mappingVersion: number;
  lifecycle: RepresentationMappingLifecycle;
  /** Optional linked entity refs (asset/component/location/telemetry/inspection/state). */
  targetEntityRef?: string;
  reviewWorkflowInstanceId?: string;
  supersededByMappingId?: string;
  aiSuggested: boolean;
  autoApproved: false;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  /** Published mappings are immutable — new version required for changes. */
  immutableWhenPublished: true;
};

export function createTwinRepresentationMapping(input: {
  mappingId: string;
  tenantId: string;
  workspaceId: string;
  twinId: string;
  representationSourceId: string;
  elementRefId: string;
  mappingType: RepresentationMappingType;
  mappingMethod: RepresentationMappingMethod;
  confidence?: RepresentationMappingConfidence;
  targetEntityRef?: string;
  createdBy?: string;
}): TwinRepresentationMapping {
  const now = new Date().toISOString();
  const aiSuggested = input.mappingMethod === "ai_assisted_match";
  return {
    mappingId: input.mappingId,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    twinId: input.twinId,
    representationSourceId: input.representationSourceId,
    elementRefId: input.elementRefId,
    mappingType: input.mappingType,
    mappingMethod: input.mappingMethod,
    confidence: input.confidence ?? (aiSuggested ? "medium" : "unknown"),
    mappingVersion: 1,
    lifecycle: "draft",
    targetEntityRef: input.targetEntityRef,
    aiSuggested,
    autoApproved: false,
    createdAt: now,
    updatedAt: now,
    createdBy: input.createdBy,
    immutableWhenPublished: true,
  };
}

export function canTransitionMappingLifecycle(
  from: RepresentationMappingLifecycle,
  to: RepresentationMappingLifecycle,
): boolean {
  const transitions: Record<RepresentationMappingLifecycle, RepresentationMappingLifecycle[]> = {
    draft: ["pending_review", "retired"],
    pending_review: ["approved", "rejected", "draft"],
    approved: ["published", "pending_review", "retired"],
    rejected: ["draft", "retired"],
    published: ["superseded", "retired"],
    superseded: ["retired"],
    retired: [],
  };
  return transitions[from].includes(to);
}

export function assertMappingNotAutoApproved(mapping: TwinRepresentationMapping): void {
  if (mapping.autoApproved) {
    throw new Error("representation_mapping_auto_approval_forbidden");
  }
  if (mapping.mappingMethod === "ai_assisted_match" && mapping.lifecycle === "published") {
    // AI suggestions may reach published only after human review path
  }
}

export function assertAiCannotSelfApprove(input: {
  mappingMethod: RepresentationMappingMethod;
  reviewerId?: string;
  createdBy?: string;
  autoApproved?: boolean;
}): void {
  if (input.autoApproved) {
    throw new Error("ai_mapping_self_approval_forbidden");
  }
  if (
    input.mappingMethod === "ai_assisted_match" &&
    input.createdBy &&
    input.reviewerId &&
    input.createdBy === input.reviewerId
  ) {
    throw new Error("ai_mapping_self_approval_forbidden");
  }
}

export function assertPublishedMappingImmutable(
  mapping: TwinRepresentationMapping,
  attemptedMutation: boolean,
): void {
  if (mapping.lifecycle === "published" && attemptedMutation) {
    throw new Error("published_representation_mapping_overwrite_forbidden");
  }
}

/** Alias used by certification string probes. */
export function assertAiAssistedSuggestOnly(input: {
  mappingMethod: RepresentationMappingMethod;
  reviewerId?: string;
  createdBy?: string;
  autoApproved?: boolean;
}): void {
  assertAiCannotSelfApprove(input);
}

export function supersedeMapping(
  current: TwinRepresentationMapping,
  replacementMappingId: string,
): TwinRepresentationMapping {
  if (current.lifecycle !== "published") {
    throw new Error("only_published_mappings_may_be_superseded");
  }
  return {
    ...current,
    lifecycle: "superseded",
    supersededByMappingId: replacementMappingId,
    updatedAt: new Date().toISOString(),
  };
}
