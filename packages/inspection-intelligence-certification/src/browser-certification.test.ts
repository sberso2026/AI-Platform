/**
 * Browser certification for Phase 9H — condition/predictive markers.
 */
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

describe("Phase 9H browser certification (source)", () => {
  it("covers condition-predictive markers and surfaces", () => {
    const overview = readFileSync(
      resolve(
        ROOT,
        "apps/web/src/app/(platform)/engineering/apps/inspection-intelligence/page.tsx",
      ),
      "utf8",
    );
    expect(overview).toContain("inspection-intelligence-condition-predictive-ready");
    expect(overview).toContain("inspection-intelligence-offline-sync-ready");
    for (const page of ["condition", "predictive", "sync", "field"]) {
      const text = readFileSync(
        resolve(
          ROOT,
          `apps/web/src/app/(platform)/engineering/apps/inspection-intelligence/${page}/page.tsx`,
        ),
        "utf8",
      );
      expect(text).toMatch(/data-testid="inspection-/);
    }
    const spec = resolve(
      ROOT,
      "packages/inspection-intelligence-certification/playwright/condition-predictive.spec.ts",
    );
    expect(existsSync(spec)).toBe(true);
  });
});
