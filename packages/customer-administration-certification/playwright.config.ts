import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./playwright",
  timeout: 120_000,
  use: {
    baseURL: process.env.RTB_TEST_BASE_URL ?? "http://127.0.0.1:3000",
  },
});
