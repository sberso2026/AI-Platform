import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  II_HOSTED_PERSISTENCE_WIRED,
  INSPECTION_HOSTED_TABLE_MAPPING,
  INSPECTION_INTELLIGENCE_II_1_IMPLEMENTED,
  SCHEMA_CHANGED,
} from "@rtb/inspection-intelligence";

const ROOT = resolve(import.meta.dirname, "../../..");

describe("II-1 hosted persistence certification", () => {
  it("records hosted wiring over existing inspection_* tables", () => {
    expect(INSPECTION_INTELLIGENCE_II_1_IMPLEMENTED).toBe(true);
    expect(II_HOSTED_PERSISTENCE_WIRED).toBe(true);
    expect(SCHEMA_CHANGED).toBe(false);
    expect(INSPECTION_HOSTED_TABLE_MAPPING.plans).toBe("inspection_plans");
    expect(INSPECTION_HOSTED_TABLE_MAPPING.sessions).toBe("inspection_sessions");
    expect(
      existsSync(
        resolve(ROOT, "apps/web/src/app/api/engineering/inspection-intelligence/hosted/route.ts"),
      ),
    ).toBe(true);
    expect(
      existsSync(
        resolve(ROOT, "packages/inspection-intelligence-certification/scripts/run-phase9k-certification.ts"),
      ),
    ).toBe(true);
    const slice = readFileSync(
      resolve(ROOT, "apps/web/src/app/api/engineering/inspection-intelligence/slice/route.ts"),
      "utf8",
    );
    expect(slice).toContain("runVerticalSliceHappyPath");
  });
});
