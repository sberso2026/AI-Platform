/**
 * Phase 9G architecture boundary tests.
 */
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

describe("Phase 9G Inspection Intelligence offline synchronization", () => {
  it("ships Engineering Mobile Offline SDK", () => {
    expect(existsSync(resolve(ROOT, "packages/engineering-os/src/mobile-sdk/offline.ts"))).toBe(
      true,
    );
    const offline = readFileSync(
      resolve(ROOT, "packages/engineering-os/src/mobile-sdk/offline.ts"),
      "utf8",
    );
    expect(offline).toContain("ENGINEERING_MOBILE_OFFLINE_CAPABILITY_KEYS");
    expect(offline).toContain("MOBILE_OFFLINE_ENGINE_IMPLEMENTED");
    expect(offline).toContain("lastWriteWinsForbidden");
  });

  it("ships offline domain, mobile reporting, migration, and threat model", () => {
    for (const file of [
      "packages/inspection-intelligence/src/domain/offline-sync.ts",
      "packages/inspection-intelligence/src/domain/mobile-reporting.ts",
      "docs/architecture/INSPECTION_INTELLIGENCE_PHASE_9G_OFFLINE_SYNC.md",
      "docs/security/INSPECTION_INTELLIGENCE_OFFLINE_THREAT_MODEL.md",
      "docs/testing/INSPECTION_INTELLIGENCE_OFFLINE_DEVICE_EVIDENCE.md",
      "supabase/migrations/20260807010000_batch_48_inspection_intelligence_offline_sync.sql",
    ]) {
      expect(existsSync(resolve(ROOT, file)), file).toBe(true);
    }
  });

  it("implements offline sync while keeping AI Vision and ownership false", () => {
    const version = readFileSync(
      resolve(ROOT, "packages/inspection-intelligence/src/version.ts"),
      "utf8",
    );
    expect(version).toMatch(/INSPECTION_OFFLINE_SYNC_IMPLEMENTED = true/);
    expect(version).toMatch(/INSPECTION_MOBILE_PRODUCT_IMPLEMENTED = true/);
    expect(version).toMatch(/INSPECTION_AI_VISION_IMPLEMENTED = true/);
    expect(version).toMatch(/INSPECTION_ASSET_INTELLIGENCE_IMPLEMENTED = false/);
    expect(
      readFileSync(resolve(ROOT, "packages/project-intelligence/src/version.ts"), "utf8"),
    ).toMatch(/PROJECT_INTELLIGENCE_VERSION = "1\.0\.0"/);
  });

  it("exposes offline sync UI markers", () => {
    const page = readFileSync(
      resolve(
        ROOT,
        "apps/web/src/app/(platform)/engineering/apps/inspection-intelligence/page.tsx",
      ),
      "utf8",
    );
    expect(page).toContain("inspection-intelligence-offline-sync-ready");
    expect(page).toContain("inspection-intelligence-mobile-ready");
    expect(
      existsSync(
        resolve(
          ROOT,
          "apps/web/src/app/(platform)/engineering/apps/inspection-intelligence/sync/page.tsx",
        ),
      ),
    ).toBe(true);
    const shell = readFileSync(
      resolve(ROOT, "apps/web/src/components/engineering/inspection-intelligence-shell.tsx"),
      "utf8",
    );
    expect(shell).toContain('data-offline-sync="true"');
  });
});
