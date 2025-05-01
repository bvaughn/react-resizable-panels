import { beforeEach, describe, expect, test } from "vitest";
import { getIntersectingRectangle } from "./getIntersectingRectangle";
import { Rectangle } from "./types";

const emptyRect = { x: 0, y: 0, width: 0, height: 0 };
const rect = { x: 25, y: 25, width: 50, height: 50 };

function forkRect(partial: Partial<Rectangle>, baseRect: Rectangle = rect) {
  return { ...rect, ...partial };
}

describe("getIntersectingRectangle", () => {
  let strict: boolean = false;

  function verify(rectOne: Rectangle, rectTwo: Rectangle, expected: Rectangle) {
    const actual = getIntersectingRectangle(rectOne, rectTwo, strict);

    try {
      expect(actual).toEqual(expected);
    } catch (thrown) {
      console.log(
        "Expect",
        strict ? "strict mode" : "loose mode",
        "\n",
        rectOne,
        "\n",
        rectTwo,
        "\n\nto intersect as:\n",
        expected,
        "\n\nbut got:\n",
        actual
      );

      throw thrown;
    }
  }

  describe("loose", () => {
    beforeEach(() => {
      strict = false;
    });

    test("should support empty rects", () => {
      verify(emptyRect, emptyRect, emptyRect);
    });

    test("should support fully overlapping rects", () => {
      verify(rect, forkRect({ x: 35, width: 30 }), {
        x: 35,
        y: 25,
        width: 30,
        height: 50,
      });

      verify(rect, forkRect({ y: 35, height: 30 }), {
        x: 25,
        y: 35,
        width: 50,
        height: 30,
      });

      verify(
        rect,
        forkRect({
          x: 35,
          y: 35,
          width: 30,
          height: 30,
        }),

        {
          x: 35,
          y: 35,
          width: 30,
          height: 30,
        }
      );
    });

    test("should support partially overlapping rects", () => {
      verify(rect, forkRect({ x: 10, y: 10 }), {
        x: 25,
        y: 25,
        width: 35,
        height: 35,
      });

      verify(rect, forkRect({ x: 45, y: 30 }), {
        x: 45,
        y: 30,
        width: 30,
        height: 45,
      });
    });

    test("should support non-overlapping rects", () => {
      verify(rect, forkRect({ x: 100, y: 100 }), emptyRect);
    });

    test("should support all negative coordinates", () => {
      verify(
        {
          x: -100,
          y: -100,
          width: 50,
          height: 50,
        },
        { x: -80, y: -80, width: 50, height: 50 },
        {
          x: -80,
          y: -80,
          width: 30,
          height: 30,
        }
      );
    });
  });

  describe("strict", () => {
    beforeEach(() => {
      strict = true;
    });

    test("should support empty rects", () => {
      verify(emptyRect, emptyRect, emptyRect);
    });

    test("should support fully overlapping rects", () => {
      verify(rect, forkRect({ x: 35, width: 30 }), {
        x: 35,
        y: 25,
        width: 30,
        height: 50,
      });

      verify(rect, forkRect({ y: 35, height: 30 }), {
        x: 25,
        y: 35,
        width: 50,
        height: 30,
      });

      verify(
        rect,
        forkRect({
          x: 35,
          y: 35,
          width: 30,
          height: 30,
        }),

        {
          x: 35,
          y: 35,
          width: 30,
          height: 30,
        }
      );
    });

    test("should support partially overlapping rects", () => {
      verify(rect, forkRect({ x: 10, y: 10 }), {
        x: 25,
        y: 25,
        width: 35,
        height: 35,
      });

      verify(rect, forkRect({ x: 45, y: 30 }), {
        x: 45,
        y: 30,
        width: 30,
        height: 45,
      });
    });

    test("should support non-overlapping rects", () => {
      verify(rect, forkRect({ x: 100, y: 100 }), emptyRect);
    });

    test("should support all negative coordinates", () => {
      verify(
        {
          x: -100,
          y: -100,
          width: 50,
          height: 50,
        },
        { x: -80, y: -80, width: 50, height: 50 },
        {
          x: -80,
          y: -80,
          width: 30,
          height: 30,
        }
      );
    });
  });
});
