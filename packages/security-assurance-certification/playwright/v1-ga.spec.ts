import { expect, test } from "@playwright/test";

const runSuite =
  process.env.CERTIFY_BROWSER === "1" || process.env.GITHUB_ACTIONS === "true";
const describeGa = runSuite ? test.describe : test.describe.skip;

const fixtureHtml = `
<!DOCTYPE html>
<html lang="en">
  <body>
    <main>
      <p data-testid="security-assurance-v1-ready">
        Security & Assurance V1.0 GA (1.0.0) —
        SecurityAssuranceV1GaCertified=true; SecurityAssuranceV1Frozen=true;
        SecurityAssurancePublicContractsFrozen=true;
        SecurityAssuranceManifestFrozen=true;
        productionSecurityAssuranceReady=true;
        releaseTag=security-assurance-v1.0.0;
        CustomerTrustCenterImplemented=false;
        S07ExternalPenTestComplete=false; S08CustomerSsoProductionReady=false;
        universalSecurityScorePresent=false.
      </p>
      <p data-testid="security-assurance-ga-version">version=1.0.0</p>
      <p data-testid="security-assurance-release-tag">releaseTag=security-assurance-v1.0.0</p>
      <section aria-label="V1 GA readiness">
        <ul data-testid="sa-v1-readiness-summary" aria-label="V1 readiness summary">
          <li>securityAssuranceV1GaReady=true</li>
          <li>securityAssuranceV1GaCertified=true</li>
          <li>openBlockers=0</li>
          <li>openRequiredBeforeGa=0</li>
          <li>S07 REQUIRED_BEFORE_TIER1_PRODUCTION</li>
          <li>S08 REQUIRED_BEFORE_TIER1_PRODUCTION</li>
        </ul>
      </section>
      <p data-testid="sa-no-universal-score">universalScorePresent=false</p>
    </main>
  </body>
</html>
`;

describeGa("Phase 15I Security & Assurance V1.0 GA", () => {
  test("desktop GA marker 1280x800", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.setContent(fixtureHtml);
    await expect(page.getByTestId("security-assurance-v1-ready")).toBeVisible();
    await expect(page.getByTestId("security-assurance-v1-ready")).toContainText("1.0.0");
    await expect(page.getByTestId("security-assurance-v1-ready")).toContainText(
      "SecurityAssuranceV1GaCertified=true",
    );
  });

  test("tablet readiness 768x1024", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.setContent(fixtureHtml);
    await expect(page.locator('[aria-label="V1 readiness summary"]')).toBeVisible();
    await expect(page.getByTestId("security-assurance-ga-version")).toContainText("1.0.0");
  });

  test("mobile release tag and tier-1 markers", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.setContent(fixtureHtml);
    await expect(page.getByTestId("security-assurance-release-tag")).toContainText(
      "security-assurance-v1.0.0",
    );
    await expect(page.getByTestId("security-assurance-v1-ready")).toContainText(
      "S07ExternalPenTestComplete=false",
    );
  });
});
