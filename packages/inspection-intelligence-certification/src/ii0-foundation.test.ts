import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  INSPECTION_INTELLIGENCE_V1_CERTIFICATION_TAG,
  INSPECTION_INTELLIGENCE_V1_CERTIFIED_COMMIT,
  SCHEMA_CHANGED,
  INSPECTION_V1_REPLACEMENT_MODELS_CREATED,
} from "@rtb/inspection-intelligence";
import {
  II_0_BUILDS_ON_HISTORICAL_PHASES,
  II_0_CERTIFICATION_PHASE,
  II_0_NEXT_GEN_FOUNDATION_GATES,
} from "./ii0/gates";

const ROOT = resolve(import.meta.dirname, "../../..");
const HISTORICAL = "d47c4ffa4c7147d3e2053b0764dfe5c80b56eb09";
const BASELINE = "6738e25272a35e979b051621414a753be93529aa";

function git(cmd: string): string {
  return execSync(cmd, { cwd: ROOT, encoding: "utf8" }).trim();
}

describe("II-0 certification foundation", () => {
  it("keeps historical V1 GA tag on the certified commit", () => {
    expect(INSPECTION_INTELLIGENCE_V1_CERTIFICATION_TAG).toBe("inspection-intelligence-v1.0.0");
    expect(INSPECTION_INTELLIGENCE_V1_CERTIFIED_COMMIT).toBe(HISTORICAL);
    expect(git("git rev-list -n 1 inspection-intelligence-v1.0.0")).toBe(HISTORICAL);
  });

  it("does not replace 9A-9K certification scripts or phase names", () => {
    expect(II_0_CERTIFICATION_PHASE).toBe("II-0");
    expect(II_0_BUILDS_ON_HISTORICAL_PHASES).toBe("9A-9K");
    expect(II_0_NEXT_GEN_FOUNDATION_GATES).toHaveLength(11);
    expect(
      existsSync(
        resolve(ROOT, "packages/inspection-intelligence-certification/scripts/run-phase9k-certification.ts"),
      ),
    ).toBe(true);
    expect(
      existsSync(resolve(ROOT, "docs/architecture/INSPECTION_INTELLIGENCE_PHASE_9K_V1_GA.md")),
    ).toBe(true);
    const version = readFileSync(
      resolve(ROOT, "packages/inspection-intelligence/src/version.ts"),
      "utf8",
    );
    expect(version).toMatch(/INSPECTION_INTELLIGENCE_V1_CERTIFICATION_VERSION = "1\.0\.0"/);
    expect(
      existsSync(
        resolve(ROOT, "packages/inspection-intelligence-certification/src/phase9a/gates.ts"),
      ),
    ).toBe(true);
  });

  it("records no schema change and no V1 replacement models", () => {
    expect(SCHEMA_CHANGED).toBe(false);
    expect(INSPECTION_V1_REPLACEMENT_MODELS_CREATED).toBe(false);
    const migrationDiff = git(`git diff --name-only ${BASELINE} -- supabase/migrations`);
    expect(migrationDiff).toBe("");
  });
});
