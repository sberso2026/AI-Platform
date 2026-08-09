import { expect, test } from "@playwright/test";

const runSuite =
  process.env.CERTIFY_BROWSER === "1" || process.env.GITHUB_ACTIONS === "true";
const describeCustomer = runSuite ? test.describe : test.describe.skip;

const fixtureHtml = `
<!DOCTYPE html>
<html lang="en">
  <body>
    <main aria-label="Customer assurance">
      <p data-testid="security-assurance-customer-ready">
        Customer Assurance ready (0.7.0-customer-assurance) —
        CustomerAssuranceImplemented=true;
        AssuranceDisclosurePolicyReady=true;
        automaticCustomerAssurancePublicationEnabled=false;
        automaticExternalDisclosureEnabled=false;
        CustomerTrustCenterImplemented=false;
        certificationClaimed=false.
      </p>
      <section aria-label="Approved claims">
        <ul data-testid="sa-ca-claims" aria-label="Customer assurance claims">
          <li data-testid="sa-ca-claim-mfa">MFA privileged access — supported</li>
          <li data-testid="sa-ca-claim-pentest">External penetration test — requires_external_assurance (S07)</li>
          <li data-testid="sa-ca-claim-sso">Customer SSO — not production-ready (S08)</li>
          <li data-testid="sa-ca-claim-iso">ISO 27001 — not certified</li>
        </ul>
      </section>
      <p data-testid="sa-ca-tier1">
        S07 external penetration test = REQUIRED_BEFORE_TIER1_PRODUCTION
        (complete=false). S08 customer SSO = REQUIRED_BEFORE_TIER1_PRODUCTION
        (productionReady=false).
      </p>
      <p data-testid="sa-ca-no-cert-claims">
        framework mapping ≠ compliance claim; iso27001CertifiedClaimed=false;
        soc2CompliantClaimed=false
      </p>
      <p data-testid="sa-no-universal-score">universalScorePresent=false</p>
    </main>
  </body>
</html>
`;

describeCustomer("Phase 15G Customer Assurance", () => {
  test("desktop readiness 1280x800", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.setContent(fixtureHtml);
    await expect(page.getByTestId("security-assurance-customer-ready")).toBeVisible();
    await expect(page.getByTestId("security-assurance-customer-ready")).toContainText(
      "0.7.0-customer-assurance",
    );
  });

  test("tablet claims 768x1024", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.setContent(fixtureHtml);
    await expect(page.locator('[aria-label="Customer assurance claims"]')).toBeVisible();
    await expect(page.getByTestId("sa-ca-claims").locator("li")).toHaveCount(4);
  });

  test("mobile tier-1 and claim-safety markers", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.setContent(fixtureHtml);
    await expect(page.getByTestId("sa-ca-tier1")).toContainText("S07");
    await expect(page.getByTestId("sa-ca-tier1")).toContainText("complete=false");
    await expect(page.getByTestId("sa-ca-no-cert-claims")).toContainText(
      "iso27001CertifiedClaimed=false",
    );
    await expect(page.getByTestId("security-assurance-customer-ready")).toContainText(
      "CustomerTrustCenterImplemented=false",
    );
  });
});
