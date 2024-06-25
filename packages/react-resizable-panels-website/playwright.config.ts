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
    process.env.REPLAY_API_KEY
      ? createReplayReporterConfig({
          apiKey: process.env.REPLAY_API_KEY,
          upload: true,
        })
      : undefined,
    // replicating Playwright's defaults
    process.env.CI ? (["dot"] as const) : (["list"] as const),
  ].filter((v): v is NonNullable<typeof v> => !!v),
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
