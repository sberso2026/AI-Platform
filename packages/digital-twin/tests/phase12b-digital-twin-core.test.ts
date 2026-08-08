import { describe, expect, it } from "vitest";
import {
  assertCoreContracts,
  assertCoreForbiddenCapabilities,
  assertOwnershipLock,
  createDigitalTwinCoreEngine,
  createDigitalTwinEngine,
  createDigitalTwinRepository,
  createDurableDigitalTwinMemoryStore,
  DIGITAL_TWIN_EVENTS,
  DIGITAL_TWIN_IDENTITY_REVIEW_SLUG,
  DIGITAL_TWIN_IMPLEMENTED,
  DIGITAL_TWIN_PHASE,
  DIGITAL_TWIN_STATUS,
  DIGITAL_TWIN_VERSION,
  HOSTED_PERSISTENCE_READY,
  IDENTITY_REVIEW_WORKFLOW_SLUG,
  KNOWLEDGE_GRAPH_REUSE,
  LIVE_TELEMETRY_IMPLEMENTED,
  PRODUCTION_DIGITAL_TWIN_READY,
  PRODUCTION_MEMORY_REPOSITORY_ALLOWED,
  PUBLIC_CONTRACT_VERSION,
  SIMULATION_EXECUTION_IMPLEMENTED,
  THREE_D_VIEWER_IMPLEMENTED,
  TWIN_IDENTITY_READY,
  TWIN_REPRESENTATION_READY,
  TWIN_THREAD_READY,
} from "../src/index";

