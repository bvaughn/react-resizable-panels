import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll, beforeEach, expect, vi } from "vitest";
import failOnConsole from "vitest-fail-on-console";

// Tests run in Node by default, which is faster to set up; tests that need a DOM opt into jsdom (see their @vitest-environment comments).
// The DOM mocks below only apply to tests that run in jsdom (and are imported dynamically, since they reference DOM globals when they're loaded)
const hasDOM = typeof document !== "undefined";

const dom = hasDOM
  ? {
      ...(await import("@testing-library/react")),
      ...(await import("./lib/global/test/mockGroup")),
      ...(await import("./lib/shared/utils/test/mockBoundingClientRect")),
      ...(await import("./lib/shared/utils/test/mockGetComputedStyle")),
      ...(await import("./lib/shared/utils/test/mockResizeObserver"))
    }
  : undefined;

const PROTOTYPE_PROPS = [
  "clientHeight",
  "clientWidth",
  "offsetHeight",
  "offsetWidth"
];

failOnConsole({
  shouldFailOnError: true
});

expect.addSnapshotSerializer({
  serialize(value) {
    const rect = value as DOMRect;
    return `${rect.x}, ${rect.y} (${rect.width} x ${rect.height})`;
  },
  test(value) {
    return (
      value !== null &&
      typeof value === "object" &&
      "x" in value &&
      "y" in value &&
      "width" in value &&
      "height" in value
    );
  }
});

expect.extend({
  toLogError: (callback: () => unknown, expectedError: string) => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    callback();

    expect(console.error).toHaveBeenCalledWith(expectedError);

    spy.mockReset();

    return {
      pass: true,
      message: () => ""
    };
  }
});

beforeAll(() => {
  if (hasDOM) {
    PROTOTYPE_PROPS.forEach((propertyKey) => {
      Object.defineProperty(HTMLElement.prototype, propertyKey, {
        configurable: true,
        value: 0
      });
    });
  }

  vi.spyOn(console, "warn").mockImplementation(() => {
    throw Error("Unexpected console warning");
  });
});

afterAll(() => {
  if (hasDOM) {
    PROTOTYPE_PROPS.forEach((propertyKey) => {
      delete HTMLElement.prototype[
        propertyKey as keyof typeof HTMLElement.prototype
      ];
    });
  }
});

beforeEach(() => {
  if (dom) {
    dom.mockBoundingClientRect();
    dom.mockGetComputedStyle();
    dom.mockResizeObserver();
  }
});

afterEach(() => {
  if (dom) {
    dom.cleanup();

    dom.resetMockGroupIdCounter();

    dom.unmockBoundingClientRect();
    dom.unmockGetComputedStyle();
    dom.unmockResizeObserver();
  }
});
