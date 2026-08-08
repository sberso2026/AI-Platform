import { describe, expect, it } from "vitest";
import {
  assertDraftSpatialReferenceReadOnly,
  assertSharedSpatialDomainOwnershipLock,
  assertSharedSpatialDraftContractsOnly,
  CANONICAL_SPATIAL_REFERENCE_OWNERSHIP,
  COORDINATE_TRANSFORMATION_IMPLEMENTED,
  createDraftCrsReference,
  createDraftLocationReference,
  createDraftSpatialReference,
  DIGITAL_TWIN_12K_CERTIFIED_COMMIT,
  DIGITAL_TWIN_12K_HOSTED_RUN,
  DIGITAL_TWIN_12K_VERSION,
  DIGITAL_TWIN_MAY_OWN_CANONICAL_SPATIAL,
  DUPLICATE_GEOMETRY_OWNERSHIP_DETECTED,
  DUPLICATE_SPATIAL_OWNERSHIP_DETECTED,
  ENGINEERING_LOCATIONS_TABLE_EXISTS,
  ENGINEERING_SHARED_SPATIAL_DOMAIN_PHASE,
  ENGINEERING_SHARED_SPATIAL_DOMAIN_VERSION,
  getSharedSpatialDomainDiscoveryDeclaration,
  GIS_RUNTIME_IMPLEMENTED,
  PHASE_12M_READY,
  SHARED_SPATIAL_DOMAIN_DISCOVERY_READY,
  SHARED_SPATIAL_DOMAIN_OWNERSHIP_LOCKED,
  SHARED_SPATIAL_DOMAIN_OWNERSHIP_MATRIX,
  SHARED_SPATIAL_DOMAIN_RUNTIME_IMPLEMENTED,
  SHARED_SPATIAL_PUBLIC_CONTRACT_FAMILIES,
  SPATIAL_ANALYTICS_IMPLEMENTED,
  SPATIAL_OWNERSHIP_FULLY_RESOLVED,
  TWIN_SPATIAL_REFERENCE_OWNERSHIP,
} from "../src/index";

describe("Phase 12L Shared Spatial Domain discovery lock", () => {
  it("declares discovery version and readiness flags", () => {
    expect(ENGINEERING_SHARED_SPATIAL_DOMAIN_VERSION).toBe("0.1.0-spatial-discovery");
    expect(ENGINEERING_SHARED_SPATIAL_DOMAIN_PHASE).toBe("12L");
    expect(SHARED_SPATIAL_DOMAIN_DISCOVERY_READY).toBe(true);
    expect(SHARED_SPATIAL_DOMAIN_OWNERSHIP_LOCKED).toBe(true);
    expect(SHARED_SPATIAL_DOMAIN_RUNTIME_IMPLEMENTED).toBe(false);
    expect(SPATIAL_OWNERSHIP_FULLY_RESOLVED).toBe(false);
    expect(COORDINATE_TRANSFORMATION_IMPLEMENTED).toBe(false);
    expect(GIS_RUNTIME_IMPLEMENTED).toBe(false);
    expect(SPATIAL_ANALYTICS_IMPLEMENTED).toBe(false);
    expect(DUPLICATE_SPATIAL_OWNERSHIP_DETECTED).toBe(false);
    expect(DUPLICATE_GEOMETRY_OWNERSHIP_DETECTED).toBe(false);
    expect(ENGINEERING_LOCATIONS_TABLE_EXISTS).toBe(false);
    expect(PHASE_12M_READY).toBe(true);
  });

  it("locks ownership without claiming Digital Twin as spatial owner", () => {
    const lock = assertSharedSpatialDomainOwnershipLock();
    expect(lock.ok).toBe(true);
    expect(lock.SharedSpatialDomainOwnershipLocked).toBe(true);
    expect(lock.spatialOwnershipFullyResolved).toBe(false);
    expect(lock.SharedSpatialDomainRuntimeImplemented).toBe(false);
    expect(lock.digitalTwinMayOwnCanonicalSpatial).toBe(false);
    expect(lock.canonicalSpatialReferenceOwnership).toBe(
      "engineering_os_shared_spatial_domain",
    );
    expect(CANONICAL_SPATIAL_REFERENCE_OWNERSHIP).toBe(
      "engineering_os_shared_spatial_domain",
    );
    expect(TWIN_SPATIAL_REFERENCE_OWNERSHIP).toBe("digital_twin");
    expect(DIGITAL_TWIN_MAY_OWN_CANONICAL_SPATIAL).toBe(false);

    const twinCanonical = SHARED_SPATIAL_DOMAIN_OWNERSHIP_MATRIX.find(
      (row) => row.concern === "canonical_spatial_location",
    );
    expect(twinCanonical?.owner).toBe("engineering_os_shared_spatial_domain");
    expect(twinCanonical?.owner).not.toBe("digital_twin");
  });

  it("keeps Digital Twin on 12K certified identity", () => {
    expect(DIGITAL_TWIN_12K_VERSION).toBe("0.11.0-digital-thread");
    expect(DIGITAL_TWIN_12K_CERTIFIED_COMMIT).toBe(
      "dc5d1d6775b172634cd50038d34f35c13c34c339",
    );
    expect(DIGITAL_TWIN_12K_HOSTED_RUN).toBe("31269156189");
  });

  it("publishes draft-only contracts and draft reference factories", () => {
    const contracts = assertSharedSpatialDraftContractsOnly();
    expect(contracts.contractVersion).toBe("0.1.0-draft");
    expect(contracts.runtimeBacked).toBe(false);
    expect(SHARED_SPATIAL_PUBLIC_CONTRACT_FAMILIES).toContain("SpatialReferenceCore");

    const location = createDraftLocationReference({
      tenantId: "t1",
      locationId: "loc-draft-1",
      legacyTextLocation: "Berth 7",
    });
    assertDraftSpatialReferenceReadOnly(location);
    expect(location.owner).toBe("engineering_os_shared_spatial_domain");

    const spatial = createDraftSpatialReference({
      tenantId: "t1",
      spatialRefId: "sp-1",
      coordinateReferenceSystem: "EPSG:4326",
      locationId: location.locationId,
    });
    expect(spatial.kind).toBe("spatial_reference");

    const crs = createDraftCrsReference({
      tenantId: "t1",
      crsRefId: "crs-1",
      coordinateReferenceSystem: "EPSG:4326",
      authority: "EPSG",
      epsgCode: 4326,
    });
    expect(crs.kind).toBe("crs_reference");

    expect(() =>
      createDraftSpatialReference({
        tenantId: "t1",
        spatialRefId: "sp-bad",
        coordinateReferenceSystem: "",
      }),
    ).toThrow(/coordinate_reference_system_required/);
  });

  it("exposes a coherent discovery declaration", () => {
    const d = getSharedSpatialDomainDiscoveryDeclaration();
    expect(d.version).toBe("0.1.0-spatial-discovery");
    expect(d.status).toBe("discovery");
    expect(d.SharedSpatialDomainDiscoveryReady).toBe(true);
    expect(d.SharedSpatialDomainOwnershipLocked).toBe(true);
    expect(d.SharedSpatialDomainRuntimeImplemented).toBe(false);
    expect(d.spatialOwnershipFullyResolved).toBe(false);
    expect(d.phase12MReady).toBe(true);
    expect(d.digitalTwin12KVersion).toBe("0.11.0-digital-thread");
  });
});
