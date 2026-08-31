import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  AUTONOMOUS_CONDITION_CERTIFICATION_ENABLED,
  AUTONOMOUS_INSPECTION_APPROVAL_ENABLED,
  AUTONOMOUS_REMEDIATION_APPROVAL_ENABLED,
  DATABASE_POLICY_CHANGED,
  DUPLICATE_ACTION_MODEL_DETECTED,
  DUPLICATE_CONDITION_MODEL_DETECTED,
  DUPLICATE_FILE_MODEL_DETECTED,
  DUPLICATE_FINDING_MODEL_DETECTED,
  II_3_IMPLEMENTED,
  II_4_READY,
  II_AI_INSPECTION_ENGINEER_IMPLEMENTED,
  II_COMMAND_CENTRE_IMPLEMENTED,
  INSPECTION_INTELLIGENCE_II_3_IMPLEMENTED,
  SCHEMA_CHANGED,
} from "@rtb/inspection-intelligence";

const ROOT = resolve(import.meta.dirname, "../../..");

describe("II-3 operational certification", () => {
  it("exposes hosted defect/condition/evidence surfaces without new truth models", () => {
    expect(INSPECTION_INTELLIGENCE_II_3_IMPLEMENTED).toBe(true);
    expect(II_3_IMPLEMENTED).toBe(true);
    expect(II_4_READY).toBe(true);
    expect(SCHEMA_CHANGED).toBe(false);
    expect(DATABASE_POLICY_CHANGED).toBe(false);
    expect(II_COMMAND_CENTRE_IMPLEMENTED).toBe(true);
    expect(II_AI_INSPECTION_ENGINEER_IMPLEMENTED).toBe(true);
    expect(AUTONOMOUS_INSPECTION_APPROVAL_ENABLED).toBe(false);
    expect(AUTONOMOUS_CONDITION_CERTIFICATION_ENABLED).toBe(false);
    expect(AUTONOMOUS_REMEDIATION_APPROVAL_ENABLED).toBe(false);
    expect(DUPLICATE_FINDING_MODEL_DETECTED).toBe(false);
    expect(DUPLICATE_ACTION_MODEL_DETECTED).toBe(false);
    expect(DUPLICATE_CONDITION_MODEL_DETECTED).toBe(false);
    expect(DUPLICATE_FILE_MODEL_DETECTED).toBe(false);
    expect(
      existsSync(
        resolve(ROOT, "apps/web/src/app/(platform)/engineering/apps/inspection-intelligence/defects/page.tsx"),
      ),
    ).toBe(true);
    expect(
      existsSync(
        resolve(
          ROOT,
          "apps/web/src/app/(platform)/engineering/apps/inspection-intelligence/defects/[defectId]/page.tsx",
        ),
      ),
    ).toBe(true);
    expect(
      existsSync(
        resolve(ROOT, "apps/web/src/app/(platform)/engineering/apps/inspection-intelligence/evidence/page.tsx"),
      ),
    ).toBe(true);
    const hosted = readFileSync(
      resolve(ROOT, "apps/web/src/app/api/engineering/inspection-intelligence/hosted/route.ts"),
      "utf8",
    );
    expect(hosted).toContain('resource === "defects"');
    expect(hosted).toContain('resource === "intelligence"');
    expect(hosted).toContain("transition_defect");
    expect(hosted).not.toContain("createServiceClient");
    const repo = readFileSync(
      resolve(ROOT, "packages/inspection-intelligence/src/hosted/repository.ts"),
      "utf8",
    );
    expect(repo).not.toContain("core_action_id");
    expect(repo).not.toContain("pi_finding");
  });
});
