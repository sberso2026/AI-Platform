import { describe, expect, it } from "vitest";

import {
  parseUninstallError,
  parseUninstallSuccess,
  UNINSTALL_ERROR_CODES,
} from "./lib/uninstall-contract.js";

describe("uninstall response contract parsers", () => {
  it("parses success response", () => {
    const parsed = parseUninstallSuccess({
      data: {
        id: "11111111-1111-4111-8111-111111111111",
        status: "uninstalled",
        tenant_id: "22222222-2222-4222-8222-222222222222",
        product_id: "33333333-3333-4333-8333-333333333333",
        subscription_id: "44444444-4444-4444-8444-444444444444",
        installed_version: "1.0.0",
      },
    });
    expect(parsed.data.status).toBe("uninstalled");
  });

  it("parses error response", () => {
    const parsed = parseUninstallError({
      error: "Dependent applications must be uninstalled first",
      code: UNINSTALL_ERROR_CODES.ACTIVE_DEPENDENCIES_EXIST,
    });
    expect(parsed.code).toBe("active_dependencies_exist");
  });
});
