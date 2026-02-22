import { describe, expect, test } from "vitest";
import { mountGroup } from "../mountGroup";
import { getMountedGroups, type MountedGroups } from "../mutable-state/groups";
import { mockGroup } from "../test/mockGroup";
import { mockPointerEvent } from "../test/mockPointerEvent";
import { findMatchingHitRegions } from "./findMatchingHitRegions";

describe("findMatchingHitRegions", () => {
  function serialize(event: PointerEvent, mountedGroups: MountedGroups) {
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
      serialize(mockPointerEvent(), getMountedGroups())
    ).toMatchInlineSnapshot(`"[]"`);
  });

  test("group with no separator", () => {
    const group = mockGroup(new DOMRect(0, 0, 100, 50));
    group.addPanel(new DOMRect(0, 0, 50, 50), "left");
    group.addPanel(new DOMRect(50, 0, 50, 50), "right");
    mountGroup(group);

    expect(serialize(mockPointerEvent({ clientX: 50 }), getMountedGroups()))
      .toMatchInlineSnapshot(`
        "[
          {
            "panels": [
              "group-1-left",
              "group-1-right"
            ],
            "rect": "45,0 10 x 50"
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

    expect(serialize(mockPointerEvent({ clientX: 60 }), getMountedGroups()))
      .toMatchInlineSnapshot(`
        "[
          {
            "panels": [
              "group-1-left",
              "group-1-right"
            ],
            "rect": "50,0 20 x 50",
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

    const innerGroup = mockGroup(new DOMRect(0, 0, 50, 50), {
      orientation: "vertical"
    });
    innerGroup.addPanel(new DOMRect(0, 0, 50, 25), "top");
    innerGroup.addPanel(new DOMRect(0, 25, 50, 25), "bottom");
    mountGroup(innerGroup);

    expect(
      serialize(
        mockPointerEvent({ clientX: 50, clientY: 25 }),
        getMountedGroups()
      )
    ).toMatchInlineSnapshot(`
      "[
        {
          "panels": [
            "group-1-left",
            "group-1-right"
          ],
          "rect": "45,0 10 x 50"
        },
        {
          "panels": [
            "group-2-top",
            "group-2-bottom"
          ],
          "rect": "0,20 50 x 10"
        }
      ]"
    `);
  });

  test("should skip disabled groups", () => {
    const group = mockGroup(new DOMRect(0, 0, 100, 50), { disabled: true });
    group.addPanel(new DOMRect(0, 0, 50, 50), "left");
    group.addPanel(new DOMRect(50, 0, 50, 50), "right");
    mountGroup(group);

    expect(serialize(mockPointerEvent({ clientX: 50 }), getMountedGroups()))
      .toMatchInlineSnapshot(`
      "[]"
    `);
  });
});
