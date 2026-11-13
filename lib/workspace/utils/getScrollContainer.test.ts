import { afterEach, describe, expect, test } from "vitest";
import { getScrollContainer } from "./getScrollContainer";

describe("getScrollContainer", () => {
  let container: HTMLElement | null = null;

  afterEach(() => {
    container?.remove();
    container = null;
  });

  // jsdom doesn't lay out elements, so scrollable sizes are defined
  function setup({
    overflowY = "auto",
    scrollHeight = 500
  }: { overflowY?: string; scrollHeight?: number } = {}) {
    container = document.createElement("div");
    container.innerHTML = `<div data-scroller style="overflow-y: ${overflowY}"><div data-element></div></div>`;
    document.body.appendChild(container);

    const scroller = container.querySelector<HTMLElement>("[data-scroller]")!;
    Object.defineProperty(scroller, "scrollHeight", { value: scrollHeight });
    Object.defineProperty(scroller, "offsetHeight", { value: 200 });

    return {
      element: container.querySelector<HTMLElement>("[data-element]")!,
      scroller
    };
  }

  test("returns the nearest ancestor that scrolls", () => {
    const { element, scroller } = setup();

    expect(getScrollContainer(element, "vertical")).toBe(scroller);
  });

  test("ignores ancestors with nothing to scroll or that don't scroll", () => {
    expect(
      getScrollContainer(setup({ scrollHeight: 200 }).element, "vertical")
    ).toBe(document.scrollingElement);
    container?.remove();
    expect(
      getScrollContainer(setup({ overflowY: "hidden" }).element, "vertical")
    ).toBe(document.scrollingElement);
  });

  test("only considers overflow along the orientation", () => {
    const { element } = setup();

    expect(getScrollContainer(element, "horizontal")).toBe(
      document.scrollingElement
    );
  });
});
