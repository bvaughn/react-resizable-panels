import { describe, expect, test } from "vitest";
import { measureTabListOverflow } from "./measureTabListOverflow";

type Box = { size: number; start: number };

// jsdom doesn't lay out elements, so the list's and tabs' positions (along the list) are mocked
function layOut(
  element: HTMLElement,
  { size, start }: Box,
  {
    border = 0,
    isVertical = false,
    scale = 1
  }: { border?: number; isVertical?: boolean; scale?: number } = {}
) {
  const rect = isVertical
    ? new DOMRect(0, start, 30, size)
    : new DOMRect(start, 0, size, 30);
  const layoutSize = Math.round(size / scale);
  Object.assign(element, {
    getBoundingClientRect: () => rect,
    getClientRects: () => [rect]
  });
  Object.defineProperty(element, isVertical ? "offsetHeight" : "offsetWidth", {
    value: layoutSize
  });
  if (border) {
    element.style.border = `${border}px solid`;
  }
}

function createTabList(
  list: Box,
  tabs: Box[],
  options?: Parameters<typeof layOut>[2]
) {
  const element = document.createElement("div");
  element.setAttribute("data-tab-list", "");
  element.dataset.orientation = options?.isVertical ? "vertical" : "horizontal";
  layOut(element, list, options);

  tabs.forEach((box, index) => {
    const tab = document.createElement("div");
    tab.setAttribute("data-tab", "");
    tab.dataset.tabId = String(index);
    layOut(tab, box, options);
    element.appendChild(tab);
  });

  return element;
}

describe("measureTabListOverflow", () => {
  test("reports tabs scrolled out of view, and tabs cut off by the edges of the list", () => {
    // A 200px list, scrolled so that tab 1 is cut off at the start and tab 4 at the end
    const element = createTabList({ size: 200, start: 100 }, [
      { size: 50, start: 20 },
      { size: 50, start: 70 },
      { size: 50, start: 120 },
      { size: 50, start: 170 },
      { size: 50, start: 270 },
      { size: 50, start: 320 }
    ]);

    expect(measureTabListOverflow(element)).toEqual({
      hiddenOrClipped: ["0", "1", "4", "5"],
      hidden: ["0", "5"]
    });
  });

  test("doesn't report tabs within a pixel of the edges of the list", () => {
    const element = createTabList({ size: 100, start: 0 }, [
      { size: 50.5, start: -0.5 },
      { size: 50.5, start: 50 },
      { size: 50, start: 99.5 }
    ]);

    expect(measureTabListOverflow(element)).toEqual({
      hiddenOrClipped: ["2"],
      hidden: ["2"]
    });
  });

  test("measures within the list's border", () => {
    // The border covers the first and last 5px of the list
    const element = createTabList(
      { size: 110, start: 0 },
      [
        { size: 50, start: 5 },
        { size: 50, start: 55 },
        { size: 10, start: 103 }
      ],
      { border: 5 }
    );

    expect(measureTabListOverflow(element)).toEqual({
      hiddenOrClipped: ["2"],
      hidden: []
    });
  });

  test("measures tabs placed on the left or right along the list's height", () => {
    const element = createTabList(
      { size: 100, start: 0 },
      [
        { size: 60, start: 0 },
        { size: 60, start: 60 },
        { size: 60, start: 120 }
      ],
      { isVertical: true }
    );

    expect(measureTabListOverflow(element)).toEqual({
      hiddenOrClipped: ["1", "2"],
      hidden: ["2"]
    });
  });

  test("measures within a scaled ancestor", () => {
    // A 100px list shown at twice its size; its border is 5 layout pixels (10 on screen)
    const element = createTabList(
      { size: 200, start: 0 },
      [
        { size: 100, start: 10 },
        { size: 100, start: 110 }
      ],
      { border: 5, scale: 2 }
    );

    expect(measureTabListOverflow(element)).toEqual({
      hiddenOrClipped: ["1"],
      hidden: []
    });
  });

  test("reports every tab of a list that has no size", () => {
    const element = createTabList({ size: 0, start: 0 }, [
      { size: 50, start: 0 },
      { size: 50, start: 50 },
      { size: 50, start: 100 }
    ]);
    // Tabs that aren't rendered still aren't reported
    Object.assign(element.children[2]!, { getClientRects: () => [] });

    expect(measureTabListOverflow(element)).toEqual({
      hiddenOrClipped: ["0", "1"],
      hidden: ["0", "1"]
    });
  });

  test("doesn't report tabs that aren't rendered, or tabs of a list that isn't rendered", () => {
    const element = createTabList({ size: 100, start: 0 }, [
      { size: 50, start: 0 },
      { size: 50, start: 200 }
    ]);
    Object.assign(element.children[1]!, { getClientRects: () => [] });
    expect(measureTabListOverflow(element)).toEqual({
      hiddenOrClipped: [],
      hidden: []
    });

    Object.assign(element, { getClientRects: () => [] });
    Object.assign(element.children[1]!, {
      getClientRects: () => [new DOMRect()]
    });
    expect(measureTabListOverflow(element)).toEqual({
      hiddenOrClipped: [],
      hidden: []
    });
  });

  test("finds tabs wrapped in other elements (e.g. by renderTab), but not tabs of another list", () => {
    const element = createTabList({ size: 100, start: 0 }, [
      { size: 50, start: 0 },
      { size: 50, start: 150 }
    ]);
    const wrapper = document.createElement("span");
    element.appendChild(wrapper);
    wrapper.appendChild(element.children[1]!);

    const nestedList = createTabList({ size: 100, start: 0 }, [
      { size: 50, start: 300 }
    ]);
    nestedList.children[0]!.setAttribute("data-tab-id", "nested");
    element.appendChild(nestedList);

    expect(measureTabListOverflow(element)).toEqual({
      hiddenOrClipped: ["1"],
      hidden: ["1"]
    });
  });

  test("reuses the previous measurement's lists while they're the same", () => {
    const element = createTabList({ size: 100, start: 0 }, [
      { size: 50, start: 0 },
      { size: 50, start: 75 },
      { size: 50, start: 150 }
    ]);
    const prev = measureTabListOverflow(element);
    expect(prev).toEqual({ hidden: ["2"], hiddenOrClipped: ["1", "2"] });

    // Tab 1 is now fully visible, but tab 2 is still out of view
    Object.assign(element.children[1]!, {
      getBoundingClientRect: () => new DOMRect(50, 0, 50, 30)
    });
    const next = measureTabListOverflow(element, prev);
    expect(next.hidden).toBe(prev.hidden);
    expect(next.hiddenOrClipped).toEqual(["2"]);
  });
});
