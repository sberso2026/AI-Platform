import { describe, expect, it } from "vitest";
import {
  assertCoordinateCrsCompatible,
  assertHierarchyDoesNotImplyGeometry,
  assertLegacyNotAutoCanonical,
  assertSharedSpatialCoreContracts,
  assertSharedSpatialDomainOwnershipLock,
  CANONICAL_SPATIAL_REFERENCE_OWNERSHIP,
  confirmLegacyMapping,
  COORDINATE_TRANSFORMATION_IMPLEMENTED,
  createCoordinateReference,
  createCrsReference,
  createDurableSharedSpatialMemoryStore,
  createLegacySpatialReconciliation,
  createSharedSpatialRepository,
  createSpatialReference,
  createSpatialRelationship,
  DIGITAL_TWIN_MAY_OWN_CANONICAL_SPATIAL,
  DIGITAL_TWIN_SPATIAL_BINDING_READY,
  ENGINEERING_SHARED_SPATIAL_DOMAIN_PHASE,
  ENGINEERING_SHARED_SPATIAL_DOMAIN_VERSION,
  GEOMETRY_REPOSITORY_IMPLEMENTED,
  getSharedSpatialDomainCoreDeclaration,
  GIS_RUNTIME_IMPLEMENTED,
  LEGACY_SPATIAL_RECONCILIATION_READY,
  PHASE_12L_CERTIFIED_COMMIT,
  PHASE_12L_HOSTED_RUN,
  PHASE_12N_READY,
  recordSpatialReferenceReview,
  SHARED_SPATIAL_DOMAIN_RUNTIME_IMPLEMENTED,
  SHARED_SPATIAL_REFERENCE_REGISTRY_READY,
  SPATIAL_OWNERSHIP_FULLY_RESOLVED,
  SPATIAL_REFERENCE_REVIEW_SLUG,
} from "../src/index";

