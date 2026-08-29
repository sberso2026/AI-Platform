import { afterEach, describe, expect, it, vi } from "vitest";
import {
  BosLiveRlsEnvironmentError,
  assessBosLiveRlsEnvironment,
  assessBosStagingTarget,
  liveRlsEnvironmentAvailable,
} from "./release";

const LIVE_KEYS = [
  "BOS_STAGING_PROJECT_REF",
  "SUPABASE_TEST_URL",
  "SUPABASE_TEST_ANON_KEY",
  "BOS_RLS_TENANT_A_JWT",
  "COMMERCE_RLS_TENANT_A_JWT",
  "BOS_RLS_TENANT_B_JWT",
  "COMMERCE_RLS_TENANT_B_JWT",
  "BOS_RLS_TENANT_A_ID",
  "COMMERCE_RLS_TENANT_A_ID",
  "BOS_RLS_TENANT_B_ID",
  "COMMERCE_RLS_TENANT_B_ID",
  "BOS_RLS_WORKSPACE_A_ID",
  "BOS_RLS_WORKSPACE_B_ID",
  "BOS_RLS_WORKSPACE_A_JWT",
  "BOS_RLS_WORKSPACE_B_JWT",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

const STAGING_REF = "bosstagingtesthost1";

function clearLiveEnv() {
  for (const key of LIVE_KEYS) {
    vi.stubEnv(key, "");
    delete process.env[key];
  }
}

function stubCompleteValidEnv(overrides: Record<string, string> = {}) {
  clearLiveEnv();
  const values = {
    BOS_STAGING_PROJECT_REF: STAGING_REF,
    SUPABASE_TEST_URL: `https://${STAGING_REF}.supabase.co`,
    SUPABASE_TEST_ANON_KEY: "anon-fixture",
    BOS_RLS_TENANT_A_JWT: "jwt-a",
    BOS_RLS_TENANT_B_JWT: "jwt-b",
    BOS_RLS_TENANT_B_ID: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    ...overrides,
  };
  for (const [key, value] of Object.entries(values)) {
    if (value === "") {
      vi.stubEnv(key, "");
      delete process.env[key];
    } else {
      vi.stubEnv(key, value);
    }
  }
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("BOS live RLS dedicated staging validation", () => {
  it("treats absent configuration as unavailable skip", () => {
    clearLiveEnv();
    expect(assessBosLiveRlsEnvironment()).toEqual({
      status: "unavailable",
      reason: "no_live_configuration",
    });
    expect(liveRlsEnvironmentAvailable()).toBe(false);
  });

  it("does not treat a staging-target-only URL as a live-RLS attempt", () => {
    clearLiveEnv();
    vi.stubEnv("SUPABASE_TEST_URL", `https://${STAGING_REF}.supabase.co`);
    expect(liveRlsEnvironmentAvailable()).toBe(false);
    expect(assessBosLiveRlsEnvironment().status).toBe("unavailable");
  });

  it("fails closed on partial live-RLS credentials without printing secrets", () => {
    stubCompleteValidEnv({
      BOS_RLS_TENANT_A_JWT: "",
      BOS_RLS_TENANT_B_JWT: "",
      BOS_RLS_TENANT_B_ID: "",
    });
    expect(() => liveRlsEnvironmentAvailable()).toThrow(BosLiveRlsEnvironmentError);
    try {
      liveRlsEnvironmentAvailable();
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      expect(message).toContain("incomplete");
      expect(message).toContain("missing=");
      expect(message).not.toMatch(/anon-fixture|jwt-a|eyJ|service_role/i);
    }
  });

  it("fails closed when BOS_STAGING_PROJECT_REF is omitted from an otherwise complete set", () => {
    stubCompleteValidEnv({ BOS_STAGING_PROJECT_REF: "" });
    expect(() => liveRlsEnvironmentAvailable()).toThrow(/BOS_STAGING_PROJECT_REF/);
  });

  it("fails closed on malformed SUPABASE_TEST_URL", () => {
    stubCompleteValidEnv({ SUPABASE_TEST_URL: "not a url" });
    expect(() => liveRlsEnvironmentAvailable()).toThrow(BosLiveRlsEnvironmentError);
    expect(() => liveRlsEnvironmentAvailable()).toThrow(/rejected|malformed|HTTPS|mismatch/i);
  });

  it("fails closed on HTTP URL", () => {
    stubCompleteValidEnv({ SUPABASE_TEST_URL: `http://${STAGING_REF}.supabase.co` });
    expect(() => liveRlsEnvironmentAvailable()).toThrow(/HTTPS/);
  });

  it("fails closed on non-Supabase host", () => {
    stubCompleteValidEnv({ SUPABASE_TEST_URL: `https://${STAGING_REF}.example.com` });
    expect(() => liveRlsEnvironmentAvailable()).toThrow(/mismatch/);
  });

  it("fails closed on project-ref mismatch", () => {
    stubCompleteValidEnv({
      BOS_STAGING_PROJECT_REF: STAGING_REF,
      SUPABASE_TEST_URL: "https://wcydlhqiqdwgoaqrlget.supabase.co",
    });
    expect(() => liveRlsEnvironmentAvailable()).toThrow(/mismatch/);
  });

  it("accepts complete matching staging env and commerce JWT aliases", () => {
    stubCompleteValidEnv({
      BOS_RLS_TENANT_A_JWT: "",
      BOS_RLS_TENANT_B_JWT: "",
      BOS_RLS_TENANT_B_ID: "",
      COMMERCE_RLS_TENANT_A_JWT: "jwt-a-alias",
      COMMERCE_RLS_TENANT_B_JWT: "jwt-b-alias",
      COMMERCE_RLS_TENANT_B_ID: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
    });
    expect(liveRlsEnvironmentAvailable()).toBe(true);
    expect(assessBosLiveRlsEnvironment()).toEqual({
      status: "available",
      projectRef: STAGING_REF,
      hostname: `${STAGING_REF}.supabase.co`,
    });
  });

  it("does not treat service-role presence as live RLS availability", () => {
    clearLiveEnv();
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service-role-fixture");
    expect(liveRlsEnvironmentAvailable()).toBe(false);
    expect(assessBosLiveRlsEnvironment().status).toBe("unavailable");
  });

  it("fails closed when a tenant JWT carries a privileged role", () => {
    const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url");
    const payload = Buffer.from(JSON.stringify({ role: "service_role" })).toString("base64url");
    stubCompleteValidEnv({ BOS_RLS_TENANT_A_JWT: `${header}.${payload}.sig` });
    expect(() => liveRlsEnvironmentAvailable()).toThrow(BosLiveRlsEnvironmentError);
    expect(() => liveRlsEnvironmentAvailable()).toThrow(/privileged credential/);
  });

  it("fails closed when a tenant JWT is replaced by the service-role key", () => {
    stubCompleteValidEnv({
      SUPABASE_SERVICE_ROLE_KEY: "service-role-fixture-key",
      BOS_RLS_TENANT_A_JWT: "service-role-fixture-key",
    });
    expect(() => liveRlsEnvironmentAvailable()).toThrow(BosLiveRlsEnvironmentError);
    expect(() => liveRlsEnvironmentAvailable()).toThrow(/privileged credential/);
    try {
      liveRlsEnvironmentAvailable();
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      expect(message).not.toContain("service-role-fixture-key");
    }
  });

  it("reuses a valid staging target then treats missing live-RLS identities as unavailable skip", () => {
    stubCompleteValidEnv();
    expect(assessBosStagingTarget()).toEqual(assessBosLiveRlsEnvironment());
    stubCompleteValidEnv({
      SUPABASE_TEST_ANON_KEY: "",
      BOS_RLS_TENANT_A_JWT: "",
      BOS_RLS_TENANT_B_JWT: "",
      BOS_RLS_TENANT_B_ID: "",
    });
    expect(assessBosStagingTarget().status).toBe("available");
    expect(assessBosLiveRlsEnvironment()).toEqual({
      status: "unavailable",
      reason: "no_live_configuration",
    });
    expect(liveRlsEnvironmentAvailable()).toBe(false);
  });
});
