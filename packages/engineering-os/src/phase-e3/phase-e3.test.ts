import { describe, expect, it } from "vitest";
import {
  AssetIntelligenceV1Intact,
  DigitalTwinV1Intact,
  EngineeringModelInteroperabilityV1Intact,
  EngineeringOSProductBoundaryLocked,
  InspectionIntelligenceV1Intact,
  ProjectControlsV1Intact,
  ProjectIntelligenceV1Intact,
  duplicateAssetOwnershipDetected,
  privateCrossModuleCouplingDetected,
} from "../version";
import {
  assertPhaseE3Invariants,
  createSystemProvenance,
  getPhaseE3Declaration,
  PhaseE3CanonicalContextComplete,
  PhaseE3DoesNotOwnConnectors,
  PhaseE3DoesNotOwnKgInfrastructure,
  PhaseE3InferredDistinctFromConfirmed,
  PhaseE3NoSecondKnowledgeGraph,
} from "./contracts";
import {
  ambientRelationshipsFromCreate,
  deriveRecordRelationships,
  refuseKeywordFabrication,
} from "./canonical-context-assembler";
import { EngineeringContextResolver } from "./canonical-context-resolver";
import { EngineeringIdentityReconciliationService } from "./canonical-context-reconciliation";
import {
  allowAllAuth,
  denyObjectAuth,
  MemoryContextDomainProvider,
} from "./memory-context-provider";
import {
  enrichAskQueryWithContext,
  preferRelationshipEvidence,
} from "./ask-context-bridge";
import { createEmptyEngineeringContext } from "../phase-e1/contracts";
import { EngineeringRetrievalService } from "../services/engineering-retrieval-service";
import { runGroundedEngineeringAsk } from "../services/grounded-ask";

const tenantId = "t-e3";
const otherTenant = "t-other";

const project = {
  objectType: "PROJECT",
  objectId: "p1",
  tenantId,
  workspaceId: "ws1",
  displayName: "Bridge Rehab",
  status: "active",
};

const document = {
  objectType: "DOCUMENT",
  objectId: "d1",
  tenantId,
  workspaceId: "ws1",
  projectId: "p1",
  belongsToProjectId: "p1",
  displayName: "DOC-100 Procedure",
  status: "approved",
  predecessorDocumentId: "d0",
};

const documentPred = {
  objectType: "DOCUMENT",
  objectId: "d0",
  tenantId,
  workspaceId: "ws1",
  projectId: "p1",
  belongsToProjectId: "p1",
  displayName: "DOC-100 Rev A",
  status: "superseded",
};

const decision = {
  objectType: "DECISION",
  objectId: "dec100",
  tenantId,
  workspaceId: "ws1",
  projectId: "p1",
  belongsToProjectId: "p1",
  displayName: "DEC-100 Temporary repair",
  status: "approved",
};

const action = {
  objectType: "ACTION",
  objectId: "act1",
  tenantId,
  workspaceId: "ws1",
  projectId: "p1",
  belongsToProjectId: "p1",
  displayName: "ACT-1 Install splice",
  status: "open",
  linkedDecisionId: "dec100",
};

const asset = {
  objectType: "ASSET",
  objectId: "a1",
  tenantId,
  workspaceId: "ws1",
  projectId: "p1",
  belongsToProjectId: "p1",
  displayName: "Pier 3",
  status: "active",
};

const secretDoc = {
  objectType: "DOCUMENT",
  objectId: "secret-doc",
  tenantId,
  workspaceId: "ws1",
  projectId: "p1",
  belongsToProjectId: "p1",
  displayName: "Classified",
  status: "approved",
};

const crossTenantDoc = {
  objectType: "DOCUMENT",
  objectId: "x-doc",
  tenantId: otherTenant,
  workspaceId: "ws-x",
  projectId: "p-x",
  belongsToProjectId: "p-x",
  displayName: "Other tenant doc",
  status: "approved",
};

const fixtures = [
  project,
  document,
  documentPred,
  decision,
  action,
  asset,
  secretDoc,
  crossTenantDoc,
];

