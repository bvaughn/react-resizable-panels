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

// CI tests against production builds (see "integrations:build");
// dev servers compile on demand and can be too slow on a busy CI runner.
// Locally, already running dev servers ("dev:integrations") are reused.
const SERVERS = [
  { app: "next", port: 3010 },
  { app: "vike", port: 3011 },
  { app: "vite", port: 3012 }
];

// Most tests only use the vite app; CI runs them with E2E_APPS=vite (so only that app is built and started),
// and runs the tests that use the other apps (see SSR_SPECS) in a separate job
const APPS = process.env.E2E_APPS?.split(",") ?? SERVERS.map(({ app }) => app);
const SSR_SPECS = ["**/default-layout.spec.tsx"];

export default defineConfig({
  testIgnore: APPS.includes("next") && APPS.includes("vike") ? [] : SSR_SPECS,
  webServer: SERVERS.filter(({ app }) => APPS.includes(app)).map(
    ({ app, port }) => ({
      command: `pnpm -C ../${app} run ${process.env.CI ? "start" : "dev"}`,
      url: `http://localhost:${port}/`,
      reuseExistingServer: !process.env.CI,
      stdout: "ignore",
      stderr: "pipe",
      timeout: 60_000
    })
  ),
  fullyParallel: true,
  // Tests mostly wait on the browser, so use more workers than the CI default (50% of cores)
  ...(process.env.CI && { workers: 4 }),
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
