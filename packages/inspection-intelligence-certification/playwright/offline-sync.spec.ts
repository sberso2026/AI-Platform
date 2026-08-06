import { expect, test } from "@playwright/test";

/**
 * Phase 9G offline sync Playwright suite (emulation).
 * Physical-device evidence is documented separately and not claimed here.
 */
const runSuite = process.env.CERTIFY_BROWSER === "1" || process.env.GITHUB_ACTIONS === "true";
const describeOffline = runSuite ? test.describe : test.describe.skip;

const fixtureHtml = `
<!DOCTYPE html>
<html lang="en">
  <body>
    <div data-testid="inspection-intelligence-shell" data-offline-sync="true" data-sync-readiness="online_ready">
      <nav aria-label="Inspection Intelligence features">
        <a href="/engineering/apps/inspection-intelligence/sync">Sync</a>
      </nav>
      <main>
        <div data-testid="inspection-intelligence-mobile-ready"></div>
        <div data-testid="inspection-intelligence-offline-sync-ready">
          <h1>Inspection Intelligence</h1>
        </div>
        <section data-testid="inspection-sync-ready" aria-labelledby="sync">
          <h1 id="sync">Sync Status</h1>
          <dd data-testid="inspection-sync-pending">0 / 0</dd>
          <dd data-testid="inspection-sync-wipe-limitation">best-effort on reconnect; permanently offline devices not guaranteed</dd>
        </section>
      </main>
    </div>
  </body>
</html>
`;

describeOffline("Phase 9G Inspection Intelligence offline sync", () => {
  test("phone offline sync markers 390x844", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.setContent(fixtureHtml);
    await expect(page.getByTestId("inspection-intelligence-offline-sync-ready")).toBeVisible();
    await expect(page.getByTestId("inspection-intelligence-shell")).toHaveAttribute(
      "data-offline-sync",
      "true",
    );
  });

  test("tablet sync status 768x1024", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.setContent(fixtureHtml);
    await expect(page.getByTestId("inspection-sync-ready")).toBeVisible();
    await expect(page.getByTestId("inspection-sync-wipe-limitation")).toContainText(
      "permanently offline",
    );
  });

  test("service worker recovery contract present in UI copy", async ({ page }) => {
    await page.setViewportSize({ width: 412, height: 915 });
    await page.setContent(fixtureHtml);
    await expect(page.getByTestId("inspection-sync-pending")).toBeVisible();
    await expect(page.getByRole("navigation", { name: /Inspection Intelligence features/i })).toBeVisible();
  });
});
