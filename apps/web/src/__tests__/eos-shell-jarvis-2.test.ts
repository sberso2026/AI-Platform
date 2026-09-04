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

describe("EOS-SHELL-JARVIS-2 command composition", () => {
  it("defines three visual depth layers without WebGL or canvas runtime", () => {
    const css = read("app/globals.css");
    expect(css).toContain(".page-main");
    expect(css).toContain("radial-gradient");
    expect(css).toContain(".eos-command-panel");
    expect(css).toContain("eos-core-spin");
    expect(css).toContain("prefers-reduced-motion");
    expect(css).not.toContain("JARVIS");
    expect(css).not.toMatch(/webgl|background-video/i);
  });

  it("redesigns Command Center as a cockpit rather than equal SaaS KPI cards", () => {
    const page = read("app/(platform)/engineering/page.tsx");
    expect(page).toContain("Project health");
    expect(page).toContain("Engineering Intelligence Core");
    expect(page).toContain("Attention required");
    expect(page).toContain("Live engineering signals");
    expect(page).toContain("EosAiCore");
    expect(page).toContain("ProjectHealthIndicator");
    expect(page).toContain("AttentionQueue");
    expect(page).toContain("LiveSignal");
    expect(page).not.toContain("this week");
    expect(page).not.toContain("JARVIS");
  });

  it("presents modules as a systems matrix without visible snake_case keys", () => {
    const modules = read("app/(platform)/engineering/modules/page.tsx");
    expect(modules).toContain("Engineering systems matrix");
    expect(modules).toContain("Open system");
    expect(modules).toContain("engineering-module-${mod.key}");
    expect(modules).not.toMatch(/>\s*\{mod\.key\}/);
    expect(modules).not.toContain("{mod.key}</");
  });

  it("rebuilds PI Overview around health, change, attention, and the AI brief", () => {
    const overview = read("app/(platform)/engineering/apps/project-intelligence/page.tsx");
    const centre = read("components/engineering/project-command-centre.tsx");
    expect(overview).toContain("project-intelligence-panel-${panel.id}");
    expect(overview).toContain("Records and reports");
    expect(centre).toContain("ProjectHealthIndicator");
    expect(centre).toContain("pi-project-brief");
    expect(centre).toContain("ProjectSelectCommandSurface");
    expect(centre).toContain("Ask Project Intelligence");
    expect(centre).not.toContain("JARVIS");
  });

  it("keeps PI intelligence consoles on existing APIs with real-data visuals", () => {
    const schedule = read("components/engineering/project-schedule-intelligence.tsx");
    const cost = read("components/engineering/project-cost-progress-intelligence.tsx");
    const risk = read("components/engineering/project-risk-change-intelligence.tsx");
    const engineering = read("components/engineering/project-engineering-intelligence.tsx");
    const decisions = read("components/engineering/project-query-decision-intelligence.tsx");
    const analyst = read("components/engineering/project-ai-analyst.tsx");
    expect(schedule).toContain("MilestoneTimeline");
    expect(cost).toContain("No published cost evidence available.");
    expect(cost).toContain("SignalBar");
    expect(risk).toContain("SeverityDistribution");
    expect(risk).toContain("item coordinates are not published");
    expect(engineering).toContain("EvidenceChain");
    expect(decisions).toContain("DecisionQueue");
    expect(decisions).not.toContain("Canonical TQ model:");
    expect(analyst).toContain("<CardTitle>Summary</CardTitle>");
    expect(analyst).toContain("Executive answer");
    expect(analyst).toContain("Next human action");
    expect(analyst).toContain("analyst-show-diagnostics");
  });

  it("keeps architecture freeze and does not introduce a second visual runtime", () => {
    const pkg = readFileSync(resolve(WEB_SRC, "../package.json"), "utf8");
    expect(pkg).not.toMatch(/three|@react-three|pixi\.js|babylon|webgl/i);
    const apiDir = resolve(WEB_SRC, "app/api/engineering/project-intelligence");
    const apiFiles = collectFiles(apiDir).map((file) => file.replace(/\\/g, "/"));
    expect(apiFiles.some((file) => file.endsWith("/command-centre/route.ts"))).toBe(true);
    expect(apiFiles.some((file) => file.endsWith("/analyst/route.ts"))).toBe(true);
    expect(existsSync(resolve(REPO, "docs/pilot/EOS-SHELL-JARVIS-2/visual-gap-analysis.md"))).toBe(true);
    expect(existsSync(resolve(REPO, "docs/pilot/EOS-SHELL-JARVIS-2/architecture-freeze.md"))).toBe(true);
    expect(read("components/layout/platform-shell.tsx")).toContain("h-screen");
    expect(read("components/engineering/project-intelligence-shell.tsx")).toContain("overflow-y-auto");
    expect(read("components/engineering/project-intelligence-shell.tsx")).toContain("eos-pi-context-nav");
  });
});
