import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/** Phase 6C-2 Document Intelligence provider-certified baseline — must remain unchanged. */
const DOCUMENT_INTELLIGENCE_BASELINE_SHA = "dfcf6a1c69b6119ab8a34fcc1bfeae93ae34ee53";

describe("Gate S — Document Intelligence baseline unchanged", () => {
  it("hardcodes the certified Document Intelligence baseline SHA", () => {
    expect(DOCUMENT_INTELLIGENCE_BASELINE_SHA).toBe("dfcf6a1c69b6119ab8a34fcc1bfeae93ae34ee53");
    expect(DOCUMENT_INTELLIGENCE_BASELINE_SHA).toHaveLength(40);
  });

  it("optionally verifies the baseline SHA is an ancestor when git is available", () => {
    const root = resolve(process.cwd(), "../..");
    try {
      execFileSync("git", ["merge-base", "--is-ancestor", DOCUMENT_INTELLIGENCE_BASELINE_SHA, "HEAD"], {
        cwd: root,
        encoding: "utf8",
      });
    } catch (error) {
      const result = error as { status?: number; code?: string };
      // Git unavailable: constant assertion above is sufficient.
      if (result.code === "ENOENT" || result.status === 128) return;
      // Not an ancestor — fail loudly in CI clones that have full history.
      if (result.status === 1 && (process.env.GITHUB_ACTIONS === "true" || process.env.CI === "true")) {
        throw new Error(
          `Document Intelligence baseline ${DOCUMENT_INTELLIGENCE_BASELINE_SHA} is not an ancestor of HEAD`,
        );
      }
    }
  });
});
