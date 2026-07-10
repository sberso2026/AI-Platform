import { describe, it, expect, vi, afterEach } from "vitest";
import { AUTH_ERROR_MESSAGES, logAuthError, mapAuthError } from "./map-auth-error";

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

afterEach(() => {
  vi.restoreAllMocks();
});
