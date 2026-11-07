import { describe, expect, test } from "vitest";
import { measureDropIndicatorInsets } from "./measureDropIndicatorInsets";

// Offset sizes are rounded, as browsers do; bounding rects are exact
function mockElement(
  x: number,
  y: number,
  width: number,
  height: number,
  scale = 1
) {
  return {
    getBoundingClientRect: () =>
      new DOMRect(x * scale, y * scale, width * scale, height * scale),
    offsetHeight: Math.round(height),
    offsetWidth: Math.round(width)
  } as unknown as HTMLElement;
}

describe("measureDropIndicatorInsets", () => {
  // An 800x600 container, with a tabset's panels filling its right half (below a 30px header)
  const container = mockElement(100, 50, 800, 600);
  const panels = mockElement(500, 80, 400, 570);

  test("covers a region of a tabset's panels", () => {
    expect(measureDropIndicatorInsets(container, panels, "center")).toEqual({
      bottom: 0,
      left: 400,
      right: 0,
      top: 30
    });
    expect(measureDropIndicatorInsets(container, panels, "left")).toEqual({
      bottom: 0,
      left: 400,
      right: 200,
      top: 30
    });
    expect(measureDropIndicatorInsets(container, panels, "right")).toEqual({
      bottom: 0,
      left: 600,
      right: 0,
      top: 30
    });
    expect(measureDropIndicatorInsets(container, panels, "top")).toEqual({
      bottom: 285,
      left: 400,
      right: 0,
      top: 30
    });
    expect(measureDropIndicatorInsets(container, panels, "bottom")).toEqual({
      bottom: 0,
      left: 400,
      right: 0,
      top: 315
    });
  });

  test("measures in layout pixels within a scaled ancestor", () => {
    expect(
      measureDropIndicatorInsets(
        mockElement(100, 50, 800, 600, 2),
        mockElement(500, 80, 400, 570, 2),
        "left"
      )
    ).toEqual({ bottom: 0, left: 400, right: 200, top: 30 });
  });

  test("covers a fraction of an element at an edge", () => {
    // e.g. a quarter of the workspace's layout, for a drop at its edge
    expect(
      measureDropIndicatorInsets(container, container, "right", 0.25)
    ).toEqual({
      bottom: 0,
      left: 600,
      right: 0,
      top: 0
    });
    expect(
      measureDropIndicatorInsets(container, container, "top", 0.25)
    ).toEqual({
      bottom: 450,
      left: 0,
      right: 0,
      top: 0
    });
  });
});
