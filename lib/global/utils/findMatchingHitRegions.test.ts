import { describe, expect, test } from "vitest";
import { read, type MountedGroupMap } from "../mutableState";
import { mockGroup } from "../test/mockGroup";
import { findMatchingHitRegions } from "./findMatchingHitRegions";
import { mountGroup } from "../mountGroup";
import { mockPointerEvent } from "../test/mockPointerEvent";

describe("findMatchingHitRegions", () => {
  function serialize(event: PointerEvent, mountedGroups: MountedGroupMap) {
    const hitRegions = findMatchingHitRegions(event, mountedGroups);

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
    mountGroup(mockGroup(new DOMRect(0, 0, 10, 50)));

    expect(
      serialize(mockPointerEvent(), read().mountedGroups)
    ).toMatchInlineSnapshot(`"[]"`);
  });

  test("group with no separator", () => {
    const group = mockGroup(new DOMRect(0, 0, 100, 50));
    group.addPanel(new DOMRect(0, 0, 50, 50), "left");
    group.addPanel(new DOMRect(50, 0, 50, 50), "right");
    mountGroup(group);

    expect(serialize(mockPointerEvent({ clientX: 50 }), read().mountedGroups))
      .toMatchInlineSnapshot(`
        "[
          {
            "panels": [
              "group-1-left",
              "group-1-right"
            ],
            "rect": "36.5,0 27 x 50"
          }
        ]"
      `);
  });

  test("group with separator", () => {
    const group = mockGroup(new DOMRect(0, 0, 1200, 50));
    group.addPanel(new DOMRect(0, 0, 50, 50), "left");
    group.addSeparator(new DOMRect(50, 0, 20, 50), "separator");
    group.addPanel(new DOMRect(70, 0, 50, 50), "right");
    mountGroup(group);

    expect(serialize(mockPointerEvent({ clientX: 60 }), read().mountedGroups))
      .toMatchInlineSnapshot(`
        "[
          {
            "panels": [
              "group-1-left",
              "group-1-right"
            ],
            "rect": "46.5,0 27 x 50",
            "separator": "group-1-separator"
          }
        ]"
      `);
  });

  test("nested groups", () => {
    const outerGroup = mockGroup(new DOMRect(0, 0, 100, 50));
    outerGroup.addPanel(new DOMRect(0, 0, 50, 50), "left");
    outerGroup.addPanel(new DOMRect(50, 0, 50, 50), "right");
    mountGroup(outerGroup);

    const innerGroup = mockGroup(new DOMRect(0, 0, 50, 50), "vertical");
    innerGroup.addPanel(new DOMRect(0, 0, 50, 25), "top");
    innerGroup.addPanel(new DOMRect(0, 25, 50, 25), "bottom");
    mountGroup(innerGroup);

    expect(
      serialize(
        mockPointerEvent({ clientX: 50, clientY: 25 }),
        read().mountedGroups
      )
    ).toMatchInlineSnapshot(`
      "[
        {
          "panels": [
            "group-1-left",
            "group-1-right"
          ],
          "rect": "36.5,0 27 x 50"
        },
        {
          "panels": [
            "group-2-top",
            "group-2-bottom"
          ],
          "rect": "0,11.5 50 x 27"
        }
      ]"
    `);
  });

  test("should skip disabled groups", () => {
    const group = mockGroup(new DOMRect(0, 0, 100, 50));
    group.addPanel(new DOMRect(0, 0, 50, 50), "left");
    group.addPanel(new DOMRect(50, 0, 50, 50), "right");
    group.disabled = true;
    mountGroup(group);

    expect(serialize(mockPointerEvent({ clientX: 50 }), read().mountedGroups))
      .toMatchInlineSnapshot(`
      "[]"
    `);
  });
});
