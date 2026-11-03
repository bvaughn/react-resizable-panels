import { describe, expect, test } from "vitest";
import type { ResizeItemConstraints } from "../../global/types";
import { calculateSplitLayout } from "./calculateSplitLayout";

function constraints(
  itemId: string,
  {
    collapsedSize = 0,
    defaultSize,
    maxSize = 100,
    minSize = 0
  }: {
    collapsedSize?: number;
    defaultSize?: number;
    maxSize?: number;
    minSize?: number;
  } = {}
): ResizeItemConstraints {
  return {
    collapsedSize,
    collapsible: collapsedSize > 0,
    defaultSize,
    disabled: false,
    groupResizeBehavior: "preserve-relative-size",
    itemId,
    maxSize,
    minSize
  } as ResizeItemConstraints;
}

describe("calculateSplitLayout", () => {
  test("uses the model's sizes when nothing is collapsed", () => {
    expect(
      calculateSplitLayout(
        [
          constraints("a", { defaultSize: 50 }),
          constraints("b", { defaultSize: 50 })
        ],
        new Set(),
        { a: 25, b: 75 }
      )
    ).toEqual({ a: 25, b: 75 });
  });

  test("collapsed items take their collapsed sizes, and the rest share the remaining space proportionally", () => {
    expect(
      calculateSplitLayout(
        [
          constraints("a"),
          constraints("b"),
          constraints("c", { collapsedSize: 10 })
        ],
        new Set(["c"]),
        { a: 60, b: 30, c: 40 }
      )
    ).toEqual({ a: 60, b: 30, c: 10 });
  });

  test("sizes with other units come from the constraints", () => {
    expect(
      calculateSplitLayout(
        [
          constraints("a", { defaultSize: 20 }),
          constraints("b"),
          constraints("c", { collapsedSize: 10 })
        ],
        new Set(["c"]),
        { a: "200px", b: undefined, c: 30 }
      )
    ).toEqual({ a: 25.714, b: 64.286, c: 10 });
  });

  test("grows items to their minimum sizes, taking the space from the others in proportion to their sizes", () => {
    expect(
      calculateSplitLayout(
        [
          constraints("a", { minSize: 16 }),
          constraints("b", { minSize: 24 }),
          constraints("c")
        ],
        new Set(),
        { a: 13.8, b: 14.95, c: 71.25 }
      )
    ).toEqual({ a: 16, b: 24, c: 60 });
  });

  test("shrinks items to their maximum sizes, giving the space to the others in proportion to their sizes", () => {
    expect(
      calculateSplitLayout(
        [constraints("a", { maxSize: 20 }), constraints("b"), constraints("c")],
        new Set(),
        { a: 40, b: 40, c: 20 }
      )
    ).toEqual({ a: 20, b: 53.333, c: 26.667 });
  });

  test("applies minimum sizes to the space left by collapsed items", () => {
    expect(
      calculateSplitLayout(
        [
          constraints("a", { minSize: 30 }),
          constraints("b"),
          constraints("c", { collapsedSize: 10 })
        ],
        new Set(["c"]),
        { a: 10, b: 90, c: 40 }
      )
    ).toEqual({ a: 30, b: 60, c: 10 });
  });

  test("shares the space in proportion to the sizes if the minimum sizes don't fit (leaving them to the Group)", () => {
    expect(
      calculateSplitLayout(
        [constraints("a", { minSize: 60 }), constraints("b", { minSize: 60 })],
        new Set(),
        { a: 25, b: 75 }
      )
    ).toEqual({ a: 25, b: 75 });
  });

  test("can ignore minimum and maximum sizes", () => {
    expect(
      calculateSplitLayout(
        [constraints("a", { minSize: 50 }), constraints("b")],
        new Set(),
        { a: 25, b: 75 },
        { applyMinAndMaxSizes: false }
      )
    ).toEqual({ a: 25, b: 75 });
  });

  test("applies fixed sizes (equal minimum and maximum sizes)", () => {
    // Larger than its fixed size
    expect(
      calculateSplitLayout(
        [constraints("a", { maxSize: 25, minSize: 25 }), constraints("b")],
        new Set(),
        { a: 40, b: 60 }
      )
    ).toEqual({ a: 25, b: 75 });

    // Smaller than its fixed size
    expect(
      calculateSplitLayout(
        [constraints("a", { maxSize: 25, minSize: 25 }), constraints("b")],
        new Set(),
        { a: 10, b: 90 }
      )
    ).toEqual({ a: 25, b: 75 });

    // Alongside an item that's below its minimum
    expect(
      calculateSplitLayout(
        [
          constraints("a", { maxSize: 25, minSize: 25 }),
          constraints("b", { minSize: 30 }),
          constraints("c")
        ],
        new Set(),
        { a: 40, b: 10, c: 50 }
      )
    ).toEqual({ a: 25, b: 30, c: 45 });
  });

  test("shares the space in proportion to the sizes if every item has a fixed size that doesn't fit", () => {
    expect(
      calculateSplitLayout(
        [
          constraints("a", { maxSize: 25, minSize: 25 }),
          constraints("b", { maxSize: 25, minSize: 25 })
        ],
        new Set(),
        { a: 40, b: 60 }
      )
    ).toEqual({ a: 40, b: 60 });
  });
});
