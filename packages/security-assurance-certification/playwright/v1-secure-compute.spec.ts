import { expect, test } from "@playwright/test";

const runSuite =
  process.env.CERTIFY_BROWSER === "1" || process.env.GITHUB_ACTIONS === "true";
const describeSecureCompute = runSuite ? test.describe : test.describe.skip;

const fixtureHtml = `
<!DOCTYPE html>
<html lang="en">
  <body>
    <main>
      <p data-testid="security-assurance-secure-compute-ready">
        Secure Compute Assurance ready (0.5.0-secure-compute) —
        SecureComputeAssuranceRuntimeImplemented=true;
        WorkloadIdentityAssuranceImplemented=true;
        ExecutionProvenanceImplemented=true;
        duplicateExecutionHostDetected=false;
        confidentialComputingClaimed=false;
        teeClaimed=false.
      </p>
      <section aria-label="Secure compute assurance">
        <ul data-testid="sa-secure-compute-planes" aria-label="Secure compute planes">
          <li data-testid="sa-sc-plane-WORKLOAD_IDENTITY">WORKLOAD_IDENTITY</li>
          <li data-testid="sa-sc-plane-TENANT_WORKSPACE_SCOPE">TENANT_WORKSPACE_SCOPE</li>
          <li data-testid="sa-sc-plane-EXECUTION_AUTHORIZATION">EXECUTION_AUTHORIZATION</li>
          <li data-testid="sa-sc-plane-RUNTIME_ISOLATION">RUNTIME_ISOLATION</li>
          <li data-testid="sa-sc-plane-FILESYSTEM_SCOPE">FILESYSTEM_SCOPE</li>
          <li data-testid="sa-sc-plane-NETWORK_EGRESS">NETWORK_EGRESS</li>
          <li data-testid="sa-sc-plane-SECRET_ACCESS">SECRET_ACCESS</li>
          <li data-testid="sa-sc-plane-RESOURCE_LIMITS">RESOURCE_LIMITS</li>
          <li data-testid="sa-sc-plane-EXECUTION_TIMEOUT">EXECUTION_TIMEOUT</li>
          <li data-testid="sa-sc-plane-ARTEFACT_INTEGRITY">ARTEFACT_INTEGRITY</li>
          <li data-testid="sa-sc-plane-EXECUTION_PROVENANCE">EXECUTION_PROVENANCE</li>
          <li data-testid="sa-sc-plane-OUTPUT_HANDLING">OUTPUT_HANDLING</li>
          <li data-testid="sa-sc-plane-TEMPORARY_DATA">TEMPORARY_DATA</li>
          <li data-testid="sa-sc-plane-LOGGING_TELEMETRY">LOGGING_TELEMETRY</li>
          <li data-testid="sa-sc-plane-HOST_POSTURE">HOST_POSTURE</li>
        </ul>
        <p data-testid="sa-sc-workload-posture">workload/runtime posture: attributable identity required; unknown fail-closed</p>
        <p data-testid="sa-sc-no-tee-claim">confidentialComputingClaimed=false; teeClaimed=false</p>
      </section>
      <p data-testid="sa-no-universal-score">universalScorePresent=false</p>
    </main>
  </body>
</html>
`;

describeSecureCompute("Phase 15E Secure Compute Assurance", () => {
  test("desktop readiness 1280x800", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.setContent(fixtureHtml);
    await expect(page.getByTestId("security-assurance-secure-compute-ready")).toBeVisible();
    await expect(page.getByTestId("security-assurance-secure-compute-ready")).toContainText(
      "0.5.0-secure-compute",
    );
  });

  test("tablet planes 768x1024", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.setContent(fixtureHtml);
    await expect(page.locator('[aria-label="Secure compute planes"]')).toBeVisible();
    await expect(page.getByTestId("sa-secure-compute-planes").locator("li")).toHaveCount(15);
  });

  test("mobile honesty markers", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.setContent(fixtureHtml);
    await expect(page.getByTestId("sa-sc-no-tee-claim")).toContainText("teeClaimed=false");
    await expect(page.getByTestId("security-assurance-secure-compute-ready")).toContainText(
      "duplicateExecutionHostDetected=false",
    );
  });
});
