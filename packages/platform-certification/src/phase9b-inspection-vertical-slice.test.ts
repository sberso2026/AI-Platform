/**
 * Phase 9B — Inspection Intelligence vertical slice + reservation architecture tests.
 */
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

type PkgJson = {
  name?: string;
  dependencies?: Record<string, string>;
};

function readPkg(rel: string): PkgJson {
  return JSON.parse(readFileSync(resolve(ROOT, rel, "package.json"), "utf8")) as PkgJson;
}

function workspaceDeps(pkg: PkgJson): string[] {
  return Object.entries(pkg.dependencies || {})
    .filter(([, v]) => typeof v === "string" && v.startsWith("workspace:"))
    .map(([k]) => k);
}

describe("Phase 9B Inspection Intelligence vertical slice", () => {
  it("locks mandatory reservation documents", () => {
    for (const rel of [
      "docs/architecture/INSPECTION_INTELLIGENCE_PHASE_9B_RESERVATIONS.md",
      "docs/architecture/INSPECTION_INTELLIGENCE_PACK_ARCHITECTURE.md",
      "docs/architecture/INSPECTION_INTELLIGENCE_EVENT_FLOW.md",
      "docs/architecture/INSPECTION_INTELLIGENCE_MOBILE_CERTIFICATION_PLACEHOLDERS.md",
    ]) {
      expect(existsSync(resolve(ROOT, rel)), rel).toBe(true);
    }
  });

  it("exports architecture contracts for targets, packs, vision, predictive, mobile", () => {
    const arch = readFileSync(
      resolve(ROOT, "packages/inspection-intelligence/src/architecture/index.ts"),
      "utf8",
    );
    expect(arch).toContain("inspection-target");
    expect(arch).toContain("asset-reference");
    expect(arch).toContain("measurement-engine");
    expect(arch).toContain("evidence");
    expect(arch).toContain("ai-vision");
    expect(arch).toContain("inspection-pack");
    expect(arch).toContain("predictive");
    expect(arch).toContain("event-flow");
    expect(arch).toContain("mobile-certification");
  });

  it("keeps dependency direction and PI freeze", () => {
    const ii = readPkg("packages/inspection-intelligence");
    const pi = readPkg("packages/project-intelligence");
    const core = readPkg("packages/platform-core");
    expect(workspaceDeps(ii)).toContain("@rtb/engineering-os");
    expect(workspaceDeps(ii)).not.toContain("@rtb/project-intelligence");
    expect(workspaceDeps(pi)).not.toContain("@rtb/inspection-intelligence");
    expect(workspaceDeps(core)).not.toContain("@rtb/inspection-intelligence");
    expect(
      readFileSync(resolve(ROOT, "packages/project-intelligence/src/version.ts"), "utf8"),
    ).toMatch(/PROJECT_INTELLIGENCE_VERSION = "1\.0\.0"/);
  });

  it("ships vertical slice markers and schema migration", () => {
    const overview = readFileSync(
      resolve(
        ROOT,
        "apps/web/src/app/(platform)/engineering/apps/inspection-intelligence/page.tsx",
      ),
      "utf8",
    );
    const release = readFileSync(
      resolve(
        ROOT,
        "apps/web/src/app/(platform)/engineering/apps/inspection-intelligence/release/page.tsx",
      ),
      "utf8",
    );
    expect(overview).toContain("inspection-intelligence-discovery-ready");
    expect(release).toContain("inspection-intelligence-vertical-slice-ready");
    expect(
      existsSync(
        resolve(
          ROOT,
          "supabase/migrations/20260806180000_batch_43_inspection_intelligence_vertical_slice.sql",
        ),
      ),
    ).toBe(true);
    for (const page of ["templates", "plans", "sessions", "review"]) {
      expect(
        existsSync(
          resolve(
            ROOT,
            `apps/web/src/app/(platform)/engineering/apps/inspection-intelligence/${page}/page.tsx`,
          ),
        ),
      ).toBe(true);
    }
  });
});
