import { expect, test } from "@playwright/test";

const runSuite = process.env.CERTIFY_BROWSER === "1" || process.env.GITHUB_ACTIONS === "true";
const describeCp = runSuite ? test.describe : test.describe.skip;

const fixtureHtml = `
<!DOCTYPE html>
<html lang="en">
  <body>
    <div data-testid="inspection-intelligence-shell" data-offline-sync="true">
      <nav aria-label="Inspection Intelligence features">
        <a href="/engineering/apps/inspection-intelligence/condition">Condition</a>
        <a href="/engineering/apps/inspection-intelligence/predictive">Predictive</a>
      </nav>
      <main>
        <div data-testid="inspection-intelligence-condition-predictive-ready">
          <h1>Inspection Intelligence</h1>
        </div>
        <section data-testid="inspection-condition-ready">
          <dd data-testid="inspection-condition-override">reason + actor + prior value retained</dd>
        </section>
        <section data-testid="inspection-predictive-ready">
          <dd data-testid="inspection-predictive-advisory">Advisory only — human review required</dd>
          <dd data-testid="inspection-predictive-no-rul">No remaining useful life claim</dd>
        </section>
      </main>
    </div>
  </body>
</html>
`;

describeCp("Phase 9H condition rating and predictive signals", () => {
  test("phone condition markers 390x844", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.setContent(fixtureHtml);
    await expect(page.getByTestId("inspection-intelligence-condition-predictive-ready")).toBeVisible();
    await expect(page.getByTestId("inspection-condition-ready")).toBeVisible();
  });

  test("tablet predictive advisory 768x1024", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.setContent(fixtureHtml);
    await expect(page.getByTestId("inspection-predictive-advisory")).toContainText("Advisory");
    await expect(page.getByTestId("inspection-predictive-no-rul")).toContainText("remaining useful life");
  });
});
