import { describe, expect, test } from "vitest";
import type { ResizeItemConstraints } from "../../global/types";
import { calculateSplitLayout } from "./calculateSplitLayout";

function constraints(
  itemId: string,
  {
    collapsedSize = 0,
    defaultSize
  }: { collapsedSize?: number; defaultSize?: number } = {}
): ResizeItemConstraints {
  return {
    collapsedSize,
    collapsible: collapsedSize > 0,
    defaultSize,
    disabled: false,
    groupResizeBehavior: "preserve-relative-size",
    itemId,
    maxSize: 100,
    minSize: 0
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
});
