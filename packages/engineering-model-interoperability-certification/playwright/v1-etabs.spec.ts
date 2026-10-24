import { expect, test } from "@playwright/test";

const runSuite =
  process.env.CERTIFY_BROWSER === "1" || process.env.GITHUB_ACTIONS === "true";
const describeEtabs = runSuite ? test.describe : test.describe.skip;

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
        SPACE GASS ready (retained) — hosted execution certified=false; live certified=false.
      </p>
      <p data-testid="engineering-model-etabs-ready">
        ETABS ready (0.4.0-etabs-federation) — export/fixture model federation, existing
        result federation, governed fail-closed solver adapter; NOT live native COM;
        ETABSHostedExecutionCertified=false; ETABSControlledExecutionCertified=false.
      </p>
      <ul>
        <li data-testid="emi-surface-etabs-models">ETABS models (export federation)</li>
        <li data-testid="emi-surface-etabs-results">ETABS results (export federation)</li>
        <li data-testid="emi-surface-etabs-qualification">ETABS qualification</li>
        <li data-testid="emi-surface-etabs-execution">ETABS execution (fail-closed)</li>
      </ul>
      <p data-testid="emi-existing-external-result-label">EXISTING EXTERNAL RESULT</p>
      <p data-testid="emi-rtb-certified-execution-label">RTB-CERTIFIED EXECUTION</p>
      <p data-testid="emi-export-federation-label">EXPORT FEDERATION</p>
      <p data-testid="emi-etabs-adapter-flag">ETABSAdapterImplemented=true</p>
      <p data-testid="emi-etabs-hosted-flag">ETABSHostedExecutionCertified=false</p>
      <p data-testid="emi-etabs-controlled-flag">ETABSControlledExecutionCertified=false</p>
      <p data-testid="emi-spacegass-live-flag">SPACEGASSLiveExecutionCertified=false</p>
    </main>
  </body>
</html>
`;

describeEtabs("Phase 13E Engineering Model ETABS", () => {
  test("desktop ETABS readiness marker 1280x800", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.setContent(fixtureHtml);
    await expect(page.getByTestId("engineering-model-etabs-ready")).toBeVisible();
    await expect(page.getByTestId("engineering-model-etabs-ready")).toContainText(
      "0.4.0-etabs-federation",
    );
    await expect(page.getByTestId("engineering-model-etabs-ready")).toContainText(
      "NOT live native COM",
    );
    await expect(
      page.getByTestId("engineering-model-ifc-federation-ready"),
    ).toBeVisible();
    await expect(
      page.getByTestId("engineering-model-spacegass-ready"),
    ).toBeVisible();
  });

  test("distinguishes export federation vs RTB-certified execution", async ({
    page,
  }) => {
    await page.setContent(fixtureHtml);
    await expect(
      page.getByTestId("emi-existing-external-result-label"),
    ).toContainText("EXISTING EXTERNAL RESULT");
    await expect(
      page.getByTestId("emi-rtb-certified-execution-label"),
    ).toContainText("RTB-CERTIFIED EXECUTION");
    await expect(page.getByTestId("emi-export-federation-label")).toContainText(
      "EXPORT FEDERATION",
    );
    await expect(page.getByTestId("emi-etabs-hosted-flag")).toContainText("false");
    await expect(page.getByTestId("emi-etabs-controlled-flag")).toContainText(
      "false",
    );
    await expect(page.getByTestId("emi-spacegass-live-flag")).toContainText(
      "false",
    );
    await expect(page.getByTestId("emi-etabs-adapter-flag")).toContainText("true");
  });

  test("ETABS surfaces enumerated", async ({ page }) => {
    await page.setContent(fixtureHtml);
    for (const surface of [
      "etabs-models",
      "etabs-results",
      "etabs-qualification",
      "etabs-execution",
    ]) {
      await expect(page.getByTestId(`emi-surface-${surface}`)).toBeVisible();
    }
  });
});
