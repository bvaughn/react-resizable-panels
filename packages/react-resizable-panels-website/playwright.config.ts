import type { PlaywrightTestConfig } from "@playwright/test";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PROJECT: Projects;
    }
  }
}

const CI = !!process.env.CI;
const { DEBUG } = process.env;
const project = process.env.PROJECT || "website";

type InferServer<T> = Exclude<T extends Array<infer U> ? U : T, undefined>;
type WebServer = InferServer<PlaywrightTestConfig["webServer"]>;
type TestDir = InferServer<PlaywrightTestConfig["testDir"]>;
type Projects = "website" | "nextjs";

function getProjectServer(): WebServer {
  const projects: Record<Projects, WebServer> = {
    website: {
      cwd: "./",
      command: "npm run watch",
      url: "http://localhost:1234",
      reuseExistingServer: !CI,
    },
    nextjs: {
      cwd: "../../examples/nextjs",
      command: "pnpm run dev",
      url: "http://localhost:3000",
      reuseExistingServer: !CI,
    },
  };

  return projects[project];
}

function getTestDir(): TestDir {
  const projects: Record<Projects, TestDir> = {
    website: "./",
    nextjs: "../../examples/nextjs/tests",
  };

  return projects[project];
}

const config: PlaywrightTestConfig = {
  testDir: getTestDir(),
  use: {
    browserName: "chromium",
    headless: true,
    viewport: { width: 400, height: 300 },
    ignoreHTTPSErrors: true,
    video: "on-first-retry",
  },
  webServer: getProjectServer(),
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
