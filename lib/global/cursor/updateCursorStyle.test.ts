import { afterEach, describe, expect, test } from "vitest";
import { updateInteractionState } from "../mutable-state/interactions";
import { updateCursorStyle } from "./updateCursorStyle";

describe("updateCursorStyle", () => {
  const originalCSSStyleSheet = window.CSSStyleSheet;
  const originalAdoptedStyleSheets = Object.getOwnPropertyDescriptor(
    Document.prototype,
    "adoptedStyleSheets"
  );

  afterEach(() => {
    // Restore global mocks
    window.CSSStyleSheet = originalCSSStyleSheet;
    if (originalAdoptedStyleSheets) {
      Object.defineProperty(
        Document.prototype,
        "adoptedStyleSheets",
        originalAdoptedStyleSheets
      );
    }
    updateInteractionState({
      cursorFlags: 0,
      state: "inactive"
    });
  });

  test("should not throw if the environment doesn't support constructable stylesheets", () => {
    // e.g. Safari < 16.4. Calling `new CSSStyleSheet()` throws
    // "TypeError: Illegal constructor" in those browsers.
    // @ts-expect-error Testing
    window.CSSStyleSheet = class CSSStyleSheet {
      constructor() {
        throw new TypeError("Illegal constructor");
      }
    };
    Object.defineProperty(Document.prototype, "adoptedStyleSheets", {
      configurable: true,
      get() {
        return undefined;
      }
    });

    updateInteractionState({
      cursorFlags: 0,
      state: "hover",
      hitRegions: []
    });

    expect(() => updateCursorStyle(document)).not.toThrow();
  });

  test("should apply cursor styles when constructable stylesheets are supported", () => {
    const styleSheet = new CSSStyleSheet();
    Object.defineProperty(Document.prototype, "adoptedStyleSheets", {
      configurable: true,
      value: [styleSheet]
    });

    updateInteractionState({
      cursorFlags: 0,
      state: "hover",
      hitRegions: []
    });

    updateCursorStyle(document);

    expect(document.adoptedStyleSheets).toContain(styleSheet);
  });
});
