/**
 * Browser certification for Phase 9J — module release markers.
 */
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

describe("Phase 9J browser certification (source)", () => {
  it("covers release and prior markers and surfaces", () => {
    const overview = readFileSync(
      resolve(
        ROOT,
        "apps/web/src/app/(platform)/engineering/apps/inspection-intelligence/page.tsx",
      ),
      "utf8",
    );
    expect(overview).toContain("inspection-intelligence-release-ready");
    expect(overview).toContain("inspection-intelligence-ai-vision-ready");
    expect(overview).toContain("inspection-intelligence-condition-predictive-ready");
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
        resolve(
          ROOT,
          "packages/inspection-intelligence-certification/playwright/module-release.spec.ts",
        ),
      ),
    ).toBe(true);
  });
});
