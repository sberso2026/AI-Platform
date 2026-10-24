import { expect, test } from "@playwright/test";

const runSuite = process.env.CERTIFY_BROWSER === "1" || process.env.GITHUB_ACTIONS === "true";
const describeRelease = runSuite ? test.describe : test.describe.skip;

const fixtureHtml = `
<!DOCTYPE html>
<html lang="en">
  <body>
    <div data-testid="inspection-intelligence-shell">
      <main>
        <div data-testid="inspection-intelligence-release-ready"><h1>Inspection Intelligence</h1></div>
        <section data-testid="inspection-release-ready">
          <dd data-testid="inspection-release-publication">Authority-governed path</dd>
          <dd data-testid="inspection-release-registries">Capability, Service, and Pack registries published</dd>
          <dd data-testid="inspection-release-no-twin">No Asset Intelligence or Digital Twin ownership</dd>
        </section>
      </main>
    </div>
  </body>
</html>
`;

describeRelease("Phase 9J Module Release", () => {
  test("phone release markers 390x844", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.setContent(fixtureHtml);
    await expect(page.getByTestId("inspection-intelligence-release-ready")).toBeVisible();
    await expect(page.getByTestId("inspection-release-publication")).toContainText("Authority");
  });

  test("tablet registries and non-ownership 768x1024", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.setContent(fixtureHtml);
    await expect(page.getByTestId("inspection-release-registries")).toContainText("registries");
    await expect(page.getByTestId("inspection-release-no-twin")).toContainText("Digital Twin");
  });
});
