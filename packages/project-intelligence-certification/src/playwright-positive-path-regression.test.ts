import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Phase 6C-1/6C-2 Playwright positive-path regression", () => {
  it("does not accept login or access denial as a positive PI outcome", () => {
    const specs = [
      readFileSync(resolve(process.cwd(), "playwright/project-intelligence.spec.ts"), "utf8"),
      readFileSync(resolve(process.cwd(), "playwright/documents.spec.ts"), "utf8"),
    ];

    for (const spec of specs) {
      expect(spec).not.toMatch(/\/Sign in\|Access denied\/i/);
      expect(spec).not.toMatch(/\/Access denied\|Sign in\/i/);
    }
  });
});
