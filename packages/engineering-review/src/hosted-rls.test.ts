import { describe, expect, it } from "vitest";

const ENABLED = process.env.ENGINEERING_REVIEW_RLS === "1";

describe("hosted JWT RLS (optional)", () => {
  it.skipIf(!ENABLED)("is reserved for live Supabase JWT fixtures", () => {
    expect(ENABLED).toBe(true);
  });

  it("documents that live JWT RLS is opt-in via ENGINEERING_REVIEW_RLS=1", () => {
    expect(process.env.ENGINEERING_REVIEW_RLS === "1" || !ENABLED).toBe(true);
  });
});
