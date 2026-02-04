import { describe, expect, test } from "vitest";
import { mockGroup, type MockGroup } from "../test/mockGroup";
import { calculateHitRegions } from "./calculateHitRegions";

describe("calculateHitRegions", () => {
  function serialize(group: MockGroup) {
    const hitRegions = calculateHitRegions(group);

    return JSON.stringify(
      hitRegions.map((region) => ({
        disabled: region.disabled || undefined,
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
    group.addPanel(new DOMRect(0, 0, 10, 50));

    expect(serialize(group)).toMatchInlineSnapshot(`"[]"`);
  });

  test("two panels", () => {
    const group = mockGroup(new DOMRect(0, 0, 100, 50));
    group.addPanel(new DOMRect(0, 0, 50, 50), "left");
    group.addPanel(new DOMRect(50, 0, 50, 50), "right");

    expect(serialize(group)).toMatchInlineSnapshot(`
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

  test("three panels", () => {
    const group = mockGroup(new DOMRect(0, 0, 120, 50));
    group.addPanel(new DOMRect(0, 0, 40, 50), "left");
    group.addPanel(new DOMRect(40, 0, 40, 50), "center");
    group.addPanel(new DOMRect(80, 0, 40, 50), "right");

    expect(serialize(group)).toMatchInlineSnapshot(`
      "[
        {
          "panels": [
            "group-1-left",
            "group-1-center"
          ],
          "rect": "35,0 10 x 50"
        },
        {
          "panels": [
            "group-1-center",
            "group-1-right"
          ],
          "rect": "75,0 10 x 50"
        }
      ]"
    `);
  });

  test("panels and explicit separators", () => {
    const group = mockGroup(new DOMRect(0, 0, 140, 50));
    group.addPanel(new DOMRect(0, 0, 40, 50), "left");
    group.addSeparator(new DOMRect(40, 0, 10, 50), "left");
    group.addPanel(new DOMRect(50, 0, 40, 50), "center");
    group.addSeparator(new DOMRect(90, 0, 10, 50), "right");
    group.addPanel(new DOMRect(100, 0, 40, 50), "right");

    expect(serialize(group)).toMatchInlineSnapshot(`
      "[
        {
          "panels": [
            "group-1-left",
            "group-1-center"
          ],
          "rect": "40,0 10 x 50",
          "separator": "group-1-left"
        },
        {
          "panels": [
            "group-1-center",
            "group-1-right"
          ],
          "rect": "90,0 10 x 50",
          "separator": "group-1-right"
        }
      ]"
    `);
  });

  test("panels and some explicit separators", () => {
    const group = mockGroup(new DOMRect(0, 0, 125, 50));
    group.addPanel(new DOMRect(0, 0, 40, 50), "a");
    group.addPanel(new DOMRect(40, 0, 40, 50), "b");
    group.addSeparator(new DOMRect(80, 0, 5, 50), "separator");
    group.addPanel(new DOMRect(85, 0, 40, 50), "c");

    expect(serialize(group)).toMatchInlineSnapshot(`
      "[
        {
          "panels": [
            "group-1-a",
            "group-1-b"
          ],
          "rect": "35,0 10 x 50"
        },
        {
          "panels": [
            "group-1-b",
            "group-1-c"
          ],
          "rect": "77.5,0 10 x 50",
          "separator": "group-1-separator"
        }
      ]"
    `);
  });

  test("mixed panels and non-panel children", () => {
    const group = mockGroup(new DOMRect(0, 0, 230, 50));
    group.addHTMLElement(new DOMRect(0, 0, 10, 50));
    group.addPanel(new DOMRect(10, 0, 50, 50), "a");
    group.addPanel(new DOMRect(60, 0, 50, 50), "b");
    group.addHTMLElement(new DOMRect(110, 0, 10, 50));
    group.addPanel(new DOMRect(120, 0, 50, 50), "c");
    group.addPanel(new DOMRect(170, 0, 50, 50), "d");
    group.addHTMLElement(new DOMRect(220, 0, 10, 50));

    expect(serialize(group)).toMatchInlineSnapshot(`
      "[
        {
          "panels": [
            "group-1-a",
            "group-1-b"
          ],
          "rect": "55,0 10 x 50"
        },
        {
          "panels": [
            "group-1-b",
            "group-1-c"
          ],
          "rect": "105,0 10 x 50"
        },
        {
          "panels": [
            "group-1-b",
            "group-1-c"
          ],
          "rect": "115,0 10 x 50"
        },
        {
          "panels": [
            "group-1-c",
            "group-1-d"
          ],
          "rect": "165,0 10 x 50"
        }
      ]"
    `);
  });

  test("CSS styles (e.g. padding and flex gap)", () => {
    const group = mockGroup(new DOMRect(0, 0, 190, 70));
    group.addPanel(new DOMRect(10, 10, 50, 40), "left");
    group.addPanel(new DOMRect(70, 10, 50, 40), "center");
    group.addPanel(new DOMRect(130, 10, 50, 40), "right");

    expect(serialize(group)).toMatchInlineSnapshot(`
      "[
        {
          "panels": [
            "group-1-left",
            "group-1-center"
          ],
          "rect": "60,10 10 x 40"
        },
        {
          "panels": [
            "group-1-center",
            "group-1-right"
          ],
          "rect": "120,10 10 x 40"
        }
      ]"
    `);
  });

  test("out of order children (e.g. dynamic rendering)", () => {
    const group = mockGroup(new DOMRect(0, 0, 150, 50));
    group.addPanel(new DOMRect(0, 0, 50, 50), "left");
    group.addPanel(new DOMRect(100, 0, 50, 50), "right");

    // Simulate conditionally rendering a new middle panel
    group.addPanel(new DOMRect(50, 0, 50, 50), "center");

    expect(serialize(group)).toMatchInlineSnapshot(`
      "[
        {
          "panels": [
            "group-1-left",
            "group-1-center"
          ],
          "rect": "45,0 10 x 50"
        },
        {
          "panels": [
            "group-1-center",
            "group-1-right"
          ],
          "rect": "95,0 10 x 50"
        }
      ]"
    `);
  });

  // Test covers conditionally rendered panels and separators
  test("should sort elements and separators by offset", () => {
    const group = mockGroup(new DOMRect(0, 0, 260, 50));
    group.addPanel(new DOMRect(200, 0, 60, 50), "d");
    group.addPanel(new DOMRect(70, 0, 60, 50), "b");
    group.addPanel(new DOMRect(0, 0, 60, 50), "a");
    group.addPanel(new DOMRect(130, 0, 60, 50), "c");
    group.addSeparator(new DOMRect(190, 0, 10, 50), "right");
    group.addSeparator(new DOMRect(60, 0, 10, 50), "left");

    expect(serialize(group)).toMatchInlineSnapshot(`
      "[
        {
          "panels": [
            "group-1-a",
            "group-1-b"
          ],
          "rect": "60,0 10 x 50",
          "separator": "group-1-left"
        },
        {
          "panels": [
            "group-1-b",
            "group-1-c"
          ],
          "rect": "125,0 10 x 50"
        },
        {
          "panels": [
            "group-1-c",
            "group-1-d"
          ],
          "rect": "190,0 10 x 50",
          "separator": "group-1-right"
        }
      ]"
    `);
  });

  test("should disable a hit region if the separator is disabled", () => {
    const group = mockGroup(new DOMRect(0, 0, 100, 50));
    group.addPanel(new DOMRect(0, 0, 50, 50), "left");
    group.addSeparator(new DOMRect(50, 0, 5, 50), "separator", true);
    group.addPanel(new DOMRect(55, 0, 50, 50), "right");

    expect(serialize(group)).toMatchInlineSnapshot(`
      "[
        {
          "disabled": true,
          "panels": [
            "group-1-left",
            "group-1-right"
          ],
          "rect": "47.5,0 10 x 50",
          "separator": "group-1-separator"
        }
      ]"
    `);
  });

  test("should disable a hit region if one or both panels are disabled and there is no explicit separator", () => {
    {
      const group = mockGroup(new DOMRect(0, 0, 100, 50));
      group.addPanel(new DOMRect(0, 0, 50, 50), "left", { disabled: true });
      group.addPanel(new DOMRect(50, 0, 50, 50), "right");

      expect(serialize(group)).toMatchInlineSnapshot(`
        "[
          {
            "disabled": true,
            "panels": [
              "group-1-left",
              "group-1-right"
            ],
            "rect": "45,0 10 x 50"
          }
        ]"
      `);
    }

    {
      const group = mockGroup(new DOMRect(0, 0, 100, 50));
      group.addPanel(new DOMRect(0, 0, 50, 50), "left");
      group.addPanel(new DOMRect(50, 0, 50, 50), "right", { disabled: true });

      expect(serialize(group)).toMatchInlineSnapshot(`
        "[
          {
            "disabled": true,
            "panels": [
              "group-2-left",
              "group-2-right"
            ],
            "rect": "45,0 10 x 50"
          }
        ]"
      `);
    }

    {
      const group = mockGroup(new DOMRect(0, 0, 100, 50));
      group.addPanel(new DOMRect(0, 0, 50, 50), "left", { disabled: true });
      group.addPanel(new DOMRect(50, 0, 50, 50), "right", { disabled: true });

      expect(serialize(group)).toMatchInlineSnapshot(`
        "[
          {
            "disabled": true,
            "panels": [
              "group-3-left",
              "group-3-right"
            ],
            "rect": "45,0 10 x 50"
          }
        ]"
      `);
    }
  });

  test("should not disable a hit region if one or both panels are disabled but there is an enabled separator", () => {
    {
      const group = mockGroup(new DOMRect(0, 0, 100, 50));
      group.addPanel(new DOMRect(0, 0, 50, 50), "left", { disabled: true });
      group.addSeparator(new DOMRect(50, 0, 5, 50), "separator");
      group.addPanel(new DOMRect(55, 0, 50, 50), "right");

      expect(serialize(group)).toMatchInlineSnapshot(`
      "[
        {
          "panels": [
            "group-1-left",
            "group-1-right"
          ],
          "rect": "47.5,0 10 x 50",
          "separator": "group-1-separator"
        }
      ]"
    `);
    }

    {
      const group = mockGroup(new DOMRect(0, 0, 100, 50));
      group.addPanel(new DOMRect(0, 0, 50, 50), "left");
      group.addSeparator(new DOMRect(50, 0, 5, 50), "separator");
      group.addPanel(new DOMRect(55, 0, 50, 50), "right", { disabled: true });

      expect(serialize(group)).toMatchInlineSnapshot(`
        "[
          {
            "panels": [
              "group-2-left",
              "group-2-right"
            ],
            "rect": "47.5,0 10 x 50",
            "separator": "group-2-separator"
          }
        ]"
      `);
    }

    {
      const group = mockGroup(new DOMRect(0, 0, 100, 50));
      group.addPanel(new DOMRect(0, 0, 50, 50), "left", { disabled: true });
      group.addSeparator(new DOMRect(50, 0, 5, 50), "separator");
      group.addPanel(new DOMRect(55, 0, 50, 50), "right", { disabled: true });

      expect(serialize(group)).toMatchInlineSnapshot(`
        "[
          {
            "panels": [
              "group-3-left",
              "group-3-right"
            ],
            "rect": "47.5,0 10 x 50",
            "separator": "group-3-separator"
          }
        ]"
      `);
    }
  });
});
