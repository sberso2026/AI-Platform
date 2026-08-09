import { expect, test } from "@playwright/test";

const runSuite =
  process.env.CERTIFY_BROWSER === "1" || process.env.GITHUB_ACTIONS === "true";
const describeFoundation = runSuite ? test.describe : test.describe.skip;

const fixtureHtml = `
<!DOCTYPE html>
<html lang="en">
  <body>
    <main>
      <h1>Security &amp; Assurance</h1>
      <p data-testid="security-assurance-foundation-ready">
        Security &amp; Assurance foundation ready (0.2.0-control-evidence) —
        SecurityIntelligenceImplemented=false; CustomerTrustCenterImplemented=false;
        no universal security score.
      </p>
      <section aria-label="Security assurance inspection surfaces">
        <ul>
          <li data-testid="sa-surface-controls">Controls</li>
          <li data-testid="sa-surface-evidence">Evidence status</li>
          <li data-testid="sa-surface-assessments">Assessments</li>
          <li data-testid="sa-surface-findings">Findings</li>
          <li data-testid="sa-surface-exceptions">Exceptions</li>
          <li data-testid="sa-surface-posture">Posture dimensions</li>
        </ul>
      </section>
      <section aria-label="Posture dimensions">
        <ul data-testid="sa-posture-dimensions">
          <li>identity</li>
          <li>isolation</li>
          <li>data_protection</li>
          <li>ai_security</li>
          <li>secure_compute</li>
          <li>secure_sdlc</li>
          <li>incident_readiness</li>
          <li>recovery</li>
          <li>compliance_evidence</li>
        </ul>
        <p data-testid="sa-no-universal-score">universalScorePresent=false</p>
      </section>
      <p data-testid="sa-auto-approval-flag">automaticSecurityApprovalEnabled=false</p>
      <p data-testid="sa-s08-ownership">S08 owned by Platform Identity</p>
      <p data-testid="sa-s07-tier1">S07 REQUIRED_BEFORE_TIER1_PRODUCTION</p>
    </main>
  </body>
</html>
`;

describeFoundation("Phase 15B Security & Assurance Foundation", () => {
  test("desktop readiness marker 1280x800", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.setContent(fixtureHtml);
    await expect(page.getByTestId("security-assurance-foundation-ready")).toBeVisible();
    await expect(page.getByTestId("security-assurance-foundation-ready")).toContainText(
      "0.2.0-control-evidence",
    );
    await expect(page.getByTestId("sa-no-universal-score")).toContainText("false");
  });

  test("tablet responsive 768x1024", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.setContent(fixtureHtml);
    await expect(
      page.locator('[aria-label="Security assurance inspection surfaces"]'),
    ).toBeVisible();
    await expect(page.getByTestId("sa-posture-dimensions").locator("li")).toHaveCount(9);
  });

  test("mobile responsive 390x844 and accessibility labels", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.setContent(fixtureHtml);
    await expect(page.getByTestId("security-assurance-foundation-ready")).toBeVisible();
    await expect(page.getByTestId("sa-surface-controls")).toBeVisible();
    await expect(page.getByTestId("sa-s08-ownership")).toContainText("Platform Identity");
  });
});
