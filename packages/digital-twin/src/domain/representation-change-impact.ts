/**
 * Phase 12F — RepresentationChangeImpact classification.
 */

export const REPRESENTATION_CHANGE_IMPACTS = [
  "unaffected",
  "review_required",
  "mapping_invalid",
  "unknown",
] as const;

export type RepresentationChangeImpactKind =
  (typeof REPRESENTATION_CHANGE_IMPACTS)[number];

export type RepresentationChangeImpact = {
  impactId: string;
  tenantId: string;
  workspaceId: string;
  twinId: string;
  representationSourceId: string;
  mappingId?: string;
  elementRefId?: string;
  impact: RepresentationChangeImpactKind;
  changeSummary: string;
  sourceVersionBefore?: string;
  sourceVersionAfter?: string;
  createdAt: string;
  requiresReview: boolean;
};

export function classifyRepresentationChangeImpact(input: {
  mappingExists: boolean;
  externalElementStillPresent: boolean;
  metadataCompatible: boolean;
}): RepresentationChangeImpactKind {
  if (!input.mappingExists) return "unaffected";
  if (!input.externalElementStillPresent) return "mapping_invalid";
  if (!input.metadataCompatible) return "review_required";
  return "unaffected";
}

export function createRepresentationChangeImpact(input: {
  impactId: string;
  tenantId: string;
  workspaceId: string;
  twinId: string;
  representationSourceId: string;
  mappingId?: string;
  elementRefId?: string;
  impact: RepresentationChangeImpactKind;
  changeSummary: string;
  sourceVersionBefore?: string;
  sourceVersionAfter?: string;
}): RepresentationChangeImpact {
  return {
    impactId: input.impactId,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    twinId: input.twinId,
    representationSourceId: input.representationSourceId,
    mappingId: input.mappingId,
    elementRefId: input.elementRefId,
    impact: input.impact,
    changeSummary: input.changeSummary,
    sourceVersionBefore: input.sourceVersionBefore,
    sourceVersionAfter: input.sourceVersionAfter,
    createdAt: new Date().toISOString(),
    requiresReview: input.impact === "review_required" || input.impact === "mapping_invalid",
  };
}
