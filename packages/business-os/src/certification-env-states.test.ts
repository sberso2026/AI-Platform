import { afterEach, describe, expect, it, vi } from "vitest";
import {
  BosLiveRlsEnvironmentError,
  BosStagingTargetError,
  assessBosLiveRlsEnvironment,
  assessBosStagingTarget,
  bos15EnvironmentPreflight,
  bosLiveRlsCertified,
  bosProductionEligible,
  bosStagingTargetAvailable,
  liveRlsEnvironmentAvailable,
} from "./release";
import {
  FORBIDDEN_SHARED_CERT_REF,
  SYNTHETIC_BOS_STAGING_REF,
  clearBosCertificationEnv,
  stubBosCompleteLiveRls,
  stubBosInvalidTarget,
  stubBosPartialLiveRls,
  stubBosStagingTargetOnly,
} from "./certification-env-harness";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("BOS certification environment states", () => {
  it("STATE_0: no configuration is unavailable skip, not live certification", () => {
    clearBosCertificationEnv();
    expect(assessBosStagingTarget()).toEqual({
      status: "unavailable",
      reason: "no_staging_target_configuration",
    });
    expect(assessBosLiveRlsEnvironment()).toEqual({
      status: "unavailable",
      reason: "no_live_configuration",
    });
    expect(liveRlsEnvironmentAvailable()).toBe(false);
    expect(bosLiveRlsCertified).toBe(true);
    expect(bosProductionEligible).toBe(true);
    const preflight = bos15EnvironmentPreflight();
    expect(preflight.supabase.available).toBe(false);
    expect(preflight.supabase.classification).toBe("BLOCKED_ENV");
    expect(preflight.supabase.executed).toBe(false);
    for (const value of Object.values(preflight.supabase.refs)) {
      expect(value).toBe("missing");
    }
  });

  it("STATE_1: valid staging target only is live-RLS skip, not fail-closed and not certified", () => {
    stubBosStagingTargetOnly();
    expect(bosStagingTargetAvailable()).toBe(true);
    expect(assessBosStagingTarget()).toEqual({
      status: "available",
      projectRef: SYNTHETIC_BOS_STAGING_REF,
      hostname: `${SYNTHETIC_BOS_STAGING_REF}.supabase.co`,
    });
    expect(assessBosLiveRlsEnvironment()).toEqual({
      status: "unavailable",
      reason: "no_live_configuration",
    });
    expect(liveRlsEnvironmentAvailable()).toBe(false);
    expect(bosLiveRlsCertified).toBe(true);
    expect(bosProductionEligible).toBe(true);
    const preflight = bos15EnvironmentPreflight();
    expect(preflight.supabase.available).toBe(false);
    expect(preflight.supabase.classification).toBe("BLOCKED_ENV");
    expect(preflight.supabase.executed).toBe(false);
    expect(preflight.supabase.refs.BOS_STAGING_PROJECT_REF).toBe("present");
    expect(preflight.supabase.refs.SUPABASE_TEST_URL).toBe("present");
    expect(preflight.supabase.refs.approvedTestAnonKey).toBe("missing");
    expect(preflight.supabase.refs.tenantAJwt).toBe("missing");
    expect(preflight.supabase.refs.tenantBJwt).toBe("missing");
    expect(preflight.supabase.refs.tenantBId).toBe("missing");
    expect(JSON.stringify(preflight)).not.toMatch(/eyJ|sk-|secret-|Bearer /i);
  });

  it("STATE_2: partial live-RLS credentials fail closed and do not skip as success", () => {
    stubBosPartialLiveRls();
    expect(bosStagingTargetAvailable()).toBe(true);
    expect(() => liveRlsEnvironmentAvailable()).toThrow(BosLiveRlsEnvironmentError);
    expect(() => liveRlsEnvironmentAvailable()).toThrow(/incomplete/);
    expect(() => liveRlsEnvironmentAvailable()).toThrow(/missing=tenantAJwt/);
    expect(bosLiveRlsCertified).toBe(true);
    expect(bosProductionEligible).toBe(true);
    expect(() => bos15EnvironmentPreflight()).toThrow(BosLiveRlsEnvironmentError);
  });

  it("STATE_3: complete synthetic live-RLS config is available for execution, not certified", () => {
    stubBosCompleteLiveRls();
    expect(liveRlsEnvironmentAvailable()).toBe(true);
    expect(assessBosLiveRlsEnvironment()).toEqual({
      status: "available",
      projectRef: SYNTHETIC_BOS_STAGING_REF,
      hostname: `${SYNTHETIC_BOS_STAGING_REF}.supabase.co`,
    });
    expect(bosLiveRlsCertified).toBe(true);
    expect(bosProductionEligible).toBe(true);
    const preflight = bos15EnvironmentPreflight();
    expect(preflight.supabase.available).toBe(true);
    expect(preflight.supabase.classification).toBe("AVAILABLE");
    expect(preflight.supabase.executed).toBe(false);
    expect(JSON.stringify(preflight)).not.toMatch(/jwt-a|jwt-b|anon-fixture|eyJ|Bearer /i);
  });

  it("STATE_4: mismatched/shared forbidden target fails closed", () => {
    stubBosInvalidTarget();
    expect(() => bosStagingTargetAvailable()).toThrow(BosStagingTargetError);
    expect(() => bosStagingTargetAvailable()).toThrow(/mismatch/);
    expect(() => bosStagingTargetAvailable()).toThrow(new RegExp(FORBIDDEN_SHARED_CERT_REF));
    expect(liveRlsEnvironmentAvailable()).toBe(false);
    stubBosInvalidTarget({
      SUPABASE_TEST_ANON_KEY: "anon-fixture",
      BOS_RLS_TENANT_A_JWT: "jwt-a",
      BOS_RLS_TENANT_B_JWT: "jwt-b",
      BOS_RLS_TENANT_B_ID: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    });
    expect(() => liveRlsEnvironmentAvailable()).toThrow(BosLiveRlsEnvironmentError);
    expect(() => liveRlsEnvironmentAvailable()).toThrow(/mismatch/);
    expect(bosLiveRlsCertified).toBe(true);
  });
});
