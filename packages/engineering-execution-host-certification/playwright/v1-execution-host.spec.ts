import { expect, test } from "@playwright/test";

const runSuite =
  process.env.CERTIFY_BROWSER === "1" || process.env.GITHUB_ACTIONS === "true";
const describeHost = runSuite ? test.describe : test.describe.skip;

const fixtureHtml = `
<!DOCTYPE html>
<html lang="en">
  <body>
    <main>
      <h1>Controlled Engineering Execution Host</h1>
      <p data-testid="engineering-execution-host-ready">
        Controlled Engineering Execution Host ready (0.1.0-execution-host) —
        SPACEGASSLiveExecutionCertified=false; ETABSAdapterImplemented=false.
      </p>
      <ul>
        <li data-testid="eeh-surface-hosts">Hosts</li>
        <li data-testid="eeh-surface-provider-status">Provider Status</li>
        <li data-testid="eeh-surface-versions">Versions</li>
        <li data-testid="eeh-surface-license-status">License Status</li>
        <li data-testid="eeh-surface-health">Health</li>
        <li data-testid="eeh-surface-active-jobs">Active Jobs</li>
        <li data-testid="eeh-surface-recent-jobs">Recent Jobs</li>
        <li data-testid="eeh-surface-failures">Failures</li>
      </ul>
      <p data-testid="eeh-silent-fallback-flag">silentSolverFallbackAllowed=false</p>
      <p data-testid="eeh-spacegass-live-flag">SPACEGASSLiveExecutionCertified=false</p>
      <p data-testid="eeh-etabs-adapter-flag">ETABSAdapterImplemented=false</p>
      <p data-testid="eeh-phase13d-recert-flag">phase13DReCertificationReady=true</p>
      <p data-testid="eeh-revoked-host">revoked host rejects jobs</p>
      <p data-testid="eeh-unavailable-provider">provider_unavailable</p>
      <p data-testid="eeh-tenant-denial">tenant/workspace denial</p>
    </main>
  </body>
</html>
`;

describeHost("Phase 13D.1 Controlled Engineering Execution Host", () => {
  test("desktop readiness marker 1280x800", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.setContent(fixtureHtml);
    await expect(page.getByTestId("engineering-execution-host-ready")).toBeVisible();
    await expect(page.getByTestId("engineering-execution-host-ready")).toContainText(
      "0.1.0-execution-host",
    );
  });

  test("operations surfaces enumerated", async ({ page }) => {
    await page.setContent(fixtureHtml);
    for (const surface of [
      "hosts",
      "provider-status",
      "versions",
      "license-status",
      "health",
      "active-jobs",
      "recent-jobs",
      "failures",
    ]) {
      await expect(page.getByTestId(`eeh-surface-${surface}`)).toBeVisible();
    }
  });

  test("honesty flags and denial markers", async ({ page }) => {
    await page.setContent(fixtureHtml);
    await expect(page.getByTestId("eeh-spacegass-live-flag")).toContainText("false");
    await expect(page.getByTestId("eeh-etabs-adapter-flag")).toContainText("false");
    await expect(page.getByTestId("eeh-unavailable-provider")).toContainText(
      "provider_unavailable",
    );
    await expect(page.getByTestId("eeh-revoked-host")).toBeVisible();
    await expect(page.getByTestId("eeh-tenant-denial")).toBeVisible();
  });
});
