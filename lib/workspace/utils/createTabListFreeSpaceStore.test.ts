import { describe, expect, test, vi } from "vitest";
import { createTabListFreeSpaceStore } from "./createTabListFreeSpaceStore";

describe("createTabListFreeSpaceStore", () => {
  test("notifies a tabset's subscribers when its free space changes", () => {
    const store = createTabListFreeSpaceStore();
    const listener = vi.fn();
    const otherListener = vi.fn();
    store.subscribe("a", listener);
    store.subscribe("b", otherListener);

    // Setting the same value again doesn't notify subscribers
    for (let index = 0; index < 2; index++) {
      store.set("a", 100);
    }
    expect(store.get("a")).toBe(100);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenLastCalledWith(100);

    store.set("a", -20);
    expect(listener).toHaveBeenLastCalledWith(-20);
    expect(otherListener).not.toHaveBeenCalled();
  });

  test("clears a tabset's free space once its tab list is removed (unless another one is rendered)", async () => {
    const store = createTabListFreeSpaceStore();
    const listener = vi.fn();
    store.subscribe("a", listener);

    // A tab list moves (e.g. to the maximized overlay): it's removed and rendered again in the same commit
    const release = store.retain("a");
    store.set("a", 100);
    release();
    const releaseMoved = store.retain("a");
    await Promise.resolve();
    expect(store.get("a")).toBe(100);
    expect(listener).toHaveBeenCalledTimes(1);

    releaseMoved();
    expect(store.get("a")).toBe(100);
    await Promise.resolve();
    expect(store.get("a")).toBeUndefined();
    expect(listener).toHaveBeenLastCalledWith(undefined);
  });

  test("stops notifying unsubscribed listeners", () => {
    const store = createTabListFreeSpaceStore();
    const listener = vi.fn();
    const unsubscribe = store.subscribe("a", listener);

    unsubscribe();
    store.set("a", 100);
    expect(listener).not.toHaveBeenCalled();
  });

  test("accepts tabset ids that are properties of plain objects", () => {
    for (const tabsetId of [
      "__proto__",
      "constructor",
      "hasOwnProperty",
      "toString"
    ]) {
      const store = createTabListFreeSpaceStore();
      const listener = vi.fn();
      store.subscribe(tabsetId, listener);

      store.set(tabsetId, 100);
      expect(store.get(tabsetId)).toBe(100);
      expect(listener).toHaveBeenCalledWith(100);
    }
  });

  test("calls every listener even if one throws", () => {
    const store = createTabListFreeSpaceStore();
    const listener = vi.fn();
    store.subscribe("a", () => {
      throw Error("listener error");
    });
    store.subscribe("a", listener);

    expect(() => store.set("a", 100)).toThrow("listener error");
    expect(listener).toHaveBeenCalledWith(100);
  });
});
