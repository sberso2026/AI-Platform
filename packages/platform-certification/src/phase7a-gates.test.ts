/**
 * Phase 7A / 7A.1 RTB AI Platform certification — unit gates.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  activeOperatingSystemIds,
  mapCommerceStatusToOsLifecycle,
  REFERENCE_OS_ID,
} from "@rtb/types";
import { OPERATING_SYSTEMS, canSeeNavItem, FULL_NAVIGATION, resolveNavTier } from "@rtb/platform-core";
import { REFERENCE_OS_MANIFEST, assertReferenceOsCertificationOnly } from "@rtb/reference-os";
import { computeTeamsProviderReadiness } from "@rtb/project-intelligence";

const ROOT = resolve(import.meta.dirname, "../../..");

describe("Gate A/B — docs and product model", () => {
  const required = [
    "docs/architecture/RTB_AI_PLATFORM_PRODUCT_MODEL.md",
    "docs/architecture/RTB_AI_PLATFORM_MULTI_OS_RUNTIME.md",
    "docs/architecture/RTB_AI_PLATFORM_DATA_OWNERSHIP.md",
    "docs/architecture/RTB_AI_PLATFORM_BOUNDARY_AUDIT.md",
    "docs/product/RTB_AI_PLATFORM_PACKAGING_AND_LICENSING.md",
    "docs/integrations/MEETING_PROVIDER_STRATEGY.md",
    "docs/integrations/MICROSOFT_TEAMS_CONNECTOR_STATUS.md",
  ];

  it("requires all Phase 7A architecture docs", () => {
    for (const rel of required) {
      expect(existsSync(resolve(ROOT, rel)), rel).toBe(true);
    }
  });

  it("locks Teams live as conditionally_deferred", () => {
    const body = readFileSync(
      resolve(ROOT, "docs/integrations/MICROSOFT_TEAMS_CONNECTOR_STATUS.md"),
      "utf8",
    );
    expect(body).toMatch(/conditionally_deferred/);
    expect(body).toMatch(/productionTeamsProviderReady/);
  });
});

describe("Gate B — platform boundary", () => {
  it("does not hardcode Engineering OS as installed in catalog", () => {
    const eng = OPERATING_SYSTEMS.find((os) => os.id === "engineering");
    expect(eng?.status).toBe("available");
  });

  it("forbids Subscription.ReadWrite.All invention in integration docs", () => {
    const docs = resolve(ROOT, "docs/integrations");
    for (const name of readdirSync(docs)) {
      const text = readFileSync(resolve(docs, name), "utf8");
      expect(text).not.toMatch(/Subscription\.ReadWrite\.All/);
    }
  });
});

describe("Gate D/E — OS runtime and platform-only nav", () => {
  it("maps commerce statuses without a competing lifecycle", () => {
    expect(mapCommerceStatusToOsLifecycle("active")).toBe("active");
    expect(mapCommerceStatusToOsLifecycle("suspended")).toBe("suspended");
    expect(mapCommerceStatusToOsLifecycle("provisioning")).toBe("installing");
    expect(mapCommerceStatusToOsLifecycle("uninstalled")).toBe("uninstalled");
  });

  it("hides Engineering nav when no active OS", () => {
    const ctx = {
      roleSlug: "owner",
      tier: resolveNavTier("owner"),
      permissions: [{ resource: "tenant" as const, action: "admin" as const }],
      showAdvancedInSidebar: false,
      activeOperatingSystemIds: [] as string[],
      hasPermission: () => true,
    };
    const engItems = FULL_NAVIGATION.filter((i) => i.group === "engineering" && !i.sidebarHidden);
    expect(engItems.length).toBeGreaterThan(0);
    expect(engItems.every((item) => !canSeeNavItem(item, ctx))).toBe(true);
  });

  it("shows Engineering nav only when engineering is active", () => {
    const ctx = {
      roleSlug: "owner",
      tier: resolveNavTier("owner"),
      permissions: [{ resource: "tenant" as const, action: "admin" as const }],
      showAdvancedInSidebar: false,
      activeOperatingSystemIds: ["engineering"],
      hasPermission: () => true,
    };
    const engDash = FULL_NAVIGATION.find((i) => i.id === "eng-dashboard");
    expect(engDash && canSeeNavItem(engDash, ctx)).toBe(true);
  });

  it("exposes rtb-ai-platform-ready marker in platform home", () => {
    const page = readFileSync(
      resolve(ROOT, "apps/web/src/app/(platform)/platform/home/page.tsx"),
      "utf8",
    );
    expect(page).toContain('data-testid="rtb-ai-platform-ready"');
  });
});

describe("Gate L — reference-os multi-OS isolation", () => {
  it("keeps reference-os certification-only", () => {
    assertReferenceOsCertificationOnly();
    expect(REFERENCE_OS_MANIFEST.id).toBe(REFERENCE_OS_ID);
    expect(REFERENCE_OS_MANIFEST.certificationOnly).toBe(true);
  });

  it("isolates active OS ids when one is suspended", () => {
    const ids = activeOperatingSystemIds([
      { operatingSystemId: "engineering", status: "active" },
      { operatingSystemId: "reference-os", status: "suspended" },
    ]);
    expect(ids).toEqual(["engineering"]);
  });

  it("namespaces reference-os events separately from engineering", () => {
    const types = (REFERENCE_OS_MANIFEST.events ?? []).map((e) => e.type);
    expect(types.every((t) => t.startsWith("reference_os."))).toBe(true);
  });
});

describe("Gate N — connector fallback", () => {
  it("keeps productionTeamsProviderReady false by default", () => {
    const readiness = computeTeamsProviderReadiness({
      env: { PI_TEAMS_GRAPH_MODE: "fixture" },
      liveTenantCertified: false,
      postMeetingTranscriptCertified: false,
    });
    expect(readiness.productionTeamsProviderReady).toBe(false);
  });
});

describe("Gate M — harmless platform admin agent contract", () => {
  it("registers a certification-only platform health summarizer contract", () => {
    const agent = {
      id: "rtb-ai-platform-health-summarizer",
      name: "RTB AI Platform Health Summarizer",
      certificationOnly: true,
      mayModifyDomainData: false,
      mayApproveBusinessDecisions: false,
    };
    expect(agent.certificationOnly).toBe(true);
    expect(agent.mayModifyDomainData).toBe(false);
    expect(agent.mayApproveBusinessDecisions).toBe(false);
  });
});
