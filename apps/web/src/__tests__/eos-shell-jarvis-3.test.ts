import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const WEB_ROOT = resolve(__dirname, "../../");
const UI_ROOT = resolve(WEB_ROOT, "../../packages/ui/src");

function readApp(rel: string) {
  return readFileSync(resolve(WEB_ROOT, rel), "utf8");
}

function readUi(rel: string) {
  return readFileSync(resolve(UI_ROOT, rel), "utf8");
}

describe("EOS-SHELL-JARVIS-3 premium command shell restore", () => {
  it("forces the authenticated platform canvas onto enterprise-dark tokens", () => {
    const shell = readApp("src/components/layout/platform-shell.tsx");
    const theme = readApp("src/components/providers/theme-provider.tsx");
    const css = readApp("src/app/globals.css");
    expect(shell).toContain('data-eos-theme="enterprise-dark"');
    expect(shell).toContain("--eos-bg-primary");
    expect(theme).toContain('defaultTheme="dark"');
    expect(theme).toContain("enableSystem={false}");
    expect(theme).toContain('forcedTheme="dark"');
    expect(css).toContain("--eos-bg-primary: #060b14");
    expect(css).toContain("--eos-accent: #38bdf8");
    expect(css).not.toContain("Force enterprise light shell");
  });

  it("restores Command Centre composition on the live dashboard API", () => {
    const page = readApp("src/app/(platform)/engineering/page.tsx");
    expect(page).toContain("/api/engineering/dashboard");
    expect(page).not.toContain("load-command-center");
    expect(page).toContain('title="Project Health"');
    expect(page).toContain('title="Engineering Intelligence Core"');
    expect(page).toContain('title="Attention Required"');
    expect(page).toContain('title="Live Engineering Signals"');
    expect(page).toContain("displayCount");
    expect(page).toContain('data-testid="home-attention"');
    expect(page).toContain('data-testid="engineering-command-center"');
  });

  it("keeps Engineering Systems on the certified Commerce launcher route", () => {
    const page = readApp("src/app/(platform)/engineering/modules/page.tsx");
    expect(page).toContain("/api/engineering/modules/access");
    expect(page).toContain("systemsState");
    expect(page).not.toMatch(/systemsState.*=.*"Installed"/);
  });

  it("exports JARVIS command primitives from the existing UI package", () => {
    const index = readUi("index.ts");
    expect(index).toContain("CommandPanel");
    expect(index).toContain("EngineeringIntelligenceCore");
    expect(readUi("lib/typography.ts")).toContain('intelligenceCore: "Engineering Intelligence Core"');
  });

  it("does not replace TQ workflow, print, or rich content surfaces", () => {
    const register = readApp("src/app/(platform)/engineering/technical-queries/page.tsx");
    const detail = readApp("src/app/(platform)/engineering/technical-queries/[id]/page.tsx");
    const print = readApp("src/app/(platform)/engineering/technical-queries/[id]/print/page.tsx");
    const compose = readApp("src/app/(platform)/engineering/technical-queries/new/page.tsx");
    const html = readApp("src/components/engineering/tq-query-html.tsx");
    expect(register).toContain("TQ_REGISTER_VIEWS");
    expect(detail).toContain("/print");
    expect(print).toContain("tq-print");
    expect(compose).toContain("save_draft");
    expect(compose).toContain('action: "submit"');
    expect(html).toContain("sanitizeTqQueryHtml");
  });
});
