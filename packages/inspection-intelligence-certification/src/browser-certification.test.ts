/**
 * Browser certification for Phase 9F — source-level markers + Playwright suite presence.
 */
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

describe("Phase 9F browser certification (source)", () => {
  it("covers mobile-ready markers and field surfaces", () => {
    const overview = readFileSync(
      resolve(
        ROOT,
        "apps/web/src/app/(platform)/engineering/apps/inspection-intelligence/page.tsx",
      ),
      "utf8",
    );
    expect(overview).toContain("inspection-intelligence-operational-workflows-ready");
    expect(overview).toContain("inspection-intelligence-mobile-ready");
    for (const page of [
      "templates",
      "plans",
      "sessions",
      "review",
      "defects",
      "actions",
      "workflows",
      "assignments",
      "my-work",
      "field",
    ]) {
      const text = readFileSync(
        resolve(
          ROOT,
          `apps/web/src/app/(platform)/engineering/apps/inspection-intelligence/${page}/page.tsx`,
        ),
        "utf8",
      );
      expect(text).toMatch(/data-testid="inspection-/);
    }
    const shell = readFileSync(
      resolve(ROOT, "apps/web/src/components/engineering/inspection-intelligence-shell.tsx"),
      "utf8",
    );
    expect(shell).toContain("data-touch-optimized");
    expect(shell).toContain("data-offline-sync");

    const mobileSpec = resolve(
      ROOT,
      "packages/inspection-intelligence-certification/playwright/mobile-product.spec.ts",
    );
    expect(existsSync(mobileSpec)).toBe(true);
    const specText = readFileSync(mobileSpec, "utf8");
    expect(specText).toMatch(/390.*844|tablet|accessibility|landmark/i);
    expect(specText).toMatch(/768.*1024/);
  });
});
