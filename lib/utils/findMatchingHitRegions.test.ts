import { describe, expect, test } from "vitest";
import { findMatchingHitRegions } from "./findMatchingHitRegions";
import { MutableGroupForTest } from "../state/tests/MutableGroupForTest";
import { mockPointerEvent } from "./test/mockPointerEvent";
import type { MutableGroup } from "../state/MutableGroup";

describe("findMatchingHitRegions", () => {
  function serialize(event: PointerEvent, groups: MutableGroup[]) {
    const hitRegions = findMatchingHitRegions(event, groups);

    return JSON.stringify(
      hitRegions.map((region) => ({
        panels: region.panels.map((panel) => panel.id),
        rect: `${region.rect.x},${region.rect.y} ${region.rect.width} x ${region.rect.height}`,
        separator: region.separator?.id
      })),
      null,
      2
    );
  }

  test("empty groups", () => {
    const group = new MutableGroupForTest({ rect: new DOMRect(0, 0, 10, 50) });
    group.mount();

    expect(serialize(mockPointerEvent(), [])).toMatchInlineSnapshot(`"[]"`);
  });

  test("group with no separator", () => {
    const group = new MutableGroupForTest({ rect: new DOMRect(0, 0, 100, 50) });
    group.addMutablePanel(new DOMRect(0, 0, 50, 50), "left");
    group.addMutablePanel(new DOMRect(50, 0, 50, 50), "right");
    group.mount();

    expect(serialize(mockPointerEvent({ clientX: 50 }), [group]))
      .toMatchInlineSnapshot(`
        "[
          {
            "panels": [
              "left",
              "right"
            ],
            "rect": "45,0 10 x 50"
          }
        ]"
      `);
  });

  test("group with separator", () => {
    const group = new MutableGroupForTest({
      rect: new DOMRect(0, 0, 1200, 50)
    });
    group.addMutablePanel(new DOMRect(0, 0, 50, 50), "left");
    group.addMutableSeparator(new DOMRect(50, 0, 20, 50), "separator");
    group.addMutablePanel(new DOMRect(70, 0, 50, 50), "right");
    group.mount();

    expect(serialize(mockPointerEvent({ clientX: 60 }), [group]))
      .toMatchInlineSnapshot(`
        "[
          {
            "panels": [
              "left",
              "right"
            ],
            "rect": "50,0 20 x 50",
            "separator": "separator"
          }
        ]"
      `);
  });

  test("nested groups", () => {
    const outerGroup = new MutableGroupForTest({
      rect: new DOMRect(0, 0, 100, 50)
    });
    outerGroup.addMutablePanel(new DOMRect(0, 0, 50, 50), "left");
    outerGroup.addMutablePanel(new DOMRect(50, 0, 50, 50), "right");
    outerGroup.mount();

    const innerGroup = new MutableGroupForTest({
      rect: new DOMRect(0, 0, 50, 50),
      orientation: "vertical"
    });
    innerGroup.addMutablePanel(new DOMRect(0, 0, 50, 25), "top");
    innerGroup.addMutablePanel(new DOMRect(0, 25, 50, 25), "bottom");
    innerGroup.mount();

    expect(
      serialize(mockPointerEvent({ clientX: 50, clientY: 25 }), [
        outerGroup,
        innerGroup
      ])
    ).toMatchInlineSnapshot(`
      "[
        {
          "panels": [
            "left",
            "right"
          ],
          "rect": "45,0 10 x 50"
        },
        {
          "panels": [
            "top",
            "bottom"
          ],
          "rect": "0,20 50 x 10"
        }
      ]"
    `);
  });

  test("should skip disabled groups", () => {
    const group = new MutableGroupForTest({ rect: new DOMRect(0, 0, 100, 50) });
    group.addMutablePanel(new DOMRect(0, 0, 50, 50), "left");
    group.addMutablePanel(new DOMRect(50, 0, 50, 50), "right");
    group.disabled = true;
    group.mount();

    expect(serialize(mockPointerEvent({ clientX: 50 }), [group]))
      .toMatchInlineSnapshot(`
      "[]"
    `);
  });
});
