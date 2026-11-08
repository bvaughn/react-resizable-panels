import { afterEach, describe, expect, test } from "vitest";
import { getDefaultFloatingRect } from "./getDefaultFloatingRect";

// jsdom doesn't lay elements out, so their measurements are specified
function createElement(
  rect: { height: number; left: number; top: number; width: number },
  attributes: { [name: string]: string } = {}
) {
  const element = document.createElement("div");
  for (const [name, value] of Object.entries(attributes)) {
    element.setAttribute(name, value);
  }
  Object.defineProperty(element, "offsetHeight", { value: rect.height });
  Object.defineProperty(element, "offsetWidth", { value: rect.width });
  element.getBoundingClientRect = () =>
    new DOMRect(rect.left, rect.top, rect.width, rect.height);

  return element;
}

describe("getDefaultFloatingRect", () => {
  let layout: HTMLElement;

  afterEach(() => {
    layout = undefined as unknown as HTMLElement;
  });

  function setup() {
    layout = createElement({ height: 400, left: 10, top: 20, width: 800 });
  }

  test("uses a default size, offset from the corner, without elements to measure", () => {
    expect(getDefaultFloatingRect(null, null)).toEqual({
      height: 240,
      width: 320,
      x: 24,
      y: 24
    });
  });

  test("uses the size of the tabset, offset from its position", () => {
    setup();
    const tabset = createElement({
      height: 200,
      left: 110,
      top: 70,
      width: 300
    });

    expect(getDefaultFloatingRect(layout, tabset)).toEqual({
      height: 200,
      width: 300,
      x: 124,
      y: 74
    });
  });

  test("moves the position to fit within the layout", () => {
    setup();
    const tabset = createElement({
      height: 200,
      left: 550,
      top: 200,
      width: 300
    });

    expect(getDefaultFloatingRect(layout, tabset)).toEqual({
      height: 200,
      width: 300,
      x: 500,
      y: 200
    });
  });

  test("respects the parts of the rect that are specified", () => {
    setup();
    const tabset = createElement({
      height: 200,
      left: 110,
      top: 70,
      width: 300
    });

    expect(getDefaultFloatingRect(layout, tabset, { width: 500 })).toEqual({
      height: 200,
      width: 500,
      x: 124,
      y: 74
    });
    // The size that is specified is used to fit the position
    expect(getDefaultFloatingRect(layout, tabset, { width: 700 }).x).toBe(100);
    expect(getDefaultFloatingRect(layout, tabset, { x: 5 })).toEqual({
      height: 200,
      width: 300,
      x: 5,
      y: 74
    });
  });

  test("doesn't use the size of a collapsed tabset", () => {
    setup();
    const tabset = createElement(
      { height: 28, left: 110, top: 70, width: 300 },
      { "data-tabset-collapsed": "" }
    );

    expect(getDefaultFloatingRect(layout, tabset)).toEqual({
      height: 240,
      width: 320,
      x: 124,
      y: 74
    });
  });
});
