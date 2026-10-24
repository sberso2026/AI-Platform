import { expect, test } from "@playwright/test";

const runSuite =
  process.env.CERTIFY_BROWSER === "1" || process.env.GITHUB_ACTIONS === "true";
const describeCompliance = runSuite ? test.describe : test.describe.skip;

const fixtureHtml = `
<!DOCTYPE html>
<html lang="en">
  <body>
    <main>
      <p data-testid="security-assurance-compliance-ready">
        Compliance Intelligence ready (0.6.0-compliance-intelligence) —
        ComplianceFrameworkRegistryImplemented=true;
        ComplianceAssessmentImplemented=true;
        automaticCertificationEnabled=false;
        automaticComplianceClaimEnabled=false;
        certificationClaimed=false.
      </p>
      <section aria-label="Compliance intelligence">
        <ul data-testid="sa-compliance-frameworks" aria-label="Compliance frameworks">
          <li data-testid="sa-comp-fw-ISO27001_2022">ISO/IEC 27001:2022</li>
          <li data-testid="sa-comp-fw-NIST_CSF_2_0">NIST CSF 2.0</li>
          <li data-testid="sa-comp-fw-ESSENTIAL_EIGHT">Essential Eight</li>
          <li data-testid="sa-comp-fw-SOC2_TSC">SOC 2 TSC (scaffold)</li>
        </ul>
        <p data-testid="sa-comp-claim-safety">
          iso27001CertifiedClaimed=false; soc2CompliantClaimed=false;
          essentialEightPassedClaimed=false; nistCompliantClaimed=false
        </p>
      </section>
      <p data-testid="sa-no-universal-score">universalScorePresent=false</p>
    </main>
  </body>
</html>
`;

describeCompliance("Phase 15F Compliance Intelligence", () => {
  test("desktop readiness 1280x800", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.setContent(fixtureHtml);
    await expect(page.getByTestId("security-assurance-compliance-ready")).toBeVisible();
    await expect(page.getByTestId("security-assurance-compliance-ready")).toContainText(
      "0.6.0-compliance-intelligence",
    );
  });

  test("tablet frameworks 768x1024", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.setContent(fixtureHtml);
    await expect(page.locator('[aria-label="Compliance frameworks"]')).toBeVisible();
    await expect(page.getByTestId("sa-compliance-frameworks").locator("li")).toHaveCount(4);
  });

  test("mobile claim-safety markers", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.setContent(fixtureHtml);
    await expect(page.getByTestId("sa-comp-claim-safety")).toContainText(
      "iso27001CertifiedClaimed=false",
    );
    await expect(page.getByTestId("security-assurance-compliance-ready")).toContainText(
      "automaticCertificationEnabled=false",
    );
  });
});
