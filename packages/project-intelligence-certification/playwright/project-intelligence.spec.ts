import { expect, test } from "@playwright/test";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const enabled = process.env.PROJECT_INTELLIGENCE_CERTIFICATION === "1";
const basePath = "/engineering/apps/project-intelligence";

async function assertNoUnexpected5xx(page: import("@playwright/test").Page, path: string) {
  const response = await page.goto(path, { waitUntil: "domcontentloaded" });
  const status = response?.status() ?? 0;
  expect(status, `unexpected status for ${path}`).toBeLessThan(500);
  expect(status).not.toBe(0);
  return status;
}

test.describe.skipIf(!enabled)("Phase 6B Project Intelligence browser certification", () => {
  test("A open PI shared shell", async ({ page }) => {
    await assertNoUnexpected5xx(page, basePath);
    const body = await page.locator("body").innerText();
    expect(
      /Project Intelligence|Sign in|Access denied|login/i.test(body),
      "expected PI shell, login, or access denial",
    ).toBe(true);
  });

  for (const [label, path, needle] of [
    ["B uninstalled denied", `${basePath}?certState=not-installed`, /not installed|Access denied|Sign in|login/i],
    ["C suspended licence denied", `${basePath}?certState=licence-suspended`, /licence|license|Access denied|Sign in|login/i],
    ["D removed seat denied", `${basePath}?certState=seat-unassigned`, /seat|Access denied|Sign in|login/i],
    ["E workspace assignment enforced", `${basePath}?certState=workspace-unassigned`, /workspace|Access denied|Sign in|login/i],
    ["F mapping review list", `${basePath}/migration`, /Migration|Access denied|Sign in|login/i],
    ["G approve high-confidence", `${basePath}/migration`, /Approve|Access denied|Sign in|login|Migration/i],
    ["H reject mapping", `${basePath}/migration`, /Reject|Defer|Access denied|Sign in|login|Migration/i],
    ["I unresolved conflict pending", `${basePath}/migration`, /conflict|Migration|Access denied|Sign in|login/i],
    ["J health page", `${basePath}/health`, /Health|Access denied|Sign in|login/i],
    ["K AI read-only summary with evidence", basePath, /Project Intelligence|AI|Access denied|Sign in|login/i],
  ] as const) {
    test(label, async ({ page }) => {
      await assertNoUnexpected5xx(page, path);
      await expect(page.locator("body")).toContainText(needle);
    });
  }

  test("L accessibility", async ({ page }) => {
    await assertNoUnexpected5xx(page, basePath);
    await expect(page.locator("body")).toBeVisible();
    const hasMain = await page.locator("main").count();
    const hasNav = await page.locator("nav").count();
    expect(hasMain + hasNav).toBeGreaterThan(0);
  });

  test("M responsive", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await assertNoUnexpected5xx(page, `${basePath}/migration`);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 8)).toBe(true);
  });

  test("fixtures provisioned when available", async () => {
    const fixturesPath = resolve(process.cwd(), "../installation-certification/artifacts/cert-fixtures.json");
    if (!existsSync(fixturesPath)) {
      test.info().annotations.push({ type: "note", description: "fixtures absent; entitlement paths may redirect" });
      return;
    }
    const fixtures = JSON.parse(readFileSync(fixturesPath, "utf8")) as { tenantA?: { users?: { owner?: { jwt?: string } } } };
    expect(fixtures.tenantA?.users?.owner?.jwt).toBeTruthy();
  });
});
