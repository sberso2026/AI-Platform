import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const WEB_ROOT = resolve(__dirname, "../../");
const REPO = resolve(__dirname, "../../../../");

function readApp(rel: string) {
  return readFileSync(resolve(WEB_ROOT, rel), "utf8");
}

const PRIMARY_PAGES = [
  "src/app/(platform)/engineering/apps/asset-intelligence/page.tsx",
  "src/app/(platform)/engineering/apps/digital-twin/page.tsx",
  "src/app/(platform)/engineering/apps/model-interoperability/page.tsx",
  "src/app/(platform)/engineering/apps/project-controls/page.tsx",
] as const;

const PRIMARY_SHELLS = [
  "src/components/engineering/asset-intelligence-shell.tsx",
  "src/components/engineering/digital-twin-shell.tsx",
  "src/components/engineering/model-interoperability-shell.tsx",
  "src/components/engineering/project-controls-shell.tsx",
] as const;

const JARGON = [
  /Production GA/,
  /batch_55/,
  /migration lineage/i,
  /fullBimViewerImplemented/,
  /ETABSHostedExecutionCertified=false/,
  /SPACEGASSLiveExecutionCertified=false/,
  /solverExecutionImplemented/,
  /Version 1\.0\.0/,
];

const INTERNAL_FLAGS = [
  /fullBimViewerImplemented=false/,
  /ETABSHostedExecutionCertified=false/,
  /SPACEGASSLiveExecutionCertified=false/,
  /solverExecutionImplemented=false/,
];

describe("EOS-MODULE-OPS-UX-1 operational product surfaces", () => {
  it("keeps the capability map", () => {
    expect(existsSync(resolve(REPO, "docs/pilot/EOS-MODULE-OPS-UX-1/capability-map.md"))).toBe(true);
  });

  it("uses the shared operational shell with Back, Return, scroll, and Administration", () => {
    const shell = readApp("src/components/engineering/module-ops-shell.tsx");
    expect(shell).toContain("module-shell-back");
    expect(shell).toContain("module-shell-return");
    expect(shell).toContain("overflow-y-auto");
    expect(shell).toContain("module-administration");
    expect(shell).toContain("Header");
  });

  it("does not put release jargon or internal flags on primary landings", () => {
    for (const rel of PRIMARY_PAGES) {
      const page = readApp(rel);
      for (const pattern of JARGON) {
        expect(page, rel).not.toMatch(pattern);
      }
      for (const pattern of INTERNAL_FLAGS) {
        expect(page, rel).not.toMatch(pattern);
      }
    }
  });

  it("keeps Governance/Release out of primary module navigation", () => {
    for (const rel of PRIMARY_SHELLS) {
      const shell = readApp(rel);
      expect(shell).not.toMatch(/label: "Governance"/);
      expect(shell).toContain("adminLinks");
    }
  });

  it("exposes operational Asset Intelligence navigation", () => {
    const shell = readApp("src/components/engineering/asset-intelligence-shell.tsx");
    for (const label of ["Overview", "Assets", "Condition", "Criticality", "Reliability", "Degradation", "Failure Modes", "Recommendations", "Evidence"]) {
      expect(shell).toContain(label);
    }
    const overview = readApp("src/app/(platform)/engineering/apps/asset-intelligence/page.tsx");
    expect(overview).toContain("Attention required");
    expect(overview).not.toMatch(/remaining life|probability of failure|PoF|RUL/i);
  });

  it("exposes operational Digital Twin navigation without a new viewer", () => {
    const shell = readApp("src/components/engineering/digital-twin-shell.tsx");
    for (const label of ["Overview", "Twins", "State", "History", "Representation", "Telemetry", "Digital Thread", "Evidence"]) {
      expect(shell).toContain(label);
    }
    expect(shell).not.toContain('label: "Simulation"');
    const overview = readApp("src/app/(platform)/engineering/apps/digital-twin/page.tsx");
    expect(overview).toContain("No digital twin has been linked to this asset.");
    expect(overview).toContain("No model or spatial representation is currently linked.");
  });

  it("exposes operational Engineering Models navigation", () => {
    const shell = readApp("src/components/engineering/model-interoperability-shell.tsx");
    for (const label of ["Models", "Versions", "Elements", "Mappings", "Results", "Interoperability", "Evidence"]) {
      expect(shell).toContain(label);
    }
    const overview = readApp("src/app/(platform)/engineering/apps/model-interoperability/page.tsx");
    expect(overview).toContain("No engineering model is registered for this project.");
    expect(overview).toContain("Live ETABS execution is not currently certified");
    expect(overview).not.toContain("ETABSHostedExecutionCertified=false");
  });

  it("exposes operational Project Controls navigation distinct from PI", () => {
    const shell = readApp("src/components/engineering/project-controls-shell.tsx");
    for (const label of ["Overview", "Progress", "Schedule", "Cost", "Change", "Productivity", "Forecast", "Scenarios", "Assurance"]) {
      expect(shell).toContain(label);
    }
    const overview = readApp("src/app/(platform)/engineering/apps/project-controls/page.tsx");
    expect(overview).not.toContain("/engineering/apps/project-intelligence");
    expect(overview).toContain("Not earned value");
  });

  it("preserves release pages under Administration", () => {
    expect(readApp("src/app/(platform)/engineering/apps/asset-intelligence/release/page.tsx")).toContain("Administration / Release");
    expect(readApp("src/app/(platform)/engineering/apps/digital-twin/release/page.tsx")).toContain("Administration / Release");
    expect(readApp("src/app/(platform)/engineering/apps/project-controls/release/page.tsx")).toContain("Administration / Release");
    expect(readApp("src/app/(platform)/engineering/apps/model-interoperability/release/page.tsx")).toContain("Provider / Execution Certification");
    expect(readApp("src/app/(platform)/engineering/apps/model-interoperability/release/page.tsx")).toContain("ETABSHostedExecutionCertified=false");
  });

  it("does not freeze the platform column", () => {
    const platform = readApp("src/components/layout/platform-shell.tsx");
    expect(platform).toContain("min-h-0");
    expect(platform).toContain("overflow-hidden");
  });
});
