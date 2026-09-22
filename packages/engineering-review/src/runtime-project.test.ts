import { describe, expect, it } from "vitest";
import {
  REVIEW_EOS_PROJECT_REF,
  REVIEW_STAGING_PROJECT_REF,
  evaluateReviewRuntime,
  supabaseProjectRefFromJwt,
  supabaseProjectRefFromUrl,
} from "./runtime-project";

function unsignedJwt(payload: Record<string, unknown>) {
  const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${header}.${body}.x`;
}

describe("Review staging project-ref validation", () => {
  it("extracts the Supabase project ref from a canonical URL", () => {
    expect(supabaseProjectRefFromUrl(`https://${REVIEW_STAGING_PROJECT_REF}.supabase.co`)).toBe(
      REVIEW_STAGING_PROJECT_REF,
    );
    expect(supabaseProjectRefFromUrl(`https://${REVIEW_EOS_PROJECT_REF}.supabase.co/`)).toBe(REVIEW_EOS_PROJECT_REF);
    expect(supabaseProjectRefFromUrl("not-a-url")).toBeNull();
    expect(supabaseProjectRefFromUrl("")).toBeNull();
  });

  it("fails closed when staging runtime is pointed at EOS or a mismatched project", () => {
    expect(
      evaluateReviewRuntime({
        url: `https://${REVIEW_EOS_PROJECT_REF}.supabase.co`,
        runtime: "staging",
      }),
    ).toEqual({ ok: false, reason: "eos_forbidden" });
    expect(
      evaluateReviewRuntime({
        url: "https://otherprojectrefxxxx.supabase.co",
        runtime: "staging",
      }),
    ).toEqual({ ok: false, reason: "staging_mismatch" });
    expect(evaluateReviewRuntime({ url: "", runtime: "staging" })).toEqual({
      ok: false,
      reason: "missing_url",
    });
  });

  it("accepts the staging project for staging runtime and does not force EOS production", () => {
    expect(
      evaluateReviewRuntime({
        url: `https://${REVIEW_STAGING_PROJECT_REF}.supabase.co`,
        runtime: "staging",
      }),
    ).toEqual({ ok: true, projectRef: REVIEW_STAGING_PROJECT_REF });
    expect(
      evaluateReviewRuntime({
        url: `https://${REVIEW_EOS_PROJECT_REF}.supabase.co`,
        runtime: "production",
      }),
    ).toEqual({ ok: true, projectRef: REVIEW_EOS_PROJECT_REF });
  });

  it("fails closed when a JWT credential ref does not match the staging URL", () => {
    expect(supabaseProjectRefFromJwt(unsignedJwt({ ref: REVIEW_EOS_PROJECT_REF }))).toBe(REVIEW_EOS_PROJECT_REF);
    expect(supabaseProjectRefFromJwt("sb_publishable_not_a_jwt")).toBeNull();
    expect(
      evaluateReviewRuntime({
        url: `https://${REVIEW_STAGING_PROJECT_REF}.supabase.co`,
        runtime: "staging",
        serviceRoleKey: unsignedJwt({ ref: REVIEW_EOS_PROJECT_REF }),
      }),
    ).toEqual({ ok: false, reason: "eos_forbidden" });
    expect(
      evaluateReviewRuntime({
        url: `https://${REVIEW_STAGING_PROJECT_REF}.supabase.co`,
        runtime: "staging",
        anonKey: unsignedJwt({ ref: "otherprojectrefxxxx" }),
      }),
    ).toEqual({ ok: false, reason: "staging_mismatch" });
  });
});
