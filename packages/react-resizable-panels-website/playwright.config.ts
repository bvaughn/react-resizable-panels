import type { PlaywrightTestConfig } from "@playwright/test";

const config: PlaywrightTestConfig = {
  use: {
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
