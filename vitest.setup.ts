import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, beforeEach, expect, vi } from "vitest";
import failOnConsole from "vitest-fail-on-console";
import { resetMockGroupIdCounter } from "./lib/global/test/mockGroup";
import {
  mockBoundingClientRect,
  unmockBoundingClientRect
} from "./lib/utils/test/mockBoundingClientRect";
import {
  mockGetComputedStyle,
  unmockGetComputedStyle
} from "./lib/utils/test/mockGetComputedStyle";
import {
  mockResizeObserver,
  unmockResizeObserver
} from "./lib/utils/test/mockResizeObserver";

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
  PROTOTYPE_PROPS.forEach((propertyKey) => {
    Object.defineProperty(HTMLElement.prototype, propertyKey, {
      configurable: true,
      value: 0
    });
  });

  vi.spyOn(console, "warn").mockImplementation(() => {
    throw Error("Unexpected console warning");
  });
});

afterAll(() => {
  PROTOTYPE_PROPS.forEach((propertyKey) => {
    delete HTMLElement.prototype[
      propertyKey as keyof typeof HTMLElement.prototype
    ];
  });
});

beforeEach(() => {
  mockBoundingClientRect();
  mockGetComputedStyle();
  mockResizeObserver();
});

afterEach(() => {
  cleanup();

  resetMockGroupIdCounter();

  unmockBoundingClientRect();
  unmockGetComputedStyle();
  unmockResizeObserver();
});
