import { describe, expect, test } from "vitest";
import type { ResizeItemConstraints } from "../types";
import { snapAxisLayout } from "./snapAxisLayout";

function constraints(
  itemId: string,
  overrides: Partial<ResizeItemConstraints> = {}
): ResizeItemConstraints {
  return {
    collapsedSize: 0,
    collapsible: false,
    defaultSize: undefined,
    disabled: undefined,
    itemId,
    maxSize: 100,
    minSize: 0,
    ...overrides
  };
}

describe("snapAxisLayout", () => {
  test("should snap to the nearest snap size", () => {
    expect(
      snapAxisLayout({
        itemConstraints: [
          constraints("a", { snapSizes: [25, 75] }),
          constraints("b")
        ],
        layout: { a: 60, b: 40 }
      })
    ).toEqual({ a: 75, b: 25 });
  });

  test("should not collapse a neighboring item", () => {
    expect(
      snapAxisLayout({
        itemConstraints: [
          constraints("a", { snapSizes: [95] }),
          constraints("b", { collapsedSize: 5, collapsible: true, minSize: 40 })
        ],
        layout: { a: 60, b: 40 }
      })
    ).toEqual({ a: 60, b: 40 });
  });
});
