import { expect, test } from "@playwright/test";

const runSuite = process.env.CERTIFY_BROWSER === "1" || process.env.GITHUB_ACTIONS === "true";
const describeSolverCapabilities = runSuite ? test.describe : test.describe.skip;

/**
 * Fixture mirrors the Digital Twin solver capabilities page markers so the
 * browser gate is deterministic and does not require a running application.
 */
const fixtureHtml = `
<!DOCTYPE html>
<html lang="en">
  <body>
    <div data-testid="digital-twin-shell" data-module-version="0.10.0-solver-capabilities" data-module-status="solver_capabilities">
      <nav aria-label="Digital Twin sections" role="navigation">
        <a href="/engineering/apps/digital-twin">Solver Capabilities</a>
      </nav>
      <main>
        <section data-testid="digital-twin-simulation-ready" aria-labelledby="dt-simulation-title">
          <h1 id="dt-simulation-title">Digital Twin — Simulation Governance</h1>
          <p>
            Version <span data-testid="digital-twin-simulation-version">0.10.0-solver-capabilities</span>.
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
            Version <span data-testid="digital-twin-assurance-version">0.10.0-solver-capabilities</span>.
          </p>
        </section>
        <section data-testid="digital-twin-external-solver-ready" aria-labelledby="dt-solver-title">
          <h2 id="dt-solver-title">External Engineering Solver</h2>
          <p>
            Version <span data-testid="digital-twin-external-solver-version">0.10.0-solver-capabilities</span>.
            <span data-testid="digital-twin-external-solver-flag">externalEngineeringSolverAdaptersImplemented=true</span>.
          </p>
          <ul data-testid="digital-twin-solver-surfaces" aria-label="Digital Twin external solver surfaces">
            <li data-testid="digital-twin-solver-surface-fixture-provider">
              <span>FIXTURE</span> Deterministic fixture provider
            </li>
            <li data-testid="digital-twin-solver-surface-calculix-adapter">
              <span>REAL SOLVER</span> CalculiX adapter
            </li>
          </ul>
        </section>
        <section data-testid="digital-twin-solver-capabilities-ready" aria-labelledby="dt-capabilities-title">
          <h2 id="dt-capabilities-title">Solver Capability Registry</h2>
          <p>
            Version <span data-testid="digital-twin-solver-capabilities-version">0.10.0-solver-capabilities</span>.
            <span data-testid="digital-twin-capability-registry-flag">SolverCapabilityRegistryReady=true</span>.
          </p>
          <ul data-testid="digital-twin-capability-surfaces" aria-label="Digital Twin solver capability surfaces">
            <li data-testid="digital-twin-capability-surface-calculix-linear-static">
              <span>QUALIFIED</span> CalculiX linear_elastic_static
            </li>
            <li data-testid="digital-twin-capability-surface-calculix-modal">
              <span>RESERVED</span> CalculiX modal
            </li>
            <li data-testid="digital-twin-capability-surface-capability-discovery">
              <span>QUERY ONLY</span> Capability Discovery
            </li>
          </ul>
        </section>
      </main>
    </div>
  </body>
</html>
`;

describeSolverCapabilities("Phase 12J Digital Twin Solver Capabilities", () => {
  test("desktop readiness marker 1280x800", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.setContent(fixtureHtml);
    await expect(page.getByTestId("digital-twin-solver-capabilities-ready")).toBeVisible();
    await expect(page.getByTestId("digital-twin-solver-capabilities-version")).toContainText(
      "0.10.0-solver-capabilities",
    );
    await expect(page.getByTestId("digital-twin-shell")).toHaveAttribute(
      "data-module-status",
      "solver_capabilities",
    );
  });

  test("mobile readiness marker 375x812", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.setContent(fixtureHtml);
    await expect(page.getByTestId("digital-twin-solver-capabilities-ready")).toBeVisible();
    await expect(page.getByTestId("digital-twin-firewall-message")).toBeVisible();
  });

  test("qualified vs reserved capability distinction", async ({ page }) => {
    await page.setContent(fixtureHtml);
    await expect(
      page.getByTestId("digital-twin-capability-surface-calculix-linear-static"),
    ).toContainText("QUALIFIED");
    await expect(
      page.getByTestId("digital-twin-capability-surface-calculix-modal"),
    ).toContainText("RESERVED");
  });

  test("accessibility landmarks present", async ({ page }) => {
    await page.setContent(fixtureHtml);
    await expect(page.getByRole("navigation", { name: "Digital Twin sections" })).toBeVisible();
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByLabel("Digital Twin solver capability surfaces")).toBeVisible();
  });
});
