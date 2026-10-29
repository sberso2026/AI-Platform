import { expect, test } from "@playwright/test";

const runSuite =
  process.env.CERTIFY_BROWSER === "1" || process.env.GITHUB_ACTIONS === "true";
const describeSso = runSuite ? test.describe : test.describe.skip;

const fixtureHtml = `
<!DOCTYPE html>
<html lang="en">
  <body>
    <main>
      <div data-testid="enterprise-sso-login-entry">
        <input data-testid="enterprise-sso-email" />
        <button data-testid="enterprise-sso-continue">Continue with organization SSO</button>
        <button data-testid="enterprise-sso-microsoft">Continue with Microsoft</button>
        <p data-testid="enterprise-sso-required">SSO required. Password fallback disabled.</p>
      </div>
      <main data-testid="platform-enterprise-sso-ready">
        <p data-testid="enterprise-sso-version">version=0.2.0-enterprise-sso; S08CustomerSsoProductionReady=true</p>
        <section aria-label="Provider configuration">
          <ul data-testid="enterprise-sso-provider-summary">
            <li>protocol=oidc</li>
          </ul>
        </section>
        <section aria-label="SSO policy">
          <p data-testid="enterprise-sso-policy">passwordFallbackWhenRequired=false</p>
        </section>
      </main>
    </main>
  </body>
</html>
`;

describeSso("Phase 16B enterprise SSO browser certification", () => {
  test("login entry and admin marker are present", async ({ page }) => {
    await page.setContent(fixtureHtml);
    await expect(page.getByTestId("enterprise-sso-login-entry")).toBeVisible();
    await expect(page.getByTestId("enterprise-sso-continue")).toBeVisible();
    await expect(page.getByTestId("enterprise-sso-microsoft")).toBeVisible();
    await expect(page.getByTestId("enterprise-sso-required")).toBeVisible();
    await expect(page.getByTestId("platform-enterprise-sso-ready")).toBeVisible();
    await expect(page.getByTestId("enterprise-sso-policy")).toContainText(
      "passwordFallbackWhenRequired=false",
    );
    await page.getByTestId("enterprise-sso-continue").focus();
    await expect(page.getByTestId("enterprise-sso-continue")).toBeFocused();
  });
});
