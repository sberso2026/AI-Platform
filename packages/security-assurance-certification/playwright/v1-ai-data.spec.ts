import { expect, test } from "@playwright/test";

const runSuite =
  process.env.CERTIFY_BROWSER === "1" || process.env.GITHUB_ACTIONS === "true";
const describeAiData = runSuite ? test.describe : test.describe.skip;

const fixtureHtml = `
<!DOCTYPE html>
<html lang="en">
  <body>
    <main>
      <p data-testid="security-assurance-ai-data-ready">
        AI &amp; Data Security Assurance ready (0.4.0-ai-data-security) —
        AiDataSecurityRuntimeImplemented=true;
        ProviderDataHandlingAssuranceImplemented=true;
        duplicateAiStackDetected=false;
        AiTrustRuntimeImplemented=false.
      </p>
      <section aria-label="AI and data security assurance">
        <ul data-testid="sa-ai-data-planes" aria-label="AI data security planes">
          <li data-testid="sa-aid-plane-DATA_INGESTION">DATA_INGESTION</li>
          <li data-testid="sa-aid-plane-DATA_STORAGE">DATA_STORAGE</li>
          <li data-testid="sa-aid-plane-RETRIEVAL">RETRIEVAL</li>
          <li data-testid="sa-aid-plane-AI_CONTEXT">AI_CONTEXT</li>
          <li data-testid="sa-aid-plane-PROMPT">PROMPT</li>
          <li data-testid="sa-aid-plane-MODEL_PROVIDER">MODEL_PROVIDER</li>
          <li data-testid="sa-aid-plane-TOOL_INPUT">TOOL_INPUT</li>
          <li data-testid="sa-aid-plane-TOOL_OUTPUT">TOOL_OUTPUT</li>
          <li data-testid="sa-aid-plane-MODEL_OUTPUT">MODEL_OUTPUT</li>
          <li data-testid="sa-aid-plane-PERSISTENCE">PERSISTENCE</li>
          <li data-testid="sa-aid-plane-LOGGING_TELEMETRY">LOGGING_TELEMETRY</li>
          <li data-testid="sa-aid-plane-DATA_EGRESS">DATA_EGRESS</li>
        </ul>
        <p data-testid="sa-aid-provider-posture">provider posture: approved evidenced; unknown fail-closed</p>
        <p data-testid="sa-aid-no-injection-claim">promptInjectionCompletelyPreventedClaimed=false</p>
      </section>
      <p data-testid="sa-no-universal-score">universalScorePresent=false</p>
    </main>
  </body>
</html>
`;

describeAiData("Phase 15D AI & Data Security Assurance", () => {
  test("desktop readiness 1280x800", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.setContent(fixtureHtml);
    await expect(page.getByTestId("security-assurance-ai-data-ready")).toBeVisible();
    await expect(page.getByTestId("security-assurance-ai-data-ready")).toContainText(
      "0.4.0-ai-data-security",
    );
  });

  test("tablet planes 768x1024", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.setContent(fixtureHtml);
    await expect(page.locator('[aria-label="AI data security planes"]')).toBeVisible();
    await expect(page.getByTestId("sa-ai-data-planes").locator("li")).toHaveCount(12);
  });

  test("mobile honesty markers", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.setContent(fixtureHtml);
    await expect(page.getByTestId("sa-aid-no-injection-claim")).toContainText("false");
    await expect(page.getByTestId("security-assurance-ai-data-ready")).toContainText(
      "duplicateAiStackDetected=false",
    );
  });
});
