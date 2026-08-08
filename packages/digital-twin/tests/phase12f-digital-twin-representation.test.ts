import { describe, expect, it } from "vitest";
import {
  AUTOMATIC_REPRESENTATION_MAPPING_APPROVAL_ENABLED,
  DIGITAL_TWIN_EVENTS,
  DIGITAL_TWIN_PHASE,
  DIGITAL_TWIN_STATUS,
  DIGITAL_TWIN_VERSION,
  DUPLICATE_MODEL_OWNERSHIP_DETECTED,
  PHASE_12E_CERTIFIED_COMMIT,
  PHASE_12E_VERSION,
  PHASE_12G_READY,
  PUBLIC_CONTRACT_VERSION,
  REPRESENTATION_DOMAIN_EVENTS,
  REPRESENTATION_NAVIGATION_IMPLEMENTED,
  THREE_D_VIEWER_IMPLEMENTED,
  TWIN_REPRESENTATION_MAPPING_READY,
  TWIN_REPRESENTATION_NAVIGATION_READY,
  TwinRepresentationMappingReady,
  assertAiCannotSelfApprove,
  assertOwnershipLock,
  assertPublishedMappingImmutable,
  assertRepresentationContracts,
  assertRepresentationForbiddenCapabilities,
  assertRepresentationFidelityDeclared,
  canTransitionMappingLifecycle,
  classifyRepresentationChangeImpact,
  createTwinRepresentationElementReference,
  createTwinRepresentationMapping,
  createTwinRepresentationNavigationService,
  createTwinRepresentationSourceReference,
  createTwinSpatialReference,
  startRepresentationMappingReview,
  supersedeMapping,
} from "../src/index";

