/**
 * Browser certification for Phase 9K — V1 GA markers.
 */
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

describe("Phase 9K browser certification (source)", () => {
  it("covers v1 and prior markers", () => {
    const overview = readFileSync(
      resolve(
        ROOT,
        "apps/web/src/app/(platform)/engineering/apps/inspection-intelligence/release/page.tsx",
      ),
      "utf8",
    );
    expect(overview).toContain("inspection-intelligence-v1-ready");
    expect(overview).toContain("inspection-intelligence-release-ready");
    expect(overview).toContain("inspection-intelligence-ai-vision-ready");
    expect(overview).toContain("inspection-intelligence-mobile-ready");
    for (const page of ["release", "vision", "condition", "predictive", "sync"]) {
      expect(
        existsSync(
          resolve(
            ROOT,
            `apps/web/src/app/(platform)/engineering/apps/inspection-intelligence/${page}/page.tsx`,
          ),
        ),
      ).toBe(true);
    }
    expect(
      existsSync(
        resolve(ROOT, "packages/inspection-intelligence-certification/playwright/v1-ga.spec.ts"),
      ),
    ).toBe(true);
  });
});
