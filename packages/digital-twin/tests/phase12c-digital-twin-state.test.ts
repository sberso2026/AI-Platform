import { describe, expect, it } from "vitest";
import {
  assertCoreContracts,
  assertOwnershipLock,
  assertStateContracts,
  assertStateForbiddenCapabilities,
  createDigitalTwinEngine,
  createDigitalTwinRepository,
  createDigitalTwinStateEngine,
  createDurableDigitalTwinMemoryStore,
  DIGITAL_TWIN_EVENTS,
  DIGITAL_TWIN_PHASE,
  DIGITAL_TWIN_STATE_REVIEW_SLUG,
  DIGITAL_TWIN_STATUS,
  DIGITAL_TWIN_VERSION,
  HOSTED_PERSISTENCE_READY,
  LIVE_TELEMETRY_IMPLEMENTED,
  PHASE_12B_CERTIFIED_COMMIT,
  PHASE_12B_VERSION,
  PHASE_12C_CERTIFIED_COMMIT,
  PHASE_12C_VERSION,
  PHASE_12D_READY,
  PHASE_12E_READY,
  PUBLIC_CONTRACT_VERSION,
  REPRESENTATION_VERSIONING_READY,
  SIMULATION_EXECUTION_IMPLEMENTED,
  STATE_DOMAIN_EVENTS,
  STATE_REVIEW_WORKFLOW_SLUG,
  THREE_D_VIEWER_IMPLEMENTED,
  TWIN_IDENTITY_READY,
  TWIN_SNAPSHOT_READY,
  TWIN_STATE_READY,
  TWIN_TIMELINE_READY,
  TWIN_VERSIONING_READY,
  twinStateReady,
} from "../src/index";
import { STATE_REVIEW_WORKFLOW } from "../src/domain/review-workflow";

