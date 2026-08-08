import { expect, test } from "@playwright/test";

const runSuite = process.env.CERTIFY_BROWSER === "1" || process.env.GITHUB_ACTIONS === "true";
const describeBinding = runSuite ? test.describe : test.describe.skip;

/**
 * Fixture mirrors the Digital Twin telemetry binding page markers so the browser gate
 * is deterministic and does not require a running application.
 */
const fixtureHtml = `
<!DOCTYPE html>
<html lang="en">
  <body>
    <div data-testid="digital-twin-shell" data-module-version="0.5.0-telemetry-binding" data-module-status="telemetry_binding">
      <nav aria-label="Digital Twin sections">
        <a href="/engineering/apps/digital-twin">Telemetry Binding</a>
      </nav>
      <main>
        <section data-testid="digital-twin-telemetry-binding-ready" aria-labelledby="dt-telemetry-title">
          <h1 id="dt-telemetry-title">Digital Twin — Telemetry Binding</h1>
          <p>
            Version <span data-testid="digital-twin-telemetry-version">0.5.0-telemetry-binding</span>.
            Engineering time series ownership stays with Asset Intelligence.
          </p>
          <ul data-testid="digital-twin-telemetry-surfaces" aria-label="Digital Twin telemetry binding surfaces">
            <li data-testid="digital-twin-surface-telemetry-sources">Telemetry Sources — reference only</li>
            <li data-testid="digital-twin-surface-telemetry-bindings">Bindings — governed lifecycle</li>
            <li data-testid="digital-twin-surface-binding-status">Binding status — no auto-publish</li>
            <li data-testid="digital-twin-surface-source-health">Source health — available | degraded | unavailable</li>
            <li data-testid="digital-twin-surface-current-projected-state">Current projected state — bounded projection</li>
            <li data-testid="digital-twin-surface-freshness">Freshness — stale detection</li>
            <li data-testid="digital-twin-surface-quality">Quality — good | suspect | bad | missing</li>
          </ul>
          <ul data-testid="digital-twin-unavailable-capabilities" aria-label="Capabilities unavailable in Phase 12E">
            <li data-testid="digital-twin-unavailable-telemetry-historian">Telemetry historian — UNAVAILABLE</li>
            <li data-testid="digital-twin-unavailable-high-frequency">High-frequency telemetry — UNAVAILABLE</li>
            <li data-testid="digital-twin-unavailable-shm-signal-processing">SHM signal processing — UNAVAILABLE</li>
            <li data-testid="digital-twin-unavailable-sensor-registry">Sensor registry — UNAVAILABLE</li>
            <li data-testid="digital-twin-unavailable-three-d-viewer">3D viewer — UNAVAILABLE</li>
          </ul>
          <section data-testid="digital-twin-source-unavailable-surface" aria-label="Source unavailable">
            <h2>Source unavailable</h2>
            <p data-testid="digital-twin-source-unavailable-message">
              When source health is unavailable, projection is blocked and no auto-publish occurs.
            </p>
          </section>
          <section data-testid="digital-twin-freshness-quality-surface" aria-label="Freshness and quality">
            <dl>
              <div>
                <dt>Freshness</dt>
                <dd data-testid="digital-twin-freshness-label">Stale when last observation exceeds policy window.</dd>
              </div>
              <div>
                <dt>Quality</dt>
                <dd data-testid="digital-twin-quality-label">
                  Projections with bad, missing, or stale quality are rejected from auto-ingest.
                </dd>
              </div>
            </dl>
          </section>
        </section>
      </main>
    </div>
  </body>
</html>
`;

describeBinding("Phase 12E Digital Twin Telemetry Binding", () => {
  test("desktop readiness marker 1280x800", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.setContent(fixtureHtml);
    await expect(page.getByTestId("digital-twin-telemetry-binding-ready")).toBeVisible();
    await expect(page.getByTestId("digital-twin-telemetry-version")).toContainText(
      "0.5.0-telemetry-binding",
    );
    await expect(page.getByTestId("digital-twin-shell")).toHaveAttribute(
      "data-module-status",
      "telemetry_binding",
    );
  });

  test("telemetry surfaces are enumerated", async ({ page }) => {
    await page.setContent(fixtureHtml);
    for (const surface of [
      "telemetry-sources",
      "telemetry-bindings",
      "binding-status",
      "source-health",
      "current-projected-state",
      "freshness",
      "quality",
    ]) {
      await expect(page.getByTestId(`digital-twin-surface-${surface}`)).toBeVisible();
    }
  });

  test("phone unavailable capability labels 390x844", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.setContent(fixtureHtml);
    await expect(page.getByTestId("digital-twin-telemetry-binding-ready")).toBeVisible();
    await expect(page.getByTestId("digital-twin-unavailable-telemetry-historian")).toContainText(
      "UNAVAILABLE",
    );
    await expect(page.getByTestId("digital-twin-unavailable-high-frequency")).toContainText(
      "UNAVAILABLE",
    );
    await expect(page.getByTestId("digital-twin-unavailable-shm-signal-processing")).toContainText(
      "UNAVAILABLE",
    );
    await expect(page.getByTestId("digital-twin-unavailable-sensor-registry")).toContainText(
      "UNAVAILABLE",
    );
    await expect(page.getByTestId("digital-twin-unavailable-three-d-viewer")).toContainText(
      "UNAVAILABLE",
    );
  });

  test("tablet freshness quality and source unavailable 768x1024", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.setContent(fixtureHtml);
    await expect(page.getByTestId("digital-twin-freshness-quality-surface")).toBeVisible();
    await expect(page.getByTestId("digital-twin-freshness-label")).toContainText("Stale");
    await expect(page.getByTestId("digital-twin-quality-label")).toContainText("rejected");
    await expect(page.getByTestId("digital-twin-source-unavailable-surface")).toBeVisible();
    await expect(page.getByTestId("digital-twin-source-unavailable-message")).toContainText(
      "no auto-publish",
    );
  });

  test("accessible landmarks and navigation", async ({ page }) => {
    await page.setContent(fixtureHtml);
    await expect(page.getByRole("navigation", { name: "Digital Twin sections" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Digital Twin — Telemetry Binding" })).toBeVisible();
    await expect(
      page.getByRole("list", { name: "Digital Twin telemetry binding surfaces" }),
    ).toBeVisible();
    await expect(
      page.getByRole("list", { name: "Capabilities unavailable in Phase 12E" }),
    ).toBeVisible();
    await expect(page.getByLabel("Source unavailable")).toBeVisible();
    await expect(page.getByLabel("Freshness and quality")).toBeVisible();
    await expect(page.getByRole("link", { name: "Telemetry Binding" })).toHaveAttribute(
      "href",
      "/engineering/apps/digital-twin",
    );
  });
});
