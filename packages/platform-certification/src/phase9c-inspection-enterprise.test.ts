/**
 * Phase 9C — enterprise foundation architecture tests.
 */
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

describe("Phase 9C Inspection Intelligence enterprise foundation", () => {
  it("ships Engineering Module SDK and Inspection Pack SDK", () => {
    expect(existsSync(resolve(ROOT, "packages/engineering-os/src/module-sdk/index.ts"))).toBe(true);
    expect(existsSync(resolve(ROOT, "packages/inspection-intelligence/src/pack-sdk/index.ts"))).toBe(
      true,
    );
    expect(
      readFileSync(resolve(ROOT, "packages/engineering-os/src/index.ts"), "utf8"),
    ).toContain("./module-sdk");
  });

  it("ships batch 43 and 44 migrations for durable persistence", () => {
    expect(
      existsSync(
        resolve(
          ROOT,
          "supabase/migrations/20260806180000_batch_43_inspection_intelligence_vertical_slice.sql",
        ),
      ),
    ).toBe(true);
    const batch44 = readFileSync(
      resolve(
        ROOT,
        "supabase/migrations/20260806200000_batch_44_inspection_intelligence_enterprise_foundation.sql",
      ),
      "utf8",
    );
    for (const table of [
      "inspection_template_versions",
      "inspection_targets",
      "inspection_approvals",
      "inspection_events",
      "inspection_pack_registry",
    ]) {
      expect(batch44).toContain(table);
    }
  });

  it("keeps PI v1 frozen and architectural reservations intact", () => {
    expect(
      readFileSync(resolve(ROOT, "packages/project-intelligence/src/version.ts"), "utf8"),
    ).toMatch(/PROJECT_INTELLIGENCE_VERSION = "1\.0\.0"/);
    expect(
      readFileSync(resolve(ROOT, "packages/inspection-intelligence/src/version.ts"), "utf8"),
    ).toMatch(/INSPECTION_AI_VISION_IMPLEMENTED = false/);
    expect(
      readFileSync(
        resolve(ROOT, "docs/architecture/INSPECTION_INTELLIGENCE_PHASE_9C_ENTERPRISE_FOUNDATION.md"),
        "utf8",
      ),
    ).toMatch(/Engineering Module SDK/);
  });

  it("exposes enterprise UI ready markers", () => {
    const page = readFileSync(
      resolve(
        ROOT,
        "apps/web/src/app/(platform)/engineering/apps/inspection-intelligence/page.tsx",
      ),
      "utf8",
    );
    expect(page).toContain("inspection-intelligence-enterprise-foundation-ready");
    expect(page).toContain("inspection-intelligence-vertical-slice-ready");
  });
});
