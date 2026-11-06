import { afterEach, describe, expect, test, vi } from "vitest";
import { measureGridAxis } from "./measureGridAxis";

function createElement({
  style = {},
  width = 0
}: {
  style?: Partial<CSSStyleDeclaration>;
  width?: number;
}) {
  const element = document.createElement("div");
  Object.defineProperty(element, "offsetWidth", { value: width });

  // Only the specified properties are defined (e.g. as if CSS Grid were not supported)
  const getComputedStyle = window.getComputedStyle;
  vi.spyOn(window, "getComputedStyle").mockImplementation((target) =>
    target === element
      ? (style as CSSStyleDeclaration)
      : getComputedStyle(target)
  );

  return element;
}

describe("measureGridAxis", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("reads track sizes from the computed template without measuring gutters", () => {
    const element = createElement({
      style: { gridTemplateColumns: "40px 10px 50px" }
    });
    const getGutterSizes = vi.fn(() => [10]);

    expect(
      measureGridAxis({
        axis: "column",
        element,
        getGutterSizes,
        hasGutters: true,
        layout: undefined,
        trackIds: ["a", "b"]
      })
    ).toEqual({ availableSize: 90, trackSizes: [40, 50] });
    expect(getGutterSizes).not.toHaveBeenCalled();
  });

  test("measures gutters when approximating from the element size", () => {
    const element = createElement({ width: 110 });
    const getGutterSizes = vi.fn(() => [10]);

    expect(
      measureGridAxis({
        axis: "column",
        element,
        getGutterSizes,
        hasGutters: true,
        layout: { a: 25, b: 75 },
        trackIds: ["a", "b"]
      })
    ).toEqual({ availableSize: 100, trackSizes: [25, 75] });
    expect(getGutterSizes).toHaveBeenCalledTimes(1);
  });
});
