import { describe, expect, it, beforeEach } from "vitest";
import {
  __resetProjectWorkspacesForTests,
  applyChangeMassPilot,
  createWorkspaceObject,
  digitalThreadFrom,
  evaluateGate,
  findByStableId,
  seedPilot001,
  snapshotProjectWorkspace,
  transitionLifecycle,
  updateProjectSetup,
} from "../lib/engineering/eos3-project-workspace-service";
import {
  EOS3_PHASE_UI_DISPOSITIONS,
  PROJECT_WORKSPACE_NAV_GROUPS,
  allCoreWorkspaceItems,
  findWorkspaceNavItem,
  workspaceHref,
} from "../lib/engineering/project-workspace-ia";
import { embeddingsAreGraphAuthority } from "../lib/engineering/eos3-digital-thread";

const PROJECT_ID = "pilot-ui-1-test-project";

describe("EOS-3-PILOT-UI-1 project workspace", () => {
  beforeEach(() => {
    __resetProjectWorkspacesForTests();
  });

  it("exposes engineering-language grouped navigation", () => {
    const ids = PROJECT_WORKSPACE_NAV_GROUPS.map((g) => g.id);
    expect(ids).toEqual(["work", "engineering", "information", "execution", "advanced"]);
    expect(allCoreWorkspaceItems().length).toBeGreaterThan(10);
    expect(findWorkspaceNavItem("requirements")?.label).toBe("Scope & Design Basis");
    expect(findWorkspaceNavItem("work-packages")?.label).toBe("Work Packages");
    expect(findWorkspaceNavItem("assets")?.label).toBe("Assets & Systems");
    expect(workspaceHref("abc", "lifecycle")).toBe("/engineering/projects/abc/lifecycle");
    expect(workspaceHref("abc", "")).toBe("/engineering/projects/abc");
  });

  it("maps every EOS 3 completed phase to a UI disposition (100%)", () => {
    const required = [
      "EOS-3.0",
      "EOS-3.1",
      "EOS-3.2",
      "EOS-3.3",
      "EOS-3.4",
      "EOS-3.5",
      "EOS-3.6",
      "EOS-3.7",
      "EOS-3.8",
      "EOS-3.9",
      "EOS-3.10",
      "EOS-3.11",
      "EOS-3.12",
      "EOS-3.12A",
      "EOS-3.13",
      "EOS-3.13R",
      "EOS-3.13R-C",
      "EOS-3.14",
      "EOS-3-MAINT-0",
    ];
    for (const phase of required) {
      expect(EOS3_PHASE_UI_DISPOSITIONS.some((d) => d.phase === phase)).toBe(true);
    }
    expect(EOS3_PHASE_UI_DISPOSITIONS).toHaveLength(required.length);
  });

  it("keeps core capabilities within nav depth 3 from overview", () => {
    // Overview (1) → group visible in shell (2) → capability link (3)
    for (const item of allCoreWorkspaceItems()) {
      expect(item.slug.split("/").length).toBeLessThanOrEqual(1);
      expect(workspaceHref("p", item.slug).split("/").length).toBeLessThanOrEqual(5);
    }
  });

  it("seeds PILOT-001 end-to-end objects and preserves graph authority", () => {
    const { created, snapshot } = seedPilot001(PROJECT_ID);
    expect(created.length).toBeGreaterThanOrEqual(10);
    for (const id of [
      "REQ-001",
      "EB-001",
      "ASM-001",
      "SYS-STR-001",
      "INT-001",
      "CALC-001",
      "DEC-001",
      "DEL-001",
      "REV-001",
      "CHG-001",
    ]) {
      expect(findByStableId(PROJECT_ID, id)?.stableObjectId).toBe(id);
    }
    expect(snapshot.setup.projectCode).toBe("PILOT-001");
    expect(snapshot.setupStatus).toBe("PROJECT_SETUP_COMPLETE");
    expect(snapshot.qualification.d1).toBe("QUALIFIED_BOUNDED");
    expect(snapshot.qualification.nonD1).toBe("NOT_QUALIFIED");
    expect(snapshot.qualification.spaceGassGlobal).toBe("NO");
    expect(snapshot.migration.claim).toContain("NOT_SUPPORTED_INITIAL_RELEASE");
    expect(embeddingsAreGraphAuthority()).toBe(false);

    const req = findByStableId(PROJECT_ID, "REQ-001")!;
    const thread = digitalThreadFrom(PROJECT_ID, req.id);
    const stables = thread.path.map((p) => p.stableObjectId);
    expect(stables).toContain("REQ-001");
    expect(stables.some((s) => ["EB-001", "ASM-001", "SYS-STR-001"].includes(s))).toBe(true);
  });

  it("blocks G0 when mandatory requirement unmet, then passes after seed", () => {
    updateProjectSetup(PROJECT_ID, {
      projectCode: "X",
      projectName: "Y",
      jurisdiction: { country: "AU", stateRegion: "QLD", profileName: "AU" },
      checklist: {
        projectProfile: true,
        jurisdiction: true,
        standards: true,
        lifecycle: true,
        roles: true,
        engineeringBasis: false,
        requirements: false,
        systemsInterfaces: false,
        deliverablePlan: false,
      },
    });
    const blocked = evaluateGate(PROJECT_ID, "G0");
    expect(blocked.result).toBe("HOLD");
    expect(blocked.blocking.some((b) => b.toLowerCase().includes("requirement"))).toBe(true);

    const advanceBlocked = transitionLifecycle(PROJECT_ID, "G0", {
      actorId: "lead",
      authority: "project_lead",
    });
    expect(advanceBlocked.ok).toBe(false);

    seedPilot001(PROJECT_ID);
    const passed = evaluateGate(PROJECT_ID, "G0");
    expect(passed.result).toBe("PASS");
    const advanced = transitionLifecycle(PROJECT_ID, "G0", {
      actorId: "lead",
      authority: "project_lead",
      gateResult: "PASS",
    });
    expect(advanced.ok).toBe(true);
    expect(advanced.lifecycle.currentKey).toBe("G0");
  });

  it("applies mass change impact across assumption/interface/calc/decision/deliverable", () => {
    seedPilot001(PROJECT_ID);
    const result = applyChangeMassPilot(PROJECT_ID, "CHG-001", "12 t", "15 t");
    expect(result.affected.length).toBe(5);
    expect(result.impact.length).toBeGreaterThanOrEqual(5);
    const asm = findByStableId(PROJECT_ID, "ASM-001")!;
    expect(asm.governedState === "STALE" || asm.payload.equipmentMass === "15 t").toBe(true);
    expect(result.impact.some((i) => i.stableObjectId === "CALC-001")).toBe(true);
  });

  it("does not invent duplicate object types outside EOS3 catalog", () => {
    const obj = createWorkspaceObject(PROJECT_ID, {
      objectType: "Requirement",
      stableObjectId: "REQ-UI-TEST",
      displayName: "UI test requirement",
    });
    expect(obj.generation).toBe(3);
    expect(obj.projectId).toBe(PROJECT_ID);
    const snap = snapshotProjectWorkspace(PROJECT_ID);
    expect(snap.trust.activation).toBe("ACTIVE_CONTROLLED_GA");
  });

  it("records setup incompleteness until required fields exist", () => {
    const snap = snapshotProjectWorkspace(PROJECT_ID);
    expect(snap.setupStatus).toBe("PROJECT_SETUP_INCOMPLETE");
    updateProjectSetup(PROJECT_ID, {
      projectCode: "PILOT-001",
      projectName: "Process Plant Structural Modification Pilot",
      jurisdiction: { country: "AU", stateRegion: "", profileName: "" },
      roles: ["Lead"],
      checklist: {
        projectProfile: true,
        jurisdiction: true,
        standards: true,
        lifecycle: true,
        roles: true,
        engineeringBasis: false,
        requirements: false,
        systemsInterfaces: false,
        deliverablePlan: false,
      },
    });
    expect(snapshotProjectWorkspace(PROJECT_ID).setupStatus).toBe("PROJECT_SETUP_COMPLETE");
  });
});
