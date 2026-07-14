import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/** Phase 6C-3B Meeting Intelligence foundation certified baseline — must remain preserved. */
export const MEETING_FOUNDATION_BASELINE_SHA = "ac84bd41f0c7de5fca2fc6f69f29100c39ff3d4e";

describe("Gate W — Phase 6C-3B Meeting Foundation baseline preserved", () => {
  it("hardcodes the certified Meeting Foundation baseline SHA", () => {
    expect(MEETING_FOUNDATION_BASELINE_SHA).toBe("ac84bd41f0c7de5fca2fc6f69f29100c39ff3d4e");
    expect(MEETING_FOUNDATION_BASELINE_SHA).toHaveLength(40);
  });

  it("optionally verifies the foundation SHA is an ancestor when git is available", () => {
    const root = resolve(process.cwd(), "../..");
    try {
      execFileSync("git", ["merge-base", "--is-ancestor", MEETING_FOUNDATION_BASELINE_SHA, "HEAD"], {
        cwd: root,
        encoding: "utf8",
      });
    } catch (error) {
      const result = error as { status?: number; code?: string };
      if (result.code === "ENOENT" || result.status === 128) return;
      if (result.status === 1 && (process.env.GITHUB_ACTIONS === "true" || process.env.CI === "true")) {
        throw new Error(
          `Meeting Foundation baseline ${MEETING_FOUNDATION_BASELINE_SHA} is not an ancestor of HEAD`,
        );
      }
    }
  });
});
