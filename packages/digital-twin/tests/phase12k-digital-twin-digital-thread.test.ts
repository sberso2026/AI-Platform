import { describe, expect, it } from "vitest";
import {
  DIGITAL_TWIN_PHASE,
  DIGITAL_TWIN_STATUS,
  DIGITAL_TWIN_VERSION,
  PUBLIC_CONTRACT_VERSION,
  PHASE_12J_CERTIFIED_COMMIT,
  PHASE_12J_HOSTED_RUN,
  PHASE_12J_VERSION,
  DigitalThreadIntelligenceReady,
  ProvenanceReady,
  IntegrityAssessmentReady,
  TemporalTraversalReady,
  ChangeSetReady,
  KnowledgeGraphReuseReady,
  duplicateKnowledgeGraphDetected,
  SolverCapabilityRegistryReady,
  FourLayerQualificationIntact,
  RealSolverExecutionCertified,
  CalculiXAdapterIntact,
  PHASE_12L_READY,
  getDigitalTwinDigitalThreadDeclaration,
} from "../src/version";
import {
  DIGITAL_THREAD_RELATIONSHIP_TYPES,
  assertNoCausalInference,
  DIGITAL_THREAD_CAUSAL_INFERENCE_ALLOWED,
} from "../src/domain/digital-thread-taxonomy";
import { createDigitalThreadProvenance } from "../src/domain/digital-thread-provenance";
import { createDigitalThreadIntelligenceEngine } from "../src/domain/digital-thread-intelligence-engine";
import {
  createDigitalThreadReview,
  decideDigitalThreadReview,
  submitDigitalThreadReview,
} from "../src/domain/digital-thread-review";
import { DIGITAL_THREAD_DOMAIN_EVENTS } from "../src/domain/digital-thread-events";
import { assertOwnershipLock } from "../src/architecture/ownership-lock";
import type { TwinThreadReference } from "../src/domain/thread";

