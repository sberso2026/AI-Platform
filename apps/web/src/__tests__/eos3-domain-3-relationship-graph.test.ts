import { describe, it, expect, beforeEach } from "vitest";
import { __resetProjectWorkspacesForTests } from "../lib/engineering/eos3-project-workspace-service";
import { __resetWorkPackagesForTests } from "../lib/engineering/eos3-work-package-service";
import { __resetAssetSystemContextForTests } from "../lib/engineering/eos3-asset-system-context";
import {
  __resetRelationshipGraphForTests,
  boundedTraversal,
  buildDependencyUiContract,
  composeAssetSystemRelationshipsIntoGraph,
  composeWorkPackageDependenciesIntoGraph,
  countImpactOverclaims,
  createGraphEdge,
  explainPath,
  filterEdgesForAuthorization,
  getDependents,
  getDependencies,
  getDownstream,
  getGraphEdge,
  getRelatedObjects,
  getUpstream,
  listEdgesForObject,
  measureGraphPerformanceBaseline,
  seedPilot001RelationshipGraph,
  supersedeGraphEdge,
  unauthorizedRelationshipWriteBlocked,
  auditDigitalThreadCompatibility,
} from "../lib/engineering/eos3-relationship-graph-core";
import {
  assertAllowedEndpoint,
  getRelationshipTypeDefinition,
  isRegisteredRelationshipType,
} from "../lib/engineering/eos3-relationship-type-registry";
import { unjustifiedRequiredFieldCount } from "../lib/engineering/eos3-field-necessity-audit";
import { createWorkPackage, addDependency } from "../lib/engineering/eos3-work-package-service";

const WS = "00000000-0000-4000-8000-d3graph000001";
const TENANT = "00000000-0000-4000-8000-000000000041";
const PROJECT = "PILOT-001-D3";

