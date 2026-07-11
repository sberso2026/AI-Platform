import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./playwright",
  timeout: 120_000,
  workers: process.env.CUSTOMER_ADMIN_CERTIFICATION ? 1 : undefined,
  fullyParallel: !process.env.CUSTOMER_ADMIN_CERTIFICATION,
  outputDir: "test-results/customer-administration",
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: ".tmp/customer-administration/html-report" }],
  ],
  use: {
    baseURL: process.env.RTB_TEST_BASE_URL ?? "http://127.0.0.1:3000",
  },
});
