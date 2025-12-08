import { describe, expect, test } from "vitest";
import { mockGroup, type MockGroup } from "../test/mockGroup";
import { calculateHitRegions } from "./calculateHitRegions";

describe("calculateHitRegions", () => {
  function serialize(group: MockGroup) {
    const hitRegions = calculateHitRegions(group);

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

  test("empty panels", () => {
    const group = mockGroup(new DOMRect(0, 0, 10, 50));
    expect(serialize(group)).toMatchInlineSnapshot(`"[]"`);
  });

  test("one panel", () => {
    const group = mockGroup(new DOMRect(0, 0, 10, 50));
    group.addChild("panel", new DOMRect(0, 0, 10, 50));

    expect(serialize(group)).toMatchInlineSnapshot(`"[]"`);
  });

  test("two panels", () => {
    const group = mockGroup(new DOMRect(0, 0, 20, 50));
    group.addChild("panel", new DOMRect(0, 0, 10, 50), "left");
    group.addChild("panel", new DOMRect(10, 0, 10, 50), "right");

    expect(serialize(group)).toMatchInlineSnapshot(`
      "[
        {
          "panels": [
            "group-1-left",
            "group-1-right"
          ],
          "rect": "10,0 0 x 50"
        }
      ]"
    `);
  });

  test("three panels", () => {
    const group = mockGroup(new DOMRect(0, 0, 30, 50));
    group.addChild("panel", new DOMRect(0, 0, 10, 50), "left");
    group.addChild("panel", new DOMRect(10, 0, 10, 50), "center");
    group.addChild("panel", new DOMRect(20, 0, 10, 50), "right");

    expect(serialize(group)).toMatchInlineSnapshot(`
      "[
        {
          "panels": [
            "group-1-left",
            "group-1-center"
          ],
          "rect": "10,0 0 x 50"
        },
        {
          "panels": [
            "group-1-center",
            "group-1-right"
          ],
          "rect": "20,0 0 x 50"
        }
      ]"
    `);
  });

  test("panels and explicit separators", () => {
    const group = mockGroup(new DOMRect(0, 0, 50, 50));
    group.addChild("panel", new DOMRect(0, 0, 10, 50), "left");
    group.addChild("separator", new DOMRect(10, 0, 10, 50), "left");
    group.addChild("panel", new DOMRect(20, 0, 10, 50), "center");
    group.addChild("separator", new DOMRect(30, 0, 10, 50), "right");
    group.addChild("panel", new DOMRect(40, 0, 10, 50), "right");

    expect(serialize(group)).toMatchInlineSnapshot(`
      "[
        {
          "panels": [
            "group-1-left",
            "group-1-center"
          ],
          "rect": "10,0 10 x 50",
          "separator": "group-1-left"
        },
        {
          "panels": [
            "group-1-center",
            "group-1-right"
          ],
          "rect": "30,0 10 x 50",
          "separator": "group-1-right"
        }
      ]"
    `);
  });

  test("panels and some explicit separators", () => {
    const group = mockGroup(new DOMRect(0, 0, 60, 50));
    group.addChild("panel", new DOMRect(0, 0, 20, 50), "a");
    group.addChild("panel", new DOMRect(20, 0, 20, 50), "b");
    group.addChild("separator", new DOMRect(40, 0, 5, 50), "separator");
    group.addChild("panel", new DOMRect(40, 0, 40, 50), "c");

    expect(serialize(group)).toMatchInlineSnapshot(`
      "[
        {
          "panels": [
            "group-1-a",
            "group-1-b"
          ],
          "rect": "20,0 0 x 50"
        },
        {
          "panels": [
            "group-1-b",
            "group-1-c"
          ],
          "rect": "40,0 0 x 50",
          "separator": "group-1-separator"
        }
      ]"
    `);
  });

  test("mixed panels and non-panel children", () => {
    const group = mockGroup(new DOMRect(0, 0, 70, 50));
    group.addChild("other", new DOMRect(0, 0, 10, 50));
    group.addChild("panel", new DOMRect(10, 0, 10, 50), "a");
    group.addChild("panel", new DOMRect(20, 0, 10, 50), "b");
    group.addChild("other", new DOMRect(30, 0, 10, 50));
    group.addChild("panel", new DOMRect(40, 0, 10, 50), "c");
    group.addChild("panel", new DOMRect(50, 0, 10, 50), "d");
    group.addChild("other", new DOMRect(60, 0, 10, 50));

    expect(serialize(group)).toMatchInlineSnapshot(`
      "[
        {
          "panels": [
            "group-1-a",
            "group-1-b"
          ],
          "rect": "20,0 0 x 50"
        },
        {
          "panels": [
            "group-1-c",
            "group-1-d"
          ],
          "rect": "50,0 0 x 50"
        }
      ]"
    `);
  });

  test("CSS styles (e.g. padding and flex gap)", () => {
    const group = mockGroup(new DOMRect(0, 0, 50, 50));
    group.addChild("panel", new DOMRect(5, 5, 10, 40), "left");
    group.addChild("panel", new DOMRect(20, 5, 10, 40), "center");
    group.addChild("panel", new DOMRect(35, 5, 10, 40), "right");

    expect(serialize(group)).toMatchInlineSnapshot(`
      "[
        {
          "panels": [
            "group-1-left",
            "group-1-center"
          ],
          "rect": "15,5 5 x 40"
        },
        {
          "panels": [
            "group-1-center",
            "group-1-right"
          ],
          "rect": "30,5 5 x 40"
        }
      ]"
    `);
  });

  test("out of order children (e.g. dynamic rendering)", () => {
    const group = mockGroup(new DOMRect(0, 0, 30, 50));
    group.addChild("panel", new DOMRect(0, 0, 10, 50), "left");
    group.addChild("panel", new DOMRect(20, 0, 10, 50), "right");

    // Simulate conditionally rendering a new middle panel
    group.addChild("panel", new DOMRect(10, 0, 10, 50), "center");

    expect(serialize(group)).toMatchInlineSnapshot(`
      "[
        {
          "panels": [
            "group-1-left",
            "group-1-center"
          ],
          "rect": "10,0 0 x 50"
        },
        {
          "panels": [
            "group-1-center",
            "group-1-right"
          ],
          "rect": "20,0 0 x 50"
        }
      ]"
    `);
  });

  // Test covers conditionally rendered panels and separators
  test("should sort elements and separators by offset", () => {
    const group = mockGroup(new DOMRect(0, 0, 50, 50));
    group.addChild("panel", new DOMRect(40, 0, 10, 50), "d");
    group.addChild("panel", new DOMRect(15, 0, 10, 50), "b");
    group.addChild("panel", new DOMRect(0, 0, 10, 50), "a");
    group.addChild("panel", new DOMRect(25, 0, 10, 50), "c");
    group.addChild("separator", new DOMRect(35, 0, 5, 50), "right");
    group.addChild("separator", new DOMRect(10, 0, 5, 50), "left");

    expect(serialize(group)).toMatchInlineSnapshot(`
      "[
        {
          "panels": [
            "group-1-a",
            "group-1-b"
          ],
          "rect": "10,0 5 x 50",
          "separator": "group-1-left"
        },
        {
          "panels": [
            "group-1-b",
            "group-1-c"
          ],
          "rect": "25,0 0 x 50"
        },
        {
          "panels": [
            "group-1-c",
            "group-1-d"
          ],
          "rect": "35,0 5 x 50",
          "separator": "group-1-right"
        }
      ]"
    `);
  });
});
