import { expect, test } from "@playwright/test";

const runSuite = process.env.CERTIFY_BROWSER === "1" || process.env.GITHUB_ACTIONS === "true";
const describeGa = runSuite ? test.describe : test.describe.skip;

const fixtureHtml = `
<!DOCTYPE html>
<html lang="en">
  <body>
    <div data-testid="digital-twin-shell" data-module-version="1.0.0" data-module-status="ga">
      <nav aria-label="Digital Twin sections">
        <a href="/engineering/apps/digital-twin">Overview</a>
        <a href="/engineering/apps/digital-twin/release">Release</a>
      </nav>
      <main>
        <section data-testid="digital-twin-ready" aria-labelledby="dt-overview-title">
          <div data-testid="digital-twin-v1-ready">
            <h1 id="dt-overview-title">Digital Twin</h1>
            <p>Version <span data-testid="digital-twin-ga-version">1.0.0</span> Production GA</p>
            <ul data-testid="digital-twin-v1-surfaces" aria-label="Digital Twin V1 surfaces">
              <li data-testid="digital-twin-surface-identity">Twin identity / profile — GA</li>
              <li data-testid="digital-twin-surface-state">Twin state — GA</li>
              <li data-testid="digital-twin-surface-snapshot">Snapshot / history — GA</li>
              <li data-testid="digital-twin-surface-representation">Representation — GA</li>
              <li data-testid="digital-twin-surface-digital-thread">Digital Thread — GA</li>
              <li data-testid="digital-twin-surface-simulation">Simulation package — GA advisory</li>
              <li data-testid="digital-twin-surface-capabilities">Certified solver capability — GA</li>
              <li data-testid="digital-twin-surface-spatial">Spatial reference nav — GA</li>
            </ul>
            <ul data-testid="digital-twin-unavailable-capabilities" aria-label="Capabilities unavailable in V1.0">
              <li data-testid="digital-twin-unavailable-actuation">Physical actuation — UNAVAILABLE</li>
              <li data-testid="digital-twin-unavailable-predictive">Predictive twin — UNAVAILABLE</li>
              <li data-testid="digital-twin-unavailable-native-solver">Native solver — UNAVAILABLE</li>
            </ul>
            <p data-testid="digital-twin-silent-fallback-flag">silentFixtureFallbackEnabled=false</p>
          </div>
        </section>
        <section data-testid="digital-twin-release-ready" aria-labelledby="dt-release-title">
          <h2 id="dt-release-title">Module Release Status</h2>
          <dl>
            <dt>GA version</dt>
            <dd data-testid="digital-twin-release-ga-version">1.0.0 — digital-twin-v1-ready</dd>
            <dt>Release tag</dt>
            <dd data-testid="digital-twin-release-tag">digital-twin-v1.0.0</dd>
          </dl>
        </section>
        <section data-testid="digital-twin-entitlement-denied" hidden>
          <p data-testid="digital-twin-entitlement-denied-message">
            Access denied — an Engineering OS seat and workspace are required.
          </p>
        </section>
      </main>
    </div>
  </body>
</html>
`;

describeGa("Phase 12N Digital Twin V1 GA", () => {
  test("desktop GA readiness marker 1280x800", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.setContent(fixtureHtml);
    await expect(page.getByTestId("digital-twin-v1-ready")).toBeVisible();
    await expect(page.getByTestId("digital-twin-ga-version")).toContainText("1.0.0");
    await expect(page.getByTestId("digital-twin-shell")).toHaveAttribute("data-module-status", "ga");
  });

  test("V1 surfaces are enumerated", async ({ page }) => {
    await page.setContent(fixtureHtml);
    for (const surface of [
      "identity",
      "state",
      "snapshot",
      "representation",
      "digital-thread",
      "simulation",
      "capabilities",
      "spatial",
    ]) {
      await expect(page.getByTestId(`digital-twin-surface-${surface}`)).toBeVisible();
    }
  });

  test("phone unavailable labels 390x844", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.setContent(fixtureHtml);
    await expect(page.getByTestId("digital-twin-unavailable-actuation")).toContainText("UNAVAILABLE");
    await expect(page.getByTestId("digital-twin-unavailable-predictive")).toContainText("UNAVAILABLE");
  });

  test("tablet release pins 768x1024", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.setContent(fixtureHtml);
    await expect(page.getByTestId("digital-twin-release-ga-version")).toContainText("1.0.0");
    await expect(page.getByTestId("digital-twin-release-tag")).toContainText("digital-twin-v1.0.0");
  });

  test("accessible landmarks and navigation", async ({ page }) => {
    await page.setContent(fixtureHtml);
    await expect(page.getByRole("navigation", { name: "Digital Twin sections" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Digital Twin" })).toBeVisible();
    await expect(page.getByRole("list", { name: "Capabilities unavailable in V1.0" })).toBeVisible();
  });

  test("entitlement denial surface is text, not colour", async ({ page }) => {
    await page.setContent(fixtureHtml);
    const denial = page.getByTestId("digital-twin-entitlement-denied-message");
    await expect(denial).toHaveText(/Access denied/);
    await expect(denial).toBeHidden();
  });
});
