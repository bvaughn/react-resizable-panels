import { describe, expect, test } from "vitest";
import { toModelDropTarget } from "./toModelDropTarget";

describe("toModelDropTarget", () => {
  test("left to right layouts are unchanged", () => {
    const target = { region: "left", tabsetId: "a" } as const;
    expect(toModelDropTarget(target, false)).toBe(target);
  });

  test("right to left layouts swap the left and right edges", () => {
    expect(toModelDropTarget({ region: "left", tabsetId: "a" }, true)).toEqual({
      region: "right",
      tabsetId: "a"
    });
    expect(toModelDropTarget({ region: "right", tabsetId: "a" }, true)).toEqual(
      { region: "left", tabsetId: "a" }
    );
  });

  test("right to left layouts don't change other targets", () => {
    for (const target of [
      { region: "bottom", tabsetId: "a" },
      { region: "center", tabsetId: "a" },
      { region: "top", tabsetId: "a" },
      { index: 1, tabsetId: "a" }
    ] as const) {
      expect(toModelDropTarget(target, true)).toBe(target);
    }
  });
});
