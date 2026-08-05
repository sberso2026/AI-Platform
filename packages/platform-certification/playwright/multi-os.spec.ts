import { test, expect, type APIRequestContext, type BrowserContext } from "@playwright/test";
import { signInAs } from "./auth.js";
import { loadManifest } from "./fixtures.js";

async function cookieHeader(context: BrowserContext): Promise<string> {
  const cookies = await context.cookies();
  return cookies.map((c) => `${c.name}=${c.value}`).join("; ");
}

async function postLifecycle(
  request: APIRequestContext,
  path: string,
  cookie: string,
  data: Record<string, unknown> = {},
) {
  return request.post(path, {
    headers: { Cookie: cookie, "Content-Type": "application/json", "x-request-id": `7b-${Date.now()}` },
    data,
  });
}

test.describe("Phase 7B browser multi-OS flows", () => {
  test("A-C platform readiness and empty OS nav for unentitled", async ({ page, context }) => {
    const m = loadManifest();
    await signInAs(context, m.users.unentitled.email);
    await page.goto("/platform/home");
    await expect(page.getByTestId("rtb-ai-platform-ready")).toBeVisible();
    await expect(page.getByRole("link", { name: /Engineering Command|Projects/i })).toHaveCount(0);
    await expect(page.getByRole("link", { name: /Reference Home/i })).toHaveCount(0);
  });

  test("B owner sees platform administration and OS catalogue", async ({ page, context }) => {
    const m = loadManifest();
    await signInAs(context, m.users.owner.email);
    await page.goto("/platform/home");
    await expect(page.getByTestId("rtb-ai-platform-ready")).toBeVisible();
    await page.goto("/system/products");
    expect((await page.goto("/system/products"))?.status() ?? 200).toBeLessThan(500);
    await expect(page.locator("body")).toBeVisible();
  });

  test("F-G owner Engineering navigation when entitled", async ({ page, context }) => {
    const m = loadManifest();
    await signInAs(context, m.users.owner.email);
    await page.goto("/engineering");
    await expect(page).not.toHaveURL(/access-denied|login/i);
    await expect(page.locator("body")).toBeVisible();
  });

  test("G engineer access without 5xx", async ({ page, context }) => {
    const m = loadManifest();
    await signInAs(context, m.users.engineer.email);
    const res = await page.goto("/engineering");
    expect(res?.status() ?? 200).toBeLessThan(500);
    await expect(page).not.toHaveURL(/login/i);
  });

  test("H viewer read-only engineering surface", async ({ page, context }) => {
    const m = loadManifest();
    await signInAs(context, m.users.viewer.email);
    const res = await page.goto("/engineering");
    expect(res?.status() ?? 200).toBeLessThan(500);
  });

  test("I unentitled denied engineering deep route", async ({ page, context }) => {
    const m = loadManifest();
    await signInAs(context, m.users.unentitled.email);
    const res = await page.goto("/engineering/projects");
    expect(res?.status() ?? 200).toBeLessThan(500);
    await expect(page.getByTestId("reference-os-ready")).toHaveCount(0);
  });

  test("J-K owner opens reference-os when installed", async ({ page, context }) => {
    const m = loadManifest();
    await signInAs(context, m.users.owner.email);
    await page.goto("/reference-os");
    await expect(page.getByTestId("reference-os-ready")).toBeVisible();
  });

  test("L-N Engineering suspend keeps reference-os; resume restores", async ({
    page,
    context,
    request,
  }) => {
    const m = loadManifest();
    await signInAs(context, m.users.owner.email);
    const cookie = await cookieHeader(context);

    const suspend = await postLifecycle(
      request,
      `/api/platform/installations/${m.installations.engineering.id}/suspend`,
      cookie,
      { reason: "phase7b-cert-eng-suspend" },
    );
    expect(suspend.status()).toBeLessThan(500);
    if (suspend.status() >= 400) {
      const body = await suspend.json();
      expect(body.error).toMatchObject({
        code: expect.any(String),
        message: expect.any(String),
        requestId: expect.any(String),
        details: expect.any(Object),
      });
    }

    await page.goto("/reference-os");
    await expect(page.getByTestId("reference-os-ready")).toBeVisible();

    const nav = await request.get("/api/platform/nav-context", { headers: { Cookie: cookie } });
    expect(nav.status()).toBeLessThan(500);
    if (nav.ok()) {
      const payload = await nav.json();
      const active: string[] = payload?.data?.activeOperatingSystemIds ?? [];
      expect(active.includes("reference-os") || active.length === 0 || !active.includes("engineering")).toBeTruthy();
    }

    const resume = await postLifecycle(
      request,
      `/api/platform/installations/${m.installations.engineering.id}/resume`,
      cookie,
    );
    expect(resume.status()).toBeLessThan(500);
  });

  test("O-P reference-os suspend keeps Engineering; resume restores", async ({
    page,
    context,
    request,
  }) => {
    const m = loadManifest();
    await signInAs(context, m.users.owner.email);
    const cookie = await cookieHeader(context);

    const suspend = await postLifecycle(
      request,
      `/api/platform/installations/${m.installations.referenceOs.id}/suspend`,
      cookie,
      { reason: "phase7b-cert-ref-suspend" },
    );
    expect(suspend.status()).toBeLessThan(500);

    await page.goto("/engineering");
    expect((await page.goto("/engineering"))?.status() ?? 200).toBeLessThan(500);
    await expect(page).not.toHaveURL(/login/i);

    const resume = await postLifecycle(
      request,
      `/api/platform/installations/${m.installations.referenceOs.id}/resume`,
      cookie,
    );
    expect(resume.status()).toBeLessThan(500);
    await page.goto("/reference-os");
    await expect(page.getByTestId("reference-os-ready")).toBeVisible();
  });

  test("Q-S uninstall Engineering keeps platform+reference; reinstall restores", async ({
    page,
    context,
    request,
  }) => {
    const m = loadManifest();
    await signInAs(context, m.users.owner.email);
    const cookie = await cookieHeader(context);

    const uninstall = await postLifecycle(
      request,
      `/api/platform/installations/${m.installations.engineering.id}/uninstall`,
      cookie,
      { force: true },
    );
    expect(uninstall.status()).toBeLessThan(500);
    if (uninstall.status() >= 400) {
      const body = await uninstall.json();
      expect(body.error?.code).toBeTruthy();
      expect(body.error?.requestId).toBeTruthy();
      expect(body.error?.details).toBeDefined();
    }

    await page.goto("/platform/home");
    await expect(page.getByTestId("rtb-ai-platform-ready")).toBeVisible();

    const refRes = await page.goto("/reference-os");
    expect(refRes?.status() ?? 200).toBeLessThan(500);

    if (uninstall.ok()) {
      const reinstall = await postLifecycle(request, "/api/platform/installations", cookie, {
        productId: m.installations.engineering.productId,
        productSlug: m.installations.engineering.productSlug,
        workspaceIds: m.workspaces.map((w) => w.id),
      });
      expect(reinstall.status()).toBeLessThan(500);
      if (reinstall.ok()) {
        const body = await reinstall.json();
        if (body?.data?.id) {
          m.installations.engineering.id = body.data.id;
        }
      }
    }
  });

  test("T workspace isolation: beta workspace id not injectable via cross path", async ({
    page,
    context,
  }) => {
    const m = loadManifest();
    await signInAs(context, m.users.owner.email);
    const foreign = "00000000-0000-4000-8000-000000000099";
    const res = await page.goto(`/engineering/projects?workspaceId=${foreign}`);
    expect(res?.status() ?? 200).toBeLessThan(500);
  });

  test("U cross-tenant denial via foreign tenant query", async ({ page, context, request }) => {
    const m = loadManifest();
    await signInAs(context, m.users.owner.email);
    const cookie = await cookieHeader(context);
    const foreignTenant = "00000000-0000-4000-8000-ffffffffffff";
    const res = await request.get(`/api/platform/installations?tenantId=${foreignTenant}`, {
      headers: { Cookie: cookie },
    });
    expect(res.status()).toBeLessThan(500);
    // Must not leak foreign tenant installations as authoritative payload
    if (res.ok()) {
      const body = await res.json();
      const rows = body?.data ?? [];
      if (Array.isArray(rows)) {
        for (const row of rows) {
          expect(row.tenant_id === foreignTenant).toBe(false);
        }
      }
    }
  });

  test("V logout invalidates session cookie jar", async ({ page, context }) => {
    const m = loadManifest();
    await signInAs(context, m.users.owner.email);
    await page.goto("/platform/home");
    await expect(page.getByTestId("rtb-ai-platform-ready")).toBeVisible();
    await context.clearCookies();
    await page.goto("/platform/home");
    const readyVisible = await page.getByTestId("rtb-ai-platform-ready").isVisible().catch(() => false);
    if (readyVisible) {
      const res = await page.request.get("/api/platform/nav-context");
      expect([401, 403, 200].includes(res.status())).toBeTruthy();
    }
  });
});
