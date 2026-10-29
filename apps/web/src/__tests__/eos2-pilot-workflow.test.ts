import { describe, expect, it } from "vitest";
import { classifyPilotWrite, CONTROLLED_PILOT_VALIDATION_PROJECT_ID } from "../lib/engineering/eos2-pilot-workflow";

describe("controlled pilot workflow authority", () => {
  it("lets the pilot engineer create a bounded record and refuses AI and approval actions", () => {
    expect(classifyPilotWrite({
      action: "create_basis",
      roleSlug: "pilot_engineer",
      projectId: CONTROLLED_PILOT_VALIDATION_PROJECT_ID,
    }).ok).toBe(true);
    expect(classifyPilotWrite({ action: "create_basis", roleSlug: "pilot_engineer", actingRole: "ai" })).toEqual({
      ok: false,
      error: "authority_denied",
    });
    expect(classifyPilotWrite({ action: "approve_freeze", roleSlug: "owner" }).error).toBe("authority_denied");
    expect(classifyPilotWrite({ action: "accept_interface", roleSlug: "pilot_engineer" }).error).toBe("authority_denied");
    expect(classifyPilotWrite({ action: "release_deliverable", roleSlug: "admin" }).error).toBe("authority_denied");
    expect(classifyPilotWrite({ action: "ifc_release", roleSlug: "pilot_engineer" }).error).toBe("authority_denied");
  });

  it("refuses customer project ids and unassessed materiality", () => {
    expect(classifyPilotWrite({ action: "create_basis", roleSlug: "pilot_engineer", projectId: "Pilot-0001" }).error).toBe("invalid_project");
    expect(classifyPilotWrite({
      action: "record_materiality",
      roleSlug: "pilot_engineer",
      materiality: "UNASSESSED",
    }).error).toBe("invalid_materiality");
    expect(classifyPilotWrite({
      action: "record_materiality",
      roleSlug: "ai",
      materiality: "MATERIAL_IMPACT",
    }).error).toBe("authority_denied");
  });
});
