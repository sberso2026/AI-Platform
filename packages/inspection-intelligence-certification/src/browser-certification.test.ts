/**
 * Browser certification for Phase 9G — offline sync markers + Playwright suite presence.
 */
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

describe("Phase 9G browser certification (source)", () => {
  it("covers offline-sync-ready markers and sync surface", () => {
    const overview = readFileSync(
      resolve(
        ROOT,
        "apps/web/src/app/(platform)/engineering/apps/inspection-intelligence/page.tsx",
      ),
      "utf8",
    );
    expect(overview).toContain("inspection-intelligence-mobile-ready");
    expect(overview).toContain("inspection-intelligence-offline-sync-ready");
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
      "sync",
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
    expect(shell).toContain('data-offline-sync="true"');

    const offlineSpec = resolve(
      ROOT,
      "packages/inspection-intelligence-certification/playwright/offline-sync.spec.ts",
    );
    expect(existsSync(offlineSpec)).toBe(true);
    expect(readFileSync(offlineSpec, "utf8")).toMatch(/390.*844|offline|permanently offline/i);
  });
});
