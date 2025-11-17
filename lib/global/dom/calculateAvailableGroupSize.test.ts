import { describe, expect, test } from "vitest";
import { mockGroup } from "../test/mockGroup";
import { calculateAvailableGroupSize } from "./calculateAvailableGroupSize";

describe("calculateAvailableGroupSize", () => {
  test("panel widths", () => {
    const group = mockGroup(new DOMRect(0, 0, 100, 50), "horizontal");
    group.addChild("panel", new DOMRect(0, 0, 25, 50));
    group.addChild("panel", new DOMRect(0, 0, 75, 50));

    expect(calculateAvailableGroupSize({ group })).toBe(100);
  });

  test("panel widths, excluding resize handles", () => {
    const group = mockGroup(new DOMRect(0, 0, 100, 50), "horizontal");
    group.addChild("other", new DOMRect(0, 0, 10, 50));
    group.addChild("panel", new DOMRect(0, 0, 20, 50));
    group.addChild("panel", new DOMRect(0, 0, 30, 50));
    group.addChild("other", new DOMRect(0, 0, 10, 50));

    expect(calculateAvailableGroupSize({ group })).toBe(50);
  });

  test("panel widths, excluding other DOM elements", () => {
    const group = mockGroup(new DOMRect(0, 0, 100, 50), "horizontal");
    group.addChild("panel", new DOMRect(0, 0, 49, 50));
    group.addChild("resize-handle", new DOMRect(0, 0, 2, 50));
    group.addChild("panel", new DOMRect(0, 0, 49, 50));

    expect(calculateAvailableGroupSize({ group })).toBe(98);
  });

  test("panel widths, excluding flex padding, gap, or margins", () => {
    const group = mockGroup(new DOMRect(0, 0, 100, 50), "horizontal");
    group.addChild("panel", new DOMRect(0, 0, 45, 50));
    group.addChild("panel", new DOMRect(0, 0, 45, 50));

    expect(calculateAvailableGroupSize({ group })).toBe(90);
  });
});
