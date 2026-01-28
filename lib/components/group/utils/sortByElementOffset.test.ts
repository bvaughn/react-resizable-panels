import { beforeEach, describe, expect, test } from "vitest";
import { setElementBoundsFunction } from "../../../utils/test/mockBoundingClientRect";
import { sortByElementOffset } from "./sortByElementOffset";

function createElementContainer({
  height = 0,
  width = 0,
  x = 0,
  y = 0
}: {
  height?: number | undefined;
  width?: number | undefined;
  x?: number | undefined;
  y?: number | undefined;
}) {
  const element = document.createElement("div");
  element.setAttribute("height", "" + height);
  element.setAttribute("width", "" + width);
  element.setAttribute("x", "" + x);
  element.setAttribute("y", "" + y);

  return element;
}

describe("sortByElementOffset", () => {
  beforeEach(() => {
    setElementBoundsFunction((element) => {
      const x = parseInt(element.getAttribute("x") ?? "0");
      const y = parseInt(element.getAttribute("y") ?? "0");
      const width = parseInt(element.getAttribute("width") ?? "0");
      const height = parseInt(element.getAttribute("height") ?? "0");

      return new DOMRect(x, y, width, height);
    });
  });

  describe("orientation: horizontal", () => {
    test("should handle empty elements array", () => {
      expect(sortByElementOffset("horizontal", [])).toMatchInlineSnapshot(`[]`);
    });

    test("should sort horizontal elements", () => {
      expect(
        sortByElementOffset("horizontal", [
          createElementContainer({ x: 0, y: 0 }),
          createElementContainer({ x: 50, y: 10 }),
          createElementContainer({ x: 25, y: 20 })
        ]).map((current) => current.getBoundingClientRect())
      ).toMatchInlineSnapshot(`
        [
          0, 0 (0 x 0),
          25, 20 (0 x 0),
          50, 10 (0 x 0),
        ]
      `);
    });

    test("should prioritize smaller elements if offsets are the same", () => {
      expect(
        sortByElementOffset("horizontal", [
          createElementContainer({ x: 0, width: 50 }),
          createElementContainer({ x: 25, width: 25 }),
          createElementContainer({ x: 25, width: 0 })
        ]).map((current) => current.getBoundingClientRect())
      ).toMatchInlineSnapshot(`
        [
          0, 0 (50 x 0),
          25, 0 (0 x 0),
          25, 0 (25 x 0),
        ]
      `);
    });
  });

  describe("orientation: vertical", () => {
    test("should sort vertical elements", () => {
      expect(
        sortByElementOffset("vertical", [
          createElementContainer({ x: 0, y: 0 }),
          createElementContainer({ x: 10, y: 50 }),
          createElementContainer({ x: 20, y: 25 })
        ]).map((current) => current.getBoundingClientRect())
      ).toMatchInlineSnapshot(`
        [
          0, 0 (0 x 0),
          20, 25 (0 x 0),
          10, 50 (0 x 0),
        ]
      `);
    });

    test("should prioritize smaller elements if offsets are the same", () => {
      expect(
        sortByElementOffset("vertical", [
          createElementContainer({ height: 50, y: 0 }),
          createElementContainer({ height: 25, y: 25 }),
          createElementContainer({ height: 0, y: 25 })
        ]).map((current) => current.getBoundingClientRect())
      ).toMatchInlineSnapshot(`
        [
          0, 0 (0 x 50),
          0, 25 (0 x 0),
          0, 25 (0 x 25),
        ]
      `);
    });
  });
});
