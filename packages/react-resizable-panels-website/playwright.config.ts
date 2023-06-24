import type { PlaywrightTestConfig } from "@playwright/test";

const { DEBUG } = process.env;

const config: PlaywrightTestConfig = {
  use: {
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
};

if (process.env.DEBUG) {
  config.use = {
    ...config.use,
    browserName: "chromium",
    headless: false,

    launchOptions: {
      slowMo: DEBUG ? 250 : undefined,
    },
  };
}

export default config;
