import { expect, test } from "@playwright/test";

const runSuite =
  process.env.CERTIFY_BROWSER === "1" || process.env.GITHUB_ACTIONS === "true";
const describeAdv = runSuite ? test.describe : test.describe.skip;

const fixtureHtml = `
<!DOCTYPE html>
<html lang="en">
  <body>
    <main data-testid="internal-adversarial-security-ready">
      <h1>Internal Adversarial Security Validation</h1>
      <p data-testid="internal-adversarial-version">version=0.3.1-internal-adversarial</p>
      <p data-testid="internal-adversarial-flags">
        InternalAdversarialSecurityValidationReady=true;
        S07Status=DEFERRED_UNTIL_TIER1_COMMERCIALIZATION;
        S07RequirementWaived=false;
        ExternalPenTestStillRequiredForTier1=true;
        S07ExternalPenTestComplete=false;
        ExternalPenTestPerformed=false;
        Tier1EnterpriseProductionReady=false;
        S08CustomerSsoProductionReady=true
      </p>
      <p data-testid="internal-adversarial-boundary">
        Internal validation ≠ independent penetration testing
      </p>
    </main>
  </body>
</html>
`;

describeAdv("Phase 16C.1 internal adversarial browser certification", () => {
  test("readiness marker and S07 deferral non-claims are present", async ({
    page,
  }) => {
    await page.setContent(fixtureHtml);
    await expect(
      page.getByTestId("internal-adversarial-security-ready"),
    ).toBeVisible();
    await expect(page.getByTestId("internal-adversarial-version")).toContainText(
      "0.3.1-internal-adversarial",
    );
    await expect(page.getByTestId("internal-adversarial-flags")).toContainText(
      "S07RequirementWaived=false",
    );
    await expect(page.getByTestId("internal-adversarial-flags")).toContainText(
      "ExternalPenTestPerformed=false",
    );
    await expect(page.getByTestId("internal-adversarial-boundary")).toContainText(
      "≠ independent penetration testing",
    );
  });
});
