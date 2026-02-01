import { defineConfig, devices } from "@playwright/test";

export type ExtendedUseOptions = {
  usePopUpWindow: boolean;
};

const DEVICES = [
  {
    name: "chromium",
    use: {
      ...devices["Desktop Chrome"],
      usePopUpWindow: false
    }
  },
  {
    name: "chromium: popup",
    use: {
      ...devices["Desktop Chrome"],
      usePopUpWindow: true
    }
  }
];

export default defineConfig({
  projects: DEVICES.map(({ name, use }) => ({
    name,
    timeout: 10_000,
    use: {
      ...use,
      viewport: { width: 1000, height: 600 }
      // Uncomment to visually debug
      // headless: false,
      // launchOptions: {
      //   slowMo: 250
      // }
    }
  }))
});
