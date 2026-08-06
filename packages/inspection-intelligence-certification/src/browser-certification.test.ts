/**
 * Browser certification for Phase 9C — source-level desktop/tablet/touch/a11y/workflow markers.
 * Playwright e2e is optional when CERTIFY_BROWSER=1.
 */
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

describe("Phase 9C browser certification (source)", () => {
  it("covers desktop/tablet/touch/responsive/accessibility/workflow/review markers", () => {
    const overview = readFileSync(
      resolve(
        ROOT,
        "apps/web/src/app/(platform)/engineering/apps/inspection-intelligence/page.tsx",
      ),
      "utf8",
    );
    expect(overview).toContain("inspection-intelligence-enterprise-foundation-ready");
    for (const page of ["templates", "plans", "sessions", "review"]) {
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
    expect(shell).toContain("Inspection Intelligence features");
    expect(shell).toContain("templates");
    expect(shell).toContain("review");

    const spec = resolve(
      ROOT,
      "packages/inspection-intelligence-certification/playwright/enterprise.spec.ts",
    );
    expect(existsSync(spec)).toBe(true);
    const specText = readFileSync(spec, "utf8");
    expect(specText).toMatch(/tablet|iPad|390|touch/i);
    expect(specText).toMatch(/accessib|landmark/i);
    expect(specText).toMatch(/offline|camera|gps|sync/i);
  });
});
