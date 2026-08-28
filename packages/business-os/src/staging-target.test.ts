import { afterEach, describe, expect, it, vi } from "vitest";
import {
  BosLiveRlsEnvironmentError,
  BosStagingTargetError,
  assessBosLiveRlsEnvironment,
  assessBosStagingTarget,
  bosStagingTargetAvailable,
  liveRlsEnvironmentAvailable,
} from "./release";

const TARGET_AND_LIVE_KEYS = [
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

function clearTargetEnv() {
  for (const key of TARGET_AND_LIVE_KEYS) {
    vi.stubEnv(key, "");
    delete process.env[key];
  }
}

function stubValidTarget(overrides: Record<string, string> = {}) {
  clearTargetEnv();
  const values = {
    BOS_STAGING_PROJECT_REF: STAGING_REF,
    SUPABASE_TEST_URL: `https://${STAGING_REF}.supabase.co`,
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

describe("BOS staging target validation", () => {
  it("treats absent target configuration as unavailable", () => {
    clearTargetEnv();
    expect(assessBosStagingTarget()).toEqual({
      status: "unavailable",
      reason: "no_staging_target_configuration",
    });
    expect(bosStagingTargetAvailable()).toBe(false);
  });

  it("does not treat service-role presence as a staging target", () => {
    clearTargetEnv();
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service-role-fixture");
    expect(assessBosStagingTarget().status).toBe("unavailable");
    expect(bosStagingTargetAvailable()).toBe(false);
  });

  it("fails closed when only BOS_STAGING_PROJECT_REF is present", () => {
    clearTargetEnv();
    vi.stubEnv("BOS_STAGING_PROJECT_REF", STAGING_REF);
    expect(() => bosStagingTargetAvailable()).toThrow(BosStagingTargetError);
    expect(() => bosStagingTargetAvailable()).toThrow(/incomplete/);
    expect(() => bosStagingTargetAvailable()).toThrow(/missing=SUPABASE_TEST_URL/);
  });

  it("fails closed when only SUPABASE_TEST_URL is present", () => {
    clearTargetEnv();
    vi.stubEnv("SUPABASE_TEST_URL", `https://${STAGING_REF}.supabase.co`);
    expect(() => bosStagingTargetAvailable()).toThrow(BosStagingTargetError);
    expect(() => bosStagingTargetAvailable()).toThrow(/incomplete/);
    expect(() => bosStagingTargetAvailable()).toThrow(/missing=BOS_STAGING_PROJECT_REF/);
  });

  it("accepts a valid HTTPS hostname matching BOS_STAGING_PROJECT_REF", () => {
    stubValidTarget();
    expect(bosStagingTargetAvailable()).toBe(true);
    expect(assessBosStagingTarget()).toEqual({
      status: "available",
      projectRef: STAGING_REF,
      hostname: `${STAGING_REF}.supabase.co`,
    });
  });

  it("fails closed on a malformed project ref", () => {
    stubValidTarget({ BOS_STAGING_PROJECT_REF: "BOS_STAGING_REF" });
    expect(() => bosStagingTargetAvailable()).toThrow(BosStagingTargetError);
    expect(() => bosStagingTargetAvailable()).toThrow(/malformed/);
  });

  it("fails closed on a malformed SUPABASE_TEST_URL without printing secrets", () => {
    stubValidTarget({ SUPABASE_TEST_URL: "not a url" });
    expect(() => bosStagingTargetAvailable()).toThrow(BosStagingTargetError);
    try {
      bosStagingTargetAvailable();
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      expect(message).toMatch(/rejected|malformed/i);
      expect(message).not.toMatch(/anon-fixture|jwt-a|eyJ|service_role|password/i);
    }
  });

  it("fails closed on HTTP URL", () => {
    stubValidTarget({ SUPABASE_TEST_URL: `http://${STAGING_REF}.supabase.co` });
    expect(() => bosStagingTargetAvailable()).toThrow(/HTTPS/);
  });

  it("fails closed on a non-Supabase host", () => {
    stubValidTarget({ SUPABASE_TEST_URL: `https://${STAGING_REF}.example.com` });
    expect(() => bosStagingTargetAvailable()).toThrow(/mismatch/);
  });

  it("fails closed on URL/ref mismatch without using the shared certification project as a target", () => {
    stubValidTarget({
      BOS_STAGING_PROJECT_REF: STAGING_REF,
      SUPABASE_TEST_URL: "https://wcydlhqiqdwgoaqrlget.supabase.co",
    });
    expect(() => bosStagingTargetAvailable()).toThrow(/mismatch/);
  });

  it("rejects URL userinfo without exposing credentials", () => {
    stubValidTarget({
      SUPABASE_TEST_URL: `https://user:super-secret-password@${STAGING_REF}.supabase.co`,
    });
    try {
      bosStagingTargetAvailable();
      throw new Error("expected fail-closed target validation");
    } catch (error) {
      expect(error).toBeInstanceOf(BosStagingTargetError);
      const message = error instanceof Error ? error.message : "";
      expect(message).toMatch(/rejected/i);
      expect(message).not.toContain("super-secret-password");
      expect(message).not.toContain("user:");
    }
  });

  it("does not require live-RLS identities for a valid staging target", () => {
    stubValidTarget();
    expect(bosStagingTargetAvailable()).toBe(true);
    expect(() => liveRlsEnvironmentAvailable()).toThrow(BosLiveRlsEnvironmentError);
    expect(() => liveRlsEnvironmentAvailable()).toThrow(/incomplete/);
    expect(() => liveRlsEnvironmentAvailable()).toThrow(/missing=SUPABASE_TEST_ANON_KEY/);
  });
});

describe("BOS live RLS reuses staging target validation", () => {
  it("returns the same proven project ref and hostname as the target helper", () => {
    stubValidTarget({
      SUPABASE_TEST_ANON_KEY: "anon-fixture",
      BOS_RLS_TENANT_A_JWT: "jwt-a",
      BOS_RLS_TENANT_B_JWT: "jwt-b",
      BOS_RLS_TENANT_B_ID: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    });
    const target = assessBosStagingTarget();
    const live = assessBosLiveRlsEnvironment();
    expect(target).toEqual({
      status: "available",
      projectRef: STAGING_REF,
      hostname: `${STAGING_REF}.supabase.co`,
    });
    expect(live).toEqual(target);
    expect(liveRlsEnvironmentAvailable()).toBe(true);
  });
});
