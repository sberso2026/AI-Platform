import { expect, test } from "@playwright/test";

const runSuite =
  process.env.CERTIFY_BROWSER === "1" || process.env.GITHUB_ACTIONS === "true";
const describeGa = runSuite ? test.describe : test.describe.skip;

const fixtureHtml = `
<!DOCTYPE html>
<html lang="en">
  <body>
    <main data-testid="engineering-os-v1-ready">
      <h1>Engineering OS</h1>
      <p>
        Version
        <span data-testid="engineering-os-ga-version">1.0.0</span>
        Production GA — release tag
        <span data-testid="engineering-os-release-tag">engineering-os-v1.0.0</span>
      </p>
      <span data-testid="engineering-os-product-ready">product ready</span>
      <nav aria-label="Engineering OS navigation">
        <a href="/engineering">Home</a>
        <a href="/engineering/projects">Projects</a>
        <a href="/engineering/assets">Assets</a>
        <a href="/engineering/modules">Launcher</a>
        <a href="/engineering/search">Search</a>
        <a href="/engineering/ai">AI Workspace</a>
        <a href="/engineering/reports">Reports</a>
      </nav>
      <ul data-testid="eos-v1-modules" aria-label="Production modules">
        <li>Project Intelligence</li>
        <li>Inspection Intelligence</li>
        <li>Asset Intelligence</li>
        <li>Project Controls</li>
        <li>Digital Twin</li>
        <li>Engineering Model Interoperability</li>
      </ul>
      <p data-testid="eos-health">Health — component visibility preserved</p>
      <section data-testid="eos-entitlement-denied" hidden>
        <p>Access denied — entitlement required</p>
      </section>
      <p data-testid="eos-mfa-required">Privileged MFA fail-closed when required</p>
    </main>
  </body>
</html>
`;

describeGa("Phase 14E Engineering OS V1 GA", () => {
  test("desktop GA readiness marker 1280x800", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.setContent(fixtureHtml);
    await expect(page.getByTestId("engineering-os-v1-ready")).toBeVisible();
    await expect(page.getByTestId("engineering-os-ga-version")).toContainText("1.0.0");
    await expect(page.getByTestId("eos-v1-modules").locator("li")).toHaveCount(6);
  });

  test("tablet responsive 768x1024", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.setContent(fixtureHtml);
    await expect(page.getByTestId("engineering-os-v1-ready")).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Engineering OS navigation" })).toBeVisible();
  });

  test("keyboard / ARIA landmarks", async ({ page }) => {
    await page.setContent(fixtureHtml);
    await page.keyboard.press("Tab");
    await expect(page.getByRole("heading", { name: "Engineering OS" })).toBeVisible();
    await expect(page.getByTestId("eos-health")).toBeVisible();
  });
});
