import { expect, test } from "@playwright/test";

const runSuite =
  process.env.CERTIFY_BROWSER === "1" || process.env.GITHUB_ACTIONS === "true";
const describeIfc = runSuite ? test.describe : test.describe.skip;

const fixtureHtml = `
<!DOCTYPE html>
<html lang="en">
  <body>
    <main>
      <h1>Engineering Model Interoperability</h1>
      <p data-testid="engineering-model-ifc-federation-ready">
        IFC federation ready (0.2.0-ifc-federation) — models, versions, elements,
        mappings, source properties, spatial/asset/twin binding, change-impact;
        no full BIM viewer.
      </p>
      <ul aria-label="Bounded federation surfaces">
        <li data-testid="emi-surface-models">Models</li>
        <li data-testid="emi-surface-versions">Versions</li>
        <li data-testid="emi-surface-elements">Elements</li>
        <li data-testid="emi-surface-mappings">Mappings</li>
        <li data-testid="emi-surface-source-properties">Source properties</li>
        <li data-testid="emi-surface-bindings">Spatial / Asset / Twin binding</li>
        <li data-testid="emi-surface-change-impact">Change-impact</li>
      </ul>
      <p data-testid="emi-full-bim-viewer-flag">fullBimViewerImplemented=false</p>
      <p data-testid="emi-solver-execution-flag">solverExecutionImplemented=false</p>
    </main>
  </body>
</html>
`;

describeIfc("Phase 13B Engineering Model IFC Federation", () => {
  test("desktop IFC federation readiness marker 1280x800", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.setContent(fixtureHtml);
    await expect(
      page.getByTestId("engineering-model-ifc-federation-ready"),
    ).toBeVisible();
    await expect(
      page.getByTestId("engineering-model-ifc-federation-ready"),
    ).toContainText("0.2.0-ifc-federation");
  });

  test("bounded surfaces are enumerated", async ({ page }) => {
    await page.setContent(fixtureHtml);
    for (const surface of [
      "models",
      "versions",
      "elements",
      "mappings",
      "source-properties",
      "bindings",
      "change-impact",
    ]) {
      await expect(page.getByTestId(`emi-surface-${surface}`)).toBeVisible();
    }
  });

  test("honesty flags remain false for viewer and solver", async ({ page }) => {
    await page.setContent(fixtureHtml);
    await expect(page.getByTestId("emi-full-bim-viewer-flag")).toContainText(
      "false",
    );
    await expect(page.getByTestId("emi-solver-execution-flag")).toContainText(
      "false",
    );
  });
});
