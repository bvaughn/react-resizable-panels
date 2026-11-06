import { describe, expect, test } from "vitest";
import { mockGroup } from "../test/mockGroup";
import type { HitRegion } from "../types";
import { hitRegionsEqual } from "./hitRegionsEqual";

describe("hitRegionsEqual", () => {
  const group = mockGroup(new DOMRect(0, 0, 300, 100));
  group.addPanel(new DOMRect(0, 0, 100, 100), "a");
  group.addSeparator(new DOMRect(100, 0, 0, 100), "first");
  group.addPanel(new DOMRect(100, 0, 100, 100), "b");
  group.addPanel(new DOMRect(200, 0, 100, 100), "c");

  const [a, b, c] = group.items;
  const [separator] = group.separators;

  function hitRegion(
    items: HitRegion["items"],
    rect: DOMRect = new DOMRect(0, 0, 10, 10),
    separatorOverride: HitRegion["separator"] = undefined
  ): HitRegion {
    return {
      axis: group,
      axisSize: 300,
      items,
      rect,
      separator: separatorOverride
    };
  }

  test("empty lists are equal", () => {
    expect(hitRegionsEqual([], [])).toBe(true);
  });

  test("ignores rects and axis sizes", () => {
    expect(
      hitRegionsEqual(
        [hitRegion([a, b], new DOMRect(0, 0, 10, 10), separator)],
        [
          {
            ...hitRegion([a, b], new DOMRect(5, 5, 20, 20), separator),
            axisSize: 150
          }
        ]
      )
    ).toBe(true);
  });

  test("detects different lengths", () => {
    expect(hitRegionsEqual([hitRegion([a, b])], [])).toBe(false);
  });

  test("detects different items", () => {
    expect(hitRegionsEqual([hitRegion([a, b])], [hitRegion([b, c])])).toBe(
      false
    );
  });

  test("detects different separators", () => {
    expect(
      hitRegionsEqual(
        [hitRegion([a, b], undefined, separator)],
        [hitRegion([a, b])]
      )
    ).toBe(false);
  });

  test("detects different axes", () => {
    const otherGroup = mockGroup(new DOMRect(0, 0, 300, 100));
    expect(
      hitRegionsEqual(
        [hitRegion([a, b])],
        [{ ...hitRegion([a, b]), axis: otherGroup }]
      )
    ).toBe(false);
  });
});
