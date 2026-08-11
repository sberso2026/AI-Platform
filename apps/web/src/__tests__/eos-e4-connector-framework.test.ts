/**
 * Phase E4 smoke — connector framework exports for web/admin.
 */
import { describe, expect, it } from "vitest";
import {
  PhaseE4ConnectorFrameworkComplete,
  PhaseE4EssentialZeroConnector,
  PhaseE4ExternalWritesDisabled,
  getPhaseE4Declaration,
  phaseE4Ready,
  EngineeringConnectorRegistry,
  NativeMockConnectorAdapter,
  FileImportConnectorAdapter,
} from "@rtb/engineering-os";

describe("eos-e4-connector-framework", () => {
  it("exports E4 readiness and ESSENTIAL zero-connector flag", () => {
    expect(phaseE4Ready).toBe(true);
    expect(PhaseE4ConnectorFrameworkComplete).toBe(true);
    expect(PhaseE4EssentialZeroConnector).toBe(true);
    expect(PhaseE4ExternalWritesDisabled).toBe(true);
    expect(getPhaseE4Declaration().contractVersion).toMatch(/e4/);
  });

  it("registry works with mock + file import without enterprise vendors", async () => {
    const registry = new EngineeringConnectorRegistry();
    registry.register(new NativeMockConnectorAdapter("t-web"));
    const file = new FileImportConnectorAdapter("t-web");
    file.ingestCsv("id,title\nA1,Asset import row");
    registry.register(file);
    const views = registry.listAdminViews("t-web");
    expect(views.length).toBe(2);
    expect(views.every((v) => v.status === "Connected" || v.status === "Needs attention")).toBe(
      true,
    );
  });
});
