import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      // Tests that need a DOM opt into jsdom with a "// @vitest-environment jsdom" comment
      // (running in Node is faster to set up, and a test that needs a DOM fails without one)
      environment: "node",
      // Faster to start than the default "forks" pool
      pool: "threads",
      setupFiles: "./vitest.setup.ts",
      exclude: ["node_modules", "integrations"]
    }
  })
);
