/**
 * Phase 12K — DigitalThreadIntelligenceEngine.
 * Composes REFERENCES only; never duplicates upstream stores; never fabricates causality.
 */

import { createDigitalThreadProfile, type DigitalThreadProfile } from "./digital-thread-profile";
import {
  createDigitalThreadReference,
  resolveCrossDomainAdapterStatus,
  type DigitalThreadReference,
  type DigitalThreadReferenceKind,
} from "./digital-thread-reference";
import { createDigitalThreadRelationship, type DigitalThreadRelationship } from "./digital-thread-relationship";
import { createDigitalThreadProvenance, assertProvenanceFailClosed, type DigitalThreadProvenance } from "./digital-thread-provenance";
import {
  assertSnapshotRefsOnly,
  createDigitalThreadSnapshot,
  type DigitalThreadSnapshot,
} from "./digital-thread-snapshot";
import { traverseDigitalThread, type DigitalThreadTraversalMode, type DigitalThreadTraversalResult } from "./digital-thread-traversal";
import { diffDigitalThreadSnapshots, type DigitalThreadChangeSet } from "./digital-thread-change-set";
import {
  assertIntegrityDetectOnly,
  assessDigitalThreadIntegrity,
  type DigitalThreadIntegrityAssessment,
} from "./digital-thread-integrity";
import { assertNoDuplicateKnowledgeGraph, publishGovernedKgRef, resolveGovernedKgRef } from "./digital-thread-kg-reuse";
import { DIGITAL_THREAD_DOMAIN_EVENTS } from "./digital-thread-events";
import type { TwinThreadReference } from "./thread";

export type DigitalThreadIntelligenceEngine = {
  getProfile: () => DigitalThreadProfile;
  composeSnapshot: (input: {
    threadSnapshotId: string;
    snapshotVersion: string;
    asOf: string;
    twinThread?: TwinThreadReference;
    twinSnapshotRef?: string;
    twinTimelineRef?: string;
    references?: readonly DigitalThreadReference[];
    relationships?: readonly DigitalThreadRelationship[];
    provenance?: readonly DigitalThreadProvenance[];
    composedBy?: string;
  }) => DigitalThreadSnapshot;
  addReference: (input: {
    threadReferenceId: string;
    kind: DigitalThreadReferenceKind;
    targetRef: string;
    targetVersion?: string;
    hookAvailable?: boolean;
    label?: string;
  }) => DigitalThreadReference;
  addRelationship: (input: {
    threadRelationshipId: string;
    fromReferenceId: string;
    toReferenceId: string;
    relationshipType?: string | null;
    notes?: string;
  }) => DigitalThreadRelationship;
  recordProvenance: (input: {
    provenanceId: string;
    sourceDomain?: string | null;
    sourceReference?: string | null;
    sourceVersion?: string | null;
    sourceTimestamp?: string | null;
    relationshipType?: string | null;
  }) => DigitalThreadProvenance;
  traverse: (input: {
    mode: DigitalThreadTraversalMode;
    snapshot: DigitalThreadSnapshot;
    asOf?: string;
  }) => DigitalThreadTraversalResult;
  compare: (input: {
    changeSetId: string;
    from: DigitalThreadSnapshot;
    to: DigitalThreadSnapshot;
  }) => DigitalThreadChangeSet;
  assessIntegrity: (input: {
    integrityId: string;
    snapshot: DigitalThreadSnapshot;
    knownReferenceIds?: ReadonlySet<string>;
  }) => DigitalThreadIntegrityAssessment;
  publishKgRef: (input: {
    nodeRef?: string;
    edgeRef?: string;
    relationshipType: string;
  }) => ReturnType<typeof publishGovernedKgRef>;
  domainEvents: typeof DIGITAL_THREAD_DOMAIN_EVENTS;
  /** Upstream mutation is forbidden — engine only composes refs. */
  mutatesUpstreamStores: false;
};

