import { expect, test } from "@playwright/test";

const runSuite = process.env.CERTIFY_BROWSER === "1" || process.env.GITHUB_ACTIONS === "true";
const describeRepresentation = runSuite ? test.describe : test.describe.skip;

/**
 * Fixture mirrors the Digital Twin representation page markers so the browser gate
 * is deterministic and does not require a running application.
 */
const fixtureHtml = `
<!DOCTYPE html>
<html lang="en">
  <body>
    <div data-testid="digital-twin-shell" data-module-version="0.6.0-representation" data-module-status="representation">
      <nav aria-label="Digital Twin sections">
        <a href="/engineering/apps/digital-twin">Representation Mapping</a>
      </nav>
      <main>
        <section data-testid="digital-twin-representation-ready" aria-labelledby="dt-representation-title">
          <h1 id="dt-representation-title">Digital Twin — Representation Mapping</h1>
          <p>
            Version <span data-testid="digital-twin-representation-version">0.6.0-representation</span>.
            Visual/navigation resolves mapped elements —
            <span data-testid="digital-twin-three-d-viewer-flag">threeDViewerImplemented=false</span>.
          </p>
          <ul data-testid="digital-twin-representation-surfaces" aria-label="Digital Twin representation surfaces">
            <li data-testid="digital-twin-surface-representations">Representations � source refs only</li>
            <li data-testid="digital-twin-surface-versions">Versions — append/supersede</li>
            <li data-testid="digital-twin-surface-mappings">Mappings — governed lifecycle</li>
            <li data-testid="digital-twin-surface-mapped-elements">Mapped Elements — no geometry</li>
            <li data-testid="digital-twin-surface-state-context">State Context — navigation refs</li>
            <li data-testid="digital-twin-surface-telemetry-context">Telemetry Context — navigation refs</li>
            <li data-testid="digital-twin-surface-inspection-context">Inspection Context — reserved</li>
            <li data-testid="digital-twin-surface-mapping-review">Mapping Review — no AI self-approval</li>
          </ul>
          <ul data-testid="digital-twin-unavailable-capabilities" aria-label="Capabilities unavailable in Phase 12F">
            <li data-testid="digital-twin-unavailable-three-d-viewer">Full 3D / BIM viewer — UNAVAILABLE</li>
            <li data-testid="digital-twin-unavailable-bim-authoring">BIM authoring — UNAVAILABLE</li>
            <li data-testid="digital-twin-unavailable-model-binary-store">Model binary store — UNAVAILABLE</li>
            <li data-testid="digital-twin-unavailable-telemetry-historian">Telemetry historian — UNAVAILABLE</li>
            <li data-testid="digital-twin-unavailable-shm-runtime">SHM runtime — UNAVAILABLE</li>
            <li data-testid="digital-twin-unavailable-simulation">Simulation execution — UNAVAILABLE</li>
          </ul>
          <section data-testid="digital-twin-navigation-boundary" aria-label="Navigation boundary">
            <h2>Navigation boundary</h2>
            <p data-testid="digital-twin-navigation-boundary-message">
              Representation navigation is read-oriented resolve. It is not BIM authoring and not a full 3D viewer.
            </p>
          </section>
          <section data-testid="digital-twin-ownership-boundary" aria-label="Ownership boundary">
            <dl>
              <div>
                <dt>Spatial ownership</dt>
                <dd data-testid="digital-twin-spatial-ownership-label">Shared-domain location refs via thin wrappers.</dd>
              </div>
              <div>
                <dt>Source model ownership</dt>
                <dd data-testid="digital-twin-source-model-ownership-label">
                  external_or_existing_engineering_model_owner - duplicateModelOwnershipDetected=false.
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

describeRepresentation("Phase 12F Digital Twin Representation", () => {
  test("desktop readiness marker 1280x800", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.setContent(fixtureHtml);
    await expect(page.getByTestId("digital-twin-representation-ready")).toBeVisible();
    await expect(page.getByTestId("digital-twin-representation-version")).toContainText(
      "0.6.0-representation",
    );
    await expect(page.getByTestId("digital-twin-shell")).toHaveAttribute(
      "data-module-status",
      "representation",
    );
  });

  test("representation surfaces are enumerated", async ({ page }) => {
    await page.setContent(fixtureHtml);
    for (const surface of [
      "representations",
      "versions",
      "mappings",
      "mapped-elements",
      "state-context",
      "telemetry-context",
      "inspection-context",
      "mapping-review",
    ]) {
      await expect(page.getByTestId(`digital-twin-surface-${surface}`)).toBeVisible();
    }
  });

  test("phone unavailable capability labels 390x844", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.setContent(fixtureHtml);
    await expect(page.getByTestId("digital-twin-representation-ready")).toBeVisible();
    await expect(page.getByTestId("digital-twin-unavailable-three-d-viewer")).toContainText(
      "UNAVAILABLE",
    );
    await expect(page.getByTestId("digital-twin-unavailable-bim-authoring")).toContainText(
      "UNAVAILABLE",
    );
    await expect(page.getByTestId("digital-twin-three-d-viewer-flag")).toContainText(
      "threeDViewerImplemented=false",
    );
  });

  test("tablet navigation and ownership boundary 768x1024", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.setContent(fixtureHtml);
    await expect(page.getByTestId("digital-twin-navigation-boundary")).toBeVisible();
    await expect(page.getByTestId("digital-twin-navigation-boundary-message")).toContainText(
      "not a full 3D viewer",
    );
    await expect(page.getByTestId("digital-twin-ownership-boundary")).toBeVisible();
    await expect(page.getByTestId("digital-twin-source-model-ownership-label")).toContainText(
      "duplicateModelOwnershipDetected=false",
    );
  });

  test("accessible landmarks and navigation", async ({ page }) => {
    await page.setContent(fixtureHtml);
    await expect(page.getByRole("navigation", { name: "Digital Twin sections" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Digital Twin — Representation Mapping" }),
    ).toBeVisible();
    await expect(
      page.getByRole("list", { name: "Digital Twin representation surfaces" }),
    ).toBeVisible();
    await expect(
      page.getByRole("list", { name: "Capabilities unavailable in Phase 12F" }),
    ).toBeVisible();
    await expect(page.getByLabel("Navigation boundary")).toBeVisible();
    await expect(page.getByLabel("Ownership boundary")).toBeVisible();
    await expect(page.getByRole("link", { name: "Representation Mapping" })).toHaveAttribute(
      "href",
      "/engineering/apps/digital-twin",
    );
  });
});
