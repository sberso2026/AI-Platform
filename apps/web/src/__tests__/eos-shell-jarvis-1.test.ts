import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const WEB_SRC = resolve(__dirname, "..");
const REPO = resolve(__dirname, "../../../..");

function read(rel: string): string {
  return readFileSync(resolve(WEB_SRC, rel), "utf8");
}

function collectFiles(dir: string, acc: string[] = []): string[] {
  if (!existsSync(dir)) return acc;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const next = resolve(dir, entry.name);
    if (entry.isDirectory()) collectFiles(next, acc);
    else acc.push(next);
  }
  return acc;
}

describe("EOS-SHELL-JARVIS-1 presentation shell", () => {
  it("defines shared EOS tokens instead of page-local palettes", () => {
    const css = read("app/globals.css");
    for (const token of [
      "--eos-bg-primary",
      "--eos-bg-secondary",
      "--eos-panel",
      "--eos-panel-elevated",
      "--eos-border",
      "--eos-border-active",
      "--eos-text-primary",
      "--eos-text-secondary",
      "--eos-accent",
      "--eos-accent-soft",
      "--eos-success",
      "--eos-warning",
      "--eos-danger",
      "--eos-ai",
    ]) {
      expect(css).toContain(token);
    }
    expect(css).toContain("prefers-reduced-motion");
    expect(css).toContain("eos-ai-pulse");
    expect(css).not.toContain("JARVIS");
  });

  it("keeps RTB Engineering OS branding and the AI core visual motif", () => {
    const switcher = read("components/layout/product-switcher.tsx");
    const core = read("components/layout/eos-ai-core.tsx");
    const header = read("components/layout/header.tsx");
    expect(switcher).toContain("BRANDING.org");
    expect(switcher).toContain("BRANDING.product");
    expect(switcher).toContain("BRANDING.edition");
    expect(core).toContain("BRANDING.intelligenceCore");
    expect(core).toContain("Engineering AI Online");
    expect(core).not.toContain("JARVIS");
    expect(header).toContain("workspace-selector");
    expect(header).toContain("project-selector");
    expect(header).toContain("global-search");
    expect(header).toContain("Notifications");
    expect(header).toContain("EosAiCore");
    expect(header).toContain("RTB Engineering");
  });

  it("preserves scroll, back navigation, and the existing shell frame", () => {
    const platform = read("components/layout/platform-shell.tsx");
    const shell = read("components/engineering/project-intelligence-shell.tsx");
    const chrome = read("components/engineering/pi-page-chrome.tsx");
    expect(platform).toContain("h-screen");
    expect(platform).toContain("overflow-hidden");
    expect(platform).toContain('data-eos-theme="enterprise-dark"');
    expect(shell).toContain("overflow-y-auto");
    expect(shell).toContain("project-intelligence-main");
    expect(shell).toContain("pi-shell-back");
    expect(chrome).toContain("pi-back-button");
    expect(chrome).toContain("Show details");
  });

  it("restyles Command Center without inventing metrics or changing load states", () => {
    const page = read("app/(platform)/engineering/page.tsx");
    expect(page).toContain("command-center-health");
    expect(page).toContain("command-center-attention");
    expect(page).toContain("command-center-kpi-projects");
    expect(page).toContain("command-center-kpi-tqs");
    expect(page).toContain("command-center-kpi-risks");
    expect(page).toContain("command-center-kpi-actions");
    expect(page).toContain("command-center-kpi-health");
    expect(page).toContain("kpiState");
    expect(page).toContain("loadCommandCenter");
    expect(page).toContain("EosAiCore");
    expect(page).not.toContain("fabricat");
  });

  it("keeps Project Intelligence information architecture and analyst answer layout", () => {
    const shell = read("components/engineering/project-intelligence-shell.tsx");
    const analyst = read("components/engineering/project-ai-analyst.tsx");
    expect(shell).toContain('label: "Overview"');
    expect(shell).toContain('label: "Schedule"');
    expect(shell).toContain('label: "Cost"');
    expect(shell).toContain("Risk & Change");
    expect(shell).toContain('label: "Engineering"');
    expect(shell).toContain('label: "Decisions"');
    expect(shell).toContain('label: "Reports"');
    expect(shell).toContain("Ask Project Intelligence");
    expect(analyst).toContain("<CardTitle>Summary</CardTitle>");
    expect(analyst).toContain("Why it matters");
    expect(analyst).toContain("Evidence");
    expect(analyst).toContain("Limitations");
    expect(analyst).toContain("Recommended human action");
    expect(analyst).toContain("What needs my attention today?");
    expect(analyst).toContain("analyst-show-diagnostics");
    expect(analyst).not.toContain("graph traversal");
    expect(analyst).not.toContain("JARVIS");
  });

  it("does not add a second UI framework, AI stack, or architecture surfaces", () => {
    const pkg = readFileSync(resolve(WEB_SRC, "../package.json"), "utf8");
    expect(pkg).not.toMatch(/three|@react-three|pixi\.js|babylon/i);
    const apiDir = resolve(WEB_SRC, "app/api/engineering/project-intelligence");
    const apiFiles = collectFiles(apiDir).map((file) => file.replace(/\\/g, "/"));
    expect(apiFiles.some((file) => file.endsWith("/command-centre/route.ts"))).toBe(true);
    expect(apiFiles.some((file) => file.endsWith("/analyst/route.ts"))).toBe(true);
    expect(existsSync(resolve(REPO, "packages/ui/src/lib/typography.ts"))).toBe(true);
  });
});
