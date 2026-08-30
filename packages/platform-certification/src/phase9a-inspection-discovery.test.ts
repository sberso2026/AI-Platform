/**
 * Phase 9A — Inspection Intelligence discovery boundary architecture tests.
 */
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

type PkgJson = {
  name?: string;
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
};

function readPkg(rel: string): PkgJson {
  return JSON.parse(readFileSync(resolve(ROOT, rel, "package.json"), "utf8")) as PkgJson;
}

function workspaceDeps(pkg: PkgJson): string[] {
  return Object.entries({ ...pkg.dependencies, ...pkg.peerDependencies })
    .filter(([, v]) => typeof v === "string" && v.startsWith("workspace:"))
    .map(([k]) => k);
}

describe("Phase 9A Inspection Intelligence discovery boundaries", () => {
  it("places inspection packages at locked Engineering OS paths", () => {
    expect(existsSync(resolve(ROOT, "packages/inspection-intelligence/package.json"))).toBe(true);
    expect(
      existsSync(resolve(ROOT, "packages/inspection-intelligence-certification/package.json")),
    ).toBe(true);
    expect(readPkg("packages/inspection-intelligence").name).toBe("@rtb/inspection-intelligence");
    const dirs = readdirSync(resolve(ROOT, "packages"), { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
    expect(dirs).toContain("inspection-intelligence");
    expect(dirs).toContain("engineering-os");
  });

  it("enforces dependency direction and forbids private reverse edges", () => {
    const ii = readPkg("packages/inspection-intelligence");
    const pi = readPkg("packages/project-intelligence");
    const core = readPkg("packages/platform-core");
    const kernel = readPkg("packages/platform-kernel");
    const intelligence = readPkg("packages/platform-intelligence");
    const engOs = readPkg("packages/engineering-os");

    expect(workspaceDeps(ii)).toContain("@rtb/engineering-os");
    expect(workspaceDeps(ii)).not.toContain("@rtb/project-intelligence");
    expect(workspaceDeps(ii).some((d) => d.endsWith("-certification"))).toBe(false);

    expect(workspaceDeps(pi)).not.toContain("@rtb/inspection-intelligence");
    expect(workspaceDeps(engOs)).not.toContain("@rtb/inspection-intelligence");

    for (const pkg of [core, kernel, intelligence]) {
      expect(workspaceDeps(pkg)).not.toContain("@rtb/inspection-intelligence");
      expect(workspaceDeps(pkg)).not.toContain("@rtb/project-intelligence");
    }
  });

  it("keeps apps/web as composition host for inspection discovery", () => {
    const web = readPkg("apps/web");
    const deps = workspaceDeps(web);
    expect(deps).toContain("@rtb/engineering-os");
    expect(deps).toContain("@rtb/inspection-intelligence");
    expect(deps.some((d) => d === "@rtb/inspection-intelligence-certification")).toBe(false);
  });

  it("locks ownership and forbids private stacks in docs", () => {
    expect(
      readFileSync(
        resolve(ROOT, "docs/architecture/INSPECTION_INTELLIGENCE_DATA_OWNERSHIP.md"),
        "utf8",
      ),
    ).toMatch(/engineering_os_shared_domain/);
    expect(
      readFileSync(
        resolve(ROOT, "docs/architecture/INSPECTION_INTELLIGENCE_PLATFORM_INTEGRATION.md"),
        "utf8",
      ),
    ).toMatch(/Private AI Runtime/);
  });

  it("preserves Project Intelligence v1 version identity", () => {
    expect(
      readFileSync(resolve(ROOT, "packages/project-intelligence/src/version.ts"), "utf8"),
    ).toMatch(/PROJECT_INTELLIGENCE_V1_CERTIFICATION_VERSION = "1\.0\.0"/);
  });

  it("exposes discovery-ready marker without product workflows", () => {
    const page = readFileSync(
      resolve(
        ROOT,
        "apps/web/src/app/(platform)/engineering/apps/inspection-intelligence/page.tsx",
      ),
      "utf8",
    );
    expect(page).toContain('data-testid="inspection-intelligence-discovery-ready"');
    expect(
      readFileSync(resolve(ROOT, "packages/inspection-intelligence/src/version.ts"), "utf8"),
    ).toMatch(/INSPECTION_INTELLIGENCE_MODULE_KEY = "inspection_intelligence"/);
  });
});
