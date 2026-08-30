import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const WEB_SRC = resolve(__dirname, "..");

function read(rel: string): string {
  return readFileSync(resolve(WEB_SRC, rel), "utf8");
}

describe("PI-8 Connector Context web surface", () => {
  it("consumes Platform Kernel connector context, not Business OS implementation", () => {
    const hosted = read("lib/project-intelligence/hosted-connector-context-source.ts");
    expect(hosted).toContain("kernel.connectorContext.readStagedContext");
    expect(hosted).toContain("canReadPlatformConnectorContext");
    expect(hosted).toContain("platform.connector_context.read");
    expect(hosted).toContain("loadConnectorContext");
    expect(hosted).toContain("connectorWriteForbidden");
    expect(hosted).not.toContain("@rtb/business-os");
    expect(hosted).not.toContain("hasBusinessPermission");
    expect(hosted).not.toContain("business_os.connectors.view");
    expect(hosted).not.toContain("ctx.business.connectors");
    expect(hosted).not.toContain("BUSINESS_OS_FEATURE_KEY");
    expect(hosted).not.toContain("evaluateBusinessOsAccess");
    expect(hosted).not.toContain("Microsoft365ProviderClient");
    expect(hosted).not.toContain("XeroProviderClient");
    expect(hosted).not.toContain("HubSpotProviderClient");
    expect(hosted).not.toContain("new OpenAI");
    expect(hosted).not.toContain(".insert(");
  });

  it("wires connector context into the existing Analyst path only", () => {
    const analyst = read("lib/project-intelligence/ai-project-analyst-service.ts");
    expect(analyst).toContain("loadHostedConnectorContext");
    expect(analyst).toContain("assembleAnalystContext(view, connectorContext)");
    expect(analyst).toContain("connectorContext");
    expect(analyst).toContain("kernel.aiDirector.run");
    expect(analyst).not.toContain("new OpenAI");
    expect(analyst).not.toContain("@rtb/business-os");
    expect(analyst).not.toContain("ctx.business.connectors");
  });

  it("distinguishes canonical, external, and AI claims in the Analyst UI", () => {
    const ui = read("components/engineering/project-ai-analyst.tsx");
    expect(ui).toContain("analyst-canonical-claims");
    expect(ui).toContain("analyst-external-context");
    expect(ui).toContain("analyst-ai-interpretation");
    expect(ui).toContain("Canonical Project Intelligence");
    expect(ui).toContain("External Context");
    expect(ui).toContain("AI Interpretation");
    expect(ui).toContain("analyst-advisory-banner");
  });
});
