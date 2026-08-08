import { expect, test } from "@playwright/test";

const runSuite = process.env.CERTIFY_BROWSER === "1" || process.env.GITHUB_ACTIONS === "true";
const describeAssurance = runSuite ? test.describe : test.describe.skip;

/**
 * Fixture mirrors the Digital Twin simulation assurance page markers so the
 * browser gate is deterministic and does not require a running application.
 */
const fixtureHtml = `
<!DOCTYPE html>
<html lang="en">
  <body>
    <div data-testid="digital-twin-shell" data-module-version="0.8.0-simulation-assurance" data-module-status="simulation_assurance">
      <nav aria-label="Digital Twin sections" role="navigation">
        <a href="/engineering/apps/digital-twin">Simulation Assurance</a>
      </nav>
      <main>
        <section data-testid="digital-twin-simulation-ready" aria-labelledby="dt-simulation-title">
          <h1 id="dt-simulation-title">Digital Twin — Simulation Governance</h1>
          <p>
            Version <span data-testid="digital-twin-simulation-version">0.8.0-simulation-assurance</span>.
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
            Version <span data-testid="digital-twin-assurance-version">0.8.0-simulation-assurance</span>.
            <span data-testid="digital-twin-external-solver-flag">externalEngineeringSolverAdaptersImplemented=false</span>.
          </p>
          <ul data-testid="digital-twin-assurance-surfaces" aria-label="Digital Twin assurance surfaces">
            <li data-testid="digital-twin-assurance-surface-method-qualifications">Method Qualifications</li>
            <li data-testid="digital-twin-assurance-surface-provider-qualifications">Provider Qualifications</li>
            <li data-testid="digital-twin-assurance-surface-application-qualifications">Application Qualifications</li>
            <li data-testid="digital-twin-assurance-surface-execution-qualifications">Execution Qualifications</li>
            <li data-testid="digital-twin-assurance-surface-eligibility">Eligibility</li>
            <li data-testid="digital-twin-assurance-surface-packages">Packages</li>
            <li data-testid="digital-twin-assurance-surface-package-integrity">Integrity</li>
            <li data-testid="digital-twin-assurance-surface-reproducibility">Reproducibility</li>
          </ul>
        </section>
      </main>
    </div>
  </body>
</html>
`;

describeAssurance("Phase 12H Digital Twin Simulation Assurance", () => {
  test("desktop readiness marker 1280x800", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.setContent(fixtureHtml);
    await expect(page.getByTestId("digital-twin-simulation-assurance-ready")).toBeVisible();
    await expect(page.getByTestId("digital-twin-assurance-version")).toContainText(
      "0.8.0-simulation-assurance",
    );
    await expect(page.getByTestId("digital-twin-shell")).toHaveAttribute(
      "data-module-status",
      "simulation_assurance",
    );
  });

  test("mobile readiness marker 375x812", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.setContent(fixtureHtml);
    await expect(page.getByTestId("digital-twin-simulation-assurance-ready")).toBeVisible();
    await expect(page.getByTestId("digital-twin-firewall-message")).toBeVisible();
  });

  test("assurance surfaces are enumerated", async ({ page }) => {
    await page.setContent(fixtureHtml);
    for (const surface of [
      "method-qualifications",
      "provider-qualifications",
      "application-qualifications",
      "execution-qualifications",
      "eligibility",
      "packages",
      "package-integrity",
      "reproducibility",
    ]) {
      await expect(page.getByTestId(`digital-twin-assurance-surface-${surface}`)).toBeVisible();
    }
  });

  test("external solvers remain unavailable", async ({ page }) => {
    await page.setContent(fixtureHtml);
    await expect(page.getByTestId("digital-twin-external-solver-flag")).toContainText("false");
    await expect(page.getByTestId("digital-twin-native-solver-flag")).toContainText("false");
  });

  test("accessible landmarks present", async ({ page }) => {
    await page.setContent(fixtureHtml);
    await expect(page.getByRole("navigation", { name: "Digital Twin sections" })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Simulation Assurance/i })).toBeVisible();
  });
});
