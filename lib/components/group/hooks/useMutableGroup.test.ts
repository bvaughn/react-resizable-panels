import { act, renderHook as renderHookExternal } from "@testing-library/react";
import { createRef } from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { MutablePanelForTest } from "../../../state/tests/MutablePanelForTest";
import { setDefaultElementBounds } from "../../../utils/test/mockBoundingClientRect";
import { useMutableGroup } from "./useMutableGroup";

type Params = Parameters<typeof useMutableGroup>[0];

describe("useMutableGroup", () => {
  function renderHook(initial: Partial<Params> = {}) {
    const elementRef = createRef<HTMLDivElement | null>();
    elementRef.current = document.createElement("div");

    return renderHookExternal((updated: Partial<Params>) =>
      useMutableGroup({
        defaultLayout: undefined,
        disableCursor: false,
        disabled: false,
        elementRef,
        id: "group",
        onLayoutChange: undefined,
        onLayoutChanged: undefined,
        orientation: "horizontal",
        resizeTargetMinimumSize: {
          coarse: 20,
          fine: 10
        },
        ...initial,
        ...updated
      })
    );
  }

  beforeEach(() => {
    setDefaultElementBounds(new DOMRect(0, 0, 100, 50));
  });

  test("should recreate mutable Group when id or orientation change", () => {
    const { rerender, result } = renderHook({
      id: "one",
      orientation: "horizontal"
    });
    let group = result.current.group;

    rerender({
      id: "two",
      orientation: "horizontal"
    });
    expect(group).not.toBe(result.current.group);
    group = result.current.group;

    rerender({
      id: "two",
      orientation: "vertical"
    });

    expect(group).not.toBe(result.current.group);
  });

  test("should not recreate mutable Group if defaultLayout changes", () => {
    const { rerender, result } = renderHook({
      defaultLayout: { left: 25, right: 75 }
    });

    const group = result.current.group;

    rerender({
      defaultLayout: { left: 35, right: 65 }
    });

    expect(group).toBe(result.current.group);
  });

  test("should update mutable Group if disabled or disableCursor props changes", () => {
    const { rerender, result } = renderHook({
      disableCursor: false,
      disabled: false
    });

    let group = result.current.group;

    rerender({
      disableCursor: false,
      disabled: true
    });

    expect(group).toBe(result.current.group);
    expect(group.disableCursor).toBe(false);
    expect(group.disabled).toBe(true);

    group = result.current.group;

    rerender({
      disableCursor: true,
      disabled: true
    });

    expect(group).toBe(result.current.group);
    expect(group.disableCursor).toBe(true);
    expect(group.disabled).toBe(true);
  });

  test("should stabilize unstable callback refs", () => {
    const onLayoutChangeA = vi.fn();
    const onLayoutChangedA = vi.fn();

    const { rerender, result } = renderHook({
      onLayoutChange: onLayoutChangeA,
      onLayoutChanged: onLayoutChangedA
    });

    const group = result.current.group;

    const onLayoutChangeB = vi.fn();
    const onLayoutChangedB = vi.fn();

    rerender({
      onLayoutChange: onLayoutChangeB,
      onLayoutChanged: onLayoutChangedB
    });

    expect(group).toBe(result.current.group);

    group.addPanels(
      new MutablePanelForTest({
        group,
        id: "left"
      }),
      new MutablePanelForTest({
        group,
        id: "right"
      })
    );
    group.flushPendingValidation();

    expect(onLayoutChangeA).toHaveBeenCalledTimes(0);
    expect(onLayoutChangedA).toHaveBeenCalledTimes(0);
    expect(onLayoutChangeB).toHaveBeenCalledTimes(1);
    expect(onLayoutChangedB).toHaveBeenCalledTimes(1);
  });

  test("should schedule a re-render when the Group layout changes", () => {
    const { result } = renderHook();

    const group = result.current.group;
    group.addPanels(
      new MutablePanelForTest({
        group,
        id: "left"
      }),
      new MutablePanelForTest({
        group,
        id: "right"
      })
    );
    group.flushPendingValidation();

    expect(group.layout).toMatchInlineSnapshot(`
      {
        "left": 50,
        "right": 50,
      }
    `);

    group
      .startLayoutTransaction()
      .proposedUpdate({
        left: 35,
        right: 65
      })
      .endTransaction();

    expect(group.layout).toMatchInlineSnapshot(`
      {
        "left": 35,
        "right": 65,
      }
    `);
  });

  test("should notify the mutable Group when the DOM element resizes", () => {
    setDefaultElementBounds(new DOMRect(0, 0, 75, 50));

    const { result } = renderHook();

    const group = result.current.group;
    expect(group.groupSize).toBe(75);

    act(() => {
      setDefaultElementBounds(new DOMRect(0, 0, 100, 50));
    });

    expect(group.groupSize).toBe(100);
  });
});
