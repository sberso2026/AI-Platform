import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  AUTONOMOUS_CONDITION_CERTIFICATION_ENABLED,
  AUTONOMOUS_INSPECTION_APPROVAL_ENABLED,
  AUTONOMOUS_REMEDIATION_APPROVAL_ENABLED,
  DATABASE_POLICY_CHANGED,
  DIRECT_PROVIDER_ACCESS_FROM_II,
  DUPLICATE_ASSET_TRUTH_MODEL_DETECTED,
  DUPLICATE_ENGINEERING_TRUTH_MODEL_DETECTED,
  DUPLICATE_HISTORY_MODEL_DETECTED,
  DUPLICATE_REPORTING_TRUTH_MODEL_DETECTED,
  EXTERNAL_WRITES_ENABLED,
  II_4_IMPLEMENTED,
  II_5_READY,
  II_AI_INSPECTION_ENGINEER_IMPLEMENTED,
  II_COMMAND_CENTRE_IMPLEMENTED,
  II_PDF_EXPORT_AVAILABLE,
  INSPECTION_INTELLIGENCE_II_4_IMPLEMENTED,
  SCHEMA_CHANGED,
} from "@rtb/inspection-intelligence";

const ROOT = resolve(import.meta.dirname, "../../..");

describe("II-4 history and reporting certification", () => {
  it("exposes hosted history and governed reporting without new truth models or PDF", () => {
    expect(INSPECTION_INTELLIGENCE_II_4_IMPLEMENTED).toBe(true);
    expect(II_4_IMPLEMENTED).toBe(true);
    expect(II_5_READY).toBe(true);
    expect(SCHEMA_CHANGED).toBe(false);
    expect(DATABASE_POLICY_CHANGED).toBe(false);
    expect(II_PDF_EXPORT_AVAILABLE).toBe(false);
    expect(II_COMMAND_CENTRE_IMPLEMENTED).toBe(false);
    expect(II_AI_INSPECTION_ENGINEER_IMPLEMENTED).toBe(true);
    expect(AUTONOMOUS_INSPECTION_APPROVAL_ENABLED).toBe(false);
    expect(AUTONOMOUS_CONDITION_CERTIFICATION_ENABLED).toBe(false);
    expect(AUTONOMOUS_REMEDIATION_APPROVAL_ENABLED).toBe(false);
    expect(DUPLICATE_HISTORY_MODEL_DETECTED).toBe(false);
    expect(DUPLICATE_REPORTING_TRUTH_MODEL_DETECTED).toBe(false);
    expect(DUPLICATE_ASSET_TRUTH_MODEL_DETECTED).toBe(false);
    expect(DUPLICATE_ENGINEERING_TRUTH_MODEL_DETECTED).toBe(false);
    expect(DIRECT_PROVIDER_ACCESS_FROM_II).toBe(false);
    expect(EXTERNAL_WRITES_ENABLED).toBe(false);
    expect(
      existsSync(
        resolve(ROOT, "apps/web/src/app/(platform)/engineering/apps/inspection-intelligence/history/page.tsx"),
      ),
    ).toBe(true);
    expect(
      existsSync(
        resolve(ROOT, "apps/web/src/app/(platform)/engineering/apps/inspection-intelligence/reports/page.tsx"),
      ),
    ).toBe(true);
    const hosted = readFileSync(
      resolve(ROOT, "apps/web/src/app/api/engineering/inspection-intelligence/hosted/route.ts"),
      "utf8",
    );
    expect(hosted).toContain('resource === "history"');
    expect(hosted).toContain("compose_report");
    expect(hosted).not.toContain("createServiceClient");
    const repo = readFileSync(resolve(ROOT, "packages/inspection-intelligence/src/hosted/repository.ts"), "utf8");
    expect(repo).toContain("T.reportingOutputs");
    expect(repo).toContain("composeGovernedReport");
    expect(repo).not.toContain("create table");
    const mapping = readFileSync(resolve(ROOT, "packages/inspection-intelligence/src/hosted/client.ts"), "utf8");
    expect(mapping).toContain('reportingOutputs: "inspection_reporting_outputs"');
    const history = readFileSync(
      resolve(ROOT, "packages/inspection-intelligence/src/domain/inspection-history.ts"),
      "utf8",
    );
    expect(history).toContain("not Asset Intelligence history");
  });
});
