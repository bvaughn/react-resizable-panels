import { describe, expect, test } from "vitest";
import { measureChromeSize } from "./measureChromeSize";

// Offset sizes are rounded, as browsers do; bounding rects are exact
function mockElement(width: number, height: number, scale = 1) {
  return {
    getBoundingClientRect: () =>
      new DOMRect(0, 0, width * scale, height * scale),
    offsetHeight: Math.round(height),
    offsetWidth: Math.round(width)
  } as unknown as HTMLElement;
}

describe("measureChromeSize", () => {
  test("doesn't change as a tabset with fractional sizes is resized", () => {
    // A 25.5px header above the panels; the difference of rounded offset sizes would be 25 for one and 26 for the other
    expect(
      measureChromeSize(mockElement(400, 300.2), mockElement(400, 274.7))
    ).toEqual({ height: 26, width: 0 });
    expect(
      measureChromeSize(mockElement(400, 300.8), mockElement(400, 275.3))
    ).toEqual({ height: 26, width: 0 });
  });

  test("measures in layout pixels within a scaled ancestor", () => {
    expect(
      measureChromeSize(mockElement(400, 300, 2), mockElement(370, 270, 2))
    ).toEqual({ height: 30, width: 30 });
  });
});
