import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { getEngineeringApiPolicy } from "@rtb/platform-commerce";
import { engineeringApiRequiresIdentityAssurance } from "../lib/commerce/engineering-identity-assurance";
import { formatProjectContextLabel } from "../lib/engineering/module-ops";

const WEB_ROOT = resolve(__dirname, "../../");

function readApp(rel: string) {
  return readFileSync(resolve(WEB_ROOT, rel), "utf8");
}

function srgbChannel(value: number): number {
  const s = value / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(hex: string): number {
  const normalized = hex.replace("#", "");
  const n = Number.parseInt(normalized, 16);
  const r = srgbChannel((n >> 16) & 255);
  const g = srgbChannel((n >> 8) & 255);
  const b = srgbChannel(n & 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(foreground: string, background: string): number {
  const a = relativeLuminance(foreground);
  const b = relativeLuminance(background);
  const [hi, lo] = a > b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
}

describe("EOS-A9F-G1 canonical Engineering project selector", () => {
  it("lists Engineering projects as Engineering OS core, not Project Intelligence", () => {
    const read = getEngineeringApiPolicy("projects", "GET");
    const write = getEngineeringApiPolicy("projects", "POST");
    expect(read.applicationKey).toBeUndefined();
    expect(write.applicationKey).toBeUndefined();
    expect(read.action).toBe("project.read");
    expect(write.action).toBe("project.create");
  });

  it("does not AAL2-gate the shared project selector API", () => {
    expect(engineeringApiRequiresIdentityAssurance("projects", "GET")).toBe(false);
    expect(engineeringApiRequiresIdentityAssurance("projects", "POST")).toBe(false);
    expect(engineeringApiRequiresIdentityAssurance("deliverables", "POST")).toBe(true);
  });

  it("loads Authorized Project options from the Engineering projects API", () => {
    const bar = readApp("src/components/engineering/project-context-bar.tsx");
    expect(bar).toContain('fetch("/api/engineering/projects")');
    expect(bar).toContain("Authorized project");
    expect(bar).toContain('aria-label="Authorized project"');
    expect(bar).toContain("eos-select");
    expect(bar).toContain("data-authorized-count");
    expect(bar).not.toContain("proj-crusher-feed");
  });

  it("styles native select and option with EOS dark-theme contrast tokens", () => {
    const css = readApp("src/app/globals.css");
    const bar = readApp("src/components/engineering/project-context-bar.tsx");
    expect(bar).toContain("<select");
    expect(css).toContain("select.eos-select");
    expect(css).toContain(".eos-select option");
    expect(css).toContain("color-scheme: dark");
    expect(css).toContain("background-color: var(--eos-bg-secondary)");
    expect(css).toContain("color: var(--eos-text-primary)");
    expect(css).toContain('.eos-select option[value=""]');
    expect(css).toContain("color: var(--eos-text-primary)");
    expect(css).toContain(".eos-select option:disabled");
    expect(css).toContain(".eos-select option:hover");
    expect(css).toContain(".eos-select:focus-visible");
    expect(contrastRatio("#e8eef7", "#0b1220")).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio("#93a4bb", "#0b1220")).toBeGreaterThanOrEqual(4.5);
  });

  it("prefers human-readable project name then code, never a raw UUID label", () => {
    expect(
      formatProjectContextLabel({
        projectCode: "ER-A1",
        projectName: "Review Project A1",
      }),
    ).toBe("Review Project A1 · ER-A1");
    expect(
      formatProjectContextLabel({
        projectCode: "4729d258-f953-45f6-927c-2ba2450365a1",
        projectName: "Review Project A1",
      }),
    ).toBe("Review Project A1");
  });

  it("does not bind Deliverables or Lifecycle to a synthetic crusher-feed project id", () => {
    const deliverables = readApp("src/components/engineering/deliverable-workspace.tsx");
    const lifecycle = readApp("src/components/engineering/lifecycle-workspace.tsx");
    expect(deliverables).not.toContain("proj-crusher-feed");
    expect(lifecycle).not.toContain("proj-crusher-feed");
    expect(deliverables).toContain("useResolvedEngineeringProjectId");
    expect(lifecycle).toContain("useResolvedEngineeringProjectId");
  });
});
