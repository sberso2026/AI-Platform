import { describe, it, expect, beforeEach } from "vitest";
import { __resetProjectWorkspacesForTests } from "../lib/engineering/eos3-project-workspace-service";
import { __resetWorkPackagesForTests } from "../lib/engineering/eos3-work-package-service";
import {
  __resetAssetSystemContextForTests,
  acceptConfigurationAsBuilt,
  associateEngineeringObjectToContext,
  auditExistingModels,
  buildAssetSystemUiContract,
  createContextNode,
  deriveObjectContextFromWorkPackage,
  getContextNode,
  listConfigurationHistory,
  listContextRelationships,
  listWorkPackageContextLinks,
  linkWorkPackageToContext,
  relateContext,
  searchContextSelector,
  seedGreenfieldProposedPumpContext,
  seedPilot001AssetSystemContext,
  setConfigurationState,
  unauthorizedWriteBlocked,
  ASSET_CONTEXT_RELATIONSHIP_TYPES,
  recordConfigurationDelta,
} from "../lib/engineering/eos3-asset-system-context";
import { createWorkPackage, getWorkPackage } from "../lib/engineering/eos3-work-package-service";
import { findWorkspaceNavItem } from "../lib/engineering/project-workspace-ia";
import { EOS3_RELATIONSHIP_TYPES } from "../lib/engineering/eos3-relationships";
import { unjustifiedRequiredFieldCount } from "../lib/engineering/eos3-field-necessity-audit";
import { snapshotProjectWorkspace } from "../lib/engineering/eos3-project-workspace-service";

const WS = "00000000-0000-4000-8000-000000000042";
const TENANT = "00000000-0000-4000-8000-000000000041";
const PROJECT = "PILOT-001-D2";

