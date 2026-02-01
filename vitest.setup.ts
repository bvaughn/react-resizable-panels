import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, beforeEach, expect, vi } from "vitest";
import failOnConsole from "vitest-fail-on-console";
import { MutableGroup } from "./lib/state/MutableGroup";
import { MutablePanel } from "./lib/state/MutablePanel";
import { MutableSeparator } from "./lib/state/MutableSeparator";
import { serializeMutableGroup } from "./lib/state/tests/serializeMutableGroup";
import { serializeMutablePanel } from "./lib/state/tests/serializeMutablePanel";
import { serializeMutableSeparator } from "./lib/state/tests/serializeMutableSeparator";
import { EventEmitter } from "./lib/utils/EventEmitter";
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

expect.addSnapshotSerializer({
  serialize(value, _, indentation) {
    return serializeMutableGroup(value as MutableGroup, indentation);
  },
  test(value) {
    return value instanceof MutableGroup;
  }
});

expect.addSnapshotSerializer({
  serialize(value, _, indentation) {
    return serializeMutablePanel(value as MutablePanel, indentation);
  },
  test(value) {
    return value instanceof MutablePanel;
  }
});

expect.addSnapshotSerializer({
  serialize(value, _, indentation) {
    return serializeMutableSeparator(value as MutableSeparator, indentation);
  },
  test(value) {
    return value instanceof MutableSeparator;
  }
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GenericEventEmitter = EventEmitter<any>;

expect.extend({
  toDispatchEvents: (
    callback: () => unknown,
    target: EventTarget | GenericEventEmitter,
    typeCounts: { [type: string]: number }
  ) => {
    let message = "";
    let pass = true;

    const listeners = new Map<string, () => void>();

    for (const type in typeCounts) {
      const listener = () => {
        const count = typeCounts[type] ?? 0;
        if (count === 0) {
          message = `Unexpected event "${type}" dispatched`;
          pass = false;
        } else {
          typeCounts[type] = count - 1;
        }
      };

      if (target instanceof EventTarget) {
        target.addEventListener(type, listener);
      } else {
        target.addListener(type, listener);
      }

      listeners.set(type, listener);
    }

    callback();

    listeners.forEach((listener, type) => {
      if (target instanceof EventTarget) {
        target.removeEventListener(type, listener);
      } else {
        target.removeListener(type, listener);
      }
    });

    for (const type in typeCounts) {
      const count = typeCounts[type] ?? 0;
      if (count > 0) {
        message = `Expected event was not dispatched: "${type}"`;
        pass = false;
      }
    }

    return {
      pass,
      message: () => message
    };
  },

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

  Object.defineProperty(Document.prototype, "adoptedStyleSheets", {
    value: []
  });
  Object.defineProperty(ShadowRoot.prototype, "adoptedStyleSheets", {
    value: []
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

  if (unmockBoundingClientRect) {
    unmockBoundingClientRect();
  }

  if (unmockResizeObserver) {
    unmockResizeObserver();
  }
});
