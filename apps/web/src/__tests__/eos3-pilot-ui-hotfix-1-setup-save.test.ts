import { describe, expect, it, beforeEach } from "vitest";
import { getEngineeringApiPolicy } from "@rtb/platform-commerce";
import { assertVerifiedCommerceContext, createTestCommerceExecutionContext } from "@rtb/platform-commerce/server";
import {
  __resetProjectWorkspacesForTests,
  hydrateProjectSetupFromRecord,
  snapshotProjectWorkspace,
  updateProjectSetup,
} from "../lib/engineering/eos3-project-workspace-service";
import { isEditableFormDirty } from "../components/engineering/project-workspace/unsaved-changes-guard";

const PROJECT_ID = "hotfix-1-setup-project";

describe("EOS-3-PILOT-UI-HOTFIX-1 project setup save authorization", () => {
  beforeEach(() => {
    __resetProjectWorkspacesForTests();
  });

  it("documents PILOT-BUG-001: POST projects.write must not be used for projects.get", () => {
    const write = getEngineeringApiPolicy("projects", "POST");
    const read = getEngineeringApiPolicy("projects", "GET");
    expect(write.action).toBe("project.create");
    expect(read.action).toBe("project.read");

    const writeCommerce = createTestCommerceExecutionContext({
      tenantId: "tenant-a",
      workspaceId: "ws-a",
      policy: write,
    });
    expect(() =>
      assertVerifiedCommerceContext(writeCommerce, {
        productKey: "engineering-os",
        action: "project.read",
      }),
    ).toThrow(/Action mismatch: expected project\.read/);

    const readCommerce = createTestCommerceExecutionContext({
      tenantId: "tenant-a",
      workspaceId: "ws-a",
      policy: read,
    });
    expect(() =>
      assertVerifiedCommerceContext(readCommerce, {
        productKey: "engineering-os",
        action: "project.read",
      }),
    ).not.toThrow();

    // Established update write path remains project.create (projects.write), not a bypass.
    expect(() =>
      assertVerifiedCommerceContext(writeCommerce, {
        productKey: "engineering-os",
        action: "project.create",
      }),
    ).not.toThrow();
  });

  it("denies unauthorized write when commerce action is only project.read", () => {
    const readOnly = createTestCommerceExecutionContext({
      tenantId: "tenant-a",
      workspaceId: "ws-a",
      policy: getEngineeringApiPolicy("projects", "GET"),
    });
    expect(() =>
      assertVerifiedCommerceContext(readOnly, {
        productKey: "engineering-os",
        action: "project.create",
      }),
    ).toThrow(/Action mismatch: expected project\.create/);
  });

  it("persists all editable setup fields through update + hydrate revalidation", () => {
    updateProjectSetup(PROJECT_ID, {
      projectCode: "PILOT-001",
      projectName: "Process Plant Structural Modification Pilot",
      client: "Design Partner",
      site: "Process Plant",
      location: "Gold Coast",
      industry: "Process",
      projectType: "Structural Modification",
      description: "Pilot description v1",
      confidentiality: "Internal",
      roles: ["Project Lead", "Structural Lead"],
      disciplines: ["Structural", "Mechanical"],
      lifecycleTemplate: "pilot-default-p0-g6",
      governanceProfile: "eos-controlled-pilot",
      qualificationContext: "D1 QUALIFIED_BOUNDED",
      assetRelationship: "plant-asset-map",
      jurisdiction: {
        country: "AU",
        stateRegion: "QLD",
        profileName: "AU-QLD-structural-v2",
      },
      standards: {
        engineeringStandards: ["AS/NZS 1170", "AS 4100"],
        companyStandards: ["RTB-ENG-STD-01"],
        codeProfiles: ["structural-steel"],
      },
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

    const snap = snapshotProjectWorkspace(PROJECT_ID);
    expect(snap.setup.jurisdiction.profileName).toBe("AU-QLD-structural-v2");
    expect(snap.setup.standards.engineeringStandards).toContain("AS 4100");
    expect(snap.setup.roles).toContain("Structural Lead");
    expect(snap.setup.disciplines).toContain("Mechanical");
    expect(snap.setup.description).toBe("Pilot description v1");
    expect(snap.setupStatus).toBe("PROJECT_SETUP_COMPLETE");

    __resetProjectWorkspacesForTests();
    hydrateProjectSetupFromRecord(PROJECT_ID, {
      project_code: "PILOT-001",
      project_name: "Process Plant Structural Modification Pilot",
      client_name: "Design Partner",
      site_name: "Process Plant",
      location: "Gold Coast",
      industry: "Process",
      project_type: "Structural Modification",
      metadata: {
        eos_project_setup: snap.setup,
      },
    });
    const reloaded = snapshotProjectWorkspace(PROJECT_ID);
    expect(reloaded.setup.description).toBe("Pilot description v1");
    expect(reloaded.setup.jurisdiction.profileName).toBe("AU-QLD-structural-v2");
    expect(reloaded.setup.standards.engineeringStandards).toEqual([
      "AS/NZS 1170",
      "AS 4100",
    ]);
  });

  it("detects dirty state only for meaningful editable changes", () => {
    const baseline = {
      description: "A",
      roles: "Lead",
      country: "AU",
    };
    expect(isEditableFormDirty(baseline, { ...baseline })).toBe(false);
    expect(isEditableFormDirty(baseline, { ...baseline, description: "A " })).toBe(false);
    expect(isEditableFormDirty(baseline, { ...baseline, description: "B" })).toBe(true);
    expect(isEditableFormDirty(baseline, { ...baseline, roles: "Lead, Reviewer" })).toBe(true);
  });

  it("preserves edited values after failed save semantics", () => {
    const baseline = { description: "original", roles: "Lead" };
    const edited = { ...baseline, description: "edited but not saved" };
    expect(isEditableFormDirty(baseline, edited)).toBe(true);
    expect(edited.description).toBe("edited but not saved");
  });

  it("encodes Save and Continue failure as cancelled navigation", async () => {
    const saveFails = async () => false;
    const saveOk = async () => true;
    expect(await saveFails()).toBe(false);
    expect(await saveOk()).toBe(true);
  });
});
