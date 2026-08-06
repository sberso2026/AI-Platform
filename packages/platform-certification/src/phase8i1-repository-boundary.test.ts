/**
 * Phase 8I.1 — Dependency direction and package boundary architecture tests.
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
  exports?: unknown;
};

function readPkg(rel: string): PkgJson {
  return JSON.parse(readFileSync(resolve(ROOT, rel, "package.json"), "utf8")) as PkgJson;
}

function workspaceDeps(pkg: PkgJson): string[] {
  return Object.entries({ ...pkg.dependencies, ...pkg.peerDependencies })
    .filter(([, v]) => typeof v === "string" && v.startsWith("workspace:"))
    .map(([k]) => k);
}

function hasCycle(graph: Map<string, string[]>): string | null {
  const visiting = new Set<string>();
  const visited = new Set<string>();
  function dfs(node: string, stack: string[]): string | null {
    if (visiting.has(node)) return [...stack, node].join(" -> ");
    if (visited.has(node)) return null;
    visiting.add(node);
    for (const next of graph.get(node) ?? []) {
      const hit = dfs(next, [...stack, node]);
      if (hit) return hit;
    }
    visiting.delete(node);
    visited.add(node);
    return null;
  }
  for (const node of graph.keys()) {
    const hit = dfs(node, []);
    if (hit) return hit;
  }
  return null;
}

describe("Phase 8I.1 package boundary architecture", () => {
  const inventory = JSON.parse(
    readFileSync(resolve(ROOT, "docs/architecture/rtb-ai-platform-package-inventory.json"), "utf8"),
  ) as { inspectionPackagesCreated: boolean; packages: Array<{ name: string; path: string }> };

  it("keeps inspection packages uncreated and inventory present", () => {
    expect(inventory.inspectionPackagesCreated).toBe(false);
    expect(existsSync(resolve(ROOT, "packages/inspection-intelligence"))).toBe(false);
    expect(existsSync(resolve(ROOT, "packages/inspection-intelligence-certification"))).toBe(false);
    expect(inventory.packages.length).toBeGreaterThanOrEqual(16);
  });

  it("enforces allowed dependency direction", () => {
    const core = readPkg("packages/platform-core");
    const kernel = readPkg("packages/platform-kernel");
    const intelligence = readPkg("packages/platform-intelligence");
    const commerce = readPkg("packages/platform-commerce");
    const engOs = readPkg("packages/engineering-os");
    const pi = readPkg("packages/project-intelligence");

    for (const pkg of [core, kernel, intelligence, commerce]) {
      const deps = workspaceDeps(pkg);
      expect(deps).not.toContain("@rtb/project-intelligence");
      expect(deps).not.toContain("@rtb/engineering-os");
      expect(deps.some((d) => d.endsWith("-certification"))).toBe(false);
      expect(deps).not.toContain("@rtb/reference-os");
    }

    expect(workspaceDeps(engOs)).not.toContain("@rtb/project-intelligence");
    expect(workspaceDeps(engOs).some((d) => d.endsWith("-certification"))).toBe(false);
    expect(workspaceDeps(engOs)).not.toContain("@rtb/reference-os");

    expect(workspaceDeps(pi)).toContain("@rtb/engineering-os");
    expect(workspaceDeps(pi).some((d) => d.endsWith("-certification"))).toBe(false);
    expect(workspaceDeps(pi)).not.toContain("@rtb/reference-os");
    expect(workspaceDeps(pi)).not.toContain("@rtb/inspection-intelligence");
  });

  it("detects no circular workspace dependencies among production packages", () => {
    const productionPaths = [
      "packages/types",
      "packages/database",
      "packages/plugin-sdk",
      "packages/ui",
      "packages/platform-core",
      "packages/platform-intelligence",
      "packages/platform-kernel",
      "packages/platform-commerce",
      "packages/engineering-os",
      "packages/project-intelligence",
      "apps/web",
    ];
    const nameByPath = new Map<string, string>();
    const graph = new Map<string, string[]>();
    for (const rel of productionPaths) {
      const pkg = readPkg(rel);
      if (!pkg.name) continue;
      nameByPath.set(rel, pkg.name);
      graph.set(pkg.name, workspaceDeps(pkg));
    }
    const cycle = hasCycle(graph);
    expect(cycle, cycle ?? "acyclic").toBeNull();
  });

  it("keeps apps/web as composition host without importing certification or reference-os", () => {
    const web = readPkg("apps/web");
    const deps = workspaceDeps(web);
    expect(deps).toContain("@rtb/engineering-os");
    expect(deps).toContain("@rtb/project-intelligence");
    expect(deps.some((d) => d.endsWith("-certification"))).toBe(false);
    expect(deps).not.toContain("@rtb/reference-os");
  });

  it("documents required architecture and release integrity files", () => {
    for (const rel of [
      "docs/architecture/RTB_AI_PLATFORM_MONOREPO_STRUCTURE.md",
      "docs/architecture/RTB_AI_PLATFORM_PACKAGE_INVENTORY.md",
      "docs/architecture/ENGINEERING_OS_SHARED_DOMAIN_OWNERSHIP.md",
      "docs/architecture/ENGINEERING_OS_MODULE_BOUNDARIES.md",
      "docs/release/PROJECT_INTELLIGENCE_V1_POST_RELEASE_CHANGE_CLASSIFICATION.md",
      "docs/release/PROJECT_INTELLIGENCE_V1_MARKER_COMPATIBILITY.md",
      "docs/testing/GENERATED_ARTIFACT_AND_ONEDRIVE_POLICY.md",
    ]) {
      expect(existsSync(resolve(ROOT, rel)), rel).toBe(true);
    }
  });

  it("keeps authoritative reasoning marker with deprecated alias", () => {
    const page = readFileSync(
      resolve(
        ROOT,
        "apps/web/src/app/(platform)/engineering/apps/project-intelligence/reasoning/page.tsx",
      ),
      "utf8",
    );
    expect(page).toContain('data-testid="engineering-reasoning-assistant-ready"');
    expect(page).toContain('data-testid="project-intelligence-copilot-ready"');
    const markerDoc = readFileSync(
      resolve(ROOT, "docs/release/PROJECT_INTELLIGENCE_V1_MARKER_COMPATIBILITY.md"),
      "utf8",
    );
    expect(markerDoc).toMatch(/deprecated compatibility alias/i);
  });

  it("lists only known packages under packages/", () => {
    const dirs = readdirSync(resolve(ROOT, "packages"), { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort();
    expect(dirs).not.toContain("inspection-intelligence");
    expect(dirs).not.toContain("inspection-intelligence-certification");
    expect(dirs).toContain("project-intelligence");
    expect(dirs).toContain("engineering-os");
  });
});
