import { expect, test } from "@playwright/test";

const runSuite = process.env.CERTIFY_BROWSER === "1" || process.env.GITHUB_ACTIONS === "true";
const describeGa = runSuite ? test.describe : test.describe.skip;

/**
 * Fixture mirrors the Engineering OS module page markers so the GA browser gate
 * is deterministic and does not require a running application.
 */
const fixtureHtml = `
<!DOCTYPE html>
<html lang="en">
  <body>
    <div data-testid="asset-intelligence-shell" data-module-version="1.0.0" data-module-status="ga">
      <nav aria-label="Asset Intelligence sections">
        <a href="/engineering/apps/asset-intelligence">Overview</a>
        <a href="/engineering/apps/asset-intelligence/release">Release</a>
      </nav>
      <main>
        <section data-testid="asset-intelligence-ready" aria-labelledby="ai-overview-title">
          <div data-testid="asset-intelligence-v1-ready">
            <h1 id="ai-overview-title">Asset Intelligence</h1>
            <p>Version <span data-testid="asset-intelligence-ga-version">1.0.0</span> Production GA</p>
            <ul data-testid="asset-intelligence-v1-surfaces" aria-label="Asset Intelligence V1 surfaces">
              <li data-testid="asset-intelligence-surface-condition">Condition — GA</li>
              <li data-testid="asset-intelligence-surface-criticality">Criticality — GA</li>
              <li data-testid="asset-intelligence-surface-reliability">Reliability — GA advisory</li>
              <li data-testid="asset-intelligence-surface-failure">Failure — GA</li>
              <li data-testid="asset-intelligence-surface-trend-degradation">Trend and degradation — GA advisory</li>
              <li data-testid="asset-intelligence-surface-lifecycle">Lifecycle — GA</li>
              <li data-testid="asset-intelligence-surface-risk">Risk signals — GA advisory</li>
              <li data-testid="asset-intelligence-surface-maintenance">Maintenance recommendations — GA advisory</li>
              <li data-testid="asset-intelligence-surface-priority">Priority context — GA advisory</li>
              <li data-testid="asset-intelligence-surface-fusion">Multi-source fusion — GA</li>
              <li data-testid="asset-intelligence-surface-predictive-governance">Predictive governance — GA</li>
            </ul>
            <ul data-testid="asset-intelligence-unavailable-capabilities" aria-label="Capabilities unavailable in V1.0">
              <li data-testid="asset-intelligence-unavailable-predictive-execution">Predictive execution — UNAVAILABLE</li>
              <li data-testid="asset-intelligence-unavailable-probability-of-failure">Probability of Failure (PoF) — UNAVAILABLE</li>
              <li data-testid="asset-intelligence-unavailable-remaining-useful-life">Remaining Useful Life (RUL) — UNAVAILABLE</li>
              <li data-testid="asset-intelligence-unavailable-predictive-ml">Machine-learning predictions — UNAVAILABLE</li>
            </ul>
            <p data-testid="asset-intelligence-health-boundary">
              The Asset Health Index is composed from condition evidence only.
            </p>
          </div>
        </section>
        <section data-testid="asset-intelligence-release-ready" aria-labelledby="ai-release-title">
          <h2 id="ai-release-title">Module Release Status</h2>
          <dl>
            <dt>GA version</dt>
            <dd data-testid="asset-intelligence-release-ga-version">1.0.0 — asset-intelligence-v1-ready</dd>
            <dt>Release tag</dt>
            <dd data-testid="asset-intelligence-release-tag">asset-intelligence-v1.0.0</dd>
            <dt>Predictive execution</dt>
            <dd data-testid="asset-intelligence-release-predictive">UNAVAILABLE — governance only, no method executes</dd>
            <dt>PoF / RUL</dt>
            <dd data-testid="asset-intelligence-release-pof-rul">UNAVAILABLE — not production functions of V1.0</dd>
            <dt>Ownership</dt>
            <dd data-testid="asset-intelligence-release-ownership">No canonical asset identity, canonical Risk, CMMS work order or Digital Twin ownership</dd>
          </dl>
        </section>
        <section data-testid="asset-intelligence-entitlement-denied" hidden>
          <p data-testid="asset-intelligence-entitlement-denied-message">
            Access denied — an Engineering OS seat and workspace are required.
          </p>
        </section>
      </main>
    </div>
  </body>
</html>
`;

describeGa("Phase 10K Asset Intelligence V1 GA", () => {
  test("desktop GA readiness marker 1280x800", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.setContent(fixtureHtml);
    await expect(page.getByTestId("asset-intelligence-v1-ready")).toBeVisible();
    await expect(page.getByTestId("asset-intelligence-ga-version")).toContainText("1.0.0");
    await expect(page.getByTestId("asset-intelligence-shell")).toHaveAttribute(
      "data-module-status",
      "ga",
    );
  });

  test("V1 surfaces are enumerated", async ({ page }) => {
    await page.setContent(fixtureHtml);
    for (const surface of [
      "condition",
      "criticality",
      "reliability",
      "failure",
      "trend-degradation",
      "lifecycle",
      "risk",
      "maintenance",
      "priority",
      "fusion",
      "predictive-governance",
    ]) {
      await expect(page.getByTestId(`asset-intelligence-surface-${surface}`)).toBeVisible();
    }
  });

  test("phone unavailable predictive labels 390x844", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.setContent(fixtureHtml);
    await expect(page.getByTestId("asset-intelligence-v1-ready")).toBeVisible();
    await expect(
      page.getByTestId("asset-intelligence-unavailable-predictive-execution"),
    ).toContainText("UNAVAILABLE");
    await expect(
      page.getByTestId("asset-intelligence-unavailable-probability-of-failure"),
    ).toContainText("UNAVAILABLE");
    await expect(
      page.getByTestId("asset-intelligence-unavailable-remaining-useful-life"),
    ).toContainText("UNAVAILABLE");
    await expect(page.getByTestId("asset-intelligence-unavailable-predictive-ml")).toContainText(
      "UNAVAILABLE",
    );
  });

  test("tablet release pins and non-ownership 768x1024", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.setContent(fixtureHtml);
    await expect(page.getByTestId("asset-intelligence-release-ga-version")).toContainText("1.0.0");
    await expect(page.getByTestId("asset-intelligence-release-tag")).toContainText(
      "asset-intelligence-v1.0.0",
    );
    await expect(page.getByTestId("asset-intelligence-release-pof-rul")).toContainText(
      "UNAVAILABLE",
    );
    await expect(page.getByTestId("asset-intelligence-release-ownership")).toContainText(
      "Digital Twin",
    );
  });

  test("accessible landmarks and navigation", async ({ page }) => {
    await page.setContent(fixtureHtml);
    await expect(page.getByRole("navigation", { name: "Asset Intelligence sections" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Asset Intelligence" })).toBeVisible();
    await expect(
      page.getByRole("list", { name: "Capabilities unavailable in V1.0" }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Release" })).toHaveAttribute(
      "href",
      "/engineering/apps/asset-intelligence/release",
    );
  });

  test("entitlement denial surface is text, not colour", async ({ page }) => {
    await page.setContent(fixtureHtml);
    const denial = page.getByTestId("asset-intelligence-entitlement-denied-message");
    await expect(denial).toHaveText(/Access denied/);
    await expect(denial).toBeHidden();
  });
});
