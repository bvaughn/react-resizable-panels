import { describe, expect, test } from "vitest";
import { mockGroup, type MockGroup } from "../test/mockGroup";
import { calculateHitRegions } from "./calculateHitRegions";

describe("calculateHitRegions", () => {
  function serialize(group: MockGroup) {
    const hitRegions = calculateHitRegions(group);

    return JSON.stringify(
      hitRegions.map((region) => ({
        panels: region.panels.map((panel) => panel.id),
        rect: region.rects.map(
          (rect) => `${rect.x},${rect.y} ${rect.width} x ${rect.height}`
        ),
        separators: region.separators.map((separator) => separator.id)
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
    group.addPanel(new DOMRect(0, 0, 10, 50));

    expect(serialize(group)).toMatchInlineSnapshot(`"[]"`);
  });

  test("two panels", () => {
    const group = mockGroup(new DOMRect(0, 0, 20, 50));
    group.addPanel(new DOMRect(0, 0, 10, 50), "left");
    group.addPanel(new DOMRect(10, 0, 10, 50), "right");

    expect(serialize(group)).toMatchInlineSnapshot(`
      "[
        {
          "panels": [
            "group-1-left",
            "group-1-right"
          ],
          "rect": [
            "10,0 0 x 50"
          ],
          "separators": []
        }
      ]"
    `);
  });

  test("three panels", () => {
    const group = mockGroup(new DOMRect(0, 0, 30, 50));
    group.addPanel(new DOMRect(0, 0, 10, 50), "left");
    group.addPanel(new DOMRect(10, 0, 10, 50), "center");
    group.addPanel(new DOMRect(20, 0, 10, 50), "right");

    expect(serialize(group)).toMatchInlineSnapshot(`
      "[
        {
          "panels": [
            "group-1-left",
            "group-1-center"
          ],
          "rect": [
            "10,0 0 x 50"
          ],
          "separators": []
        },
        {
          "panels": [
            "group-1-center",
            "group-1-right"
          ],
          "rect": [
            "20,0 0 x 50"
          ],
          "separators": []
        }
      ]"
    `);
  });

  test("panels and explicit separators", () => {
    const group = mockGroup(new DOMRect(0, 0, 50, 50));
    group.addPanel(new DOMRect(0, 0, 10, 50), "left");
    group.addSeparator(new DOMRect(10, 0, 10, 50), "left");
    group.addPanel(new DOMRect(20, 0, 10, 50), "center");
    group.addSeparator(new DOMRect(30, 0, 10, 50), "right");
    group.addPanel(new DOMRect(40, 0, 10, 50), "right");

    expect(serialize(group)).toMatchInlineSnapshot(`
      "[
        {
          "panels": [
            "group-1-left",
            "group-1-center"
          ],
          "rect": [
            "10,0 10 x 50"
          ],
          "separators": [
            "group-1-left"
          ]
        },
        {
          "panels": [
            "group-1-center",
            "group-1-right"
          ],
          "rect": [
            "30,0 10 x 50"
          ],
          "separators": [
            "group-1-right"
          ]
        }
      ]"
    `);
  });

  test("panels and some explicit separators", () => {
    const group = mockGroup(new DOMRect(0, 0, 60, 50));
    group.addPanel(new DOMRect(0, 0, 20, 50), "a");
    group.addPanel(new DOMRect(20, 0, 20, 50), "b");
    group.addSeparator(new DOMRect(40, 0, 5, 50), "separator");
    group.addPanel(new DOMRect(40, 0, 40, 50), "c");

    expect(serialize(group)).toMatchInlineSnapshot(`
      "[
        {
          "panels": [
            "group-1-a",
            "group-1-b"
          ],
          "rect": [
            "20,0 0 x 50"
          ],
          "separators": []
        },
        {
          "panels": [
            "group-1-b",
            "group-1-c"
          ],
          "rect": [
            "40,0 0 x 50"
          ],
          "separators": [
            "group-1-separator"
          ]
        }
      ]"
    `);
  });

  test("mixed panels and non-panel children", () => {
    const group = mockGroup(new DOMRect(0, 0, 70, 50));
    group.addHTMLElement(new DOMRect(0, 0, 10, 50));
    group.addPanel(new DOMRect(10, 0, 10, 50), "a");
    group.addPanel(new DOMRect(20, 0, 10, 50), "b");
    group.addHTMLElement(new DOMRect(30, 0, 10, 50));
    group.addPanel(new DOMRect(40, 0, 10, 50), "c");
    group.addPanel(new DOMRect(50, 0, 10, 50), "d");
    group.addHTMLElement(new DOMRect(60, 0, 10, 50));

    expect(serialize(group)).toMatchInlineSnapshot(`
      "[
        {
          "panels": [
            "group-1-a",
            "group-1-b"
          ],
          "rect": [
            "20,0 0 x 50"
          ],
          "separators": []
        },
        {
          "panels": [
            "group-1-b",
            "group-1-c"
          ],
          "rect": [
            "30,0 0 x 50",
            "40,0 0 x 50"
          ],
          "separators": []
        },
        {
          "panels": [
            "group-1-c",
            "group-1-d"
          ],
          "rect": [
            "50,0 0 x 50"
          ],
          "separators": []
        }
      ]"
    `);
  });

  test("CSS styles (e.g. padding and flex gap)", () => {
    const group = mockGroup(new DOMRect(0, 0, 50, 50));
    group.addPanel(new DOMRect(5, 5, 10, 40), "left");
    group.addPanel(new DOMRect(20, 5, 10, 40), "center");
    group.addPanel(new DOMRect(35, 5, 10, 40), "right");

    expect(serialize(group)).toMatchInlineSnapshot(`
      "[
        {
          "panels": [
            "group-1-left",
            "group-1-center"
          ],
          "rect": [
            "15,5 5 x 40"
          ],
          "separators": []
        },
        {
          "panels": [
            "group-1-center",
            "group-1-right"
          ],
          "rect": [
            "30,5 5 x 40"
          ],
          "separators": []
        }
      ]"
    `);
  });

  test("out of order children (e.g. dynamic rendering)", () => {
    const group = mockGroup(new DOMRect(0, 0, 30, 50));
    group.addPanel(new DOMRect(0, 0, 10, 50), "left");
    group.addPanel(new DOMRect(20, 0, 10, 50), "right");

    // Simulate conditionally rendering a new middle panel
    group.addPanel(new DOMRect(10, 0, 10, 50), "center");

    expect(serialize(group)).toMatchInlineSnapshot(`
      "[
        {
          "panels": [
            "group-1-left",
            "group-1-center"
          ],
          "rect": [
            "10,0 0 x 50"
          ],
          "separators": []
        },
        {
          "panels": [
            "group-1-center",
            "group-1-right"
          ],
          "rect": [
            "20,0 0 x 50"
          ],
          "separators": []
        }
      ]"
    `);
  });

  // Test covers conditionally rendered panels and separators
  test("should sort elements and separators by offset", () => {
    const group = mockGroup(new DOMRect(0, 0, 50, 50));
    group.addPanel(new DOMRect(40, 0, 10, 50), "d");
    group.addPanel(new DOMRect(15, 0, 10, 50), "b");
    group.addPanel(new DOMRect(0, 0, 10, 50), "a");
    group.addPanel(new DOMRect(25, 0, 10, 50), "c");
    group.addSeparator(new DOMRect(35, 0, 5, 50), "right");
    group.addSeparator(new DOMRect(10, 0, 5, 50), "left");

    expect(serialize(group)).toMatchInlineSnapshot(`
      "[
        {
          "panels": [
            "group-1-a",
            "group-1-b"
          ],
          "rect": [
            "10,0 5 x 50"
          ],
          "separators": [
            "group-1-left"
          ]
        },
        {
          "panels": [
            "group-1-b",
            "group-1-c"
          ],
          "rect": [
            "25,0 0 x 50"
          ],
          "separators": []
        },
        {
          "panels": [
            "group-1-c",
            "group-1-d"
          ],
          "rect": [
            "35,0 5 x 50"
          ],
          "separators": [
            "group-1-right"
          ]
        }
      ]"
    `);
  });
});
