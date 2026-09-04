import { describe, it, expect } from "vitest";
import {
  TYPOGRAPHY,
  GLOBAL_SEARCH_PLACEHOLDER,
  SPACING,
  BRANDING,
  resolveStatusChip,
  STATUS_LABELS,
  statusChipVariants,
  sidebarNavItemClassName,
} from "./index";

describe("EOS-SHELL-JARVIS-1 — Typography enforcement", () => {
  it("keeps primary text at 16px+ and titles at enterprise scale", () => {
    expect(TYPOGRAPHY.pageTitle).toContain("text-[2.125rem]");
    expect(TYPOGRAPHY.pageTitle).toContain("font-bold");
    expect(TYPOGRAPHY.sectionHeading).toContain("text-[1.25rem]");
    expect(TYPOGRAPHY.kpiValue).toContain("text-[2.5rem]");
    expect(TYPOGRAPHY.kpiLabel).toContain("text-[0.9375rem]");
    expect(TYPOGRAPHY.body).toContain("text-[1rem]");
    expect(TYPOGRAPHY.sidebarItem).toContain("text-[1rem]");
    expect(TYPOGRAPHY.sidebarItem).toContain("leading-5");
  });

  it("keeps metadata secondary only", () => {
    expect(TYPOGRAPHY.meta).toContain("text-[0.875rem]");
    expect(TYPOGRAPHY.sidebarGroup).toContain("text-[0.8125rem]");
    expect(TYPOGRAPHY.sidebarGroup).toContain("tracking-[0.08em]");
  });
});

describe("EOS-SHELL-JARVIS-1 — Sidebar nav spacing", () => {
  it("uses flex row with 44–48px min height, padding, and 12px gap", () => {
    const cls = sidebarNavItemClassName({ active: false });
    expect(cls).toContain("flex");
    expect(cls).toContain("items-center");
    expect(cls).toContain("min-h-12");
    expect(cls).toContain("px-4");
    expect(cls).toContain("gap-3");
  });

  it("keeps active highlight distinct and luminous", () => {
    const active = sidebarNavItemClassName({ active: true });
    expect(active).toContain("bg-[color:var(--eos-accent-soft)]");
    expect(active).toContain("ring-[color:var(--eos-border-active)]");
  });

  it("documents fixed icon rail width", () => {
    expect(SPACING.sidebarNavIconWidth).toBe("w-6");
    expect(SPACING.sidebarIconGap).toBe("gap-3");
    expect(SPACING.sidebarWidth).toBe("w-[16.25rem]");
  });
});

describe("Batch 2.11 — Search input icon clearance", () => {
  it("keeps icon in a fixed right rail so text ends before the glyph", () => {
    expect(SPACING.searchInputIconRail).toBe("w-11");
    expect(SPACING.searchInputPaddingLeft).toBe("pl-4");
    expect(SPACING.searchInputPaddingRight).toBe("pr-2");
  });

  it("keeps multi-entity placeholder", () => {
    expect(GLOBAL_SEARCH_PLACEHOLDER).toBe(
      "Search projects, assets, documents, risks..."
    );
  });

  it("allows desktop search up to ~520px", () => {
    expect(SPACING.globalSearchMax).toContain("520px");
  });
});

describe("Batch 2.11 — Branding", () => {
  it("keeps 40–44px logo and clearer brand type", () => {
    expect(BRANDING.logoSizePx).toBeGreaterThanOrEqual(40);
    expect(BRANDING.logoSizePx).toBeLessThanOrEqual(44);
    expect(BRANDING.org).toBe("RTB");
    expect(BRANDING.product).toBe("Engineering OS");
    expect(BRANDING.edition).toBe("Enterprise Edition");
    expect(TYPOGRAPHY.brandMark).toContain("font-bold");
    expect(TYPOGRAPHY.brandProduct).toContain("font-semibold");
    expect(TYPOGRAPHY.brandEdition).toContain("text-[0.8125rem]");
  });
});

describe("Batch 2.09/2.10 — StatusChip contracts", () => {
  it("resolves engineering statuses", () => {
    expect(resolveStatusChip("pending").status).toBe("pending");
    expect(resolveStatusChip("critical").status).toBe("critical");
    expect(resolveStatusChip("ai-review-required").status).toBe("ai-review");
  });

  it("exposes required labels", () => {
    for (const key of [
      "pending",
      "approved",
      "closed",
      "high",
      "medium",
      "low",
      "critical",
      "complete",
      "ai-review",
    ] as const) {
      expect(STATUS_LABELS[key]).toBeTruthy();
      expect(statusChipVariants({ status: key })).toContain("h-7");
    }
  });
});

describe("Batch 2.11 — Component contracts", () => {
  it("exports building blocks", async () => {
    const mod = await import("./index");
    expect(mod.SearchInput).toBeTypeOf("object");
    expect(mod.SidebarNavItem).toBeTypeOf("function");
    expect(mod.sidebarNavItemClassName).toBeTypeOf("function");
    expect(mod.CommandPanel).toBeTypeOf("function");
    expect(mod.EngineeringIntelligenceCore).toBeTypeOf("function");
    expect(mod.ProjectHealthIndicator).toBeTypeOf("function");
    expect(mod.LiveSignal).toBeTypeOf("function");
    expect(mod.AttentionQueue).toBeTypeOf("function");
    expect(mod.MilestoneTimeline).toBeTypeOf("function");
    expect(mod.EvidenceChain).toBeTypeOf("function");
    expect(mod.DecisionQueue).toBeTypeOf("function");
  });
});
