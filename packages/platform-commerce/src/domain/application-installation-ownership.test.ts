import { describe, expect, it } from "vitest";
import { InstallationStateMachine } from "../domain/installation-state-machine";

/**
 * Ownership boundary: commercial_application_installations is authoritative for
 * commercial/installation status. engineering_application_installations is runtime-only.
 */
describe("Application installation ownership", () => {
  it("commercial status transitions are independent of runtime registration", () => {
    expect(InstallationStateMachine.canTransitionApp("active", "suspended")).toBe(true);
    expect(InstallationStateMachine.canTransitionApp("suspended", "active")).toBe(true);
    expect(InstallationStateMachine.canTransitionApp("uninstalled", "requested")).toBe(true);
    expect(InstallationStateMachine.canTransitionApp("active", "uninstalled")).toBe(false);
  });

  it("conflicting commercial states cannot be active and uninstalled simultaneously", () => {
    const commercialActive = InstallationStateMachine.isAccessGranting("active");
    const commercialUninstalled = InstallationStateMachine.isAccessGranting("uninstalled");
    expect(commercialActive).toBe(true);
    expect(commercialUninstalled).toBe(false);
    expect(commercialActive && commercialUninstalled).toBe(false);
  });

  it("runtime enabled flag alone cannot grant commercial access", () => {
    const runtimeEnabled = true;
    const commercialStatus = "suspended" as const;
    const accessGranted =
      runtimeEnabled && InstallationStateMachine.isAccessGranting(commercialStatus);
    expect(accessGranted).toBe(false);
  });
});
