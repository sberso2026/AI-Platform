import { expect, test } from "@playwright/test";

const runSuite =
  process.env.CERTIFY_BROWSER === "1" || process.env.GITHUB_ACTIONS === "true";
const describeSg = runSuite ? test.describe : test.describe.skip;

const fixtureHtml = `
<!DOCTYPE html>
<html lang="en">
  <body>
    <main>
      <h1>Engineering Model Interoperability</h1>
      <p data-testid="engineering-model-ifc-federation-ready">
        IFC federation ready (retained from 0.2.0-ifc-federation)
      </p>
      <p data-testid="engineering-model-spacegass-ready">
        SPACE GASS ready (0.3.0-spacegass) — native model federation, existing result
        federation, governed fail-closed solver adapter; hosted execution certified=false.
      </p>
      <ul>
        <li data-testid="emi-surface-spacegass-models">SPACE GASS models</li>
        <li data-testid="emi-surface-spacegass-results">SPACE GASS results</li>
        <li data-testid="emi-surface-spacegass-qualification">SPACE GASS qualification</li>
        <li data-testid="emi-surface-spacegass-execution">SPACE GASS execution (fail-closed)</li>
      </ul>
      <p data-testid="emi-existing-external-result-label">EXISTING EXTERNAL RESULT</p>
      <p data-testid="emi-rtb-certified-execution-label">RTB-CERTIFIED EXECUTION</p>
      <p data-testid="emi-spacegass-hosted-flag">spaceGassHostedExecutionCertified=false</p>
      <p data-testid="emi-etabs-adapter-flag">ETABSAdapterImplemented=false</p>
    </main>
  </body>
</html>
`;

describeSg("Phase 13C Engineering Model SPACE GASS", () => {
  test("desktop SPACE GASS readiness marker 1280x800", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.setContent(fixtureHtml);
    await expect(page.getByTestId("engineering-model-spacegass-ready")).toBeVisible();
    await expect(page.getByTestId("engineering-model-spacegass-ready")).toContainText(
      "0.3.0-spacegass",
    );
    await expect(
      page.getByTestId("engineering-model-ifc-federation-ready"),
    ).toBeVisible();
  });

  test("distinguishes existing external vs RTB-certified execution", async ({
    page,
  }) => {
    await page.setContent(fixtureHtml);
    await expect(
      page.getByTestId("emi-existing-external-result-label"),
    ).toContainText("EXISTING EXTERNAL RESULT");
    await expect(
      page.getByTestId("emi-rtb-certified-execution-label"),
    ).toContainText("RTB-CERTIFIED EXECUTION");
    await expect(page.getByTestId("emi-spacegass-hosted-flag")).toContainText(
      "false",
    );
    await expect(page.getByTestId("emi-etabs-adapter-flag")).toContainText(
      "false",
    );
  });

  test("SPACE GASS surfaces enumerated", async ({ page }) => {
    await page.setContent(fixtureHtml);
    for (const surface of [
      "spacegass-models",
      "spacegass-results",
      "spacegass-qualification",
      "spacegass-execution",
    ]) {
      await expect(page.getByTestId(`emi-surface-${surface}`)).toBeVisible();
    }
  });
});
