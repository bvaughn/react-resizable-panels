import type { PlaywrightTestConfig } from "@playwright/test";

const config: PlaywrightTestConfig = {
  use: {
    // Uncomment to test in headless Chromium:
    // launchOptions: {
    //   slowMo: 100,
    // },
    // browserName: "chromium",
    // headless: false,
    headless: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    video: "on-first-retry",
  },
  webServer: {
    command: "PORT=2345 npm run watch",
    url: "http://localhost:2345",
  },
};

export default config;
