import { describe, expect, it } from "vitest";
import { activeOperatingSystemIds, mapCommerceStatusToOsLifecycle } from "@rtb/types";
import { canSeeNavItem, FULL_NAVIGATION, resolveNavTier } from "@rtb/platform-core";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "../../..");

describe("Phase 7B multi-OS isolation (unit)", () => {
  it("keeps reference-os active when engineering is suspended", () => {
    const ids = activeOperatingSystemIds([
      { operatingSystemId: "engineering", status: "suspended" },
      { operatingSystemId: "reference-os", status: "active" },
    ]);
    expect(ids).toEqual(["reference-os"]);
  });

  it("hides reference-os nav unless active", () => {
    const item = FULL_NAVIGATION.find((i) => i.id === "reference-os-home")!;
    const hidden = canSeeNavItem(item, {
      roleSlug: "owner",
      tier: resolveNavTier("owner"),
      permissions: [{ resource: "tenant", action: "admin" }],
      showAdvancedInSidebar: false,
      activeOperatingSystemIds: ["engineering"],
      hasPermission: () => true,
    });
    expect(hidden).toBe(false);
    const shown = canSeeNavItem(item, {
      roleSlug: "owner",
      tier: resolveNavTier("owner"),
      permissions: [{ resource: "tenant", action: "admin" }],
      showAdvancedInSidebar: false,
      activeOperatingSystemIds: ["reference-os"],
      hasPermission: () => true,
    });
    expect(shown).toBe(true);
  });

  it("maps uninstall/reinstall lifecycle without competing states", () => {
    expect(mapCommerceStatusToOsLifecycle("uninstall_pending")).toBe("uninstall_pending");
    expect(mapCommerceStatusToOsLifecycle("uninstalled")).toBe("uninstalled");
    expect(mapCommerceStatusToOsLifecycle("active")).toBe("active");
  });

  it("documents fixture isolation and hosted E2E", () => {
    expect(existsSync(resolve(ROOT, "docs/testing/RTB_AI_PLATFORM_FIXTURE_ISOLATION.md"))).toBe(true);
    expect(existsSync(resolve(ROOT, "docs/testing/RTB_AI_PLATFORM_HOSTED_E2E.md"))).toBe(true);
  });

  it("keeps readiness marker id stable", () => {
    const page = readFileSync(
      resolve(ROOT, "apps/web/src/app/(platform)/platform/home/page.tsx"),
      "utf8",
    );
    expect(page).toContain('data-testid="rtb-ai-platform-ready"');
    expect(page).not.toMatch(/[Cc]ortex/);
  });

  it("lifecycle observability payload includes required Phase 7B fields", async () => {
    const { emitLifecycleObservation } = await import("@rtb/platform-commerce");
    const captured: Record<string, unknown>[] = [];
    const events = {
      emit: async (input: { payload?: Record<string, unknown> }) => {
        captured.push(input.payload ?? {});
      },
    };
    await emitLifecycleObservation(events as never, {
      eventType: "installation.suspended",
      tenantId: "t1",
      workspaceId: "w1",
      installationId: "i1",
      actorUserId: "u1",
      operation: "installation.suspend",
      result: "success",
      correlationId: "c1",
      aggregateType: "installation",
      aggregateId: "i1",
      payload: {
        requestId: "r1",
        operatingSystemKey: "engineering",
        previousState: "active",
        nextState: "suspended",
        durationMs: 12,
      },
    });
    expect(captured[0]).toMatchObject({
      request_id: "r1",
      correlation_id: "c1",
      tenant_id: "t1",
      workspace_id: "w1",
      actor_id: "u1",
      installation_id: "i1",
      operating_system_key: "engineering",
      action: "installation.suspend",
      previous_state: "active",
      next_state: "suspended",
      result: "success",
      duration_ms: 12,
    });
  });
});
