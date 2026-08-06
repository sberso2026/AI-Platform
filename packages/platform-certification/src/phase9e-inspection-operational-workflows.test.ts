/**
 * Phase 9E architecture boundary tests.
 */
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

describe("Phase 9E Inspection Intelligence operational workflows", () => {
  it("ships Engineering Workflow SDK", () => {
    expect(existsSync(resolve(ROOT, "packages/engineering-os/src/workflow-sdk/index.ts"))).toBe(
      true,
    );
    expect(
      readFileSync(resolve(ROOT, "packages/engineering-os/src/index.ts"), "utf8"),
    ).toContain("./workflow-sdk");
    const sdk = readFileSync(
      resolve(ROOT, "packages/engineering-os/src/workflow-sdk/index.ts"),
      "utf8",
    );
    expect(sdk).toContain("ENGINEERING_WORKFLOW_SDK_CAPABILITY_KEYS");
    expect(sdk).toContain("transitionGuards");
    expect(sdk).toContain("slaTimers");
  });

  it("ships operational workflows, reporting prep, and batch 46 migration", () => {
    for (const file of [
      "packages/inspection-intelligence/src/domain/operational-workflow-definition.ts",
      "packages/inspection-intelligence/src/domain/operational-workflows.ts",
      "packages/inspection-intelligence/src/domain/reporting-preparation.ts",
    ]) {
      expect(existsSync(resolve(ROOT, file)), file).toBe(true);
    }
    const migration = readFileSync(
      resolve(
        ROOT,
        "supabase/migrations/20260806230000_batch_46_inspection_intelligence_operational_workflows.sql",
      ),
      "utf8",
    );
    expect(migration).toContain("inspection_assignments");
    expect(migration).toContain("inspection_workflow_instances");
    expect(migration).toContain("inspection_reporting_outputs");
  });

  it("forbids mobile, offline, and AI Vision while marking operational ready", () => {
    const version = readFileSync(
      resolve(ROOT, "packages/inspection-intelligence/src/version.ts"),
      "utf8",
    );
    expect(version).toMatch(/INSPECTION_MOBILE_PRODUCT_IMPLEMENTED = false/);
    expect(version).toMatch(/INSPECTION_OFFLINE_SYNC_IMPLEMENTED = false/);
    expect(version).toMatch(/INSPECTION_AI_VISION_IMPLEMENTED = false/);
    expect(version).toMatch(/INSPECTION_OPERATIONAL_WORKFLOWS_READY = true/);
    expect(version).toMatch(/INSPECTION_ENGINEERING_DOMAIN_COMPLETE = true/);
    expect(
      readFileSync(resolve(ROOT, "packages/project-intelligence/src/version.ts"), "utf8"),
    ).toMatch(/PROJECT_INTELLIGENCE_VERSION = "1\.0\.0"/);
  });

  it("exposes operational workflow UI markers", () => {
    const page = readFileSync(
      resolve(
        ROOT,
        "apps/web/src/app/(platform)/engineering/apps/inspection-intelligence/page.tsx",
      ),
      "utf8",
    );
    expect(page).toContain("inspection-intelligence-operational-workflows-ready");
    expect(
      existsSync(
        resolve(
          ROOT,
          "apps/web/src/app/(platform)/engineering/apps/inspection-intelligence/workflows/page.tsx",
        ),
      ),
    ).toBe(true);
    expect(
      existsSync(
        resolve(
          ROOT,
          "apps/web/src/app/(platform)/engineering/apps/inspection-intelligence/assignments/page.tsx",
        ),
      ),
    ).toBe(true);
  });
});
