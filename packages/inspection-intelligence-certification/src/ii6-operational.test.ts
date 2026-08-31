import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  AUTONOMOUS_CONDITION_CERTIFICATION_ENABLED,
  AUTONOMOUS_INSPECTION_APPROVAL_ENABLED,
  AUTONOMOUS_REMEDIATION_APPROVAL_ENABLED,
  DATABASE_POLICY_CHANGED,
  DUPLICATE_COMMAND_CENTRE_MODEL_DETECTED,
  DUPLICATE_ENGINEERING_TRUTH_MODEL_DETECTED,
  II_6_IMPLEMENTED,
  II_COMMAND_CENTRE_IMPLEMENTED,
  INSPECTION_INTELLIGENCE_II_6_IMPLEMENTED,
  SCHEMA_CHANGED,
} from "@rtb/inspection-intelligence";

const ROOT = resolve(import.meta.dirname, "../../..");

describe("II-6 Inspection Command Centre certification", () => {
  it("hosts Command Centre composition over existing inspection records without a new truth model", () => {
    expect(INSPECTION_INTELLIGENCE_II_6_IMPLEMENTED).toBe(true);
    expect(II_6_IMPLEMENTED).toBe(true);
    expect(II_COMMAND_CENTRE_IMPLEMENTED).toBe(true);
    expect(DUPLICATE_COMMAND_CENTRE_MODEL_DETECTED).toBe(false);
    expect(DUPLICATE_ENGINEERING_TRUTH_MODEL_DETECTED).toBe(false);
    expect(SCHEMA_CHANGED).toBe(false);
    expect(DATABASE_POLICY_CHANGED).toBe(false);
    expect(AUTONOMOUS_INSPECTION_APPROVAL_ENABLED).toBe(false);
    expect(AUTONOMOUS_CONDITION_CERTIFICATION_ENABLED).toBe(false);
    expect(AUTONOMOUS_REMEDIATION_APPROVAL_ENABLED).toBe(false);
    expect(
      existsSync(
        resolve(ROOT, "apps/web/src/app/(platform)/engineering/apps/inspection-intelligence/command-centre/page.tsx"),
      ),
    ).toBe(true);
    const hosted = readFileSync(
      resolve(ROOT, "apps/web/src/app/api/engineering/inspection-intelligence/hosted/route.ts"),
      "utf8",
    );
    expect(hosted).toContain('resource === "command_centre"');
    expect(hosted).toContain("getCommandCentre");
    expect(hosted).not.toContain("createServiceClient");
    const repo = readFileSync(resolve(ROOT, "packages/inspection-intelligence/src/hosted/repository.ts"), "utf8");
    expect(repo).toContain("composeInspectionCommandCentre");
    expect(repo).toContain("listInSessionIds");
    expect(repo).not.toContain("create table");
    const ui = readFileSync(
      resolve(ROOT, "apps/web/src/components/engineering/inspection-command-centre.tsx"),
      "utf8",
    );
    expect(ui).toContain("inspection-command-centre");
    expect(ui).toContain("command-centre-provenance-");
    expect(ui).toContain("InspectionEngineerEntry");
    expect(ui).toContain("not scored as");
    expect(ui).not.toContain("overallHealth");
  });
});