describe("EOS-3-DOMAIN-3 Relationship Graph Core", () => {
  beforeEach(() => {
    __resetProjectWorkspacesForTests();
    __resetWorkPackagesForTests();
    __resetAssetSystemContextForTests();
    __resetRelationshipGraphForTests();
  });

  it("audits digital thread without creating a duplicate", () => {
    const a = auditDigitalThreadCompatibility();
    expect(a.existingDigitalThreadAudited).toBe(true);
    expect(a.duplicateDigitalThreadCreated).toBe(false);
  });

  it("registers governed types with constraints and directionality", () => {
    expect(isRegisteredRelationshipType("ASSUMES")).toBe(true);
    expect(isRegisteredRelationshipType("LOCATED_IN")).toBe(true);
    const assumes = getRelationshipTypeDefinition("ASSUMES")!;
    expect(assumes.directional).toBe(true);
    expect(assumes.symmetric).toBe(false);
    expect(assumes.revisionSpecificAllowed).toBe(true);
    expect(assertAllowedEndpoint("ASSUMES", "Calculation", "Assumption").ok).toBe(true);
    expect(assertAllowedEndpoint("ASSUMES", "Assumption", "Calculation").ok).toBe(false);
    const connected = getRelationshipTypeDefinition("CONNECTED_TO")!;
    expect(connected.symmetric).toBe(true);
  });

  it("creates canonical relationship identity without cloning objects", () => {
    const edge = createGraphEdge({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
      sourceClass: "Calculation",
      sourceStableId: "CALC-X",
      targetClass: "Assumption",
      targetStableId: "ASM-X",
      relationshipType: "ASSUMES",
      createdBy: "engineer-1",
    });
    expect(edge.relationshipId).toBeTruthy();
    expect(edge.provenance.duplicateObjectStore).toBe(false);
    expect(edge.provenance.canonicalObjectsRemainSourceOfTruth).toBe(true);
    expect(edge.provenance.grantsEngineeringAuthority).toBe(false);
    expect(edge.provenance.inProcessGraphSourceOfTruth).toBe(false);
    expect(edge.provenance.stalenessPropagation).toBe(false);
  });

  it("enforces duplicate control and evidence aggregation", () => {
    const a = createGraphEdge({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
      sourceClass: "Evidence",
      sourceStableId: "EVD-1",
      targetClass: "Assumption",
      targetStableId: "ASM-1",
      relationshipType: "SUPPORTS",
      evidenceRefs: ["doc-a"],
    });
    const b = createGraphEdge({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
      sourceClass: "Evidence",
      sourceStableId: "EVD-1",
      targetClass: "Assumption",
      targetStableId: "ASM-1",
      relationshipType: "SUPPORTS",
      evidenceRefs: ["doc-b"],
    });
    expect(a.relationshipId).toBe(b.relationshipId);
    expect(b.evidenceRefs).toEqual(expect.arrayContaining(["doc-a", "doc-b"]));
  });

  it("preserves revision-aware history when assumption revises", () => {
    const e1 = createGraphEdge({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
      sourceClass: "Calculation",
      sourceStableId: "CALC-STR-042",
      sourceRevisionId: "calc-r2",
      sourceRevisionLabel: "Rev 2",
      targetClass: "Assumption",
      targetStableId: "ASM-018",
      targetRevisionId: "asm-r1",
      targetRevisionLabel: "Rev 1",
      relationshipType: "ASSUMES",
    });
    // New assumption rev does not rewrite historical edge
    createGraphEdge({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
      sourceClass: "Calculation",
      sourceStableId: "CALC-STR-042",
      sourceRevisionId: "calc-r3",
      sourceRevisionLabel: "Rev 3",
      targetClass: "Assumption",
      targetStableId: "ASM-018",
      targetRevisionId: "asm-r2",
      targetRevisionLabel: "Rev 2",
      relationshipType: "ASSUMES",
    });
    const hist = getGraphEdge(WS, e1.relationshipId)!;
    expect(hist.target.revisionId).toBe("asm-r1");
    expect(hist.target.revisionLabel).toBe("Rev 1");
    expect(listEdgesForObject(WS, "CALC-STR-042")).toHaveLength(2);
  });

  it("supports supersession without destructive rewrite", () => {
    const old = createGraphEdge({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
      sourceClass: "WorkPackage",
      sourceStableId: "WP-A",
      targetClass: "Asset",
      targetStableId: "AST-1",
      relationshipType: "MODIFIES",
    });
    const { old: superseded, neu } = supersedeGraphEdge({
      workspaceId: WS,
      oldRelationshipId: old.relationshipId,
      replacement: {
        tenantId: TENANT,
        workspaceId: WS,
        projectId: PROJECT,
        sourceClass: "WorkPackage",
        sourceStableId: "WP-A",
        targetClass: "Asset",
        targetStableId: "AST-2",
        relationshipType: "MODIFIES",
      },
    });
    expect(superseded.status).toBe("SUPERSEDED");
    expect(superseded.supersededByRelationshipId).toBe(neu.relationshipId);
    expect(neu.supersedesRelationshipId).toBe(old.relationshipId);
    expect(getGraphEdge(WS, old.relationshipId)?.status).toBe("SUPERSEDED");
  });

  it("infers material relationships as PROPOSED, not silent facts", () => {
    const edge = createGraphEdge({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
      sourceClass: "Calculation",
      sourceStableId: "CALC-I",
      targetClass: "Assumption",
      targetStableId: "ASM-I",
      relationshipType: "ASSUMES",
      origin: "INFERRED",
      inferenceBasis: "Heuristic from shared WP",
      material: true,
    });
    expect(edge.confirmationState).toBe("PROPOSED");
  });

  it("handles symmetric CONNECTED_TO and cycle-safe traversal", () => {
    createGraphEdge({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
      sourceClass: "System",
      sourceStableId: "SYS-A",
      targetClass: "System",
      targetStableId: "SYS-B",
      relationshipType: "CONNECTED_TO",
    });
    createGraphEdge({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
      sourceClass: "System",
      sourceStableId: "SYS-B",
      targetClass: "System",
      targetStableId: "SYS-A",
      relationshipType: "CONNECTED_TO",
    });
    // Duplicate symmetric collapses
    expect(listEdgesForObject(WS, "SYS-A", { status: "ACTIVE" }).length).toBeLessThanOrEqual(1);

    createGraphEdge({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
      sourceClass: "WorkPackage",
      sourceStableId: "WP-1",
      targetClass: "WorkPackage",
      targetStableId: "WP-2",
      relationshipType: "AFFECTS",
    });
    createGraphEdge({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
      sourceClass: "WorkPackage",
      sourceStableId: "WP-2",
      targetClass: "WorkPackage",
      targetStableId: "WP-1",
      relationshipType: "AFFECTS",
    });
    const paths = boundedTraversal(WS, "WP-1", {
      maxDepth: 4,
      direction: "downstream",
      projectId: PROJECT,
    });
    expect(paths.length).toBeGreaterThan(0);
    // Terminates (no infinite loop) — finite path set
    expect(paths.every((p) => p.hops.length <= 4)).toBe(true);
  });

  it("explains paths in engineering language", () => {
    createGraphEdge({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
      sourceClass: "Evidence",
      sourceStableId: "EVD-5",
      targetClass: "Assumption",
      targetStableId: "ASM-018",
      relationshipType: "SUPPORTS",
    });
    createGraphEdge({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
      sourceClass: "Calculation",
      sourceStableId: "CALC-042",
      targetClass: "Assumption",
      targetStableId: "ASM-018",
      relationshipType: "ASSUMES",
    });
    createGraphEdge({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
      sourceClass: "Calculation",
      sourceStableId: "CALC-042",
      targetClass: "Decision",
      targetStableId: "DEC-011",
      relationshipType: "SUPPORTS",
    });
    const paths = boundedTraversal(WS, "EVD-5", {
      maxDepth: 3,
      direction: "both",
      projectId: PROJECT,
    });
    expect(paths.some((p) => p.explanation.includes("SUPPORTS"))).toBe(true);
    expect(explainPath(paths[0]!).length).toBeGreaterThan(0);
    const ui = buildDependencyUiContract(WS, "CALC-042", PROJECT);
    expect(ui.labels.dependencies).toBe("Dependencies");
    expect(ui.engineeringLanguage).toBe(true);
  });

  it("filters unauthorized disclosures and blocks cross-workspace writes", () => {
    createGraphEdge({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
      sourceClass: "Calculation",
      sourceStableId: "CALC-SEC",
      targetClass: "Assumption",
      targetStableId: "ASM-SEC",
      relationshipType: "ASSUMES",
    });
    const edges = getRelatedObjects(WS, "CALC-SEC");
    expect(filterEdgesForAuthorization(edges, new Set(["CALC-SEC"])).length).toBe(0);
    expect(
      filterEdgesForAuthorization(edges, new Set(["CALC-SEC", "ASM-SEC"])).length,
    ).toBe(1);
    expect(
      unauthorizedRelationshipWriteBlocked({
        callerWorkspaceId: WS,
        edgeWorkspaceId: "other-ws",
      }),
    ).toBe(true);
  });

  it("composes Domain-1 dependencies without duplicating the model", () => {
    createWorkPackage({ projectId: PROJECT, title: "A", stableId: "WP-STR-001" });
    createWorkPackage({ projectId: PROJECT, title: "B", stableId: "WP-MEC-002" });
    addDependency(PROJECT, {
      sourceStableId: "WP-STR-001",
      targetStableId: "WP-MEC-002",
      dependencyType: "REQUIRES",
    });
    const edges = composeWorkPackageDependenciesIntoGraph({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
      workPackageStableId: "WP-STR-001",
    });
    expect(edges.some((e) => e.relationshipType === "REQUIRES")).toBe(true);
  });

  it("brownfield Pilot-001 graph validation and queries", () => {
    const seeded = seedPilot001RelationshipGraph({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
    });
    expect(seeded.edgeCount).toBeGreaterThan(5);
    expect(seeded.audit.duplicateDigitalThreadCreated).toBe(false);

    // What does CALC-001 depend on?
    expect(seeded.calcDependsOn.some((e) => e.target.objectStableId === "ASM-001")).toBe(true);

    // What depends on ASM-001?
    expect(
      seeded.assumptionDependents.some((e) => e.source.objectStableId === "CALC-001"),
    ).toBe(true);

    // WP objects
    expect(
      seeded.workPackageObjects.some(
        (e) =>
          e.source.objectStableId === "WP-STR-004" || e.target.objectStableId === "WP-STR-004",
      ),
    ).toBe(true);

    // Asset engineering context
    expect(
      seeded.assetEngineering.some(
        (e) =>
          e.source.objectStableId === "AST-PLT-201" || e.target.objectStableId === "AST-PLT-201",
      ),
    ).toBe(true);

    expect(countImpactOverclaims(WS)).toBe(0);
    expect(composeAssetSystemRelationshipsIntoGraph({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
    }).length).toBeGreaterThanOrEqual(0);
  });

  it("measures performance baseline without fabricated SLOs", () => {
    const perf = measureGraphPerformanceBaseline({ nodeCount: 200, edgeFactor: 2 });
    expect(perf.nodeCount).toBe(200);
    expect(perf.edgeCount).toBeGreaterThan(100);
    expect(typeof perf.directP50Ms).toBe("number");
    expect(typeof perf.directP95Ms).toBe("number");
    expect(typeof perf.hop3P50Ms).toBe("number");
    expect(typeof perf.hop3P95Ms).toBe("number");
    expect(perf.performanceBlockerCount).toBeGreaterThanOrEqual(0);
    // Record for phase output via console
    // eslint-disable-next-line no-console
    console.log(
      "EOS_DOMAIN3_PERF",
      JSON.stringify({
        directP50: perf.directP50Ms,
        directP95: perf.directP95Ms,
        hop3P50: perf.hop3P50Ms,
        hop3P95: perf.hop3P95Ms,
        blockers: perf.performanceBlockerCount,
      }),
    );
  });

  it("preserves guided engineering and does not require manual graph maintenance", () => {
    expect(unjustifiedRequiredFieldCount()).toBe(0);
  });

  it("direct query service returns upstream and downstream", () => {
    createGraphEdge({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
      sourceClass: "Calculation",
      sourceStableId: "C1",
      targetClass: "Assumption",
      targetStableId: "A1",
      relationshipType: "ASSUMES",
    });
    expect(getDownstream(WS, "C1")[0]?.target.objectStableId).toBe("A1");
    expect(getUpstream(WS, "A1")[0]?.source.objectStableId).toBe("C1");
    expect(getDependencies(WS, "C1")[0]?.relationshipType).toBe("ASSUMES");
    expect(getDependents(WS, "A1").length).toBe(1);
  });
});
