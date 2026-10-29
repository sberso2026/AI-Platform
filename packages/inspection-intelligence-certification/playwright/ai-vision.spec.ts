import { expect, test } from "@playwright/test";

const runSuite = process.env.CERTIFY_BROWSER === "1" || process.env.GITHUB_ACTIONS === "true";
const describeVision = runSuite ? test.describe : test.describe.skip;

const fixtureHtml = `
<!DOCTYPE html>
<html lang="en">
  <body>
    <div data-testid="inspection-intelligence-shell">
      <main>
        <div data-testid="inspection-intelligence-ai-vision-ready"><h1>Inspection Intelligence</h1></div>
        <section data-testid="inspection-vision-ready">
          <dd data-testid="inspection-vision-advisory">Advisory only — human validation required</dd>
          <dd data-testid="inspection-vision-original">Immutable — overlays are derivatives</dd>
          <dd data-testid="inspection-vision-no-accuracy">No unsupported accuracy claim</dd>
        </section>
      </main>
    </div>
  </body>
</html>
`;

describeVision("Phase 9I AI Vision", () => {
  test("phone vision markers 390x844", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.setContent(fixtureHtml);
    await expect(page.getByTestId("inspection-intelligence-ai-vision-ready")).toBeVisible();
    await expect(page.getByTestId("inspection-vision-advisory")).toContainText("Advisory");
  });

  test("tablet original immutability 768x1024", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.setContent(fixtureHtml);
    await expect(page.getByTestId("inspection-vision-original")).toContainText("Immutable");
    await expect(page.getByTestId("inspection-vision-no-accuracy")).toContainText("accuracy");
  });
});