export function createDigitalThreadIntelligenceEngine(input: {
  twinId: string;
  tenantId: string;
  workspaceId: string;
  profileId: string;
  profileKey?: string;
  displayName?: string;
}): DigitalThreadIntelligenceEngine {
  const profile = createDigitalThreadProfile({
    profileId: input.profileId,
    twinId: input.twinId,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    profileKey: input.profileKey ?? "default",
    displayName: input.displayName ?? "Digital Thread Profile",
  });

  assertNoDuplicateKnowledgeGraph();

  return {
    mutatesUpstreamStores: false,
    domainEvents: DIGITAL_THREAD_DOMAIN_EVENTS,
    getProfile: () => profile,
    composeSnapshot: (snapInput) => {
      const twinThreadRef = snapInput.twinThread
        ? `twin_thread:${snapInput.twinThread.twinId}`
        : undefined;
      // Integrate 12B thread links as references when provided — by reference only.
      const fromThread: DigitalThreadReference[] = (snapInput.twinThread?.links ?? []).map(
        (link, idx) =>
          createDigitalThreadReference({
            threadReferenceId: `ttl-${link.linkId || idx}`,
            twinId: input.twinId,
            tenantId: input.tenantId,
            workspaceId: input.workspaceId,
            kind: "twin_thread_link",
            targetRef: link.targetRef,
            label: link.label,
            recordedAt: link.recordedAt,
          }),
      );
      const snapshot = createDigitalThreadSnapshot({
        threadSnapshotId: snapInput.threadSnapshotId,
        twinId: input.twinId,
        tenantId: input.tenantId,
        workspaceId: input.workspaceId,
        snapshotVersion: snapInput.snapshotVersion,
        asOf: snapInput.asOf,
        twinThreadRef,
        twinSnapshotRef: snapInput.twinSnapshotRef,
        twinTimelineRef: snapInput.twinTimelineRef,
        references: [...fromThread, ...(snapInput.references ?? [])],
        relationships: snapInput.relationships,
        provenance: snapInput.provenance,
        composedBy: snapInput.composedBy,
      });
      assertSnapshotRefsOnly(snapshot);
      return snapshot;
    },
    addReference: (refInput) =>
      createDigitalThreadReference({
        threadReferenceId: refInput.threadReferenceId,
        twinId: input.twinId,
        tenantId: input.tenantId,
        workspaceId: input.workspaceId,
        kind: refInput.kind,
        targetRef: refInput.targetRef,
        targetVersion: refInput.targetVersion,
        label: refInput.label,
        adapterStatus: resolveCrossDomainAdapterStatus({
          kind: refInput.kind,
          hookAvailable: refInput.hookAvailable,
        }),
      }),
    addRelationship: (relInput) =>
      createDigitalThreadRelationship({
        threadRelationshipId: relInput.threadRelationshipId,
        twinId: input.twinId,
        tenantId: input.tenantId,
        workspaceId: input.workspaceId,
        fromReferenceId: relInput.fromReferenceId,
        toReferenceId: relInput.toReferenceId,
        relationshipType: relInput.relationshipType,
        notes: relInput.notes,
      }),
    recordProvenance: (pInput) => {
      const p = createDigitalThreadProvenance({
        provenanceId: pInput.provenanceId,
        twinId: input.twinId,
        tenantId: input.tenantId,
        workspaceId: input.workspaceId,
        sourceDomain: pInput.sourceDomain,
        sourceReference: pInput.sourceReference,
        sourceVersion: pInput.sourceVersion,
        sourceTimestamp: pInput.sourceTimestamp,
        relationshipType: pInput.relationshipType,
      });
      assertProvenanceFailClosed(p);
      return p;
    },
    traverse: (tInput) =>
      traverseDigitalThread({
        twinId: input.twinId,
        mode: tInput.mode,
        snapshot: tInput.snapshot,
        asOf: tInput.asOf,
      }),
    compare: (cInput) =>
      diffDigitalThreadSnapshots({
        changeSetId: cInput.changeSetId,
        twinId: input.twinId,
        from: cInput.from,
        to: cInput.to,
      }),
    assessIntegrity: (aInput) => {
      const assessment = assessDigitalThreadIntegrity({
        integrityId: aInput.integrityId,
        twinId: input.twinId,
        snapshot: aInput.snapshot,
        knownReferenceIds: aInput.knownReferenceIds,
      });
      assertIntegrityDetectOnly(assessment);
      return assessment;
    },
    publishKgRef: (kgInput) => {
      const resolved = resolveGovernedKgRef(kgInput);
      return publishGovernedKgRef(resolved);
    },
  };
}
