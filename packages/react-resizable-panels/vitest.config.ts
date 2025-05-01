import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom", // Use jsdom for browser-like tests
    coverage: {
      reporter: ["text", "json", "html"], // Optional: Add coverage reports
    },
    setupFiles: ["./vitest.setup.ts"],
  },
});
