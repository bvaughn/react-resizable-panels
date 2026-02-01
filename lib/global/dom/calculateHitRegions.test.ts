import { describe, expect, test } from "vitest";
import { calculateHitRegions } from "./calculateHitRegions";
import type { MutableGroup } from "../../state/MutableGroup";
import { MutableGroupForTest } from "../../state/tests/MutableGroupForTest";

function serialize(group: MutableGroup) {
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

describe("calculateHitRegions", () => {
  test("empty panels", () => {
    const group = new MutableGroupForTest({ rect: new DOMRect(0, 0, 10, 50) });
    expect(serialize(group)).toMatchInlineSnapshot(`"[]"`);
  });

  test("one panel", () => {
    const group = new MutableGroupForTest({ rect: new DOMRect(0, 0, 10, 50) });
    group.addMutablePanel(new DOMRect(0, 0, 10, 50));

    expect(serialize(group)).toMatchInlineSnapshot(`"[]"`);
  });

  test("two panels", () => {
    const group = new MutableGroupForTest({ rect: new DOMRect(0, 0, 100, 50) });
    group.addMutablePanel(new DOMRect(0, 0, 50, 50), "left");
    group.addMutablePanel(new DOMRect(50, 0, 50, 50), "right");

    expect(serialize(group)).toMatchInlineSnapshot(`
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

  test("three panels", () => {
    const group = new MutableGroupForTest({ rect: new DOMRect(0, 0, 120, 50) });
    group.addMutablePanel(new DOMRect(0, 0, 40, 50), "left");
    group.addMutablePanel(new DOMRect(40, 0, 40, 50), "center");
    group.addMutablePanel(new DOMRect(80, 0, 40, 50), "right");

    expect(serialize(group)).toMatchInlineSnapshot(`
      "[
        {
          "panels": [
            "left",
            "center"
          ],
          "rect": "35,0 10 x 50"
        },
        {
          "panels": [
            "center",
            "right"
          ],
          "rect": "75,0 10 x 50"
        }
      ]"
    `);
  });

  test("panels and explicit separators", () => {
    const group = new MutableGroupForTest({ rect: new DOMRect(0, 0, 140, 50) });
    group.addMutablePanel(new DOMRect(0, 0, 40, 50), "left");
    group.addMutableSeparator(new DOMRect(40, 0, 10, 50), "left");
    group.addMutablePanel(new DOMRect(50, 0, 40, 50), "center");
    group.addMutableSeparator(new DOMRect(90, 0, 10, 50), "right");
    group.addMutablePanel(new DOMRect(100, 0, 40, 50), "right");

    expect(serialize(group)).toMatchInlineSnapshot(`
      "[
        {
          "panels": [
            "left",
            "center"
          ],
          "rect": "40,0 10 x 50",
          "separator": "left"
        },
        {
          "panels": [
            "center",
            "right"
          ],
          "rect": "90,0 10 x 50",
          "separator": "right"
        }
      ]"
    `);
  });

  test("panels and some explicit separators", () => {
    const group = new MutableGroupForTest({ rect: new DOMRect(0, 0, 125, 50) });
    group.addMutablePanel(new DOMRect(0, 0, 40, 50), "a");
    group.addMutablePanel(new DOMRect(40, 0, 40, 50), "b");
    group.addMutableSeparator(new DOMRect(80, 0, 5, 50), "separator");
    group.addMutablePanel(new DOMRect(85, 0, 40, 50), "c");

    expect(serialize(group)).toMatchInlineSnapshot(`
      "[
        {
          "panels": [
            "a",
            "b"
          ],
          "rect": "35,0 10 x 50"
        },
        {
          "panels": [
            "b",
            "c"
          ],
          "rect": "77.5,0 10 x 50",
          "separator": "separator"
        }
      ]"
    `);
  });

  test("mixed panels and non-panel children", () => {
    const group = new MutableGroupForTest({ rect: new DOMRect(0, 0, 230, 50) });
    group.addDiv(new DOMRect(0, 0, 10, 50));
    group.addMutablePanel(new DOMRect(10, 0, 50, 50), "a");
    group.addMutablePanel(new DOMRect(60, 0, 50, 50), "b");
    group.addDiv(new DOMRect(110, 0, 10, 50));
    group.addMutablePanel(new DOMRect(120, 0, 50, 50), "c");
    group.addMutablePanel(new DOMRect(170, 0, 50, 50), "d");
    group.addDiv(new DOMRect(220, 0, 10, 50));

    expect(serialize(group)).toMatchInlineSnapshot(`
      "[
        {
          "panels": [
            "a",
            "b"
          ],
          "rect": "55,0 10 x 50"
        },
        {
          "panels": [
            "b",
            "c"
          ],
          "rect": "105,0 10 x 50"
        },
        {
          "panels": [
            "b",
            "c"
          ],
          "rect": "115,0 10 x 50"
        },
        {
          "panels": [
            "c",
            "d"
          ],
          "rect": "165,0 10 x 50"
        }
      ]"
    `);
  });

  test("CSS styles (e.g. padding and flex gap)", () => {
    const group = new MutableGroupForTest({ rect: new DOMRect(0, 0, 190, 70) });
    group.addMutablePanel(new DOMRect(10, 10, 50, 40), "left");
    group.addMutablePanel(new DOMRect(70, 10, 50, 40), "center");
    group.addMutablePanel(new DOMRect(130, 10, 50, 40), "right");

    expect(serialize(group)).toMatchInlineSnapshot(`
      "[
        {
          "panels": [
            "left",
            "center"
          ],
          "rect": "60,10 10 x 40"
        },
        {
          "panels": [
            "center",
            "right"
          ],
          "rect": "120,10 10 x 40"
        }
      ]"
    `);
  });

  test("out of order children (e.g. dynamic rendering)", () => {
    const group = new MutableGroupForTest({ rect: new DOMRect(0, 0, 150, 50) });
    group.addMutablePanel(new DOMRect(0, 0, 50, 50), "left");
    group.addMutablePanel(new DOMRect(100, 0, 50, 50), "right");

    // Simulate conditionally rendering a new middle panel
    group.addMutablePanel(new DOMRect(50, 0, 50, 50), "center");

    expect(serialize(group)).toMatchInlineSnapshot(`
      "[
        {
          "panels": [
            "left",
            "center"
          ],
          "rect": "45,0 10 x 50"
        },
        {
          "panels": [
            "center",
            "right"
          ],
          "rect": "95,0 10 x 50"
        }
      ]"
    `);
  });

  // Test covers conditionally rendered panels and separators
  test("should sort elements and separators by offset", () => {
    const group = new MutableGroupForTest({ rect: new DOMRect(0, 0, 270, 50) });
    group.addMutablePanel(new DOMRect(205, 0, 65, 50), "d");
    group.addMutablePanel(new DOMRect(70, 0, 65, 50), "b");
    group.addMutablePanel(new DOMRect(0, 0, 65, 50), "a");
    group.addMutablePanel(new DOMRect(135, 0, 65, 50), "c");
    group.addMutableSeparator(new DOMRect(200, 0, 5, 50), "right");
    group.addMutableSeparator(new DOMRect(65, 0, 5, 50), "left");

    expect(serialize(group)).toMatchInlineSnapshot(`
      "[
        {
          "panels": [
            "a",
            "b"
          ],
          "rect": "62.5,0 10 x 50",
          "separator": "left"
        },
        {
          "panels": [
            "b",
            "c"
          ],
          "rect": "130,0 10 x 50"
        },
        {
          "panels": [
            "c",
            "d"
          ],
          "rect": "197.5,0 10 x 50",
          "separator": "right"
        }
      ]"
    `);
  });
});
