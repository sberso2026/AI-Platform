import { describe, expect, it } from "vitest";
import {
  assertMeetingsUsesProjectIntelligenceApp,
  MeetingIntelligenceError,
  requireProjectIntelligenceMeetingsAccess,
} from "@rtb/project-intelligence";
import type { AccessContext } from "@rtb/project-intelligence/server";

const entitledContext: AccessContext = {
  principalId: "user-1",
  tenantId: "tenant-1",
  tenantActive: true,
  workspaceId: "workspace-1",
  workspaceAssigned: true,
  subscriptionActive: true,
  licenceActive: true,
  engineeringOsInstalled: true,
  applicationInstalled: true,
  seatAssigned: true,
  roleAssigned: true,
  featureEnabled: true,
  permissions: ["read"],
};

describe("Gate D/P — meeting entitlement isolation", () => {
  it("uses project_intelligence application with meetings feature — not meeting_intelligence app", () => {
    expect(() => assertMeetingsUsesProjectIntelligenceApp("project_intelligence")).not.toThrow();
    expect(() => assertMeetingsUsesProjectIntelligenceApp("project-intelligence")).not.toThrow();
  });

  it("rejects meeting_intelligence stub and project-intelligence-meetings as applications", () => {
    expect(() => assertMeetingsUsesProjectIntelligenceApp("meeting_intelligence")).toThrow(
      MeetingIntelligenceError,
    );
    expect(() => assertMeetingsUsesProjectIntelligenceApp("project-intelligence-meetings")).toThrow(
      MeetingIntelligenceError,
    );
  });

  it("requires feature meetings enabled via access guard", () => {
    expect(() => requireProjectIntelligenceMeetingsAccess(entitledContext)).not.toThrow();
    expect(() =>
      requireProjectIntelligenceMeetingsAccess({ ...entitledContext, featureEnabled: false }),
    ).toThrow(MeetingIntelligenceError);
  });

  it("does not treat meetings as a separate commercial application key", () => {
    // Commerce segment project-intelligence-meetings.* maps to applicationKey project_intelligence + feature meetings.
    const forbiddenApps = ["meeting_intelligence", "project-intelligence-meetings", "meetings"];
    for (const applicationKey of forbiddenApps) {
      expect(() => assertMeetingsUsesProjectIntelligenceApp(applicationKey)).toThrow();
    }
  });
});