describe("EOS-3-DOMAIN-2 Asset/System ontology and context", () => {
  beforeEach(() => {
    __resetProjectWorkspacesForTests();
    __resetWorkPackagesForTests();
    __resetAssetSystemContextForTests();
  });

  it("audits existing models without duplication", () => {
    const a = auditExistingModels();
    expect(a.existingAssetSystemModelAudited).toBe(true);
    expect(a.duplicateAssetModelCreated).toBe(false);
    expect(a.duplicateSystemModelCreated).toBe(false);
    expect(a.projectToAssetPreserved).toBe(true);
    expect(a.ontologyNotRigidSingleTree).toBe(true);
  });

  it("supports facility, area, system, subsystem, asset, optional component", () => {
    const facility = createContextNode({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
      contextKind: "FACILITY",
      displayName: "Compressor Station",
      stableId: "FAC-CS-1",
      configurationState: "OPERATING",
    });
    const area = createContextNode({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
      contextKind: "AREA",
      displayName: "Train 2",
      stableId: "AREA-T2",
    });
    const system = createContextNode({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
      contextKind: "SYSTEM",
      displayName: "Gas Compression",
      stableId: "SYS-GC-1",
    });
    const subsystem = createContextNode({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
      contextKind: "SUBSYSTEM",
      displayName: "Suction System",
      stableId: "SSYS-SUC-1",
    });
    const asset = createContextNode({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
      contextKind: "ASSET",
      displayName: "Compressor C-201",
      tag: "C-201",
      stableId: "AST-C-201",
      configurationState: "INSTALLED",
      ownerOrganization: "Operations",
      primaryTechnicalDiscipline: "Mechanical",
    });
    const component = createContextNode({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
      contextKind: "COMPONENT",
      displayName: "Baseplate",
      stableId: "CMP-BP-1",
    });

    expect(facility.contextKind).toBe("FACILITY");
    expect(area.contextKind).toBe("AREA");
    expect(system.contextKind).toBe("SYSTEM");
    expect(subsystem.contextKind).toBe("SUBSYSTEM");
    expect(asset.contextKind).toBe("ASSET");
    expect(component.contextKind).toBe("COMPONENT");
    expect(asset.ownerOrganization).toBe("Operations");
    expect(asset.primaryTechnicalDiscipline).toBe("Mechanical");
    expect(asset.ownerOrganization).not.toBe(asset.primaryTechnicalDiscipline);
  });

  it("uses typed relationships instead of a rigid single tree", () => {
    createContextNode({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
      contextKind: "FACILITY",
      displayName: "Plant",
      stableId: "FAC-1",
    });
    createContextNode({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
      contextKind: "SYSTEM",
      displayName: "Firewater",
      stableId: "SYS-FW",
    });
    createContextNode({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
      contextKind: "ASSET",
      displayName: "Pump P-1",
      stableId: "AST-P1",
    });
    // Functional link without requiring Area parent
    relateContext({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
      relationshipType: "PART_OF_SYSTEM",
      fromStableId: "AST-P1",
      toStableId: "SYS-FW",
    });
    relateContext({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
      relationshipType: "LOCATED_IN",
      fromStableId: "SYS-FW",
      toStableId: "FAC-1",
    });
    expect(listContextRelationships(WS).map((r) => r.relationshipType)).toEqual(
      expect.arrayContaining(["PART_OF_SYSTEM", "LOCATED_IN"]),
    );
    expect(ASSET_CONTEXT_RELATIONSHIP_TYPES).toContain("SUPPORTS");
    expect(EOS3_RELATIONSHIP_TYPES).toContain("LOCATED_IN");
    expect(EOS3_RELATIONSHIP_TYPES).toContain("PART_OF_SYSTEM");
  });

  it("preserves proposed-to-installed continuity and identity", () => {
    const asset = createContextNode({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
      contextKind: "ASSET",
      displayName: "MCC-03",
      stableId: "AST-MCC-03",
      configurationState: "PROPOSED",
    });
    setConfigurationState(WS, asset.stableAssetId, "DESIGNED");
    setConfigurationState(WS, asset.stableAssetId, "INSTALLED");
    setConfigurationState(WS, asset.stableAssetId, "OPERATING");
    const after = getContextNode(WS, "AST-MCC-03")!;
    expect(after.stableAssetId).toBe("AST-MCC-03");
    expect(after.configurationState).toBe("OPERATING");
    expect(after.assetId).toBe(asset.assetId);
  });

  it("separates asset configuration state from engineering maturity", () => {
    const wp = createWorkPackage({
      projectId: PROJECT,
      title: "Support Frame Modification",
      maturity: "Detailed Engineering",
      stableId: "WP-STR-100",
    });
    const asset = createContextNode({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
      contextKind: "ASSET",
      displayName: "Platform",
      stableId: "AST-PLT",
      configurationState: "INSTALLED",
    });
    expect(asset.configurationState).toBe("INSTALLED");
    expect(wp.maturity).toBe("Detailed Engineering");
    expect(asset.configurationState).not.toBe(wp.maturity);
  });

  it("supports multi-asset primary/related Work Package links with reuse", () => {
    createWorkPackage({
      projectId: PROJECT,
      title: "Pipe Rack Strengthening",
      stableId: "WP-STR-200",
    });
    createContextNode({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
      contextKind: "ASSET",
      displayName: "Pipe Rack PR-12",
      stableId: "AST-PR-12",
      configurationState: "INSTALLED",
    });
    createContextNode({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
      contextKind: "ASSET",
      displayName: "Pipe Support PS-14",
      stableId: "AST-PS-14",
    });
    linkWorkPackageToContext({
      workspaceId: WS,
      projectId: PROJECT,
      workPackageStableId: "WP-STR-200",
      contextStableId: "AST-PR-12",
      role: "PRIMARY_ASSET_OR_SYSTEM",
    });
    linkWorkPackageToContext({
      workspaceId: WS,
      projectId: PROJECT,
      workPackageStableId: "WP-STR-200",
      contextStableId: "AST-PS-14",
      role: "RELATED_ASSET_OR_SYSTEM",
    });
    const links = listWorkPackageContextLinks(WS, "WP-STR-200");
    expect(links).toHaveLength(2);
    const wp = getWorkPackage(PROJECT, "WP-STR-200");
    expect(wp?.affectedAssets.some((a) => a.stableRef === "AST-PR-12")).toBe(true);
  });

  it("keeps existing vs proposed configuration separate", () => {
    createContextNode({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
      contextKind: "COMPONENT",
      displayName: "Beam B23",
      stableId: "CMP-B23X",
      configurationState: "INSTALLED",
    });
    const delta = recordConfigurationDelta({
      workspaceId: WS,
      assetStableId: "CMP-B23X",
      memberKey: "section",
      existingBaseline: { section: "X" },
      proposedModification: { section: "Y" },
    });
    expect(delta.installedUpdated).toBe(false);
    expect(delta.status).toBe("PROPOSED");
    expect(getContextNode(WS, "CMP-B23X")!.configurationState).toBe("INSTALLED");
    acceptConfigurationAsBuilt(WS, delta.id);
    expect(listConfigurationHistory(WS, "CMP-B23X")[0].installedUpdated).toBe(true);
  });

  it("associates engineering objects and derives context from WP", () => {
    createWorkPackage({ projectId: PROJECT, title: "Mod", stableId: "WP-X" });
    createContextNode({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
      contextKind: "ASSET",
      displayName: "Platform",
      stableId: "AST-P",
    });
    linkWorkPackageToContext({
      workspaceId: WS,
      projectId: PROJECT,
      workPackageStableId: "WP-X",
      contextStableId: "AST-P",
      role: "PRIMARY_ASSET_OR_SYSTEM",
    });
    associateEngineeringObjectToContext({
      workspaceId: WS,
      projectId: PROJECT,
      objectType: "Calculation",
      objectStableId: "CALC-Z",
      contextStableId: "AST-P",
    });
    const derived = deriveObjectContextFromWorkPackage({
      workspaceId: WS,
      projectId: PROJECT,
      objectType: "Assumption",
      objectStableId: "ASM-Z",
      workPackageStableId: "WP-X",
    });
    expect(derived?.derived).toBe(true);
    expect(derived?.contextStableId).toBe("AST-P");
    expect(derived?.provenance.confirmationStatus).toBe("INFERRED");
  });

  it("provides selector foundation and engineering language nav", () => {
    createContextNode({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
      contextKind: "ASSET",
      displayName: "Tank TK-101",
      tag: "TK-101",
      stableId: "AST-TK-101",
    });
    const sel = searchContextSelector({ workspaceId: WS, projectId: PROJECT, q: "TK-101" });
    expect(sel.results[0].stableAssetId).toBe("AST-TK-101");
    const item = findWorkspaceNavItem("assets");
    expect(item?.label).toBe("Assets & Systems");
    expect(item?.label.toLowerCase()).not.toMatch(/ontology|graph|resolver/);
  });

  it("blocks cross-workspace unauthorized write pattern", () => {
    expect(unauthorizedWriteBlocked({ workspaceId: WS, callerWorkspaceId: "other" })).toBe(true);
    expect(unauthorizedWriteBlocked({ workspaceId: WS, callerWorkspaceId: WS })).toBe(false);
  });

  it("brownfield PILOT-001 asset/system context for WP-STR-004", () => {
    const seeded = seedPilot001AssetSystemContext({ workspaceId: WS, projectId: PROJECT });
    expect(seeded.facility.displayName).toBe("Synthetic Process Plant");
    expect(seeded.primaryAsset.tag).toBe("PLT-201");
    expect(seeded.primaryAsset.configurationState).toBe("INSTALLED");
    expect(seeded.workPackage.maturity).toBe("Detailed Engineering");
    expect(seeded.workPackage.disciplines.lead).toBe("Structural");
    expect(seeded.workPackage.disciplines.participating).toContain("Mechanical");
    expect(seeded.uiContract.primaryAsset).toMatch(/PLT-201|platform/i);
    expect(snapshotProjectWorkspace(PROJECT).lifecycle.currentKey).toBe("P0");
    const ui = buildAssetSystemUiContract({
      workspaceId: WS,
      projectId: PROJECT,
      workPackageStableId: "WP-STR-004",
    });
    expect(ui.engineeringLanguage).toBe(true);
    expect(ui.facility).toBeTruthy();
  });

  it("greenfield proposed asset scenario", () => {
    const g = seedGreenfieldProposedPumpContext({
      workspaceId: WS,
      projectId: "GREENFIELD-001",
    });
    expect(g.system.displayName).toBe("Cooling Water");
    expect(g.asset.tag).toBe("P-101");
    expect(g.asset.stableAssetId).toBe("AST-P-101");
    expect(g.asset.configurationState).toBe("DESIGNED");
  });

  it("preserves guided engineering required-input regression", () => {
    expect(unjustifiedRequiredFieldCount()).toBe(0);
  });

  it("does not grant engineering authority via asset modeling", () => {
    const a = createContextNode({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
      contextKind: "ASSET",
      displayName: "X",
      stableId: "AST-AUTH",
    });
    expect(a.provenance.grantsEngineeringAuthority).toBe(false);
    expect(a.provenance.newInProcessAssetShadowModel).toBe(false);
  });
});