describe("Phase 12F Digital Twin representation", () => {
  const tenantId = "tenant-1";
  const workspaceId = "workspace-1";
  const twinId = "twin-1";

  it("declares representation version and pinned 12E baseline", () => {
    expect(DIGITAL_TWIN_VERSION).toBe("0.7.0-simulation");
    expect(DIGITAL_TWIN_STATUS).toBe("simulation");
    expect(DIGITAL_TWIN_PHASE).toBe("12G");
    expect(PUBLIC_CONTRACT_VERSION).toBe("0.7.0-simulation-draft");
    expect(PHASE_12E_VERSION).toBe("0.5.0-telemetry-binding");
    expect(PHASE_12E_CERTIFIED_COMMIT).toBe("b871e8c3eb9e1293604610bacdd410ecb4da5684");
    expect(PHASE_12G_READY).toBe(true);
    expect(TWIN_REPRESENTATION_MAPPING_READY).toBe(true);
    expect(TwinRepresentationMappingReady).toBe(true);
    expect(TWIN_REPRESENTATION_NAVIGATION_READY).toBe(true);
    expect(REPRESENTATION_NAVIGATION_IMPLEMENTED).toBe(true);
  });

  it("keeps viewer and auto-approve false with no duplicate model ownership", () => {
    expect(THREE_D_VIEWER_IMPLEMENTED).toBe(false);
    expect(AUTOMATIC_REPRESENTATION_MAPPING_APPROVAL_ENABLED).toBe(false);
    expect(DUPLICATE_MODEL_OWNERSHIP_DETECTED).toBe(false);
    assertRepresentationForbiddenCapabilities();
    assertRepresentationContracts();
  });

  it("declares representation events in catalog", () => {
    for (const evt of REPRESENTATION_DOMAIN_EVENTS) {
      expect(DIGITAL_TWIN_EVENTS).toContain(evt);
    }
  });

  it("asserts ownership lock with representation flags", () => {
    const lock = assertOwnershipLock();
    expect(lock.twinRepresentationMappingReady).toBe(true);
    expect(lock.twinRepresentationNavigationReady).toBe(true);
    expect(lock.threeDViewerImplemented).toBe(false);
    expect(lock.duplicateModelOwnershipDetected).toBe(false);
    expect(lock.automaticRepresentationMappingApprovalEnabled).toBe(false);
  });

  it("runs mapping lifecycle and forbids AI self-approval", () => {
    const mapping = createTwinRepresentationMapping({
      mappingId: "map-1",
      tenantId,
      workspaceId,
      twinId,
      representationSourceId: "src-1",
      elementRefId: "el-1",
      mappingType: "asset",
      mappingMethod: "ai_assisted_match",
      createdBy: "user-a",
    });
    expect(mapping.lifecycle).toBe("draft");
    expect(mapping.aiSuggested).toBe(true);
    expect(mapping.autoApproved).toBe(false);
    expect(canTransitionMappingLifecycle("draft", "pending_review")).toBe(true);
    expect(canTransitionMappingLifecycle("published", "draft")).toBe(false);

    expect(() =>
      assertAiCannotSelfApprove({
        mappingMethod: "ai_assisted_match",
        createdBy: "user-a",
        reviewerId: "user-a",
      }),
    ).toThrow(/ai_mapping_self_approval_forbidden/);

    const review = startRepresentationMappingReview({
      tenantId,
      workspaceId,
      twinId,
      mappingId: mapping.mappingId,
      startedBy: "user-a",
    });
    expect(review.instance.state).toBe("pending_review");
  });

  it("enforces published mapping immutability and change impact", () => {
    const published = {
      ...createTwinRepresentationMapping({
        mappingId: "map-2",
        tenantId,
        workspaceId,
        twinId,
        representationSourceId: "src-1",
        elementRefId: "el-1",
        mappingType: "component",
        mappingMethod: "manual_confirmed",
      }),
      lifecycle: "published" as const,
    };
    expect(() => assertPublishedMappingImmutable(published, true)).toThrow(
      /published_representation_mapping_overwrite_forbidden/,
    );
    const superseded = supersedeMapping(published, "map-3");
    expect(superseded.lifecycle).toBe("superseded");
    expect(classifyRepresentationChangeImpact({
      mappingExists: true,
      externalElementStillPresent: false,
      metadataCompatible: true,
    })).toBe("mapping_invalid");
  });

  it("navigates twin representations without a 3D viewer", () => {
    const source = createTwinRepresentationSourceReference({
      representationSourceId: "src-1",
      twinId,
      tenantId,
      workspaceId,
      format: "ifc",
      sourceRef: "file://models/bridge.ifc",
      displayName: "Bridge IFC",
      version: "1",
      fidelityLevel: "L1",
    });
    const element = createTwinRepresentationElementReference({
      elementRefId: "el-1",
      representationSourceId: source.representationSourceId,
      twinId,
      tenantId,
      workspaceId,
      externalElementId: "IfcBeam-001",
    });
    const mapping = {
      ...createTwinRepresentationMapping({
        mappingId: "map-nav",
        tenantId,
        workspaceId,
        twinId,
        representationSourceId: source.representationSourceId,
        elementRefId: element.elementRefId,
        mappingType: "telemetry",
        mappingMethod: "external_id_match",
        targetEntityRef: "binding-1",
      }),
      lifecycle: "published" as const,
    };
    const nav = createTwinRepresentationNavigationService({
      listSources: () => [source],
      listElements: () => [element],
      listMappings: () => [mapping],
    });
    const result = nav.resolveTwinRepresentations(twinId);
    expect(result.threeDViewerImplemented).toBe(false);
    expect(result.representationNavigationImplemented).toBe(true);
    expect(result.sources).toHaveLength(1);
    expect(nav.resolveTelemetryBindingElement(twinId, "binding-1")?.elementRefId).toBe("el-1");
    expect(nav.resolveInspectionElement(twinId, "insp-1", { inspectionContractsAvailable: false }).reserved).toBe(
      true,
    );
  });

  it("requires CRS on spatial refs and forbids L4 fidelity claims", () => {
    const spatial = createTwinSpatialReference({
      spatialRefId: "sp-1",
      twinId,
      tenantId,
      workspaceId,
      canonicalLocationId: "loc-1",
      coordinateReferenceSystem: "EPSG:4326",
    });
    expect(spatial.ownsCanonicalLocation).toBe(false);
    expect(() =>
      createTwinSpatialReference({
        spatialRefId: "sp-2",
        twinId,
        tenantId,
        workspaceId,
        canonicalLocationId: "loc-1",
        coordinateReferenceSystem: "",
      }),
    ).toThrow(/coordinate_reference_system_required/);
    expect(() => assertRepresentationFidelityDeclared("L4")).toThrow();
    assertRepresentationFidelityDeclared("L1");
  });
});
