import { defineConfig, devices } from "@playwright/test";

const webPort = process.env.WEB_PORT ?? "3000";

export default defineConfig({
  testDir: "./e2e",
  use: {
    baseURL: `http://localhost:${webPort}`,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: `pnpm --filter eve-web exec next dev --port ${webPort}`,
    reuseExistingServer: true,
    timeout: 180_000,
    url: `http://127.0.0.1:${webPort}`,
  },
});
