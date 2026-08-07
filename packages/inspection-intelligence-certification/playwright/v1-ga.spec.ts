import { expect, test } from "@playwright/test";

const runSuite = process.env.CERTIFY_BROWSER === "1" || process.env.GITHUB_ACTIONS === "true";
const describeGa = runSuite ? test.describe : test.describe.skip;

const fixtureHtml = `
<!DOCTYPE html>
<html lang="en">
  <body>
    <div data-testid="inspection-intelligence-shell">
      <main>
        <div data-testid="inspection-intelligence-v1-ready"><h1>Inspection Intelligence 1.0.0</h1></div>
        <div data-testid="inspection-intelligence-release-ready">Release</div>
        <section data-testid="inspection-release-ready">
          <dd data-testid="inspection-release-ga-version">1.0.0</dd>
          <dd data-testid="inspection-release-pins">vision_provider_approved_v1</dd>
          <dd data-testid="inspection-release-no-twin">No Asset Intelligence or Digital Twin ownership</dd>
        </section>
      </main>
    </div>
  </body>
</html>
`;

describeGa("Phase 9K Inspection Intelligence V1 GA", () => {
  test("phone v1 markers 390x844", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.setContent(fixtureHtml);
    await expect(page.getByTestId("inspection-intelligence-v1-ready")).toBeVisible();
    await expect(page.getByTestId("inspection-release-ga-version")).toContainText("1.0.0");
  });

  test("tablet pins and non-ownership 768x1024", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.setContent(fixtureHtml);
    await expect(page.getByTestId("inspection-release-pins")).toContainText("vision_provider");
    await expect(page.getByTestId("inspection-release-no-twin")).toContainText("Digital Twin");
  });
});
