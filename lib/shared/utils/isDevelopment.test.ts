import { afterEach, describe, expect, test, vi } from "vitest";
import { isDevelopment } from "./isDevelopment";
import { resetWarnOnceForTest, warnOnce } from "./warnOnce";

describe("isDevelopment", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    resetWarnOnceForTest();
  });

  test("is true unless NODE_ENV is production", () => {
    expect(isDevelopment()).toBe(true);

    vi.stubEnv("NODE_ENV", "production");
    expect(isDevelopment()).toBe(false);
  });

  test("is false when process is not defined (e.g. without a bundler)", () => {
    vi.stubGlobal("process", undefined);
    expect(isDevelopment()).toBe(false);
  });

  test("warnings are only logged in development", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    vi.stubEnv("NODE_ENV", "production");
    warnOnce("message");
    expect(warn).not.toHaveBeenCalled();

    vi.unstubAllEnvs();
    warnOnce("message");
    expect(warn).toHaveBeenCalledWith("react-resizable-panels: message");

    warn.mockRestore();
  });
});