describe("Phase 12M Shared Spatial Domain core", () => {
  it("declares spatial-core version and readiness flags", () => {
    expect(ENGINEERING_SHARED_SPATIAL_DOMAIN_VERSION).toBe("0.2.0-spatial-core");
    expect(ENGINEERING_SHARED_SPATIAL_DOMAIN_PHASE).toBe("12M");
    expect(SHARED_SPATIAL_DOMAIN_RUNTIME_IMPLEMENTED).toBe(true);
    expect(SHARED_SPATIAL_REFERENCE_REGISTRY_READY).toBe(true);
    expect(SPATIAL_OWNERSHIP_FULLY_RESOLVED).toBe(true);
    expect(LEGACY_SPATIAL_RECONCILIATION_READY).toBe(true);
    expect(DIGITAL_TWIN_SPATIAL_BINDING_READY).toBe(true);
    expect(COORDINATE_TRANSFORMATION_IMPLEMENTED).toBe(false);
    expect(GIS_RUNTIME_IMPLEMENTED).toBe(false);
    expect(GEOMETRY_REPOSITORY_IMPLEMENTED).toBe(false);
    expect(DIGITAL_TWIN_MAY_OWN_CANONICAL_SPATIAL).toBe(false);
    expect(PHASE_12N_READY).toBe(true);
    expect(PHASE_12L_CERTIFIED_COMMIT).toBe(
      "7d9bfbd792a034bae088dbb1db02876ca400929d",
    );
    expect(PHASE_12L_HOSTED_RUN).toBe("31269729941");
  });

  it("locks ownership with FullyResolved proven", () => {
    const lock = assertSharedSpatialDomainOwnershipLock();
    expect(lock.ok).toBe(true);
    expect(lock.spatialOwnershipFullyResolved).toBe(true);
    expect(lock.SharedSpatialDomainRuntimeImplemented).toBe(true);
    expect(lock.DigitalTwinSpatialBindingReady).toBe(true);
    expect(lock.digitalTwinMayOwnCanonicalSpatial).toBe(false);
    expect(lock.coordinateTransformationImplemented).toBe(false);
    expect(lock.canonicalSpatialReferenceOwnership).toBe(
      CANONICAL_SPATIAL_REFERENCE_OWNERSHIP,
    );
  });

  it("fail-closes incompatible CRS", () => {
    const bad = assertCoordinateCrsCompatible({
      leftCrsId: "crs_epsg_4326",
      rightCrsId: "crs_epsg_3857",
    });
    expect(bad.ok).toBe(false);
    expect(bad.compatible).toBe(false);
    if (!bad.ok) expect(bad.code).toBe("incompatible_crs");

    const good = assertCoordinateCrsCompatible({
      leftCrsId: "crs_epsg_4326",
      rightCrsId: "crs_epsg_4326",
    });
    expect(good.ok).toBe(true);
  });

  it("hierarchy does not imply geometry", () => {
    const parent = createSpatialReference({
      id: "sr_site",
      tenantId: "t1",
      workspaceId: "w1",
      referenceType: "site",
    });
    const child = createSpatialReference({
      id: "sr_zone",
      tenantId: "t1",
      workspaceId: "w1",
      referenceType: "zone",
      parentSpatialReferenceId: parent.id,
    });
    assertHierarchyDoesNotImplyGeometry(child);
    expect(child.hierarchyImpliesGeometry).toBe(false);
    expect(child.parentSpatialReferenceId).toBe(parent.id);
  });

  it("legacy TEXT is never auto-canonical", () => {
    const legacy = createLegacySpatialReconciliation({
      reconciliationId: "leg_1",
      tenantId: "t1",
      workspaceId: "w1",
      sourceTable: "engineering_assets",
      sourceColumn: "location",
      sourceRecordId: "asset_1",
      legacyText: "Berth 7",
      state: "candidate_match",
      candidateSpatialReferenceId: "sr_site",
    });
    assertLegacyNotAutoCanonical(legacy);
    expect(legacy.isCanonical).toBe(false);
    expect(legacy.state).toBe("candidate_match");
    expect(legacy.confirmedSpatialReferenceId).toBeUndefined();

    const confirmed = confirmLegacyMapping(legacy, "sr_site");
    expect(confirmed.state).toBe("confirmed");
    expect(confirmed.isCanonical).toBe(false);
  });

  it("rejects AI self-approval on reviews", () => {
    const spatial = createSpatialReference({
      id: "sr_1",
      tenantId: "t1",
      workspaceId: "w1",
      referenceType: "facility",
      status: "in_review",
    });
    expect(() =>
      recordSpatialReferenceReview({
        reviewId: "rev_1",
        tenantId: "t1",
        workspaceId: "w1",
        spatialReference: spatial,
        decision: "approve",
        aiSelfApproval: true,
      }),
    ).toThrow(/ai_self_approval_forbidden/);
    expect(SPATIAL_REFERENCE_REVIEW_SLUG).toBe(
      "engineering_shared_spatial_domain.spatial_reference_review",
    );
  });

  it("memory repository persists references and forbids production memory", () => {
    const repo = createSharedSpatialRepository({
      adapter: "memory",
      nodeEnv: "test",
      memoryStore: createDurableSharedSpatialMemoryStore(),
    });
    expect(repo.adapterKind).toBe("memory");

    const crs = createCrsReference({
      crsId: "crs_1",
      tenantId: "t1",
      workspaceId: "w1",
      crsKind: "epsg",
      coordinateReferenceSystem: "EPSG:4326",
      epsgCode: 4326,
    });
    // async exercised via thenables in sync test style
    return (async () => {
      await repo.saveCrs(crs);
      const spatial = createSpatialReference({
        id: "sr_1",
        tenantId: "t1",
        workspaceId: "w1",
        referenceType: "site",
        crsId: crs.crsId,
      });
      await repo.saveSpatialReference(spatial);
      const rel = createSpatialRelationship({
        relationshipId: "rel_1",
        tenantId: "t1",
        workspaceId: "w1",
        fromSpatialReferenceId: spatial.id,
        toSpatialReferenceId: spatial.id,
        relationshipKind: "references",
      });
      expect(rel.geometricProof).toBe(false);
      await repo.saveRelationship(rel);
      const coord = createCoordinateReference({
        coordinateReferenceId: "coord_1",
        tenantId: "t1",
        workspaceId: "w1",
        crsId: crs.crsId,
        latitude: -33.8,
        longitude: 151.2,
      });
      expect(coord.storesGeometryBlob).toBe(false);
      await repo.saveCoordinate(coord);

      expect(await repo.getSpatialReference("t1", "w1", "sr_1")).toMatchObject({
        id: "sr_1",
      });

      expect(() =>
        createSharedSpatialRepository({ adapter: "memory", nodeEnv: "production" }),
      ).toThrow(/production_memory_repository_forbidden/);
    })();
  });

  it("publishes 0.2.0-spatial-core contracts (not GA)", () => {
    const contracts = assertSharedSpatialCoreContracts();
    expect(contracts.contractVersion).toBe("0.2.0-spatial-core");
    expect(contracts.runtimeBacked).toBe(true);
    expect(contracts.ga).toBe(false);
  });

  it("exposes coherent core declaration", () => {
    const d = getSharedSpatialDomainCoreDeclaration();
    expect(d.version).toBe("0.2.0-spatial-core");
    expect(d.status).toBe("spatial_core");
    expect(d.spatialOwnershipFullyResolved).toBe(true);
    expect(d.DigitalTwinSpatialBindingReady).toBe(true);
    expect(d.phase12NReady).toBe(true);
    expect(d.phase12LCertifiedCommit).toBe(PHASE_12L_CERTIFIED_COMMIT);
    expect(d.digitalTwin12KVersion).toBe("0.11.0-digital-thread");
  });
});
