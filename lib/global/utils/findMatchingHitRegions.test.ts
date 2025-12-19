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
        rect: region.rects.map(
          (rect) => `${rect.x},${rect.y} ${rect.width} x ${rect.height}`
        )
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

  test("group", () => {
    const group = mockGroup(new DOMRect(0, 0, 20, 50));
    group.addPanel(new DOMRect(0, 0, 10, 50), "left");
    group.addPanel(new DOMRect(10, 0, 10, 50), "right");
    mountGroup(group);

    expect(serialize(mockPointerEvent({ clientX: 10 }), read().mountedGroups))
      .toMatchInlineSnapshot(`
        "[
          {
            "panels": [
              "group-1-left",
              "group-1-right"
            ],
            "rect": [
              "10,0 0 x 50"
            ]
          }
        ]"
      `);
  });

  test("nested groups", () => {
    const outerGroup = mockGroup(new DOMRect(0, 0, 20, 50));
    outerGroup.addPanel(new DOMRect(0, 0, 10, 50), "left");
    outerGroup.addPanel(new DOMRect(10, 0, 10, 50), "right");
    mountGroup(outerGroup);

    const innerGroup = mockGroup(new DOMRect(0, 0, 10, 50), "vertical");
    innerGroup.addPanel(new DOMRect(0, 0, 10, 25), "top");
    innerGroup.addPanel(new DOMRect(0, 25, 10, 25), "bottom");
    mountGroup(innerGroup);

    expect(
      serialize(
        mockPointerEvent({ clientX: 10, clientY: 25 }),
        read().mountedGroups
      )
    ).toMatchInlineSnapshot(`
      "[
        {
          "panels": [
            "group-1-left",
            "group-1-right"
          ],
          "rect": [
            "10,0 0 x 50"
          ]
        },
        {
          "panels": [
            "group-2-top",
            "group-2-bottom"
          ],
          "rect": [
            "0,25 10 x 0"
          ]
        }
      ]"
    `);
  });

  test("should skip disabled groups", () => {
    const group = mockGroup(new DOMRect(0, 0, 20, 50));
    group.disabled = true;
    group.addPanel(new DOMRect(0, 0, 10, 50), "left");
    group.addPanel(new DOMRect(10, 0, 10, 50), "right");
    mountGroup(group);

    expect(serialize(mockPointerEvent({ clientX: 10 }), read().mountedGroups))
      .toMatchInlineSnapshot(`
      "[]"
    `);
  });
});
