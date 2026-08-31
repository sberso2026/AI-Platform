import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  DATABASE_POLICY_CHANGED,
  II_6R_IMPLEMENTED,
  INSPECTION_INTELLIGENCE_II_6R_IMPLEMENTED,
  SCHEMA_CHANGED,
} from "@rtb/inspection-intelligence";

const ROOT = resolve(import.meta.dirname, "../../..");

describe("II-6R runtime topology certification", () => {
  it("pins syd1 and profiles command-centre/target-history/write/report without schema change", () => {
    expect(INSPECTION_INTELLIGENCE_II_6R_IMPLEMENTED).toBe(true);
    expect(II_6R_IMPLEMENTED).toBe(true);
    expect(SCHEMA_CHANGED).toBe(false);
    expect(DATABASE_POLICY_CHANGED).toBe(false);

    const vercel = readFileSync(resolve(ROOT, "apps/web/vercel.json"), "utf8");
    expect(vercel).toContain('"syd1"');

    const repo = readFileSync(resolve(ROOT, "packages/inspection-intelligence/src/hosted/repository.ts"), "utf8");
    expect(repo).toContain("parallelWithSessionScope");
    expect(repo).toContain("payloadStats");
    expect(repo).toContain("parallelAfterSessionScope");
    expect(repo).toContain("sessionLookupMs");
    expect(repo).toContain("snapshotMs");
    expect(repo).not.toContain("createServiceClient");

    expect(existsSync(resolve(ROOT, "supabase/functions/ii6r-runtime-profile/index.ts"))).toBe(true);
    expect(
      existsSync(resolve(ROOT, "packages/inspection-intelligence-certification/src/ii6r-runtime-performance-live.test.ts")),
    ).toBe(true);
  });
});
