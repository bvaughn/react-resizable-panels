import {
  afterEach,
  describe,
  expect,
  test,
  vi,
  type MockInstance
} from "vitest";
import { normalizeResizeSmoothing } from "./normalizeResizeSmoothing";

describe("normalizeResizeSmoothing", () => {
  let restoreWarn: (() => void) | null = null;

  const suppressWarnings = () => {
    const wasMocked = vi.isMockFunction(console.warn);
    if (wasMocked) {
      const warn = console.warn as unknown as MockInstance<
        (message?: unknown, ...optionalParams: unknown[]) => void
      >;
      const previousImplementation = warn.getMockImplementation();
      warn.mockImplementation(() => {});

      return () => {
        warn.mockImplementation(previousImplementation ?? (() => {}));
      };
    }

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    return () => {
      warnSpy.mockRestore();
    };
  };

  afterEach(() => {
    restoreWarn?.();
    restoreWarn = null;
  });

  test("returns the default when enabled", () => {
    restoreWarn = suppressWarnings();
    expect(normalizeResizeSmoothing(true)).toBe(0.2);
  });

  test("returns 0 when disabled", () => {
    restoreWarn = suppressWarnings();
    expect(normalizeResizeSmoothing(false)).toBe(0);
    expect(normalizeResizeSmoothing(undefined)).toBe(0);
    expect(normalizeResizeSmoothing(0)).toBe(0);
  });

  test("returns the provided value when in range", () => {
    restoreWarn = suppressWarnings();
    expect(normalizeResizeSmoothing(0.35)).toBe(0.35);
  });

  test("clamps out-of-range values and warns", () => {
    restoreWarn = suppressWarnings();
    const warn = console.warn as unknown as MockInstance<
      (message?: unknown, ...optionalParams: unknown[]) => void
    >;

    expect(normalizeResizeSmoothing(2)).toBe(1);
    expect(warn).toHaveBeenCalledTimes(1);
  });

  test("warns and disables smoothing for invalid values", () => {
    restoreWarn = suppressWarnings();
    const warn = console.warn as unknown as MockInstance<
      (message?: unknown, ...optionalParams: unknown[]) => void
    >;

    expect(normalizeResizeSmoothing(Number.NaN)).toBe(0);
    expect(warn).toHaveBeenCalledTimes(1);
  });
});
