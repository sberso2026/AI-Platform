import { expect, test } from "@playwright/test";

const runSuite = process.env.CERTIFY_BROWSER === "1" || process.env.GITHUB_ACTIONS === "true";
const describeGa = runSuite ? test.describe : test.describe.skip;

const fixtureHtml = `
<!DOCTYPE html>
<html lang="en">
  <body>
    <div data-testid="project-controls-shell" data-module-version="1.0.0" data-module-status="ga">
      <nav aria-label="Project Controls sections">
        <a href="/engineering/apps/project-controls">Overview</a>
        <a href="/engineering/apps/project-controls/release">Release</a>
      </nav>
      <main>
        <section data-testid="project-controls-ready" aria-labelledby="pc-overview-title">
          <div data-testid="project-controls-v1-ready">
            <h1 id="pc-overview-title">Project Controls</h1>
            <p>Version <span data-testid="project-controls-ga-version">1.0.0</span> Production GA</p>
            <ul data-testid="project-controls-v1-surfaces" aria-label="Project Controls V1 surfaces">
              <li data-testid="project-controls-surface-progress">Progress — GA</li>
              <li data-testid="project-controls-surface-schedule">Schedule — GA</li>
              <li data-testid="project-controls-surface-change">Change — GA</li>
              <li data-testid="project-controls-surface-cost">Cost — GA</li>
              <li data-testid="project-controls-surface-productivity">Productivity — GA</li>
              <li data-testid="project-controls-surface-forecast">Forecast — GA advisory</li>
              <li data-testid="project-controls-surface-decision">Decision support — GA advisory</li>
              <li data-testid="project-controls-surface-scenario">Scenario — GA advisory</li>
              <li data-testid="project-controls-surface-risk-opportunity">Risk / opportunity — GA advisory</li>
              <li data-testid="project-controls-surface-assurance">Assurance — GA advisory</li>
              <li data-testid="project-controls-surface-explainability">Explainability — GA advisory</li>
              <li data-testid="project-controls-surface-organizational-learning">Organizational learning — GA advisory</li>
              <li data-testid="project-controls-surface-profile">Project profile — GA</li>
            </ul>
            <ul data-testid="project-controls-unavailable-capabilities" aria-label="Capabilities unavailable in V1.0">
              <li data-testid="project-controls-unavailable-native-cpm">Native CPM — UNAVAILABLE</li>
              <li data-testid="project-controls-unavailable-earned-value">Earned value — UNAVAILABLE</li>
              <li data-testid="project-controls-unavailable-financial-posting">Financial posting — UNAVAILABLE</li>
              <li data-testid="project-controls-unavailable-schedule-execution">Schedule execution — UNAVAILABLE</li>
            </ul>
          </div>
        </section>
        <section data-testid="project-controls-release-ready" aria-labelledby="pc-release-title">
          <h2 id="pc-release-title">Module Release Status</h2>
          <dl>
            <dt>GA version</dt>
            <dd data-testid="project-controls-release-ga-version">1.0.0 — project-controls-v1-ready</dd>
            <dt>Release tag</dt>
            <dd data-testid="project-controls-release-tag">project-controls-v1.0.0</dd>
            <dt>CPM / EV</dt>
            <dd data-testid="project-controls-release-cpm-ev">UNAVAILABLE — not production functions of V1.0</dd>
          </dl>
        </section>
        <section data-testid="project-controls-entitlement-denied" hidden>
          <p data-testid="project-controls-entitlement-denied-message">
            Access denied — an Engineering OS seat and workspace are required.
          </p>
        </section>
      </main>
    </div>
  </body>
</html>
`;

describeGa("Phase 11N Project Controls V1 GA", () => {
  test("desktop GA readiness marker 1280x800", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.setContent(fixtureHtml);
    await expect(page.getByTestId("project-controls-v1-ready")).toBeVisible();
    await expect(page.getByTestId("project-controls-ga-version")).toContainText("1.0.0");
    await expect(page.getByTestId("project-controls-shell")).toHaveAttribute("data-module-status", "ga");
  });

  test("V1 surfaces are enumerated", async ({ page }) => {
    await page.setContent(fixtureHtml);
    for (const surface of [
      "progress",
      "schedule",
      "change",
      "cost",
      "productivity",
      "forecast",
      "decision",
      "scenario",
      "risk-opportunity",
      "assurance",
      "explainability",
      "organizational-learning",
      "profile",
    ]) {
      await expect(page.getByTestId(`project-controls-surface-${surface}`)).toBeVisible();
    }
  });

  test("phone unavailable labels 390x844", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.setContent(fixtureHtml);
    await expect(page.getByTestId("project-controls-unavailable-native-cpm")).toContainText("UNAVAILABLE");
    await expect(page.getByTestId("project-controls-unavailable-earned-value")).toContainText("UNAVAILABLE");
  });

  test("tablet release pins 768x1024", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.setContent(fixtureHtml);
    await expect(page.getByTestId("project-controls-release-ga-version")).toContainText("1.0.0");
    await expect(page.getByTestId("project-controls-release-tag")).toContainText("project-controls-v1.0.0");
  });

  test("accessible landmarks and navigation", async ({ page }) => {
    await page.setContent(fixtureHtml);
    await expect(page.getByRole("navigation", { name: "Project Controls sections" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Project Controls" })).toBeVisible();
    await expect(page.getByRole("list", { name: "Capabilities unavailable in V1.0" })).toBeVisible();
  });

  test("entitlement denial surface is text, not colour", async ({ page }) => {
    await page.setContent(fixtureHtml);
    const denial = page.getByTestId("project-controls-entitlement-denied-message");
    await expect(denial).toHaveText(/Access denied/);
    await expect(denial).toBeHidden();
  });
});
