import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./playwright",
  timeout: 30_000,
  retries: 0,
  use: {
    headless: true,
  },
});
