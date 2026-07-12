import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./playwright",
  timeout: 120_000,
  retries: process.env.CI || process.env.GITHUB_ACTIONS === "true" ? 1 : 0,
  workers: process.env.PROJECT_INTELLIGENCE_CERTIFICATION === "1" ? 1 : undefined,
  fullyParallel: process.env.PROJECT_INTELLIGENCE_CERTIFICATION !== "1",
  outputDir: "test-results/project-intelligence",
  reporter: [["list"], ["json", { outputFile: "artifacts/playwright-report.json" }]],
  use: {
    baseURL: process.env.RTB_TEST_BASE_URL ?? "http://127.0.0.1:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
