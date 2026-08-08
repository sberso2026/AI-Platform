import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./playwright",
  reporter: [["json", { outputFile: "artifacts/playwright-report.json" }]],
  use: { headless: true },
});
