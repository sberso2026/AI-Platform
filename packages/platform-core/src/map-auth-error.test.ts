import { describe, it, expect, vi, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { AUTH_ERROR_MESSAGES, describeSignupAuthResult, logAuthError, mapAuthError } from "./map-auth-error";

describe("mapAuthError", () => {
  it("maps Invalid login credentials to a friendly sign-in message", () => {
    expect(mapAuthError({ message: "Invalid login credentials" })).toBe(
      AUTH_ERROR_MESSAGES.invalidCredentials
    );
    expect(mapAuthError({ code: "invalid_credentials" })).toBe(
      AUTH_ERROR_MESSAGES.invalidCredentials
    );
    expect(mapAuthError({ message: "Invalid login credentials", status: 400 })).toBe(
      AUTH_ERROR_MESSAGES.invalidCredentials
    );
  });

  it("maps user-not-found style errors to account/password guidance", () => {
    expect(mapAuthError({ message: "User not found" })).toBe(
      AUTH_ERROR_MESSAGES.accountOrPassword
    );
  });

  it("maps missing email", () => {
    expect(mapAuthError({ message: "Email is required" })).toBe(
      AUTH_ERROR_MESSAGES.missingEmail
    );
  });

  it("maps missing password", () => {
    expect(mapAuthError({ message: "Password is required" })).toBe(
      AUTH_ERROR_MESSAGES.missingPassword
    );
  });

  it("maps weak password", () => {
    expect(mapAuthError({ message: "Password should be at least 8 characters" })).toBe(
      AUTH_ERROR_MESSAGES.weakPassword
    );
    expect(mapAuthError({ code: "weak_password" })).toBe(AUTH_ERROR_MESSAGES.weakPassword);
  });

  it("maps already-registered signup conflicts", () => {
    expect(mapAuthError({ message: "User already registered" }, "signup")).toBe(
      AUTH_ERROR_MESSAGES.emailTaken
    );
  });

  it("does not map signup email_address_invalid to sign-in credentials", () => {
    expect(
      mapAuthError(
        { message: 'Email address "silvestre.berso@rtbea.com.au" is invalid', status: 400, code: "email_address_invalid" },
        "signup",
      ),
    ).toBe(AUTH_ERROR_MESSAGES.signupEmailInvalid);
    expect(
      mapAuthError({ message: 'Email address "a@b.com" is invalid', status: 400 }, "signup"),
    ).not.toBe(AUTH_ERROR_MESSAGES.invalidCredentials);
  });

  it("maps signup not-authorized and rate-limit without credential copy", () => {
    expect(
      mapAuthError({ code: "email_address_not_authorized", message: "email address not authorized" }, "signup"),
    ).toBe(AUTH_ERROR_MESSAGES.signupEmailNotAuthorized);
    expect(mapAuthError({ status: 429, message: "over_email_send_rate_limit" }, "signup")).toBe(
      AUTH_ERROR_MESSAGES.rateLimited,
    );
  });

  it("keeps invalid credentials mapping on sign-in only", () => {
    expect(mapAuthError({ message: "Invalid login credentials", status: 400 }, "signin")).toBe(
      AUTH_ERROR_MESSAGES.invalidCredentials,
    );
  });

  it("falls back for unknown auth errors without exposing raw text", () => {
    const mapped = mapAuthError({ message: "JWT secret mismatch XYZ-INTERNAL" });
    expect(mapped).toBe(AUTH_ERROR_MESSAGES.fallback);
    expect(mapped).not.toContain("JWT");
    expect(mapped).not.toContain("XYZ");
  });

  it("falls back for empty / null errors", () => {
    expect(mapAuthError(null)).toBe(AUTH_ERROR_MESSAGES.fallback);
    expect(mapAuthError({})).toBe(AUTH_ERROR_MESSAGES.fallback);
  });

  it("never returns the raw invalid credentials provider string", () => {
    const mapped = mapAuthError({ message: "Invalid login credentials" });
    expect(mapped.toLowerCase()).not.toBe("invalid login credentials");
  });

  it("logs auth diagnostics as a string without console.error", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);

    logAuthError("signin", {
      name: "AuthApiError",
      message: "Invalid login credentials",
      status: 400,
      code: "invalid_credentials",
    });

    expect(error).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0]?.[0])).toContain("[auth:signin]");
    expect(String(warn.mock.calls[0]?.[0])).toContain("Invalid login credentials");
    // Must not pass the Error-like object as a second arg (triggers overlays)
    expect(warn.mock.calls[0]?.length).toBe(1);

    warn.mockRestore();
    error.mockRestore();
  });
});

describe("describeSignupAuthResult", () => {
  it("treats empty identities without a session as an existing account", () => {
    expect(describeSignupAuthResult({ user: { identities: [] }, session: null })).toEqual({
      kind: "existing",
      message: AUTH_ERROR_MESSAGES.emailTaken,
    });
  });

  it("asks for email confirmation when Auth returns a user without a session", () => {
    expect(
      describeSignupAuthResult({ user: { identities: [{ provider: "email" }] }, session: null }),
    ).toEqual({
      kind: "pending_confirmation",
      message: AUTH_ERROR_MESSAGES.signupCreatedConfirmEmail,
    });
  });

  it("reports success when a session is established", () => {
    expect(
      describeSignupAuthResult({ user: { identities: [{ provider: "email" }] }, session: { access_token: "x" } }),
    ).toEqual({
      kind: "session",
      message: AUTH_ERROR_MESSAGES.signupCreatedSession,
    });
  });
});

describe("signup page contract", () => {
  it("derives success copy from Auth state and does not hard-code credential errors", () => {
    const signup = readFileSync(
      resolve(dirname(fileURLToPath(import.meta.url)), "../../../apps/web/src/app/(auth)/signup/page.tsx"),
      "utf8",
    );
    expect(signup).toContain("describeSignupAuthResult");
    expect(signup).toContain('mapAuthError(authError, "signup")');
    expect(signup).not.toContain("then sign in.");
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});
