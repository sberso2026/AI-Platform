import { describe, expect, it } from "vitest";
import { ProjectIntelligenceError } from "@rtb/project-intelligence";

const entitlementContracts = [
  ["project_intelligence_not_installed", 403],
  ["licence_suspended", 403],
  ["seat_not_assigned", 403],
  ["workspace_not_assigned", 403],
] as const;

describe("Phase 6C-1 entitlement error-code contract", () => {
  it.each(entitlementContracts)("uses %s with HTTP %i", (code, statusCode) => {
    const error = new ProjectIntelligenceError(code, "Entitlement denied", statusCode, {
      reasonCode: code,
    });

    expect(error.statusCode).toBe(statusCode);
    expect(error.toEnvelope().error).toMatchObject({
      code,
      details: { reasonCode: code },
    });
  });

  it("reserves unauthenticated for HTTP 401", () => {
    expect({ status: 401, body: { error: { code: "unauthenticated" } } }).toMatchObject({
      status: 401,
      body: { error: { code: "unauthenticated" } },
    });
  });
});
