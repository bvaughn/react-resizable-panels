import { describe, expect, test } from "vitest";
import { clampFloatingPosition } from "./clampFloatingPosition";

describe("clampFloatingPosition", () => {
  const layout = { height: 400, width: 800 };
  // A 300px wide tabset with its header (30px tall) along its top
  const header = { height: 30, left: 0, top: 0, width: 300 };

  test("leaves positions that keep the header within the layout unchanged", () => {
    expect(clampFloatingPosition({ x: 100, y: 50 }, header, layout)).toEqual({
      x: 100,
      y: 50
    });
  });

  test("keeps the header within the layout", () => {
    expect(clampFloatingPosition({ x: -50, y: -10 }, header, layout)).toEqual({
      x: 0,
      y: 0
    });
    expect(clampFloatingPosition({ x: 700, y: 500 }, header, layout)).toEqual({
      x: 500,
      y: 370
    });
  });

  test("accounts for where the header is within the tabset", () => {
    // Tabs placed along the bottom of a 200px tall tabset; the rest of the tabset can be above the top of the layout
    const bottomHeader = { height: 30, left: 0, top: 170, width: 300 };

    expect(
      clampFloatingPosition({ x: 0, y: -500 }, bottomHeader, layout)
    ).toEqual({ x: 0, y: -170 });
  });

  test("keeps the start of a header that's larger than the layout within it", () => {
    expect(
      clampFloatingPosition(
        { x: 100, y: 0 },
        { ...header, width: 1000 },
        layout
      )
    ).toEqual({ x: 0, y: 0 });
  });

  test("doesn't change positions before the layout has been measured", () => {
    expect(
      clampFloatingPosition({ x: -50, y: 900 }, header, { height: 0, width: 0 })
    ).toEqual({ x: -50, y: 900 });
  });
});
