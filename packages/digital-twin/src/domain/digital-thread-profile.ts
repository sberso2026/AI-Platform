/**
 * Phase 12K — Digital Thread profile (per-twin composition config).
 */

export type DigitalThreadProfile = {
  profileId: string;
  twinId: string;
  tenantId: string;
  workspaceId: string;
  profileKey: string;
  displayName: string;
  /** Integrate existing Twin Thread / Snapshot / Timeline by reference. */
  twinThreadIntegration: "by_reference";
  twinSnapshotIntegration: "by_reference";
  twinTimelineIntegration: "by_reference";
  knowledgeGraphReuse: true;
  duplicateKnowledgeGraphDetected: false;
  compositionMode: "references_only";
  enabledRelationshipTaxonomyVersion: string;
  createdAt: string;
  updatedAt: string;
};

export function createDigitalThreadProfile(input: {
  profileId: string;
  twinId: string;
  tenantId: string;
  workspaceId: string;
  profileKey: string;
  displayName: string;
  enabledRelationshipTaxonomyVersion?: string;
}): DigitalThreadProfile {
  const now = new Date().toISOString();
  return {
    profileId: input.profileId,
    twinId: input.twinId,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    profileKey: input.profileKey,
    displayName: input.displayName,
    twinThreadIntegration: "by_reference",
    twinSnapshotIntegration: "by_reference",
    twinTimelineIntegration: "by_reference",
    knowledgeGraphReuse: true,
    duplicateKnowledgeGraphDetected: false,
    compositionMode: "references_only",
    enabledRelationshipTaxonomyVersion:
      input.enabledRelationshipTaxonomyVersion ?? "1.0.0",
    createdAt: now,
    updatedAt: now,
  };
}
