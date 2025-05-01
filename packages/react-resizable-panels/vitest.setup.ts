import { beforeAll, vi } from "vitest";

beforeAll(() => {
  vi.mock("#is-browser", () => ({
    isBrowser: true,
  }));
});
