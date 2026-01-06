import { afterEach, describe, expect, test, vi } from "vitest";

const emptySeparatorMap = new Map();

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("layoutSmoothing", () => {
  test("getNextGroupLayoutState respects smoothing settings", async () => {
    vi.resetModules();

    const { getNextGroupLayoutState } = await import("./layoutSmoothing");
    const { mockGroup } = await import("../test/mockGroup");

    const group = mockGroup(new DOMRect(0, 0, 100, 50), "horizontal", "A");
    group.resizeSmoothing = 0;

    const current = {
      defaultLayoutDeferred: false,
      derivedPanelConstraints: [],
      layout: { a: 50, b: 50 },
      layoutTarget: { a: 50, b: 50 },
      separatorToPanels: emptySeparatorMap
    };

    const { next, shouldSchedule, didChange } = getNextGroupLayoutState({
      group,
      current,
      layoutTarget: { a: 25, b: 75 }
    });

    expect(next.layout).toEqual({ a: 25, b: 75 });
    expect(next.layoutTarget).toEqual({ a: 25, b: 75 });
    expect(shouldSchedule).toBe(false);
    expect(didChange).toBe(true);
  });

  test("scheduleLayoutSmoothing eases toward the target layout", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      return setTimeout(() => callback(0), 0) as unknown as number;
    });
    vi.resetModules();

    const { scheduleLayoutSmoothing } = await import("./layoutSmoothing");
    const { update, read } = await import("../mutableState");
    const { mockGroup } = await import("../test/mockGroup");

    const group = mockGroup(new DOMRect(0, 0, 100, 50), "horizontal", "A");
    group.resizeSmoothing = 0.5;

    update({
      mountedGroups: new Map([
        [
          group,
          {
            defaultLayoutDeferred: false,
            derivedPanelConstraints: [],
            layout: { a: 0, b: 100 },
            layoutTarget: { a: 100, b: 0 },
            separatorToPanels: emptySeparatorMap
          }
        ]
      ])
    });

    scheduleLayoutSmoothing();
    vi.runOnlyPendingTimers();

    expect(read().mountedGroups.get(group)?.layout).toEqual({ a: 50, b: 50 });

    vi.runAllTimers();

    expect(read().mountedGroups.get(group)?.layout).toEqual({ a: 100, b: 0 });

    update({ mountedGroups: new Map() });
  });
});
