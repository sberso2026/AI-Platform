import { describe, expect, it } from "vitest";
import { InstallationStateMachine } from "./installation-state-machine";
import { InvalidInstallationTransitionError } from "./errors";

describe("InstallationStateMachine", () => {
  it("allows not_installed → requested", () => {
    expect(InstallationStateMachine.canTransitionProduct("not_installed", "requested")).toBe(true);
  });

  it("allows queued → provisioning → validating → active", () => {
    expect(InstallationStateMachine.canTransitionProduct("queued", "provisioning")).toBe(true);
    expect(InstallationStateMachine.canTransitionProduct("provisioning", "validating")).toBe(true);
    expect(InstallationStateMachine.canTransitionProduct("validating", "active")).toBe(true);
  });

  it("rejects active → provisioning", () => {
    expect(InstallationStateMachine.canTransitionProduct("active", "provisioning")).toBe(false);
    expect(() => InstallationStateMachine.assertProductTransition("active", "provisioning")).toThrow(
      InvalidInstallationTransitionError
    );
  });

  it("normalizes legacy healthy → active", () => {
    expect(InstallationStateMachine.normalizeProductStatus("healthy")).toBe("active");
    expect(InstallationStateMachine.normalizeProductStatus("installing")).toBe("provisioning");
  });

  it("isAccessGranting only for active and degraded", () => {
    expect(InstallationStateMachine.isAccessGranting("active")).toBe(true);
    expect(InstallationStateMachine.isAccessGranting("degraded")).toBe(true);
    expect(InstallationStateMachine.isAccessGranting("suspended")).toBe(false);
    expect(InstallationStateMachine.isAccessGranting("provisioning")).toBe(false);
  });
});
