import { describe, expect, it } from "vitest";
import { canEnrollEos2, decideEos2Access } from "../lib/commerce/eos2-rollout";

const open = {
  authenticated: true,
  productEntitled: true,
  workspaceId: "workspace",
  mode: "controlled_pilot",
  enrolled: true,
  emergencyOff: false,
};

describe("EOS 2 rollout decision", () => {
  it("allows entitled enrolled workspaces in controlled_pilot or general_availability", () => {
    expect(decideEos2Access(open)).toEqual({ allowed: true, reason: "enrolled" });
    expect(decideEos2Access({ ...open, mode: "general_availability" })).toEqual({
      allowed: true,
      reason: "enrolled",
    });
  });

  it("fails closed when the flag, enrollment, workspace, or entitlement is missing or malformed", () => {
    expect(decideEos2Access({ ...open, mode: undefined }).reason).toBe("global_off");
    expect(decideEos2Access({ ...open, mode: "ON" }).reason).toBe("global_off");
    expect(decideEos2Access({ ...open, mode: "off" }).reason).toBe("global_off");
    expect(decideEos2Access({ ...open, enrolled: undefined }).reason).toBe("not_enrolled");
    expect(decideEos2Access({ ...open, enrolled: "true" }).reason).toBe("not_enrolled");
    expect(decideEos2Access({ ...open, workspaceId: null }).reason).toBe("workspace_missing");
    expect(decideEos2Access({ ...open, productEntitled: false }).reason).toBe("entitlement_missing");
    expect(decideEos2Access({ ...open, authenticated: false }).reason).toBe("unauthenticated");
    expect(decideEos2Access({ ...open, indeterminate: true }).reason).toBe("indeterminate");
  });

  it("lets the kill switch deny an enrolled workspace", () => {
    expect(decideEos2Access({ ...open, emergencyOff: true }).reason).toBe("kill_switch");
    expect(
      decideEos2Access({ ...open, mode: "general_availability", emergencyOff: true }).reason,
    ).toBe("kill_switch");
  });

  it("does not let an engineer, pilot engineer, or AI enroll a workspace", () => {
    expect(canEnrollEos2("engineer")).toBe(false);
    expect(canEnrollEos2("pilot-engineer")).toBe(false);
    expect(canEnrollEos2("ai")).toBe(false);
    expect(canEnrollEos2("owner")).toBe(true);
    expect(canEnrollEos2("admin")).toBe(true);
    expect(canEnrollEos2(null)).toBe(false);
  });
});