describe("Phase 12B Digital Twin core domain", () => {
  const tenantId = "tenant-1";
  const workspaceId = "workspace-1";

  it("retains core identity with 12E module version", () => {
    expect(DIGITAL_TWIN_VERSION).toBe("0.5.0-telemetry-binding");
    expect(DIGITAL_TWIN_STATUS).toBe("telemetry_binding");
    expect(DIGITAL_TWIN_PHASE).toBe("12E");
    expect(DIGITAL_TWIN_IMPLEMENTED).toBe(true);
    expect(TWIN_IDENTITY_READY).toBe(true);
    expect(TWIN_REPRESENTATION_READY).toBe(true);
    expect(TWIN_THREAD_READY).toBe(true);
    expect(KNOWLEDGE_GRAPH_REUSE).toBe(true);
    expect(HOSTED_PERSISTENCE_READY).toBe(true);
    expect(PUBLIC_CONTRACT_VERSION).toBe("0.5.0-telemetry-binding-draft");
    expect(IDENTITY_REVIEW_WORKFLOW_SLUG).toBe("digital_twin.identity_review");
    expect(DIGITAL_TWIN_IDENTITY_REVIEW_SLUG).toBe("digital_twin.identity_review");
  });

  it("keeps forbidden runtime locks closed with bounded live telemetry", () => {
    expect(PRODUCTION_DIGITAL_TWIN_READY).toBe(false);
    expect(LIVE_TELEMETRY_IMPLEMENTED).toBe(true);
    expect(SIMULATION_EXECUTION_IMPLEMENTED).toBe(false);
    expect(THREE_D_VIEWER_IMPLEMENTED).toBe(false);
    expect(PRODUCTION_MEMORY_REPOSITORY_ALLOWED).toBe(false);
    assertCoreForbiddenCapabilities();
  });

  it("asserts ownership lock for core slice", () => {
    const lock = assertOwnershipLock();
    expect(lock.ok).toBe(true);
    expect(lock.digitalTwinImplemented).toBe(true);
    expect(lock.productionDigitalTwinReady).toBe(false);
    expect(lock.twinIdentityReady).toBe(true);
    expect(lock.knowledgeGraphReuse).toBe(true);
    expect(lock.publicContractVersion).toBe("0.5.0-telemetry-binding-draft");
  });

  it("declares core contract families", () => {
    expect(assertCoreContracts().contractVersion).toBe("0.5.0-telemetry-binding-draft");
  });

  it("declares domain events including state events", () => {
    expect(DIGITAL_TWIN_EVENTS).toEqual(
      expect.arrayContaining([
        "engineering.digital_twin.created",
        "engineering.digital_twin.updated",
        "engineering.digital_twin.relationship.updated",
        "engineering.digital_twin.representation.updated",
        "engineering.digital_twin.state.created",
        "engineering.digital_twin.snapshot.updated",
      ]),
    );
  });

  it("creates identity and lookup via memory repository", async () => {
    const repository = createDigitalTwinRepository({
      adapter: "memory",
      memoryStore: createDurableDigitalTwinMemoryStore(),
    });
    const engine = createDigitalTwinCoreEngine({ repository });

    const identity = await engine.createIdentity({
      tenantId,
      workspaceId,
      canonicalEntityType: "asset",
      canonicalEntityId: "asset-123",
    });
    expect(identity.twinId).toBeTruthy();
    expect(identity.target.canonicalEntityType).toBe("asset");
    expect(identity.duplicatesAssetFields).toBe(false);
    expect(identity.liveTelemetryBound).toBe(false);

    const rep = await engine.attachRepresentation({
      tenantId,
      workspaceId,
      twinId: identity.twinId,
      representationType: "ifc",
      sourceRef: "s3://models/asset-123.ifc",
      version: "1",
      fidelityLevel: "L0",
    });
    expect(rep.storesGeometryPayload).toBe(false);
    expect(rep.viewerEnabled).toBe(false);

    const rel = await engine.addRelationship({
      tenantId,
      workspaceId,
      twinId: identity.twinId,
      relationshipType: "represents",
      targetRef: "asset-123",
      targetKind: "canonical_entity",
    });
    expect(rel.knowledgeGraphReuse).toBe(true);
    expect(rel.newGraphEngineIntroduced).toBe(false);

    const link = await engine.addThreadLink({
      tenantId,
      workspaceId,
      twinId: identity.twinId,
      targetType: "platform_timeline",
      targetRef: "timeline-entry-1",
      platformTimelineRef: "project_controls_project_timeline",
    });
    expect(link.duplicatesTimelineStorage).toBe(false);

    const lookup = await engine.getLookup(tenantId, workspaceId, identity.twinId);
    expect(lookup.identity.twinId).toBe(identity.twinId);
    expect(lookup.representations).toHaveLength(1);
    expect(lookup.relationships).toHaveLength(1);
    expect(lookup.threadLinks).toHaveLength(1);
  });

  it("rejects duplicate identity for same target", async () => {
    const repository = createDigitalTwinRepository({
      adapter: "memory",
      memoryStore: createDurableDigitalTwinMemoryStore(),
    });
    const engine = createDigitalTwinCoreEngine({ repository });
    await engine.createIdentity({
      tenantId,
      workspaceId,
      canonicalEntityType: "project",
      canonicalEntityId: "proj-1",
    });
    await expect(
      engine.createIdentity({
        tenantId,
        workspaceId,
        canonicalEntityType: "project",
        canonicalEntityId: "proj-1",
      }),
    ).rejects.toThrow("twin_identity_already_exists_for_target");
  });

  it("fails closed without tenant/workspace scope", async () => {
    const repository = createDigitalTwinRepository({
      adapter: "memory",
      memoryStore: createDurableDigitalTwinMemoryStore(),
    });
    const engine = createDigitalTwinCoreEngine({ repository });
    await expect(
      engine.createIdentity({
        tenantId: "",
        workspaceId: "",
        canonicalEntityType: "asset",
        canonicalEntityId: "a1",
      }),
    ).rejects.toThrow("tenant_and_workspace_required");
  });

  it("starts identity review via engine facade", async () => {
    const repository = createDigitalTwinRepository({
      adapter: "memory",
      memoryStore: createDurableDigitalTwinMemoryStore(),
    });
    const engine = createDigitalTwinEngine({ repository });
    const identity = await engine.createIdentity({
      tenantId,
      workspaceId,
      canonicalEntityType: "system",
      canonicalEntityId: "sys-1",
    });
    const { instance, review } = await engine.startReview({
      tenantId,
      workspaceId,
      twinId: identity.twinId,
      startedBy: "user-a",
    });
    expect(instance.state).toBe("pending_review");
    expect(review.selfApproved).toBe(false);
  });

  it("forbids production memory repository", () => {
    expect(() =>
      createDigitalTwinRepository({ adapter: "memory", nodeEnv: "production" }),
    ).toThrow("production_memory_repository_forbidden");
  });
});
