import type { PlaywrightTestConfig } from "@playwright/test";
import {
  createReplayReporterConfig,
  devices as replayDevices,
} from "@replayio/playwright";

const { DEBUG } = process.env;

const config: PlaywrightTestConfig = {
  projects: [
    {
      name: "replay-chromium",
      use: { ...replayDevices["Replay Chromium"] },
    },
  ],
  reporter: [
    // @ts-ignore
    createReplayReporterConfig({
      apiKey: process.env.REPLAY_API_KEY,
      upload: true,
    }),
  ],
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
};

if (process.env.DEBUG) {
  config.use = {
    ...config.use,
    headless: false,

    launchOptions: {
      slowMo: DEBUG ? 50 : undefined,
    },
  };
}

export default config;
