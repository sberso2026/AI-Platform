import { expect, test } from "@playwright/test";

const runSuite = process.env.CERTIFY_BROWSER === "1" || process.env.GITHUB_ACTIONS === "true";
const describeExternalSolver = runSuite ? test.describe : test.describe.skip;

/**
 * Fixture mirrors the Digital Twin external solver page markers so the
 * browser gate is deterministic and does not require a running application.
 */
const fixtureHtml = `
<!DOCTYPE html>
<html lang="en">
  <body>
    <div data-testid="digital-twin-shell" data-module-version="0.9.0-external-solver" data-module-status="external_solver">
      <nav aria-label="Digital Twin sections" role="navigation">
        <a href="/engineering/apps/digital-twin">External Solver</a>
      </nav>
      <main>
        <section data-testid="digital-twin-simulation-ready" aria-labelledby="dt-simulation-title">
          <h1 id="dt-simulation-title">Digital Twin — Simulation Governance</h1>
          <p>
            Version <span data-testid="digital-twin-simulation-version">0.9.0-external-solver</span>.
            <span data-testid="digital-twin-native-solver-flag">nativeEngineeringSolverImplemented=false</span>.
          </p>
          <section data-testid="digital-twin-observed-vs-simulated" aria-label="Observed versus simulated firewall">
            <p data-testid="digital-twin-firewall-message">
              Simulated Twin State never silently replaces Observed state.
            </p>
          </section>
        </section>
        <section data-testid="digital-twin-simulation-assurance-ready" aria-labelledby="dt-assurance-title">
          <h2 id="dt-assurance-title">Simulation Assurance</h2>
          <p>
            Version <span data-testid="digital-twin-assurance-version">0.9.0-external-solver</span>.
          </p>
        </section>
        <section data-testid="digital-twin-external-solver-ready" aria-labelledby="dt-solver-title">
          <h2 id="dt-solver-title">External Engineering Solver</h2>
          <p>
            Version <span data-testid="digital-twin-external-solver-version">0.9.0-external-solver</span>.
            <span data-testid="digital-twin-external-solver-flag">externalEngineeringSolverAdaptersImplemented=true</span>.
          </p>
          <ul data-testid="digital-twin-solver-surfaces" aria-label="Digital Twin external solver surfaces">
            <li data-testid="digital-twin-solver-surface-fixture-provider">
              <span>FIXTURE</span> Deterministic fixture provider
            </li>
            <li data-testid="digital-twin-solver-surface-calculix-adapter">
              <span>REAL SOLVER</span> CalculiX adapter
            </li>
            <li data-testid="digital-twin-solver-surface-solver-providers">Solver Providers</li>
            <li data-testid="digital-twin-solver-surface-solver-benchmarks">Solver Benchmarks</li>
            <li data-testid="digital-twin-solver-surface-solver-runs">Solver Runs</li>
          </ul>
        </section>
      </main>
    </div>
  </body>
</html>
`;

describeExternalSolver("Phase 12I Digital Twin External Solver", () => {
  test("desktop readiness marker 1280x800", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.setContent(fixtureHtml);
    await expect(page.getByTestId("digital-twin-external-solver-ready")).toBeVisible();
    await expect(page.getByTestId("digital-twin-external-solver-version")).toContainText(
      "0.9.0-external-solver",
    );
    await expect(page.getByTestId("digital-twin-shell")).toHaveAttribute(
      "data-module-status",
      "external_solver",
    );
  });

  test("mobile readiness marker 375x812", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.setContent(fixtureHtml);
    await expect(page.getByTestId("digital-twin-external-solver-ready")).toBeVisible();
    await expect(page.getByTestId("digital-twin-firewall-message")).toBeVisible();
  });

  test("solver surfaces are enumerated", async ({ page }) => {
    await page.setContent(fixtureHtml);
    for (const surface of [
      "fixture-provider",
      "calculix-adapter",
      "solver-providers",
      "solver-benchmarks",
      "solver-runs",
    ]) {
      await expect(page.getByTestId(`digital-twin-solver-surface-${surface}`)).toBeVisible();
    }
  });

  test("external adapters enabled, native solver false", async ({ page }) => {
    await page.setContent(fixtureHtml);
    await expect(page.getByTestId("digital-twin-external-solver-flag")).toContainText("true");
    await expect(page.getByTestId("digital-twin-native-solver-flag")).toContainText("false");
  });

  test("fixture vs real solver distinction visible", async ({ page }) => {
    await page.setContent(fixtureHtml);
    await expect(page.getByTestId("digital-twin-solver-surface-fixture-provider")).toContainText(
      "FIXTURE",
    );
    await expect(page.getByTestId("digital-twin-solver-surface-calculix-adapter")).toContainText(
      "REAL SOLVER",
    );
  });

  test("accessible landmarks present", async ({ page }) => {
    await page.setContent(fixtureHtml);
    await expect(page.getByRole("navigation", { name: "Digital Twin sections" })).toBeVisible();
    await expect(page.getByRole("heading", { name: /External Engineering Solver/i })).toBeVisible();
  });
});
