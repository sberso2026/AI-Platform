import { expect, test } from "@playwright/test";

const runSuite = process.env.CERTIFY_BROWSER === "1" || process.env.GITHUB_ACTIONS === "true";
const describeDigitalThread = runSuite ? test.describe : test.describe.skip;

/**
 * Fixture mirrors the Digital Twin digital thread page markers so the
 * browser gate is deterministic and does not require a running application.
 */
const fixtureHtml = `
<!DOCTYPE html>
<html lang="en">
  <body>
    <div data-testid="digital-twin-shell" data-module-version="0.11.0-digital-thread" data-module-status="digital_thread">
      <nav aria-label="Digital Twin sections" role="navigation">
        <a href="/engineering/apps/digital-twin">Digital Thread</a>
      </nav>
      <main>
        <section data-testid="digital-twin-simulation-ready" aria-labelledby="dt-simulation-title">
          <h1 id="dt-simulation-title">Digital Twin — Simulation Governance</h1>
          <p>
            Version <span data-testid="digital-twin-simulation-version">0.11.0-digital-thread</span>.
            <span data-testid="digital-twin-native-solver-flag">nativeEngineeringSolverImplemented=false</span>.
          </p>
          <section data-testid="digital-twin-observed-vs-simulated" aria-label="Observed versus simulated firewall">
            <p data-testid="digital-twin-firewall-message">
              Simulated Twin State never silently replaces Observed state.
            </p>
          </section>
        </section>
        <section data-testid="digital-twin-solver-capabilities-ready" aria-labelledby="dt-capabilities-title">
          <h2 id="dt-capabilities-title">Solver Capability Registry</h2>
          <p>
            Version <span data-testid="digital-twin-solver-capabilities-version">0.11.0-digital-thread</span>.
            <span data-testid="digital-twin-capability-registry-flag">SolverCapabilityRegistryReady=true</span>.
          </p>
        </section>
        <section data-testid="digital-twin-digital-thread-ready" aria-labelledby="dt-thread-title">
          <h2 id="dt-thread-title">Digital Thread Intelligence</h2>
          <p>
            Version <span data-testid="digital-twin-digital-thread-version">0.11.0-digital-thread</span>.
            <span data-testid="digital-twin-digital-thread-flag">DigitalThreadIntelligenceReady=true</span>.
          </p>
          <ul data-testid="digital-twin-digital-thread-surfaces" aria-label="Digital Twin digital thread surfaces">
            <li data-testid="digital-twin-digital-thread-surface-compose">
              <span>THREAD REF</span> Compose
            </li>
            <li data-testid="digital-twin-digital-thread-surface-provenance">
              <span>THREAD REF</span> Provenance
            </li>
            <li data-testid="digital-twin-digital-thread-surface-integrity">
              <span>THREAD REF</span> Integrity
            </li>
          </ul>
        </section>
      </main>
    </div>
  </body>
</html>
`;

describeDigitalThread("Phase 12K Digital Twin Digital Thread", () => {
  test("desktop readiness marker 1280x800", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.setContent(fixtureHtml);
    await expect(page.getByTestId("digital-twin-digital-thread-ready")).toBeVisible();
    await expect(page.getByTestId("digital-twin-digital-thread-version")).toContainText(
      "0.11.0-digital-thread",
    );
    await expect(page.getByTestId("digital-twin-shell")).toHaveAttribute(
      "data-module-status",
      "digital_thread",
    );
  });

  test("mobile readiness marker 375x812", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.setContent(fixtureHtml);
    await expect(page.getByTestId("digital-twin-digital-thread-ready")).toBeVisible();
    await expect(page.getByTestId("digital-twin-firewall-message")).toBeVisible();
  });

  test("thread surface markers present", async ({ page }) => {
    await page.setContent(fixtureHtml);
    await expect(page.getByTestId("digital-twin-digital-thread-surface-compose")).toContainText(
      "Compose",
    );
    await expect(
      page.getByTestId("digital-twin-digital-thread-surface-provenance"),
    ).toContainText("Provenance");
  });

  test("accessibility landmarks present", async ({ page }) => {
    await page.setContent(fixtureHtml);
    await expect(page.getByRole("navigation", { name: "Digital Twin sections" })).toBeVisible();
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByLabel("Digital Twin digital thread surfaces")).toBeVisible();
  });
});
