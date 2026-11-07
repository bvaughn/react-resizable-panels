import { describe, expect, test } from "vitest";
import { isSameDropTarget } from "./isSameDropTarget";

describe("isSameDropTarget", () => {
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