const links = [
  {
    fromType: "DECISION",
    fromId: "dec100",
    toType: "ACTION",
    toId: "act1",
    relationshipType: "HAS_ACTION" as const,
    status: "CONFIRMED" as const,
    projectId: "p1",
    sourceId: "link-1",
  },
  {
    fromType: "DECISION",
    fromId: "dec100",
    toType: "DOCUMENT",
    toId: "secret-doc",
    relationshipType: "REFERENCES" as const,
    status: "CONFIRMED" as const,
    projectId: "p1",
    sourceId: "link-secret",
  },
  {
    fromType: "ASSET",
    fromId: "a1",
    toType: "DOCUMENT",
    toId: "d1",
    relationshipType: "HAS_DOCUMENT" as const,
    status: "INFERRED" as const,
    projectId: "p1",
    sourceId: "link-inferred",
  },
  {
    fromType: "DOCUMENT",
    fromId: "d1",
    toType: "DOCUMENT",
    toId: "x-doc",
    relationshipType: "REFERENCES" as const,
    status: "CONFIRMED" as const,
    sourceId: "link-cross-tenant",
  },
  {
    fromType: "DECISION",
    fromId: "dec100",
    toType: "ACTION",
    toId: "act-revoked",
    relationshipType: "HAS_ACTION" as const,
    status: "CONFIRMED" as const,
    revoked: true,
    sourceId: "link-revoked",
  },
];

const mappings = [
  {
    mappingId: "map-unresolved",
    tenantId,
    workspaceId: "ws1",
    canonicalObjectType: "ASSET",
    canonicalObjectId: "a1",
    sourceSystem: "mock-cmms",
    externalId: "EQ-UNRESOLVED",
    mappingStatus: "UNRESOLVED" as const,
    confidence: null,
    provenance: createSystemProvenance("mock", "EQ-UNRESOLVED"),
  },
  {
    mappingId: "map-probable",
    tenantId,
    workspaceId: "ws1",
    canonicalObjectType: "ASSET",
    canonicalObjectId: "a1",
    sourceSystem: "mock-cmms",
    externalId: "EQ-PROB",
    mappingStatus: "PROBABLE_MATCH" as const,
    confidence: 0.62,
    provenance: createSystemProvenance("mock", "EQ-PROB"),
  },
  {
    mappingId: "map-matched",
    tenantId,
    workspaceId: "ws1",
    canonicalObjectType: "ASSET",
    canonicalObjectId: "a1",
    sourceSystem: "mock-cmms",
    externalId: "EQ-OK",
    mappingStatus: "MATCHED" as const,
    confidence: 1,
    provenance: createSystemProvenance("mock", "EQ-OK"),
    verifiedAt: "2026-08-01T00:00:00Z",
    verifiedBy: "steward-1",
  },
  {
    mappingId: "map-conflict-a",
    tenantId,
    workspaceId: "ws1",
    canonicalObjectType: "ASSET",
    canonicalObjectId: "a1",
    sourceSystem: "mock-erp",
    externalId: "ERP-1",
    mappingStatus: "MATCHED" as const,
    confidence: 0.9,
    provenance: createSystemProvenance("mock", "ERP-1"),
  },
];

