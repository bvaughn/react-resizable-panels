import { describe, expect, test, vi } from "vitest";
import { scrollTabIntoView } from "./scrollTabIntoView";

// A list that's 100px long (on screen) starting at 0, and a tab at the given position (along the list)
function setUp(
  tab: { size: number; start: number },
  {
    isVertical = false,
    scale = 1
  }: { isVertical?: boolean; scale?: number } = {}
) {
  const list = document.createElement("div");
  list.dataset.orientation = isVertical ? "vertical" : "horizontal";
  const layoutSize = 100 / scale;
  Object.defineProperty(list, isVertical ? "offsetHeight" : "offsetWidth", {
    value: layoutSize
  });
  list.getBoundingClientRect = () =>
    isVertical ? new DOMRect(0, 0, 30, 100) : new DOMRect(0, 0, 100, 30);
  const scrollBy = vi.fn();
  list.scrollBy = scrollBy;

  const element = document.createElement("div");
  element.getBoundingClientRect = () =>
    isVertical
      ? new DOMRect(0, tab.start, 30, tab.size)
      : new DOMRect(tab.start, 0, tab.size, 30);

  return { element, list, scrollBy };
}

describe("scrollTabIntoView", () => {
  test("scrolls the least it can to show the whole tab", () => {
    let { element, list, scrollBy } = setUp({ size: 40, start: 90 });
    scrollTabIntoView(list, element);
    expect(scrollBy).toHaveBeenCalledWith({ left: 30 });

    ({ element, list, scrollBy } = setUp({ size: 40, start: -25 }));
    scrollTabIntoView(list, element);
    expect(scrollBy).toHaveBeenCalledWith({ left: -25 });
  });

  test("doesn't scroll if the tab is already visible", () => {
    const { element, list, scrollBy } = setUp({ size: 40, start: 60.5 });
    scrollTabIntoView(list, element);
    expect(scrollBy).not.toHaveBeenCalled();
  });

  test("shows the start of a tab that's longer than the list", () => {
    const { element, list, scrollBy } = setUp({ size: 150, start: 50 });
    scrollTabIntoView(list, element);
    expect(scrollBy).toHaveBeenCalledWith({ left: 50 });
  });

  test("scrolls tabs placed on the left or right vertically", () => {
    const { element, list, scrollBy } = setUp(
      { size: 40, start: 120 },
      { isVertical: true }
    );
    scrollTabIntoView(list, element);
    expect(scrollBy).toHaveBeenCalledWith({ top: 60 });
  });

  test("scrolls by layout pixels within a scaled ancestor", () => {
    const { element, list, scrollBy } = setUp(
      { size: 40, start: 90 },
      { scale: 2 }
    );
    scrollTabIntoView(list, element);
    expect(scrollBy).toHaveBeenCalledWith({ left: 15 });
  });
});
