import type { PlaywrightTestConfig } from "@playwright/test";

const { DEBUG } = process.env;

const config: PlaywrightTestConfig = {
  use: {
    browserName: "chromium",
    headless: true,
    viewport: { width: 400, height: 300 },
    ignoreHTTPSErrors: true,
    video: "on-first-retry",
  },
  webServer: {
    command: "npm run watch",
    reuseExistingServer: true,
    url: "http://localhost:1234",
  },
  timeout: 60_000,
};

if (process.env.DEBUG) {
  config.use = {
    ...config.use,
    headless: false,

    launchOptions: {
      // slowMo: DEBUG ? 250 : undefined,
    },
  };
}

export default config;
