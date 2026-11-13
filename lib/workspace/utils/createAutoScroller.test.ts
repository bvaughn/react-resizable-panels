import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { createAutoScroller } from "./createAutoScroller";

describe("createAutoScroller", () => {
  let container: HTMLElement;
  let frames: Array<() => void>;
  let scroller: HTMLElement;
  let element: HTMLElement;

  // Runs the next frame (if one was requested)
  const runFrame = () => frames.shift()?.();

  beforeEach(() => {
    frames = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      frames.push(() => callback(0));
      return frames.length;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {
      frames = [];
    });

    container = document.createElement("div");
    container.innerHTML = `<div data-scroller style="overflow-y: auto"><div data-element></div></div>`;
    document.body.appendChild(container);

    scroller = container.querySelector<HTMLElement>("[data-scroller]")!;
    element = container.querySelector<HTMLElement>("[data-element]")!;
    Object.defineProperty(scroller, "scrollHeight", { value: 1000 });
    Object.defineProperty(scroller, "offsetHeight", { value: 200 });
    scroller.getBoundingClientRect = () => new DOMRect(0, 100, 300, 200);

    // jsdom doesn't scroll; scrolling is limited to the end of the content
    scroller.scrollBy = ((options: ScrollToOptions) => {
      scroller.scrollTop = Math.max(
        0,
        Math.min(800, scroller.scrollTop + (options.top ?? 0))
      );
    }) as typeof scroller.scrollBy;
  });

  afterEach(() => {
    container.remove();
    vi.restoreAllMocks();
  });

  test("scrolls every frame while the pointer is near an edge", () => {
    const onScroll = vi.fn();
    const autoScroller = createAutoScroller(element, "vertical", onScroll);

    autoScroller.update(50, 290);
    expect(frames).toHaveLength(1);
    runFrame();
    expect(scroller.scrollTop).toBeGreaterThan(0);
    expect(onScroll).toHaveBeenCalledTimes(1);
    expect(frames).toHaveLength(1);

    runFrame();
    expect(onScroll).toHaveBeenCalledTimes(2);

    autoScroller.stop();
  });

  test("scrolls up near the start, faster closer to the edge", () => {
    const autoScroller = createAutoScroller(element, "vertical", vi.fn());
    scroller.scrollTop = 500;

    autoScroller.update(50, 130);
    runFrame();
    const slow = 500 - scroller.scrollTop;
    expect(slow).toBeGreaterThan(0);

    scroller.scrollTop = 500;
    autoScroller.update(50, 101);
    runFrame();
    expect(500 - scroller.scrollTop).toBeGreaterThan(slow);

    autoScroller.stop();
  });

  test("doesn't scroll away from the edges", () => {
    const autoScroller = createAutoScroller(element, "vertical", vi.fn());

    autoScroller.update(50, 200);
    expect(frames).toHaveLength(0);
  });

  test("stops requesting frames once the end is reached, until the pointer moves", () => {
    const onScroll = vi.fn();
    const autoScroller = createAutoScroller(element, "vertical", onScroll);
    scroller.scrollTop = 800;

    autoScroller.update(50, 295);
    runFrame();
    expect(onScroll).not.toHaveBeenCalled();
    expect(frames).toHaveLength(0);

    autoScroller.update(50, 296);
    expect(frames).toHaveLength(1);

    autoScroller.stop();
  });

  test("keeps requesting frames at the end, calling onBlocked instead of onScroll", () => {
    const onScroll = vi.fn();
    const onBlocked = vi.fn();
    const autoScroller = createAutoScroller(
      element,
      "vertical",
      onScroll,
      onBlocked
    );
    scroller.scrollTop = 800;

    autoScroller.update(50, 299);
    runFrame();
    expect(onScroll).not.toHaveBeenCalled();
    expect(onBlocked).toHaveBeenCalledTimes(1);
    expect(onBlocked.mock.calls[0]![0]).toBeGreaterThan(0);
    expect(frames).toHaveLength(1);

    runFrame();
    expect(onBlocked).toHaveBeenCalledTimes(2);

    autoScroller.stop();
    expect(frames).toHaveLength(0);
  });

  test("stop cancels the pending frame", () => {
    const onScroll = vi.fn();
    const autoScroller = createAutoScroller(element, "vertical", onScroll);

    autoScroller.update(50, 290);
    autoScroller.stop();
    runFrame();

    expect(onScroll).not.toHaveBeenCalled();
    expect(scroller.scrollTop).toBe(0);
  });

  test("scrolls at least a pixel per frame, instantly", () => {
    const scrollBy = vi.spyOn(scroller, "scrollBy");
    const autoScroller = createAutoScroller(element, "vertical", vi.fn());

    // Barely within the edge's distance: the speed is a fraction of a pixel
    autoScroller.update(50, 252.01);
    runFrame();

    expect(scrollBy).toHaveBeenCalledWith({ behavior: "instant", top: 1 });
    expect(scroller.scrollTop).toBe(1);

    autoScroller.stop();
  });
});
