// @vitest-environment jsdom

import { describe, expect, test } from "vitest";
import { mockGroup } from "../test/mockGroup";
import { calculateAvailableAxisSize } from "./calculateAvailableAxisSize";

describe("calculateAvailableAxisSize", () => {
  test("panel widths", () => {
    const group = mockGroup(new DOMRect(0, 0, 100, 50), {
      orientation: "horizontal"
    });
    group.addPanel(new DOMRect(0, 0, 25, 50));
    group.addPanel(new DOMRect(0, 0, 75, 50));

    expect(calculateAvailableAxisSize({ axis: group })).toBe(100);
  });

  test("panel widths, excluding separators", () => {
    const group = mockGroup(new DOMRect(0, 0, 100, 50), {
      orientation: "horizontal"
    });
    group.addHTMLElement(new DOMRect(0, 0, 10, 50));
    group.addPanel(new DOMRect(0, 0, 20, 50));
    group.addPanel(new DOMRect(0, 0, 30, 50));
    group.addHTMLElement(new DOMRect(0, 0, 10, 50));

    expect(calculateAvailableAxisSize({ axis: group })).toBe(50);
  });

  test("panel widths, excluding other DOM elements", () => {
    const group = mockGroup(new DOMRect(0, 0, 100, 50), {
      orientation: "horizontal"
    });
    group.addPanel(new DOMRect(0, 0, 49, 50));
    group.addSeparator(new DOMRect(0, 0, 2, 50));
    group.addPanel(new DOMRect(0, 0, 49, 50));

    expect(calculateAvailableAxisSize({ axis: group })).toBe(98);
  });

  test("panel widths, excluding flex padding, gap, or margins", () => {
    const group = mockGroup(new DOMRect(0, 0, 100, 50), {
      orientation: "horizontal"
    });
    group.addPanel(new DOMRect(0, 0, 45, 50));
    group.addPanel(new DOMRect(0, 0, 45, 50));

    expect(calculateAvailableAxisSize({ axis: group })).toBe(90);
  });

  test("scales up items whose flex-grow values add up to less than 1", () => {
    const group = mockGroup(new DOMRect(0, 0, 100, 50), {
      orientation: "horizontal"
    });
    group.addPanel(new DOMRect(0, 0, 33, 50));
    group.addPanel(new DOMRect(0, 0, 33, 50));
    group.items.forEach((item) => {
      item.element.style.flexGrow = "0.33";
      item.element.style.flexBasis = "0px";
    });

    expect(calculateAvailableAxisSize({ axis: group })).toBeCloseTo(100, 0);
  });

  test("does not scale items that have a flex-basis", () => {
    const group = mockGroup(new DOMRect(0, 0, 100, 50), {
      orientation: "horizontal"
    });
    group.addPanel(new DOMRect(0, 0, 20, 50));
    group.addPanel(new DOMRect(0, 0, 30, 50));
    group.items[0].element.style.flexGrow = "0.5";
    group.items[0].element.style.flexBasis = "0px";
    group.items[1].element.style.flexBasis = "30px";

    expect(calculateAvailableAxisSize({ axis: group })).toBe(50);
  });
});
