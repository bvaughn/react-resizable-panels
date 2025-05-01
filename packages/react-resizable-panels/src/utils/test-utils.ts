import { expect } from "vitest";
import { DATA_ATTRIBUTES } from "../constants";
import { assert } from "./assert";
import util from "node:util";

export function dispatchPointerEvent(type: string, target: HTMLElement) {
  const rect = target.getBoundingClientRect();

  const clientX = rect.left + rect.width / 2;
  const clientY = rect.top + rect.height / 2;

  const event = new MouseEvent(type, {
    bubbles: true,
    clientX,
    clientY,
    buttons: 1,
  });
  Object.defineProperties(event, {
    pageX: {
      get() {
        return clientX;
      },
    },
    pageY: {
      get() {
        return clientY;
      },
    },
    isPrimary: {
      value: true,
    },
  });

  target.dispatchEvent(event);
}

export function expectToBeCloseToArray(
  actualNumbers: number[],
  expectedNumbers: number[]
) {
  expect(actualNumbers.length).toBe(expectedNumbers.length);

  try {
    actualNumbers.forEach((actualNumber, index) => {
      const expectedNumber = expectedNumbers[index];
      assert(expectedNumber != null, `Expected number not found`);

      expect(actualNumber).toBeCloseTo(expectedNumber, 1);
    });
  } catch (error) {
    expect(actualNumbers).toEqual(expectedNumbers);
  }
}

export function mockBoundingClientRect(
  element: HTMLElement,
  rect: {
    height: number;
    width: number;
    x: number;
    y: number;
  }
) {
  const { height, width, x, y } = rect;

  Object.defineProperty(element, "getBoundingClientRect", {
    configurable: true,
    value: () =>
      ({
        bottom: y + height,
        height,
        left: x,
        right: x + width,
        toJSON() {
          return "";
        },
        top: y,
        width,
        x,
        y,
      }) satisfies DOMRect,
  });
}

export function mockPanelGroupOffsetWidthAndHeight(
  mockWidth = 1_000,
  mockHeight = 1_000
) {
  const offsetHeightPropertyDescriptor = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    "offsetHeight"
  );

  const offsetWidthPropertyDescriptor = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    "offsetWidth"
  );

  Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
    configurable: true,
    get: function () {
      if (this.hasAttribute(DATA_ATTRIBUTES.resizeHandle)) {
        return 0;
      } else if (this.hasAttribute(DATA_ATTRIBUTES.group)) {
        return mockHeight;
      }
    },
  });

  Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
    configurable: true,
    get: function () {
      if (this.hasAttribute(DATA_ATTRIBUTES.resizeHandle)) {
        return 0;
      } else if (this.hasAttribute(DATA_ATTRIBUTES.group)) {
        return mockWidth;
      }
    },
  });

  return function uninstallMocks() {
    if (offsetHeightPropertyDescriptor) {
      Object.defineProperty(
        HTMLElement.prototype,
        "offsetHeight",
        offsetHeightPropertyDescriptor
      );
    }

    if (offsetWidthPropertyDescriptor) {
      Object.defineProperty(
        HTMLElement.prototype,
        "offsetWidth",
        offsetWidthPropertyDescriptor
      );
    }
  };
}

export function verifyAttribute(
  element: HTMLElement,
  attributeName: string,
  expectedValue: string | null
) {
  const actualValue = element.getAttribute(attributeName);
  expect(actualValue).toBe(expectedValue);
}

export function verifyExpandedPanelGroupLayout(
  actualLayout: number[],
  expectedLayout: number[]
) {
  expect(actualLayout).toEqual(expectedLayout);
}

export function verifyExpectedWarnings(
  callback: Function,
  ...expectedMessages: string[]
) {
  const consoleSpy = (format: any, ...args: any[]) => {
    const message = util.format(format, ...args);

    for (let index = 0; index < expectedMessages.length; index++) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const expectedMessage = expectedMessages[index]!;
      if (message.includes(expectedMessage)) {
        expectedMessages.splice(index, 1);
        return;
      }
    }

    if (expectedMessages.length === 0) {
      throw new Error(`Unexpected message recorded:\n\n${message}`);
    }
  };

  const originalError = console.error;
  const originalWarn = console.warn;

  console.error = consoleSpy;
  console.warn = consoleSpy;

  let caughtError;
  let didCatch = false;
  try {
    callback();
  } catch (error) {
    caughtError = error;
    didCatch = true;
  } finally {
    console.error = originalError;
    console.warn = originalWarn;

    if (didCatch) {
      throw caughtError;
    }

    // Any remaining messages indicate a failed expectations.
    if (expectedMessages.length > 0) {
      throw Error(
        `Expected message(s) not recorded:\n\n${expectedMessages.join("\n")}`
      );
    }

    return { pass: true };
  }
}
