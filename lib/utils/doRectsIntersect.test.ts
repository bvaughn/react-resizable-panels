import { describe, expect, test } from "vitest";
import { Rect } from "../types";
import { doRectsIntersect } from "./doRectsIntersect";

const emptyRect = Rect.fromObject({ x: 0, y: 0, width: 0, height: 0 });
const rect = Rect.fromObject({ x: 25, y: 25, width: 50, height: 50 });

function forkRect(partial: Partial<Rect>) {
  return Rect.merge(rect, partial);
}

describe("doRectsIntersect", () => {
  function verify(rectOne: Rect, rectTwo: Rect, expected: boolean) {
    const actual = doRectsIntersect(rectOne, rectTwo);

    try {
      expect(actual).toBe(expected);
    } catch (thrown) {
      console.log(
        "Expected",
        rectOne,
        "to",
        expected ? "intersect" : "not intersect",
        rectTwo
      );

      throw thrown;
    }
  }

  test("should handle empty rects", () => {
    verify(emptyRect, emptyRect, false);
  });

  test("should support fully overlapping rects", () => {
    verify(rect, rect, true);

    verify(rect, forkRect({ x: 35, width: 30 }), true);
    verify(rect, forkRect({ y: 35, height: 30 }), true);
    verify(
      rect,
      forkRect({
        x: 35,
        y: 35,
        width: 30,
        height: 30
      }),
      true
    );

    verify(rect, forkRect({ x: 10, width: 100 }), true);
    verify(rect, forkRect({ y: 10, height: 100 }), true);
    verify(
      rect,
      forkRect({
        x: 10,
        y: 10,
        width: 100,
        height: 100
      }),
      true
    );
  });

  test.each([[{ x: 0 }], [{ y: 0 }]])(
    "should support partially overlapping rects: %o",
    (partial) => {
      verify(forkRect(partial), rect, true);
    }
  );

  test.each([
    [{ x: 100 }],
    [{ x: -100 }],
    [{ y: 100 }],
    [{ y: -100 }],
    [{ x: -100, y: -100 }],
    [{ x: 100, y: 100 }],
    [{ x: -25 }],
    [{ x: 75 }],
    [{ y: -25 }],
    [{ y: 75 }],
    [{ x: -25, y: -25 }],
    [{ x: 75, y: 75 }]
  ])("should support non-overlapping rects: %o", (partial) => {
    verify(forkRect(partial), rect, false);
  });

  test("should support all negative coordinates", () => {
    expect(
      doRectsIntersect(
        Rect.fromObject({ x: -100, y: -100, width: 50, height: 50 }),
        Rect.fromObject({ x: -110, y: -90, width: 50, height: 50 })
      )
    ).toBe(true);
  });
});
