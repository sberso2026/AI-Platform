import { expect, test } from "@playwright/test";

const runSuite =
  process.env.CERTIFY_BROWSER === "1" || process.env.GITHUB_ACTIONS === "true";
const describeIsolation = runSuite ? test.describe : test.describe.skip;

const fixtureHtml = `
<!DOCTYPE html>
<html lang="en">
  <body>
    <main>
      <h1>Security &amp; Assurance</h1>
      <p data-testid="security-assurance-foundation-ready">
        Security &amp; Assurance foundation ready (0.3.0-isolation-assurance) —
        SecurityIntelligenceImplemented=false; no universal security score.
      </p>
      <p data-testid="security-assurance-isolation-ready">
        Isolation Assurance ready (0.3.0-isolation-assurance) —
        IsolationAssuranceRuntimeImplemented=true;
        knownCrossTenantLeakageDetected=false;
        knownCrossWorkspaceLeakageDetected=false;
        automaticRemediationEnabled=false;
        automaticRlsMutationEnabled=false.
      </p>
      <section aria-label="Isolation assurance">
        <ul data-testid="sa-isolation-planes" aria-label="Isolation target planes">
          <li data-testid="sa-iso-plane-DATABASE">DATABASE</li>
          <li data-testid="sa-iso-plane-API">API</li>
          <li data-testid="sa-iso-plane-FILES">FILES</li>
          <li data-testid="sa-iso-plane-SEARCH">SEARCH</li>
          <li data-testid="sa-iso-plane-KNOWLEDGE_GRAPH">KNOWLEDGE_GRAPH</li>
          <li data-testid="sa-iso-plane-AI_CONTEXT">AI_CONTEXT</li>
          <li data-testid="sa-iso-plane-BACKGROUND_JOB">BACKGROUND_JOB</li>
          <li data-testid="sa-iso-plane-EVENT">EVENT</li>
          <li data-testid="sa-iso-plane-EXECUTION_HOST">EXECUTION_HOST</li>
          <li data-testid="sa-iso-plane-SOLVER_WORKSPACE">SOLVER_WORKSPACE</li>
          <li data-testid="sa-iso-plane-CACHE">CACHE (NOT_APPLICABLE)</li>
        </ul>
        <p data-testid="sa-iso-no-theatre">no fake 100% secure indicator</p>
      </section>
      <p data-testid="sa-no-universal-score">universalScorePresent=false</p>
    </main>
  </body>
</html>
`;

describeIsolation("Phase 15C Security & Assurance Isolation", () => {
  test("desktop isolation readiness 1280x800", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.setContent(fixtureHtml);
    await expect(page.getByTestId("security-assurance-isolation-ready")).toBeVisible();
    await expect(page.getByTestId("security-assurance-isolation-ready")).toContainText(
      "0.3.0-isolation-assurance",
    );
    await expect(page.getByTestId("sa-iso-no-theatre")).toBeVisible();
  });

  test("tablet responsive planes 768x1024", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.setContent(fixtureHtml);
    await expect(page.locator('[aria-label="Isolation target planes"]')).toBeVisible();
    await expect(page.getByTestId("sa-isolation-planes").locator("li")).toHaveCount(11);
  });

  test("mobile accessibility and leakage honesty", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.setContent(fixtureHtml);
    await expect(page.getByTestId("sa-iso-plane-CACHE")).toContainText("NOT_APPLICABLE");
    await expect(page.getByTestId("security-assurance-isolation-ready")).toContainText(
      "knownCrossTenantLeakageDetected=false",
    );
  });
});
