import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  CANONICAL_AUTH_RECOVERY_PATH,
  buildAuthRecoveryRedirect,
} from "./canonical-auth-origin";
import { AUTH_ERROR_MESSAGES, mapAuthError } from "./map-auth-error";

const PILOT = "https://eos-pilot.rtbea.com.au";
const webRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../../apps/web/src/app/(auth)");

describe("password recovery contract", () => {
  it("targets the custom-domain reset path", () => {
    expect(CANONICAL_AUTH_RECOVERY_PATH).toBe("/reset-password");
    expect(buildAuthRecoveryRedirect({ appUrl: PILOT })).toBe(`${PILOT}/reset-password`);
  });

  it("maps recovery rate limits without exposing provider text", () => {
    expect(mapAuthError({ status: 429, message: "over_email_send_rate_limit" }, "reset")).toBe(
      AUTH_ERROR_MESSAGES.rateLimited,
    );
    expect(AUTH_ERROR_MESSAGES.recoveryDispatched.toLowerCase()).toContain("if an account exists");
  });

  it("keeps recovery pages on the canonical Auth stack", () => {
    const forgot = readFileSync(resolve(webRoot, "forgot-password/page.tsx"), "utf8");
    const reset = readFileSync(resolve(webRoot, "reset-password/page.tsx"), "utf8");
    expect(forgot).toContain("resetPasswordForEmail");
    expect(forgot).toContain("buildAuthRecoveryRedirect");
    expect(reset).toContain("PASSWORD_RECOVERY");
    expect(reset).toContain("updateUser");
    expect(forgot).not.toContain("temporaryPassword");
    expect(reset).not.toContain("breakGlass");
  });
});
