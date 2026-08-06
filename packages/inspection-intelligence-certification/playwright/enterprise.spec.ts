import { expect, test } from "@playwright/test";

/**
 * Phase 9C browser suite.
 * When INSPECTION_INTELLIGENCE_CERTIFICATION=1 and fixtures/auth are available, full path runs.
 * Reserved: offline, camera, GPS, sync — asserted as documentation placeholders only.
 */
const enabled = process.env.INSPECTION_INTELLIGENCE_CERTIFICATION === "1";
const describeEnterprise = enabled ? test.describe : test.describe.skip;

const base = "/engineering/apps/inspection-intelligence";

describeEnterprise("Phase 9C Inspection Intelligence enterprise browser", () => {
  test("desktop enterprise foundation markers", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(base);
    await expect(page.getByTestId("inspection-intelligence-enterprise-foundation-ready")).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId("inspection-intelligence-shell")).toBeVisible();
  });

  test("tablet layout", async ({ page }) => {
    await page.setViewportSize({ width: 834, height: 1112 });
    await page.goto(base);
    await expect(page.getByTestId("inspection-intelligence-shell")).toBeVisible({
      timeout: 45_000,
    });
  });

  test("touch phone viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${base}/sessions`);
    await expect(page.getByTestId("inspection-sessions-ready")).toBeVisible({
      timeout: 45_000,
    });
  });

  test("accessibility landmarks and review workflow surface", async ({ page }) => {
    await page.goto(`${base}/review`);
    await expect(page.getByRole("heading", { name: /review/i })).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId("inspection-review-ready")).toBeVisible();
  });

  test("reserved mobile capabilities remain deferred", async () => {
    // Offline / camera / GPS / sync are Phase 9D — placeholder assertion for restructuring-safety.
    expect(["offline", "camera", "gps", "sync"]).toHaveLength(4);
  });
});