describe("Phase 12C Digital Twin state domain", () => {
  const tenantId = "tenant-1";
  const workspaceId = "workspace-1";

  it("retains state capabilities with pinned 12B/12C baselines", () => {
    expect(PHASE_12C_VERSION).toBe("0.3.0-state");
    expect(PHASE_12C_CERTIFIED_COMMIT).toBe("07b5ccc843395bd02633163dc654668da9f17658");
    expect(PHASE_12B_VERSION).toBe("0.2.0-core");
    expect(PHASE_12B_CERTIFIED_COMMIT).toBe("5e1bb22486a9fdd6385fb980daf0150a330eca9b");
    expect(PHASE_12D_READY).toBe(true);
    expect(PHASE_12E_READY).toBe(true);
    expect(TWIN_STATE_READY).toBe(true);
    expect(twinStateReady).toBe(true);
    expect(TWIN_VERSIONING_READY).toBe(true);
    expect(REPRESENTATION_VERSIONING_READY).toBe(true);
    expect(TWIN_SNAPSHOT_READY).toBe(true);
    expect(TWIN_TIMELINE_READY).toBe(true);
    expect(TWIN_IDENTITY_READY).toBe(true);
    expect(HOSTED_PERSISTENCE_READY).toBe(true);
    expect(STATE_REVIEW_WORKFLOW_SLUG).toBe("digital_twin.state_review");
    expect(DIGITAL_TWIN_STATE_REVIEW_SLUG).toBe("digital_twin.state_review");
    expect(STATE_REVIEW_WORKFLOW.slug).toBe("digital_twin.state_review");
  });

  it("keeps forbidden runtime locks closed with bounded live telemetry", () => {
    expect(LIVE_TELEMETRY_IMPLEMENTED).toBe(true);
    expect(SIMULATION_EXECUTION_IMPLEMENTED).toBe(true);
    expect(THREE_D_VIEWER_IMPLEMENTED).toBe(false);
    assertStateForbiddenCapabilities();
  });

  it("asserts ownership lock for state slice", () => {
    const lock = assertOwnershipLock();
    expect(lock.ok).toBe(true);
    expect(lock.twinStateReady).toBe(true);
    expect(lock.twinVersioningReady).toBe(true);
    expect(lock.publicContractVersion).toBe("0.9.0-external-solver-draft");
  });

  it("declares state contract families and domain events", () => {
    expect(assertCoreContracts().contractVersion).toBe("0.9.0-external-solver-draft");
    expect(assertStateContracts().contractVersion).toBe("0.9.0-external-solver-draft");
    for (const evt of STATE_DOMAIN_EVENTS) {
      expect(DIGITAL_TWIN_EVENTS).toContain(evt);
    }
  });

  it("creates governed state with provenance and publishes via review", async () => {
    const repository = createDigitalTwinRepository({
      adapter: "memory",
      memoryStore: createDurableDigitalTwinMemoryStore(),
    });
    const engine = createDigitalTwinEngine({ repository });

    const identity = await engine.createIdentity({
      tenantId,
      workspaceId,
      canonicalEntityType: "asset",
      canonicalEntityId: "asset-state-1",
    });

    const state = await engine.createState({
      tenantId,
      workspaceId,
      twinId: identity.twinId,
      category: "observed",
      externalRef: "ref://field-reading/001",
      provenance: {
        sourceModule: "inspection_intelligence",
        sourceRef: "inspection-42",
        capturedAt: new Date().toISOString(),
      },
      evidenceRefs: ["doc://evidence/1"],
    });
    expect(state.lifecycle).toBe("draft");
    expect(state.storesTelemetryPayload).toBe(false);
    expect(state.simulationExecuted).toBe(false);

    const { instance } = await engine.submitStateReview({
      tenantId,
      workspaceId,
      twinId: identity.twinId,
      stateId: state.stateId,
    });
    expect(instance.state).toBe("pending_review");

    const approved = await engine.transitionStateReview({
      tenantId,
      workspaceId,
      twinId: identity.twinId,
      stateId: state.stateId,
      instance,
      action: "approve",
      to: "approved",
      reviewerId: "reviewer-1",
    });
    expect(approved.state.reviewStatus).toBe("approved");

    const published = await engine.publishState({
      tenantId,
      workspaceId,
      twinId: identity.twinId,
      stateId: state.stateId,
      instance: approved.instance,
      reviewerId: "reviewer-1",
    });
    expect(published.lifecycle).toBe("published");
  });

  it("rejects state without provenance", async () => {
    const repository = createDigitalTwinRepository({
      adapter: "memory",
      memoryStore: createDurableDigitalTwinMemoryStore(),
    });
    const stateEngine = createDigitalTwinStateEngine({ repository });
    const core = createDigitalTwinEngine({ repository });
    const identity = await core.createIdentity({
      tenantId,
      workspaceId,
      canonicalEntityType: "project",
      canonicalEntityId: "proj-state-1",
    });
    await expect(
      stateEngine.createState({
        tenantId,
        workspaceId,
        twinId: identity.twinId,
        category: "derived",
        externalRef: "ref://missing-prov",
        provenance: { sourceModule: "", sourceRef: "", capturedAt: "" },
      }),
    ).rejects.toThrow(/provenance_required/);
  });

  it("creates snapshot from published states and lists history", async () => {
    const repository = createDigitalTwinRepository({
      adapter: "memory",
      memoryStore: createDurableDigitalTwinMemoryStore(),
    });
    const engine = createDigitalTwinEngine({ repository });
    const identity = await engine.createIdentity({
      tenantId,
      workspaceId,
      canonicalEntityType: "facility",
      canonicalEntityId: "fac-1",
    });
    const state = await engine.createState({
      tenantId,
      workspaceId,
      twinId: identity.twinId,
      category: "operational",
      externalRef: "ref://ops/status",
      provenance: {
        sourceModule: "project_controls",
        sourceRef: "pc-status-1",
        capturedAt: new Date().toISOString(),
      },
    });
    const { instance } = await engine.submitStateReview({
      tenantId,
      workspaceId,
      twinId: identity.twinId,
      stateId: state.stateId,
    });
    const approved = await engine.transitionStateReview({
      tenantId,
      workspaceId,
      twinId: identity.twinId,
      stateId: state.stateId,
      instance,
      action: "approve",
      to: "approved",
      reviewerId: "rev-2",
    });
    await engine.publishState({
      tenantId,
      workspaceId,
      twinId: identity.twinId,
      stateId: state.stateId,
      instance: approved.instance,
      reviewerId: "rev-2",
    });

    const snapshot = await engine.createSnapshot({
      tenantId,
      workspaceId,
      twinId: identity.twinId,
      stateIds: [state.stateId],
      label: "baseline",
    });
    expect(snapshot.storesTelemetryPayload).toBe(false);
    expect(snapshot.stateVersionRefs).toHaveLength(1);

    const history = await engine.listStateHistory(tenantId, workspaceId, identity.twinId);
    expect(history.states.length).toBeGreaterThan(0);
    expect(history.snapshots).toHaveLength(1);
    expect(history.timeline.length).toBeGreaterThan(0);
  });

  it("forbids representation version overwrite", async () => {
    const repository = createDigitalTwinRepository({
      adapter: "memory",
      memoryStore: createDurableDigitalTwinMemoryStore(),
    });
    const engine = createDigitalTwinEngine({ repository });
    const identity = await engine.createIdentity({
      tenantId,
      workspaceId,
      canonicalEntityType: "asset",
      canonicalEntityId: "asset-rep-v",
    });
    const input = {
      tenantId,
      workspaceId,
      twinId: identity.twinId,
      representationType: "ifc" as const,
      sourceSystem: "bim_server",
      sourceRef: "s3://models/a.ifc",
      revision: "R1",
      effectiveDate: new Date().toISOString(),
      fidelityLevel: "L1" as const,
    };
    await engine.attachRepresentationVersion(input);
    await expect(engine.attachRepresentationVersion(input)).rejects.toThrow(/overwrite_forbidden/);
  });
});
