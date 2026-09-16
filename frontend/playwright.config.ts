import { defineConfig, devices } from "@playwright/test";

/**
 * Precondition (not orchestrated here): the backend + MySQL must already be
 * running (`docker compose up -d mysql backend` or `npm run start:dev` in
 * /backend) before running `npx playwright test`.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  fullyParallel: false,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
