import { describe, expect, it } from "vitest";
import {
  ENGINEERING_OS_RUNTIME_MANIFEST,
  EngineeringModuleRegistry,
  createEngineeringAiFramework,
  createEngineeringSharedServicesFacade,
  defaultEngineeringModuleRegistry,
} from "./index";

describe("Phase 8A module registry", () => {
  it("registers exactly the four initial modules", () => {
    const keys = defaultEngineeringModuleRegistry.listInitial().map((m) => m.moduleKey);
    expect(keys).toEqual([
      "project_intelligence",
      "inspection_intelligence",
      "project_controls",
      "digital_twin",
    ]);
  });

  it("builds OS runtime manifest with modules", () => {
    expect(ENGINEERING_OS_RUNTIME_MANIFEST.modules?.length).toBe(4);
    expect(ENGINEERING_OS_RUNTIME_MANIFEST.capabilities?.some((c) => c.id === "engineering_module_host")).toBe(
      true,
    );
  });

  it("bridges commerce application keys", () => {
    expect(defaultEngineeringModuleRegistry.commerceKeys()).toContain("project_intelligence");
  });

  it("prevents duplicate registration", () => {
    const registry = new EngineeringModuleRegistry([]);
    const sample = defaultEngineeringModuleRegistry.get("project_intelligence")!;
    registry.register(sample);
    expect(() => registry.register(sample)).toThrow(/Duplicate/);
  });

  it("exposes shared services and AI framework", () => {
    expect(createEngineeringSharedServicesFacade().has("audit")).toBe(true);
    expect(createEngineeringAiFramework().listCapabilities().length).toBeGreaterThan(0);
  });
});
