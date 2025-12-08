import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, beforeEach, expect } from "vitest";
import { resetMockGroupIdCounter } from "./lib/global/test/mockGroup";
import { mockBoundingClientRect } from "./lib/utils/test/mockBoundingClientRect";
import { mockResizeObserver } from "./lib/utils/test/mockResizeObserver";

let unmockBoundingClientRect: (() => void) | null = null;
let unmockResizeObserver: (() => void) | null = null;

const PROTOTYPE_PROPS = [
  "clientHeight",
  "clientWidth",
  "offsetHeight",
  "offsetWidth"
];

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

beforeAll(() => {
  PROTOTYPE_PROPS.forEach((propertyKey) => {
    Object.defineProperty(HTMLElement.prototype, propertyKey, {
      configurable: true,
      value: 0
    });
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
  unmockBoundingClientRect = mockBoundingClientRect();
  unmockResizeObserver = mockResizeObserver();
});

afterEach(() => {
  cleanup();

  resetMockGroupIdCounter();

  if (unmockBoundingClientRect) {
    unmockBoundingClientRect();
  }

  if (unmockResizeObserver) {
    unmockResizeObserver();
  }
});
