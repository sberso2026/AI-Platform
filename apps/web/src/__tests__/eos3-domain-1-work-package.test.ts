import { describe, it, expect, beforeEach } from "vitest";
import { __resetProjectWorkspacesForTests } from "../lib/engineering/eos3-project-workspace-service";
import {
  __resetWorkPackagesForTests,
  addDependency,
  associateObject,
  buildWorkPackageUiContract,
  countRequiredHumanInputsForCreate,
  createWorkPackage,
  deriveBlockers,
  deriveNextAction,
  deriveReadiness,
  getWorkPackage,
  listAssociations,
  listObjectsForWorkPackageVisibility,
  listWorkPackages,
  seedPilot001SupportFrameWorkPackage,
  supportedAssociationObjectTypes,
  updateWorkPackage,
  WORK_PACKAGE_MATURITY_STATES,
  workspaceObjectsStillExist,
} from "../lib/engineering/eos3-work-package-service";
import { findWorkspaceNavItem } from "../lib/engineering/project-workspace-ia";
import { EOS3_OBJECT_TYPES } from "../lib/engineering/eos3-canonical-objects";
import { unjustifiedRequiredFieldCount } from "../lib/engineering/eos3-field-necessity-audit";

const PROJECT = "PILOT-001-DOMAIN1";

