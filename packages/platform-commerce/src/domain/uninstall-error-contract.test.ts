import { describe, expect, it } from "vitest";
import { InvalidInstallationTransitionError, InstallationDependencyError } from "./errors";
import { InstallationErrorCode } from "./installation-reason-codes";

describe("Installation uninstall error contract", () => {
  it("invalid transition uses HTTP 409 and stable code", () => {
    const err = new InvalidInstallationTransitionError("uninstalled", "uninstall_pending");
    expect(err.statusCode).toBe(409);
    expect(err.code).toBe(InstallationErrorCode.INVALID_INSTALLATION_TRANSITION);
  });

  it("active dependencies use HTTP 422 and stable code", () => {
    const err = new InstallationDependencyError(
      "Dependent applications must be uninstalled first",
      InstallationErrorCode.ACTIVE_DEPENDENCIES_EXIST
    );
    expect(err.statusCode).toBe(422);
    expect(err.code).toBe(InstallationErrorCode.ACTIVE_DEPENDENCIES_EXIST);
  });
});
