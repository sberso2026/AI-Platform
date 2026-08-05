/**
 * Phase 8A — Engineering OS foundation unit gates.
 */
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  ENGINEERING_DOMAIN_ENTITY_KINDS,
  ENGINEERING_INITIAL_MODULE_KEYS,
  assertNoDuplicateDomainOwnership,
  resolveOsModules,
} from "@rtb/types";
import {
  ENGINEERING_OS_RUNTIME_MANIFEST,
  EngineeringModuleRegistry,
  createEngineeringAiFramework,
  createEngineeringSharedServicesFacade,
  ENGINEERING_SHARED_SERVICE_IDS,
  ENGINEERING_AI_CAPABILITY_IDS,
  defaultEngineeringModuleRegistry,
} from "@rtb/engineering-os";

const ROOT = resolve(import.meta.dirname, "../../..");

describe("Phase 8A Engineering OS foundation", () => {
  it("documents Engineering OS architecture", () => {
    expect(
      existsSync(resolve(ROOT, "docs/architecture/ENGINEERING_OS_ARCHITECTURE_PHASE_8A.md")),
    ).toBe(true);
    const product = readFileSync(
      resolve(ROOT, "docs/architecture/RTB_AI_PLATFORM_PRODUCT_MODEL.md"),
      "utf8",
    );
    expect(product).toMatch(/Modules/);
    expect(product.toLowerCase()).not.toMatch(/cortex ai/);
    expect(product).toMatch(/Reintroducing Cortex terminology|No Cortex/);
  });

  it("exposes OperatingSystemManifest with initial modules", () => {
    expect(ENGINEERING_OS_RUNTIME_MANIFEST.id).toBe("engineering");
    expect(ENGINEERING_OS_RUNTIME_MANIFEST.certificationOnly).toBe(false);
    const modules = resolveOsModules(ENGINEERING_OS_RUNTIME_MANIFEST);
    expect(modules.map((m) => m.moduleKey).sort()).toEqual(
      [...ENGINEERING_INITIAL_MODULE_KEYS].sort(),
    );
  });

  it("rejects modules that bypass Engineering OS routes", () => {
    const registry = new EngineeringModuleRegistry([]);
    expect(() =>
      registry.register({
        id: "rogue",
        moduleKey: "rogue",
        commerceApplicationKey: "rogue",
        name: "Rogue",
        description: "bypass",
        version: "0.0.0",
        operatingSystemId: "engineering",
        status: "registered",
        routes: [{ path: "/business/rogue", title: "Rogue" }],
        navigation: [],
        permissions: [],
        workspaceVisibility: "all",
        searchProviders: [],
        aiCapabilities: [],
        eventHandlers: [],
      }),
    ).toThrow(/must be under \/engineering/);
  });

  it("locks shared domain ownership to Engineering OS Core", () => {
    expect(ENGINEERING_DOMAIN_ENTITY_KINDS).toContain("project");
    expect(ENGINEERING_DOMAIN_ENTITY_KINDS).toContain("drawing");
    expect(ENGINEERING_DOMAIN_ENTITY_KINDS).toContain("tag");
    expect(() =>
      assertNoDuplicateDomainOwnership(
        ENGINEERING_DOMAIN_ENTITY_KINDS.map((entity) => ({
          entity,
          owner: "engineering-os-core",
        })),
      ),
    ).not.toThrow();
    expect(() =>
      assertNoDuplicateDomainOwnership([{ entity: "project", owner: "project_intelligence" }]),
    ).toThrow(/ownership violation/);
  });

  it("provides shared engineering services catalog", () => {
    const facade = createEngineeringSharedServicesFacade();
    expect(facade.list()).toHaveLength(ENGINEERING_SHARED_SERVICE_IDS.length);
    expect(facade.has("approvals")).toBe(true);
    expect(facade.has("ai_context")).toBe(true);
  });

  it("provides Engineering AI framework and forbids independent stacks", () => {
    const ai = createEngineeringAiFramework();
    expect(ai.listCapabilities()).toHaveLength(ENGINEERING_AI_CAPABILITY_IDS.length);
    expect(() => ai.assertSharedStackOnly("project_intelligence", false)).not.toThrow();
    expect(() => ai.assertSharedStackOnly("rogue", true)).toThrow(/independent AI stacks/);
  });

  it("keeps platform readiness marker stable", () => {
    const page = readFileSync(
      resolve(ROOT, "apps/web/src/app/(platform)/platform/home/page.tsx"),
      "utf8",
    );
    expect(page).toContain('data-testid="rtb-ai-platform-ready"');
  });

  it("exposes Engineering OS shell and module launcher markers", () => {
    const dash = readFileSync(
      resolve(ROOT, "apps/web/src/app/(platform)/engineering/page.tsx"),
      "utf8",
    );
    const modules = readFileSync(
      resolve(ROOT, "apps/web/src/app/(platform)/engineering/modules/page.tsx"),
      "utf8",
    );
    expect(dash).toContain('data-testid="engineering-os-shell"');
    expect(modules).toContain('data-testid="engineering-module-launcher"');
    expect(defaultEngineeringModuleRegistry.listInitial()).toHaveLength(4);
  });
});
