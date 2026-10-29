import { expect, test } from "@playwright/test";

const runSuite =
  process.env.CERTIFY_BROWSER === "1" || process.env.GITHUB_ACTIONS === "true";
const describePen = runSuite ? test.describe : test.describe.skip;

const fixtureHtml = `
<!DOCTYPE html>
<html lang="en">
  <body>
    <main data-testid="tier1-pen-test-readiness-ready">
      <h1>Tier-1 External Pen-Test Readiness</h1>
      <p data-testid="pen-test-readiness-version">version=0.3.0-pen-test-readiness</p>
      <p data-testid="pen-test-readiness-flags">
        ExternalPenTestReadinessReady=true;
        S07ExternalPenTestComplete=false;
        Tier1EnterpriseProductionReady=false;
        S08CustomerSsoProductionReady=true
      </p>
      <ul data-testid="pen-test-package-docs">
        <li>scope</li>
        <li>rules-of-engagement</li>
        <li>assessor-package</li>
      </ul>
    </main>
  </body>
</html>
`;

describePen("Phase 16C pen-test readiness browser certification", () => {
  test("readiness marker and S07 non-claim are present", async ({ page }) => {
    await page.setContent(fixtureHtml);
    await expect(page.getByTestId("tier1-pen-test-readiness-ready")).toBeVisible();
    await expect(page.getByTestId("pen-test-readiness-version")).toContainText(
      "0.3.0-pen-test-readiness",
    );
    await expect(page.getByTestId("pen-test-readiness-flags")).toContainText(
      "ExternalPenTestReadinessReady=true",
    );
    await expect(page.getByTestId("pen-test-readiness-flags")).toContainText(
      "S07ExternalPenTestComplete=false",
    );
    await expect(page.getByTestId("pen-test-readiness-flags")).toContainText(
      "Tier1EnterpriseProductionReady=false",
    );
    await expect(page.getByTestId("pen-test-package-docs")).toContainText("scope");
  });
});