describe("Phase E3 canonical context", () => {
  it("locks contracts and ownership invariants", () => {
    expect(PhaseE3CanonicalContextComplete).toBe(true);
    expect(PhaseE3NoSecondKnowledgeGraph).toBe(true);
    expect(PhaseE3DoesNotOwnKgInfrastructure).toBe(true);
    expect(PhaseE3DoesNotOwnConnectors).toBe(true);
    expect(PhaseE3InferredDistinctFromConfirmed).toBe(true);
    expect(getPhaseE3Declaration().implementedObjectTypes).toContain("DECISION");
    expect(getPhaseE3Declaration().futureObjectTypes).toContain("DRAWING");
    assertPhaseE3Invariants({
      ProjectIntelligenceV1Intact,
      InspectionIntelligenceV1Intact,
      AssetIntelligenceV1Intact,
      ProjectControlsV1Intact,
      DigitalTwinV1Intact,
      EngineeringModelInteroperabilityV1Intact,
      privateCrossModuleCouplingDetected,
      duplicateAssetOwnershipDetected,
      EngineeringOSProductBoundaryLocked,
    });
  });

  it("1. project → document relationship", async () => {
    const provider = new MemoryContextDomainProvider(fixtures, links, mappings);
    const resolver = new EngineeringContextResolver(provider, allowAllAuth(tenantId));
    const bundle = await resolver.resolve({
      experience: createEmptyEngineeringContext({
        tenantId,
        workspaceId: "ws1",
        userId: "u1",
        projectId: "p1",
      }),
      scope: { projectId: "p1" },
    });
    expect(
      bundle.relationships.some(
        (r) =>
          r.relationshipType === "BELONGS_TO_PROJECT" &&
          r.fromObject.objectId === "d1" &&
          r.toObject.objectId === "p1" &&
          r.status === "CONFIRMED",
      ),
    ).toBe(true);
  });

  it("2. project → decision/action relationship", async () => {
    const edges = [
      ...deriveRecordRelationships(decision),
      ...deriveRecordRelationships(action),
    ];
    expect(edges.some((e) => e.relationshipType === "BELONGS_TO_PROJECT")).toBe(true);
    expect(edges.some((e) => e.relationshipType === "HAS_ACTION")).toBe(true);
    expect(edges.some((e) => e.relationshipType === "RESULTED_IN")).toBe(true);
  });

  it("3. asset → project", () => {
    const edges = deriveRecordRelationships(asset);
    expect(
      edges.some(
        (e) =>
          e.relationshipType === "BELONGS_TO_PROJECT" &&
          e.fromObject.objectId === "a1",
      ),
    ).toBe(true);
  });

  it("4. explicit object relationship traversal", async () => {
    const provider = new MemoryContextDomainProvider(fixtures, links, mappings);
    const resolver = new EngineeringContextResolver(provider, allowAllAuth(tenantId));
    const bundle = await resolver.resolve({
      experience: createEmptyEngineeringContext({
        tenantId,
        workspaceId: "ws1",
        userId: "u1",
        objectType: "decision",
        objectId: "dec100",
        projectId: "p1",
      }),
    });
    expect(bundle.primaryObjects[0]?.objectId).toBe("dec100");
    expect(
      bundle.relationships.some(
        (r) =>
          r.relationshipType === "HAS_ACTION" && r.toObject.objectId === "act1",
      ),
    ).toBe(true);
    expect(bundle.relatedObjects.some((o) => o.objectId === "act1")).toBe(true);
  });

  it("5-8. external identity mapping statuses + reconciliation", () => {
    const svc = new EngineeringIdentityReconciliationService(mappings);
    expect(svc.listUnresolved({ tenantId })).toHaveLength(1);
    expect(svc.listProbable({ tenantId })).toHaveLength(1);
    expect(svc.list({ tenantId, statuses: ["MATCHED"] }).length).toBeGreaterThanOrEqual(1);

    const conflict = svc.upsert({
      mappingId: "map-conflict-b",
      tenantId,
      workspaceId: "ws1",
      canonicalObjectType: "ASSET",
      canonicalObjectId: "a2-different",
      sourceSystem: "mock-erp",
      externalId: "ERP-1",
      mappingStatus: "MATCHED",
      confidence: 0.8,
      provenance: createSystemProvenance("mock", "ERP-1-b"),
    });
    expect(conflict.mappingStatus).toBe("CONFLICTING");
    expect(svc.listConflicting({ tenantId }).length).toBeGreaterThanOrEqual(2);

    const confirmed = svc.applyAction({
      mappingId: "map-probable",
      action: "confirm",
      actorId: "steward-1",
      tenantId,
      permitted: true,
    });
    expect(confirmed.mappingStatus).toBe("MATCHED");
    expect(svc.getAuditTrail("map-probable")).toHaveLength(1);

    expect(() =>
      svc.applyAction({
        mappingId: "map-unresolved",
        action: "reject",
        actorId: "u1",
        tenantId,
        permitted: false,
      }),
    ).toThrow(/forbidden/);
  });

  it("9. inferred vs confirmed relationship", async () => {
    const provider = new MemoryContextDomainProvider(fixtures, links, mappings);
    const resolver = new EngineeringContextResolver(provider, allowAllAuth(tenantId));
    const bundle = await resolver.resolve({
      experience: createEmptyEngineeringContext({
        tenantId,
        userId: "u1",
        objectType: "asset",
        objectId: "a1",
        projectId: "p1",
      }),
    });
    const inferred = bundle.relationships.filter((r) => r.status === "INFERRED");
    const confirmed = bundle.relationships.filter((r) => r.status === "CONFIRMED");
    expect(inferred.length).toBeGreaterThan(0);
    expect(confirmed.length).toBeGreaterThan(0);
    expect(inferred.every((r) => r.status !== "CONFIRMED")).toBe(true);
  });

  it("10. unauthorized related object is omitted silently", async () => {
    const provider = new MemoryContextDomainProvider(fixtures, links, mappings);
    const resolver = new EngineeringContextResolver(
      provider,
      denyObjectAuth(tenantId, [{ objectType: "DOCUMENT", objectId: "secret-doc" }]),
    );
    const bundle = await resolver.resolve({
      experience: createEmptyEngineeringContext({
        tenantId,
        userId: "u1",
        objectType: "decision",
        objectId: "dec100",
        projectId: "p1",
      }),
    });
    expect(bundle.relatedObjects.some((o) => o.objectId === "secret-doc")).toBe(false);
    expect(
      bundle.relationships.some(
        (r) =>
          r.toObject.objectId === "secret-doc" || r.fromObject.objectId === "secret-doc",
      ),
    ).toBe(false);
    expect(JSON.stringify(bundle)).not.toMatch(/hidden related/i);
    expect(JSON.stringify(bundle)).not.toMatch(/3 hidden/i);
  });

  it("11. cross-tenant relationship attack blocked", async () => {
    const provider = new MemoryContextDomainProvider(fixtures, links, mappings);
    const resolver = new EngineeringContextResolver(provider, allowAllAuth(tenantId));
    const bundle = await resolver.resolve({
      experience: createEmptyEngineeringContext({
        tenantId,
        userId: "u1",
        objectType: "document",
        objectId: "d1",
        projectId: "p1",
      }),
    });
    expect(bundle.relatedObjects.some((o) => o.objectId === "x-doc")).toBe(false);
    expect(
      bundle.relationships.some(
        (r) => r.toObject.objectId === "x-doc" || r.fromObject.objectId === "x-doc",
      ),
    ).toBe(false);
  });

  it("12. ambiguous context", async () => {
    const provider = new MemoryContextDomainProvider(fixtures, links, mappings);
    const resolver = new EngineeringContextResolver(provider, allowAllAuth(tenantId));
    const bundle = await resolver.resolve({
      experience: createEmptyEngineeringContext({
        tenantId,
        userId: "u1",
        objectType: "decision",
        objectId: "missing-dec",
      }),
    });
    expect(["AMBIGUOUS", "INSUFFICIENT"]).toContain(bundle.contextState);
    expect(bundle.ambiguities.length).toBeGreaterThan(0);
  });

  it("13. context fallback to E2 search", async () => {
    const retrieval = new EngineeringRetrievalService({
      search: async () => ({
        projects: [],
        documents: [
          {
            id: "d1",
            tenant_id: tenantId,
            engineering_project_id: "p1",
            title: "Temporary repair procedure",
            status: "approved",
          },
        ],
        assets: [],
        decisions: [],
        actions: [],
        risks: [],
        issues: [],
        technical_queries: [],
        lessons: [],
      }),
    });
    const result = await runGroundedEngineeringAsk({
      commerce: {} as never,
      retrieval,
      query: {
        tenantId,
        userId: "u1",
        query: "temporary repair",
        projectId: "p1",
      },
      // no provider → degrade
    });
    expect(result.meta.contextDegradedToE2).toBe(true);
    expect(result.evidence.length).toBeGreaterThan(0);
    expect(["E2", "E5"]).toContain(result.meta.phase);
  });

  it("14. context-bounded retrieval expansion", async () => {
    const provider = new MemoryContextDomainProvider(fixtures, links, mappings);
    const enrichment = await enrichAskQueryWithContext({
      query: {
        tenantId,
        userId: "u1",
        query: "show related actions",
        objectType: "decision",
        objectId: "dec100",
        projectId: "p1",
      },
      provider,
      auth: allowAllAuth(tenantId),
    });
    expect(enrichment.contextApplied).toBe(true);
    expect(enrichment.query.relatedObjectIds).toContain("act1");
    expect(preferRelationshipEvidence(enrichment.bundle, "show related actions")).toContain(
      "act1",
    );
    expect(enrichment.bundle?.limits.maxDepth).toBeLessThanOrEqual(2);
  });

  it("15. revision/predecessor relation", () => {
    const edges = deriveRecordRelationships(document);
    expect(
      edges.some(
        (e) =>
          e.relationshipType === "DERIVED_FROM" &&
          e.toObject.objectId === "d0" &&
          e.status === "CONFIRMED",
      ),
    ).toBe(true);
  });

  it("16. delete/revoke relationship behavior", async () => {
    const provider = new MemoryContextDomainProvider(fixtures, links, mappings);
    const resolver = new EngineeringContextResolver(provider, allowAllAuth(tenantId));
    const bundle = await resolver.resolve({
      experience: createEmptyEngineeringContext({
        tenantId,
        userId: "u1",
        objectType: "decision",
        objectId: "dec100",
      }),
    });
    expect(bundle.relationships.some((r) => r.toObject.objectId === "act-revoked")).toBe(
      false,
    );
  });

  it("17. no fabricated relationship from keyword similarity", () => {
    expect(refuseKeywordFabrication()).toEqual([]);
    const ambient = ambientRelationshipsFromCreate({
      tenantId,
      created: decision,
    });
    expect(ambient.every((r) => r.provenance.mechanism === "SYSTEM")).toBe(true);
    expect(ambient.some((r) => r.relationshipType === "BELONGS_TO_PROJECT")).toBe(true);
  });

  it("never claims human authority for machine-created relationships", () => {
    const edges = deriveRecordRelationships(action);
    expect(edges.every((e) => e.provenance.mechanism !== "USER")).toBe(true);
    expect(edges.every((e) => e.provenance.actorId == null)).toBe(true);
  });
});