describe("EOS-3-DOMAIN-1 Work Package execution model", () => {
  beforeEach(() => {
    __resetProjectWorkspacesForTests();
    __resetWorkPackagesForTests();
  });

  it("creates with minimal human input (title only)", () => {
    const wp = createWorkPackage({
      projectId: PROJECT,
      title: "Support Frame Modification",
    });
    expect(wp.stableId).toMatch(/^WP-STR-/);
    expect(wp.disciplines.lead).toBe("Structural");
    expect(wp.disciplines.participating).toContain("Mechanical");
    expect(wp.maturity).toBe("Initiation");
    expect(countRequiredHumanInputsForCreate({ title: "Support Frame Modification" })).toBeLessThanOrEqual(3);
    expect(countRequiredHumanInputsForCreate({ title: "Support Frame Modification" })).toBe(1);
  });

  it("preserves project as organizational container", () => {
    const wp = createWorkPackage({ projectId: PROJECT, title: "MCC Upgrade" });
    expect(wp.projectId).toBe(PROJECT);
    expect(listWorkPackages(PROJECT)).toHaveLength(1);
    expect(EOS3_OBJECT_TYPES).toContain("Project");
    expect(EOS3_OBJECT_TYPES).toContain("WorkPackage");
  });

  it("supports multi-discipline participation and owner/discipline separation", () => {
    const wp = createWorkPackage({
      projectId: PROJECT,
      title: "Pipe Rack Strengthening",
      ownerName: "Project Engineer",
      initiatingDiscipline: "Structural",
      leadDiscipline: "Structural",
      participatingDisciplines: ["Mechanical", "Piping"],
    });
    expect(wp.ownerName).toBe("Project Engineer");
    expect(wp.disciplines.lead).toBe("Structural");
    expect(wp.disciplines.participating).toEqual(
      expect.arrayContaining(["Mechanical", "Piping"]),
    );
    expect(wp.ownerName).not.toBe(wp.disciplines.lead);
    expect(wp.provenance.ownerIsNotApprovalAuthority).toBe(true);
  });

  it("has independent maturity and removes single-stage project assumption", () => {
    const wp = createWorkPackage({
      projectId: PROJECT,
      title: "Tank Roof Repair",
      maturity: "Detailed Engineering",
    });
    expect(wp.maturity).toBe("Detailed Engineering");
    expect(wp.projectLifecycleKeyPreserved).toBe(true);
    expect(WORK_PACKAGE_MATURITY_STATES).toContain("FEED");
    expect(WORK_PACKAGE_MATURITY_STATES).toContain("Closed");
    const updated = updateWorkPackage(PROJECT, wp.stableId, { maturity: "Verification / Review" });
    expect(updated.maturity).toBe("Verification / Review");
  });

  it("is asset-context ready with placeholder references", () => {
    const wp = createWorkPackage({
      projectId: PROJECT,
      title: "Platform strengthening",
      affectedAssetHint: "Existing steel platform",
    });
    expect(wp.affectedAssets.length).toBeGreaterThan(0);
    expect(wp.affectedAssets[0].referenceKind).toMatch(/PLACEHOLDER|EXISTING/);
  });

  it("associates canonical objects without duplication", () => {
    const wp = createWorkPackage({ projectId: PROJECT, title: "Compressor Support Frame Replacement" });
    const a1 = associateObject(PROJECT, wp.stableId, {
      objectType: "Calculation",
      objectStableId: "CALC-X",
      confirmationState: "PROPOSED",
    });
    const a2 = associateObject(PROJECT, wp.stableId, {
      objectType: "Decision",
      objectStableId: "DEC-X",
      role: "RELATED_WORK_PACKAGE",
    });
    expect(a1.provenance.duplicateObjectCreated).toBe(false);
    expect(listAssociations(PROJECT, wp.stableId)).toHaveLength(2);
    expect(a2.role).toBe("RELATED_WORK_PACKAGE");
    expect(supportedAssociationObjectTypes()).toEqual(
      expect.arrayContaining([
        "Requirement",
        "Assumption",
        "Calculation",
        "Decision",
        "Deliverable",
        "Review",
        "Evidence",
        "Change",
      ]),
    );
  });

  it("supports evidence association and dependency foundation", () => {
    const a = createWorkPackage({ projectId: PROJECT, title: "Structural frame A", stableId: "WP-STR-001" });
    const b = createWorkPackage({ projectId: PROJECT, title: "Mechanical interface B", stableId: "WP-MEC-002" });
    associateObject(PROJECT, a.stableId, {
      objectType: "Evidence",
      objectStableId: "EVD-1",
      confirmationState: "CONFIRMED",
    });
    const dep = addDependency(PROJECT, {
      sourceStableId: a.stableId,
      targetStableId: b.stableId,
      dependencyType: "REQUIRES",
    });
    expect(dep.dependencyType).toBe("REQUIRES");
    expect(listAssociations(PROJECT, a.stableId).some((x) => x.objectType === "Evidence")).toBe(true);
  });

  it("derives readiness without manual progress percent", () => {
    const wp = createWorkPackage({ projectId: PROJECT, title: "Site Structural Repair" });
    associateObject(PROJECT, wp.stableId, { objectType: "Calculation", objectStableId: "C1" });
    associateObject(PROJECT, wp.stableId, { objectType: "Deliverable", objectStableId: "D1" });
    const readiness = deriveReadiness(PROJECT, wp.stableId);
    expect(readiness.rule).toContain("DOMAIN1_PILOT_WEIGHTED_V1");
    expect(typeof readiness.percent).toBe("number");
    expect(readiness.percent).toBeGreaterThanOrEqual(0);
    expect(readiness.percent).toBeLessThanOrEqual(100);
  });

  it("derives blockers and next-action foundation", () => {
    const wp = createWorkPackage({ projectId: PROJECT, title: "Support Frame Modification" });
    associateObject(PROJECT, wp.stableId, {
      objectType: "Assumption",
      objectStableId: "ASM-001",
      confirmationState: "PROPOSED",
    });
    const blockers = deriveBlockers(PROJECT, wp.stableId);
    expect(blockers.some((b) => b.kind === "missing_vendor_input")).toBe(true);
    expect(deriveNextAction(PROJECT, wp.stableId)).toBe("Review revised vendor load");
  });

  it("keeps proposed state visible and never auto-approves", () => {
    const wp = createWorkPackage({ projectId: PROJECT, title: "Vendor Equipment Change Assessment" });
    associateObject(PROJECT, wp.stableId, {
      objectType: "Decision",
      objectStableId: "DEC-PROP",
      confirmationState: "PROPOSED",
    });
    const vis = listObjectsForWorkPackageVisibility(PROJECT, wp.stableId);
    expect(vis[0].proposedVisible).toBe(true);
    expect(vis[0].confirmationState).toBe("PROPOSED");
  });

  it("brownfield PILOT-001 WP-STR-004 preserves project lifecycle", () => {
    const { workPackage, projectLifecycleKey, associations } =
      seedPilot001SupportFrameWorkPackage(PROJECT);
    expect(workPackage.stableId).toBe("WP-STR-004");
    expect(workPackage.title).toBe("Support Frame Modification");
    expect(workPackage.maturity).toBe("Detailed Engineering");
    expect(workPackage.disciplines.lead).toBe("Structural");
    expect(workPackage.disciplines.participating).toContain("Mechanical");
    expect(workPackage.affectedAssets.length).toBeGreaterThan(0);
    expect(projectLifecycleKey).toBe("P0");
    expect(associations.length).toBeGreaterThanOrEqual(8);
    expect(workspaceObjectsStillExist(PROJECT)).toBeGreaterThan(0);

    const contract = buildWorkPackageUiContract(PROJECT, "WP-STR-004");
    expect(contract?.header.stableId).toBe("WP-STR-004");
    expect(contract?.cards.nextRecommendedAction).toBeTruthy();
    expect(contract?.sections.decisions.length).toBeGreaterThan(0);
    expect(contract?.sections.overview).toBeTruthy();
  });

  it("exposes engineer-facing Work Packages nav label", () => {
    const item = findWorkspaceNavItem("work-packages");
    expect(item?.label).toBe("Work Packages");
    expect(item?.label.toLowerCase()).not.toMatch(/orchestration|canonical|graph|fabric/);
  });

  it("does not increase guided / initial required project inputs", () => {
    expect(unjustifiedRequiredFieldCount()).toBe(0);
  });

  it("authorization boundaries: owner is not approval authority", () => {
    const wp = createWorkPackage({
      projectId: PROJECT,
      title: "Piping Reroute",
      ownerName: "Project Engineer",
    });
    expect(wp.provenance.ownerIsNotApprovalAuthority).toBe(true);
    expect(getWorkPackage(PROJECT, wp.id)?.provenance.ownerIsNotApprovalAuthority).toBe(true);
  });

  it("RLS model contract: workspace scoped identity fields present", () => {
    const wp = createWorkPackage({ projectId: PROJECT, title: "Civil pad check" });
    expect(wp.tenantId).toBeTruthy();
    expect(wp.workspaceId).toBeTruthy();
    expect(wp.projectId).toBe(PROJECT);
  });

  it("existing project without work packages remains valid", () => {
    expect(listWorkPackages("EMPTY-PROJECT")).toEqual([]);
  });
});
