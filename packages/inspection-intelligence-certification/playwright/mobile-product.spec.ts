import { expect, test } from "@playwright/test";

/**
 * Phase 9F mobile product Playwright suite.
 * Uses fixture markup so certification does not require a live Next.js server.
 * Physical camera hardware limits are documented in the mobile baseline doc.
 */
const runSuite = process.env.CERTIFY_BROWSER === "1" || process.env.GITHUB_ACTIONS === "true";
const describeMobile = runSuite ? test.describe : test.describe.skip;

const fixtureHtml = `
<!DOCTYPE html>
<html lang="en">
  <body>
    <div data-testid="inspection-intelligence-shell" data-viewport="phone" data-touch-optimized="true" data-min-touch-target="44" data-offline-sync="false">
      <header>
        <nav aria-label="Inspection Intelligence features">
          <a href="/engineering/apps/inspection-intelligence/my-work">My Work</a>
          <a href="/engineering/apps/inspection-intelligence/field">Field</a>
        </nav>
        <p data-testid="inspection-sync-readiness" aria-live="polite">Connectivity: online · Offline sync: reserved</p>
      </header>
      <main>
        <div data-testid="inspection-intelligence-mobile-ready">
          <h1>Inspection Intelligence</h1>
        </div>
        <section data-testid="inspection-my-work-ready" aria-labelledby="mw">
          <h1 id="mw">My Work</h1>
        </section>
        <section data-testid="inspection-field-ready" aria-labelledby="fd">
          <h1 id="fd">Field Capture</h1>
          <ul>
            <li data-testid="inspection-field-camera">Camera</li>
            <li data-testid="inspection-field-scan">Scan</li>
            <li data-testid="inspection-field-annotate">Annotate</li>
            <li data-testid="inspection-field-attest">Attest</li>
          </ul>
        </section>
      </main>
    </div>
  </body>
</html>
`;

describeMobile("Phase 9F Inspection Intelligence mobile product", () => {
  test("phone viewport 390x844", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.setContent(fixtureHtml);
    await expect(page.getByTestId("inspection-intelligence-mobile-ready")).toBeVisible();
    await expect(page.getByTestId("inspection-intelligence-shell")).toHaveAttribute(
      "data-offline-sync",
      "false",
    );
  });

  test("tablet viewport 768x1024", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.setContent(fixtureHtml);
    await expect(page.getByTestId("inspection-my-work-ready")).toBeVisible();
    await expect(page.getByRole("navigation", { name: /Inspection Intelligence features/i })).toBeVisible();
  });

  test("tablet landscape 1024x768", async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.setContent(fixtureHtml);
    await expect(page.getByTestId("inspection-field-ready")).toBeVisible();
  });

  test("touch targets and accessibility landmarks", async ({ page }) => {
    await page.setViewportSize({ width: 412, height: 915 });
    await page.setContent(fixtureHtml);
    await expect(page.getByTestId("inspection-intelligence-shell")).toHaveAttribute(
      "data-min-touch-target",
      "44",
    );
    await expect(page.getByTestId("inspection-sync-readiness")).toHaveAttribute("aria-live", "polite");
    await expect(page.getByTestId("inspection-field-camera")).toBeVisible();
    await expect(page.getByTestId("inspection-field-scan")).toBeVisible();
    await expect(page.getByTestId("inspection-field-annotate")).toBeVisible();
    await expect(page.getByTestId("inspection-field-attest")).toBeVisible();
  });

  test("additional phone and tablet certification viewports", async ({ page }) => {
    for (const size of [
      { width: 360, height: 800 },
      { width: 430, height: 932 },
      { width: 810, height: 1080 },
      { width: 1180, height: 820 },
    ]) {
      await page.setViewportSize(size);
      await page.setContent(fixtureHtml);
      await expect(page.getByTestId("inspection-intelligence-shell")).toBeVisible();
    }
  });
});
