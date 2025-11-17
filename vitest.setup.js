import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, beforeEach } from "vitest";
import { resetMockGroupIdCounter } from "./lib/global/test/mockGroup";
import { mockBoundingClientRect } from "./lib/utils/test/mockBoundingClientRect";
import { mockResizeObserver } from "./lib/utils/test/mockResizeObserver";

let unmockBoundingClientRect = null;
let unmockResizeObserver = null;

const PROTOTYPE_PROPS = [
  "clientHeight",
  "clientWidth",
  "offsetHeight",
  "offsetWidth"
];

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
    delete HTMLElement.prototype[propertyKey];
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
