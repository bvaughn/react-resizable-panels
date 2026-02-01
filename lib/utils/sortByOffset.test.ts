import { describe, expect, test } from "vitest";
import { MutablePanelForTest } from "../state/tests/MutablePanelForTest";
import { sortByOffset } from "./sortByOffset";

function init({
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
  const panel = new MutablePanelForTest();
  panel.mockPanelHTMLElementInterface.resizeForTest({ x, y, width, height });

  return panel;
}

describe("sortByOffset", () => {
  describe("orientation: horizontal", () => {
    test("should handle empty elements array", () => {
      expect(sortByOffset([])).toMatchInlineSnapshot(`[]`);
    });

    test("should sort horizontal elements", () => {
      expect(
        sortByOffset([
          init({ x: 0, y: 0 }),
          init({ x: 50, y: 10 }),
          init({ x: 25, y: 20 })
        ]).map((current) => current.elementInterface.getElementRect())
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
        sortByOffset([
          init({ x: 0, width: 50 }),
          init({ x: 25, width: 25 }),
          init({ x: 25, width: 0 })
        ]).map((current) => current.elementInterface.getElementRect())
      ).toMatchInlineSnapshot(`
        [
          0, 0 (50 x 0),
          25, 0 (0 x 0),
          25, 0 (25 x 0),
        ]
      `);
    });
  });
});
