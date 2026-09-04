import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  displayOperationalText,
  formatProjectContextLabel,
  isRawUuid,
} from "../lib/engineering/module-ops";
import { engineeringSystemsCommerceState } from "../lib/engineering/certified-modules";

const WEB_ROOT = resolve(__dirname, "../../");

function readApp(rel: string) {
  return readFileSync(resolve(WEB_ROOT, rel), "utf8");
}

describe("EOS-MODULE-OPS-UX-1R founder operational closure", () => {
  it("never shows a raw UUID as a project context label", () => {
    expect(isRawUuid("80652532-932e-464d-803b-9876df705bda")).toBe(true);
    expect(
      formatProjectContextLabel({
        projectCode: "RTB-PILOT-001",
        projectName: "Gold Coast Structural Inspection",
      }),
    ).toBe("RTB-PILOT-001 · Gold Coast Structural Inspection");
    expect(displayOperationalText("80652532-932e-464d-803b-9876df705bda")).toBe("—");
  });

  it("maps Engineering Systems commerce states without using the Enterprise plan", () => {
    expect(
      engineeringSystemsCommerceState({ allowed: true, installed: true }),
    ).toBe("Installed");
    expect(
      engineeringSystemsCommerceState({ allowed: true, installed: false }),
    ).toBe("Available");
    expect(
      engineeringSystemsCommerceState({
        allowed: false,
        installed: false,
        reasonCode: "application_not_in_plan",
      }),
    ).toBe("Not included");
  });

  it("hides raw identifiers from operational module chrome", () => {
    const shell = readApp("src/components/engineering/module-ops-shell.tsx");
    expect(shell).toContain("formatProjectContextLabel");
    expect(shell).not.toContain("{projectId ?? \"All projects\"}");
    const assetDetail = readApp(
      "src/app/(platform)/engineering/apps/asset-intelligence/assets/[assetId]/page.tsx",
    );
    expect(assetDetail).not.toContain("data-testid=\"ai-asset-id\"");
    const twinDetail = readApp(
      "src/app/(platform)/engineering/apps/digital-twin/twins/[twinId]/page.tsx",
    );
    expect(twinDetail).not.toContain("{twinId}</p>");
    const launcher = readApp("src/app/(platform)/engineering/modules/page.tsx");
    expect(launcher).toContain("systemsState");
    expect(launcher).toContain("Installed");
  });

  it("keeps release certification flags off operational landings", () => {
    const overview = readApp("src/app/(platform)/engineering/apps/model-interoperability/page.tsx");
    expect(overview).not.toContain("ETABSHostedExecutionCertified");
    expect(overview).not.toContain("SPACEGASSLiveExecutionCertified");
  });
});