describe("Phase 12K Digital Twin digital thread", () => {
  it("declares digital thread version and status", () => {
    expect(DIGITAL_TWIN_VERSION).toBe("1.0.0");
    expect(DIGITAL_TWIN_STATUS).toBe("ga");
    expect(DIGITAL_TWIN_PHASE).toBe("12N");
    expect(PUBLIC_CONTRACT_VERSION).toBe("1.0.0");
  });

  it("pins Phase 12J certified baseline", () => {
    expect(PHASE_12J_CERTIFIED_COMMIT).toBe(
      "b9c9a911e96e490022248badd99630ddc8cacb2f",
    );
    expect(PHASE_12J_HOSTED_RUN).toBe("31267810968");
    expect(PHASE_12J_VERSION).toBe("0.10.0-solver-capabilities");
  });

  it("enables thread flags and preserves 12J/12I evidence", () => {
    expect(DigitalThreadIntelligenceReady).toBe(true);
    expect(ProvenanceReady).toBe(true);
    expect(IntegrityAssessmentReady).toBe(true);
    expect(TemporalTraversalReady).toBe(true);
    expect(ChangeSetReady).toBe(true);
    expect(KnowledgeGraphReuseReady).toBe(true);
    expect(duplicateKnowledgeGraphDetected).toBe(false);
    expect(SolverCapabilityRegistryReady).toBe(true);
    expect(FourLayerQualificationIntact).toBe(true);
    expect(RealSolverExecutionCertified).toBe(true);
    expect(CalculiXAdapterIntact).toBe(true);
    expect(PHASE_12L_READY).toBe(true);
  });

  it("documents taxonomy without causal inference", () => {
    expect(DIGITAL_THREAD_RELATIONSHIP_TYPES).toContain("derived_from");
    expect(DIGITAL_THREAD_RELATIONSHIP_TYPES).toContain("associated_with");
    expect(DIGITAL_THREAD_RELATIONSHIP_TYPES).toContain("unknown");
    expect(DIGITAL_THREAD_CAUSAL_INFERENCE_ALLOWED).toBe(false);
    expect(assertNoCausalInference("derived_from").impliesCausality).toBe(false);
  });

  it("marks missing provenance as unknown fail-closed", () => {
    const p = createDigitalThreadProvenance({
      provenanceId: "prov-1",
      twinId: "twin-1",
      tenantId: "t1",
      workspaceId: "w1",
    });
    expect(p.provenanceStatus).toBe("unknown");
    expect(p.fabricated).toBe(false);
    expect(() =>
      createDigitalThreadProvenance({
        provenanceId: "prov-2",
        twinId: "twin-1",
        tenantId: "t1",
        workspaceId: "w1",
        provenanceStatus: "known",
      }),
    ).toThrow(/provenance_missing_must_be_unknown_fail_closed/);
  });

  it("composes refs only and integrates twin thread by reference", () => {
    const engine = createDigitalThreadIntelligenceEngine({
      twinId: "twin-1",
      tenantId: "t1",
      workspaceId: "w1",
      profileId: "prof-1",
    });
    expect(engine.mutatesUpstreamStores).toBe(false);

    const twinThread: TwinThreadReference = {
      twinId: "twin-1",
      links: [
        {
          linkId: "l1",
          twinId: "twin-1",
          tenantId: "t1",
          workspaceId: "w1",
          targetType: "asset",
          targetRef: "asset:A1",
          recordedAt: "2026-01-01T00:00:00.000Z",
          duplicatesTimelineStorage: false,
        },
      ],
    };

    const simRef = engine.addReference({
      threadReferenceId: "ref-sim",
      kind: "simulation_package",
      targetRef: "pkg:1",
    });
    const mqRef = engine.addReference({
      threadReferenceId: "ref-mq",
      kind: "method_qualification",
      targetRef: "mq:1",
    });
    const iiRef = engine.addReference({
      threadReferenceId: "ref-ii",
      kind: "inspection_intelligence",
      targetRef: "ii:1",
      // hook missing → reserved
    });
    expect(iiRef.adapterStatus).toBe("reserved");
    expect(iiRef.ownershipClaimed).toBe(false);
    expect(simRef.impliesObservedState).toBe(false);

    const rel = engine.addRelationship({
      threadRelationshipId: "rel-1",
      fromReferenceId: simRef.threadReferenceId,
      toReferenceId: mqRef.threadReferenceId,
      relationshipType: "qualified_by",
    });
    expect(rel.impliesCausality).toBe(false);

    const snap = engine.composeSnapshot({
      threadSnapshotId: "ts-1",
      snapshotVersion: "1.0.0",
      asOf: "2026-06-01T00:00:00.000Z",
      twinThread,
      twinSnapshotRef: "twin_snapshot:s1",
      twinTimelineRef: "twin_timeline:t1",
      references: [simRef, mqRef, iiRef],
      relationships: [rel],
    });
    expect(snap.compositionMode).toBe("references_only");
    expect(snap.replacesTwinSnapshot).toBe(false);
    expect(snap.twinSnapshotRef).toBe("twin_snapshot:s1");
    expect(snap.references.some((r) => r.kind === "twin_thread_link")).toBe(true);

    const traversal = engine.traverse({ mode: "as_of", snapshot: snap });
    expect(traversal.causalInferencePerformed).toBe(false);
    expect(traversal.simulationPackageTraversable).toBe(true);
    expect(traversal.fourLayerQualificationTraversable).toBe(true);
  });

  it("builds change sets and integrity assessments without auto-repair", () => {
    const engine = createDigitalThreadIntelligenceEngine({
      twinId: "twin-1",
      tenantId: "t1",
      workspaceId: "w1",
      profileId: "prof-1",
    });
    const a = engine.addReference({
      threadReferenceId: "r1",
      kind: "asset",
      targetRef: "asset:1",
      targetVersion: "1",
    });
    const from = engine.composeSnapshot({
      threadSnapshotId: "from",
      snapshotVersion: "1",
      asOf: "2026-01-01T00:00:00.000Z",
      references: [a],
    });
    const b = engine.addReference({
      threadReferenceId: "r1",
      kind: "asset",
      targetRef: "asset:1",
      targetVersion: "2",
    });
    const c = engine.addReference({
      threadReferenceId: "r2",
      kind: "document",
      targetRef: "doc:1",
    });
    const to = engine.composeSnapshot({
      threadSnapshotId: "to",
      snapshotVersion: "2",
      asOf: "2026-02-01T00:00:00.000Z",
      references: [b, c],
      relationships: [
        engine.addRelationship({
          threadRelationshipId: "broken",
          fromReferenceId: "missing",
          toReferenceId: "r2",
          relationshipType: "references",
        }),
      ],
      provenance: [
        engine.recordProvenance({
          provenanceId: "p-missing",
        }),
      ],
    });

    const cs = engine.compare({ changeSetId: "cs-1", from, to });
    expect(cs.causalInferencePerformed).toBe(false);
    expect(cs.changes.some((ch) => ch.changeKind === "version_changed")).toBe(true);
    expect(cs.changes.some((ch) => ch.changeKind === "added")).toBe(true);

    const integrity = engine.assessIntegrity({ integrityId: "int-1", snapshot: to });
    expect(integrity.autoRepairAttempted).toBe(false);
    expect(["broken_reference", "partial", "conflicting", "unknown"]).toContain(
      integrity.status,
    );
  });

  it("forbids AI self-approval on digital thread review", () => {
    const review = createDigitalThreadReview({
      reviewId: "rev-1",
      subjectRef: "ts-1",
      twinId: "twin-1",
    });
    const submitted = submitDigitalThreadReview(review, "engineer-1");
    expect(() => decideDigitalThreadReview(submitted, "approved", "ai")).toThrow(
      /automatic_or_ai_self_approval_forbidden/,
    );
    const decided = decideDigitalThreadReview(submitted, "approved", "engineer-2");
    expect(decided.status).toBe("approved");
  });

  it("emits thread domain events identifiers only", () => {
    expect(DIGITAL_THREAD_DOMAIN_EVENTS).toContain(
      "engineering.digital_twin.thread.composed",
    );
    expect(DIGITAL_THREAD_DOMAIN_EVENTS).toContain(
      "engineering.digital_twin.thread.reviewed",
    );
    expect(DIGITAL_THREAD_DOMAIN_EVENTS).toContain(
      "engineering.digital_twin.thread.published",
    );
    expect(DIGITAL_THREAD_DOMAIN_EVENTS).toContain(
      "engineering.digital_twin.thread.integrity_changed",
    );
  });

  it("ownership lock includes digital thread flags", () => {
    const lock = assertOwnershipLock();
    expect(lock.digitalThreadIntelligenceReady).toBe(true);
    expect(lock.provenanceReady).toBe(true);
    expect(lock.duplicateKnowledgeGraphDetected).toBe(false);
    expect(lock.solverCapabilityRegistryReady).toBe(true);
    expect(lock.realSolverExecutionCertified).toBe(true);
  });

  it("declaration reports digital thread version", () => {
    const d = getDigitalTwinDigitalThreadDeclaration();
    expect(d.version).toBe("1.0.0");
    expect(d.status).toBe("ga");
    expect(d.phase12LReady).toBe(true);
    expect(d.phase12JCertifiedCommit).toBe(PHASE_12J_CERTIFIED_COMMIT);
  });
});
