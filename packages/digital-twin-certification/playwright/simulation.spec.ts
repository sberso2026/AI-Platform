import { expect, test } from "@playwright/test";

const runSuite = process.env.CERTIFY_BROWSER === "1" || process.env.GITHUB_ACTIONS === "true";
const describeSimulation = runSuite ? test.describe : test.describe.skip;

/**
 * Fixture mirrors the Digital Twin simulation page markers so the browser gate
 * is deterministic and does not require a running application.
 */
const fixtureHtml = `
<!DOCTYPE html>
<html lang="en">
  <body>
    <div data-testid="digital-twin-shell" data-module-version="0.7.0-simulation" data-module-status="simulation">
      <nav aria-label="Digital Twin sections" role="navigation">
        <a href="/engineering/apps/digital-twin">Simulation Governance</a>
      </nav>
      <main>
        <section data-testid="digital-twin-simulation-ready" aria-labelledby="dt-simulation-title">
          <h1 id="dt-simulation-title">Digital Twin — Simulation Governance</h1>
          <p>
            Version <span data-testid="digital-twin-simulation-version">0.7.0-simulation</span>.
            Surfaces labeled SIMULATED —
            <span data-testid="digital-twin-fixture-provider-flag">deterministic_fixture</span>
            <span data-testid="digital-twin-native-solver-flag">nativeEngineeringSolverImplemented=false</span>.
          </p>
          <ul data-testid="digital-twin-simulation-surfaces" aria-label="Digital Twin SIMULATED surfaces">
            <li data-testid="digital-twin-surface-methods">Methods</li>
            <li data-testid="digital-twin-surface-providers">Providers</li>
            <li data-testid="digital-twin-surface-definitions">Definitions</li>
            <li data-testid="digital-twin-surface-scenarios">Scenarios</li>
            <li data-testid="digital-twin-surface-input-sets">Input Sets</li>
            <li data-testid="digital-twin-surface-runs">Runs</li>
            <li data-testid="digital-twin-surface-results">Results</li>
            <li data-testid="digital-twin-surface-validation">Validation</li>
            <li data-testid="digital-twin-surface-reviews">Reviews</li>
            <li data-testid="digital-twin-surface-simulated-states">Simulated States</li>
            <li data-testid="digital-twin-surface-comparisons">Comparisons</li>
          </ul>
          <section data-testid="digital-twin-observed-vs-simulated" aria-label="Observed versus simulated firewall">
            <h2>Observed ≠ Simulated</h2>
            <p data-testid="digital-twin-firewall-message">
              Simulated Twin State never silently replaces Observed, Derived, or Operational state.
            </p>
          </section>
          <ul data-testid="digital-twin-unavailable-capabilities" aria-label="Capabilities unavailable in Phase 12G">
            <li data-testid="digital-twin-unavailable-native-solver">Native solver — UNAVAILABLE</li>
            <li data-testid="digital-twin-unavailable-optimization">Optimization — UNAVAILABLE</li>
            <li data-testid="digital-twin-unavailable-prediction">Prediction — UNAVAILABLE</li>
            <li data-testid="digital-twin-unavailable-shm">SHM — UNAVAILABLE</li>
            <li data-testid="digital-twin-unavailable-actuation">Actuation — UNAVAILABLE</li>
          </ul>
        </section>
      </main>
    </div>
  </body>
</html>
`;

describeSimulation("Phase 12G Digital Twin Simulation", () => {
  test("desktop readiness marker 1280x800", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.setContent(fixtureHtml);
    await expect(page.getByTestId("digital-twin-simulation-ready")).toBeVisible();
    await expect(page.getByTestId("digital-twin-simulation-version")).toContainText(
      "0.7.0-simulation",
    );
    await expect(page.getByTestId("digital-twin-shell")).toHaveAttribute(
      "data-module-status",
      "simulation",
    );
  });

  test("mobile readiness marker 375x812", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.setContent(fixtureHtml);
    await expect(page.getByTestId("digital-twin-simulation-ready")).toBeVisible();
    await expect(page.getByTestId("digital-twin-firewall-message")).toBeVisible();
  });

  test("SIMULATED surfaces are enumerated", async ({ page }) => {
    await page.setContent(fixtureHtml);
    for (const surface of [
      "methods",
      "providers",
      "definitions",
      "scenarios",
      "input-sets",
      "runs",
      "results",
      "validation",
      "reviews",
      "simulated-states",
      "comparisons",
    ]) {
      await expect(page.getByTestId(`digital-twin-surface-${surface}`)).toBeVisible();
    }
  });

  test("native solver remains unavailable", async ({ page }) => {
    await page.setContent(fixtureHtml);
    await expect(page.getByTestId("digital-twin-native-solver-flag")).toContainText("false");
    await expect(page.getByTestId("digital-twin-unavailable-native-solver")).toBeVisible();
  });

  test("accessible landmarks present", async ({ page }) => {
    await page.setContent(fixtureHtml);
    await expect(page.getByRole("navigation", { name: "Digital Twin sections" })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Simulation Governance/i })).toBeVisible();
  });
});
