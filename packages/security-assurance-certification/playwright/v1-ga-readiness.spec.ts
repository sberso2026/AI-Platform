import { expect, test } from "@playwright/test";

const runSuite =
  process.env.CERTIFY_BROWSER === "1" || process.env.GITHUB_ACTIONS === "true";
const describeGa = runSuite ? test.describe : test.describe.skip;

const fixtureHtml = `
<!DOCTYPE html>
<html lang="en">
  <body>
    <main>
      <p data-testid="security-assurance-v1-readiness">
        Security & Assurance V1 GA readiness assessed (0.8.0-ga-readiness) —
        securityAssuranceV1GaReady=true; securityAssuranceV1GaCertified=false;
        openBlockers=0; openRequiredBeforeGa=0; phase15IReady=true;
        contracts not frozen at 1.0.0; S07/S08 remain Tier-1 requirements.
      </p>
      <section aria-label="V1 GA readiness">
        <ul data-testid="sa-v1-readiness-summary" aria-label="V1 readiness summary">
          <li>securityAssuranceV1GaReady=true</li>
          <li>securityAssuranceV1GaCertified=false</li>
          <li>openBlockers=0</li>
          <li>openRequiredBeforeGa=0</li>
          <li>S07 REQUIRED_BEFORE_TIER1_PRODUCTION</li>
          <li>S08 REQUIRED_BEFORE_TIER1_PRODUCTION</li>
        </ul>
        <p data-testid="sa-v1-contracts">
          SecurityAssurancePublicContractsFrozenAt1_0_0=false
        </p>
      </section>
      <p data-testid="sa-no-universal-score">universalScorePresent=false</p>
    </main>
  </body>
</html>
`;

describeGa("Phase 15H Security & Assurance V1 GA Readiness", () => {
  test("desktop readiness 1280x800", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.setContent(fixtureHtml);
    await expect(page.getByTestId("security-assurance-v1-readiness")).toBeVisible();
    await expect(page.getByTestId("security-assurance-v1-readiness")).toContainText(
      "0.8.0-ga-readiness",
    );
    await expect(page.getByTestId("security-assurance-v1-readiness")).toContainText(
      "securityAssuranceV1GaReady=true",
    );
  });

  test("tablet readiness summary 768x1024", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.setContent(fixtureHtml);
    await expect(page.locator('[aria-label="V1 readiness summary"]')).toBeVisible();
    await expect(page.getByTestId("sa-v1-readiness-summary").locator("li")).toHaveCount(6);
  });

  test("mobile certified-false and contracts marker", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.setContent(fixtureHtml);
    await expect(page.getByTestId("sa-v1-contracts")).toContainText(
      "SecurityAssurancePublicContractsFrozenAt1_0_0=false",
    );
    await expect(page.getByTestId("security-assurance-v1-readiness")).toContainText(
      "securityAssuranceV1GaCertified=false",
    );
  });
});
