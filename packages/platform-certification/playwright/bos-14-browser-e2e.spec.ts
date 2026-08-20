import { test, expect } from "@playwright/test";
import { BOS_14_BROWSER_ROUTES, BOS14C_STATUS, bosBrowserE2eCertified } from "@rtb/business-os";

const browserReady = Boolean(
  process.env.RTB_TEST_BASE_URL || process.env.PLAYWRIGHT_BASE_URL || process.env.E2E_BASE_URL,
);

test.describe("BOS-14C browser E2E honesty", () => {
  test("does not certify browser E2E from an unavailable environment", () => {
    expect(bosBrowserE2eCertified).toBe(false);
    expect(BOS14C_STATUS).toBe("BOS14C_BLOCKED_BROWSER_ENV");
    if (!browserReady) expect(browserReady).toBe(false);
  });
});

test.describe("BOS-14C live Business OS routes", () => {
  test.beforeEach(() => {
    test.skip(!browserReady, "BOS14C_BLOCKED_BROWSER_ENV: no Playwright base URL");
  });

  test("authorized Business OS routes are reachable", async ({ page }) => {
    for (const route of BOS_14_BROWSER_ROUTES) {
      const res = await page.goto(route);
      expect(res?.status() ?? 500).toBeLessThan(500);
    }
  });
});
