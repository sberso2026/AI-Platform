import { describe, expect, it } from "vitest";
import {
  ENGINEERING_OS_RUNTIME_MANIFEST,
  EngineeringModuleRegistry,
  createEngineeringAiFramework,
  createEngineeringSharedServicesFacade,
  defaultEngineeringModuleRegistry,
} from "./index";

describe("Phase 8A module registry", () => {
  it("registers production V1 modules (Phase 14B truthful registry)", () => {
    const keys = defaultEngineeringModuleRegistry.listInitial().map((m) => m.moduleKey);
    expect(keys).toEqual([
      "project_intelligence",
      "inspection_intelligence",
      "asset_intelligence",
      "project_controls",
      "digital_twin",
      "engineering_model_interoperability",
    ]);
  });

  it("builds OS runtime manifest with modules", () => {
    expect(ENGINEERING_OS_RUNTIME_MANIFEST.modules?.length).toBe(6);
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
