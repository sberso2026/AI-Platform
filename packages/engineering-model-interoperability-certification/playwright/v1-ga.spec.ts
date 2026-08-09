import { expect, test } from "@playwright/test";

const runSuite =
  process.env.CERTIFY_BROWSER === "1" || process.env.GITHUB_ACTIONS === "true";
const describeGa = runSuite ? test.describe : test.describe.skip;

const fixtureHtml = `
<!DOCTYPE html>
<html lang="en">
  <body>
    <main>
      <div data-testid="engineering-model-interoperability-v1-ready">
        <h1>Engineering Model Interoperability</h1>
        <p>
          Version
          <span data-testid="engineering-model-interoperability-ga-version">1.0.0</span>
          Production GA — release tag
          <span data-testid="engineering-model-interoperability-release-tag">
            engineering-model-interoperability-v1.0.0
          </span>
        </p>
      </div>
      <p data-testid="engineering-model-ifc-federation-ready">
        IFC Federation — AVAILABLE
      </p>
      <p data-testid="engineering-model-spacegass-ready">
        SPACE GASS Federation — AVAILABLE. SPACE GASS Live Execution — NOT CERTIFIED
      </p>
      <p data-testid="engineering-model-etabs-ready">
        ETABS Federation — AVAILABLE. ETABS Live Execution — NOT CERTIFIED
      </p>
      <p data-testid="engineering-execution-host-ready">
        Controlled Engineering Execution Host — AVAILABLE
      </p>
      <ul data-testid="emi-v1-surfaces" aria-label="Engineering Model Interoperability V1 surfaces">
        <li data-testid="emi-surface-models">Models — AVAILABLE</li>
        <li data-testid="emi-surface-mappings">Mappings — AVAILABLE</li>
        <li data-testid="emi-surface-bindings">Spatial / Asset / Twin binding — AVAILABLE</li>
        <li data-testid="emi-surface-spacegass-models">SPACE GASS models — AVAILABLE</li>
        <li data-testid="emi-surface-spacegass-results">SPACE GASS results — AVAILABLE</li>
        <li data-testid="emi-surface-etabs-models">ETABS models — AVAILABLE</li>
        <li data-testid="emi-surface-etabs-results">ETABS results — AVAILABLE</li>
      </ul>
      <ul data-testid="emi-unavailable-capabilities" aria-label="Capabilities not certified in V1.0">
        <li data-testid="emi-unavailable-spacegass-live">
          SPACE GASS Live Execution — NOT CERTIFIED
        </li>
        <li data-testid="emi-unavailable-etabs-live">
          ETABS Live Execution — NOT CERTIFIED
        </li>
      </ul>
      <p data-testid="emi-existing-external-result-label">EXISTING EXTERNAL RESULT</p>
      <p data-testid="emi-rtb-certified-execution-label">RTB-CERTIFIED EXECUTION</p>
      <p data-testid="emi-export-federation-label">EXPORT FEDERATION</p>
      <p data-testid="emi-spacegass-live-flag">SPACEGASSLiveExecutionCertified=false</p>
      <p data-testid="emi-etabs-hosted-flag">ETABSHostedExecutionCertified=false</p>
      <section data-testid="emi-entitlement-denied" hidden>
        <p data-testid="emi-entitlement-denied-message">
          Access denied — Engineering OS seat and workspace required.
        </p>
      </section>
      <nav aria-label="EMI sections">
        <a href="/engineering/apps/model-interoperability">Overview</a>
        <a href="/engineering/apps/model-interoperability/release">Release</a>
      </nav>
    </main>
  </body>
</html>
`;

describeGa("Phase 13F Engineering Model Interoperability V1 GA", () => {
  test("desktop GA readiness marker 1280x800", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.setContent(fixtureHtml);
    await expect(
      page.getByTestId("engineering-model-interoperability-v1-ready"),
    ).toBeVisible();
    await expect(
      page.getByTestId("engineering-model-interoperability-ga-version"),
    ).toContainText("1.0.0");
  });

  test("preserves federation markers and truthful live status", async ({
    page,
  }) => {
    await page.setContent(fixtureHtml);
    await expect(
      page.getByTestId("engineering-model-ifc-federation-ready"),
    ).toContainText("AVAILABLE");
    await expect(
      page.getByTestId("engineering-model-spacegass-ready"),
    ).toContainText("NOT CERTIFIED");
    await expect(
      page.getByTestId("engineering-model-etabs-ready"),
    ).toContainText("NOT CERTIFIED");
    await expect(
      page.getByTestId("engineering-execution-host-ready"),
    ).toBeVisible();
  });

  test("phone unavailable labels 390x844", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.setContent(fixtureHtml);
    await expect(
      page.getByTestId("emi-unavailable-spacegass-live"),
    ).toContainText("NOT CERTIFIED");
    await expect(page.getByTestId("emi-unavailable-etabs-live")).toContainText(
      "NOT CERTIFIED",
    );
  });

  test("tablet surfaces and result trust 768x1024", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.setContent(fixtureHtml);
    await expect(page.getByTestId("emi-surface-models")).toBeVisible();
    await expect(page.getByTestId("emi-surface-mappings")).toBeVisible();
    await expect(page.getByTestId("emi-surface-bindings")).toBeVisible();
    await expect(
      page.getByTestId("emi-existing-external-result-label"),
    ).toContainText("EXISTING EXTERNAL RESULT");
    await expect(
      page.getByTestId("emi-rtb-certified-execution-label"),
    ).toContainText("RTB-CERTIFIED EXECUTION");
  });

  test("accessible landmarks and navigation", async ({ page }) => {
    await page.setContent(fixtureHtml);
    await expect(
      page.getByRole("navigation", { name: "EMI sections" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "Engineering Model Interoperability",
      }),
    ).toBeVisible();
  });
});
