import { describe, expect, test } from "vitest";
import { isSameDropTarget } from "./isSameDropTarget";

describe("isSameDropTarget", () => {
  test("compares floating rectangles by value", () => {
    const float = { x: 1, y: 2, width: 300, height: 200 };
    expect(isSameDropTarget({ float }, { float: { ...float } })).toBe(true);
    expect(isSameDropTarget({ float }, { float: { ...float, x: 2 } })).toBe(
      false
    );
    expect(
      isSameDropTarget({ float }, { region: "center", tabsetId: "a" })
    ).toBe(false);
  });
  test("compares edges of the workspace", () => {
    expect(isSameDropTarget({ edge: "left" }, { edge: "left" })).toBe(true);
    expect(isSameDropTarget({ edge: "left" }, { edge: "right" })).toBe(false);
    expect(
      isSameDropTarget({ edge: "left" }, { region: "left", tabsetId: "a" })
    ).toBe(false);
    expect(isSameDropTarget({ edge: "left" }, undefined)).toBe(false);
  });

  test("compares tabset targets", () => {
    expect(
      isSameDropTarget(
        { region: "left", tabsetId: "a" },
        { region: "left", tabsetId: "a" }
      )
    ).toBe(true);
    expect(
      isSameDropTarget(
        { region: "left", tabsetId: "a" },
        { region: "left", tabsetId: "b" }
      )
    ).toBe(false);
    expect(
      isSameDropTarget({ index: 0, tabsetId: "a" }, { index: 0, tabsetId: "a" })
    ).toBe(true);
  });
});
