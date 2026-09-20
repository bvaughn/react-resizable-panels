import { describe, expect, test } from "vitest";
import { calculateHitRegions } from "../dom/calculateHitRegions";
import { mockGroup } from "../test/mockGroup";
import { calculateResizePreviews } from "./calculateResizePreviews";

describe("calculateResizePreviews", () => {
  for (const orientation of ["horizontal", "vertical"] as const) {
    for (const explicit of [false, true]) {
      for (const activeIndex of [0, 1]) {
        test(`${orientation}, explicit=${explicit}, active edge=${activeIndex}`, () => {
          const horizontal = orientation === "horizontal";
          const rect = (start: number, size: number) =>
            horizontal
              ? new DOMRect(start, 0, size, 100)
              : new DOMRect(0, start, 100, size);

          const group = mockGroup(rect(0, 300), { orientation });
          group.addPanel(rect(0, 100));
          if (explicit) {
            group.addSeparator(rect(100, 10));
          }
          group.addHTMLElement(rect(explicit ? 110 : 100, explicit ? 90 : 100));
          group.addPanel(rect(200, 100));

          const hitRegions = calculateHitRegions({ group });
          const previews = calculateResizePreviews(group, [
            hitRegions[activeIndex]
          ]);

          expect(previews).toHaveLength(2);
          expect(previews.map(({ active }) => active)).toEqual([
            activeIndex === 0,
            activeIndex === 1
          ]);
          expect(
            previews.map(({ rect }) => (horizontal ? rect.left : rect.top))
          ).toEqual([100, 200]);
          expect(
            previews.map(({ rect }) => (horizontal ? rect.width : rect.height))
          ).toEqual([explicit ? 10 : 0, 0]);
          expect(new Set(previews.map(({ key }) => key)).size).toBe(2);
          expect(previews[0].separator).toBe(group.separators[0]);
          expect(previews[1].separator).toBeUndefined();
        });
      }
    }
  }

  test("includes disabled separators that can move indirectly", () => {
    const group = mockGroup(new DOMRect(0, 0, 210, 100));
    group.addPanel(new DOMRect(0, 0, 100, 100));
    group.addSeparator(new DOMRect(100, 0, 10, 100), "separator", true);
    group.addPanel(new DOMRect(110, 0, 100, 100));

    expect(calculateHitRegions({ group })).toHaveLength(0);

    const previews = calculateResizePreviews(group, []);
    expect(previews).toHaveLength(1);
    expect(previews[0].active).toBe(false);
    expect(previews[0].separator).toBe(group.separators[0]);
  });
});
