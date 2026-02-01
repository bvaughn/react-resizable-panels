import { renderHook as renderHookExternal } from "@testing-library/react";
import { createElement, createRef } from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { MutableGroupForTest } from "../../../state/tests/MutableGroupForTest";
import { MutablePanelForTest } from "../../../state/tests/MutablePanelForTest";
import { setDefaultElementBounds } from "../../../utils/test/mockBoundingClientRect";
import { simulateUnsupportedEnvironmentForTest } from "../../../utils/test/mockResizeObserver";
import { GroupContext } from "../../group/GroupContext";
import { useMutablePanel } from "./useMutablePanel";

type Params = Parameters<typeof useMutablePanel>[0];

describe("useMutablePanel", () => {
  let group: MutableGroupForTest;

  function renderHook(initial: Partial<Params> = {}) {
    const elementRef = createRef<HTMLDivElement | null>();
    elementRef.current = document.createElement("div");

    return renderHookExternal(
      (updated: Partial<Params>) =>
        useMutablePanel({
          collapsedSize: undefined,
          collapsible: undefined,
          elementRef,
          defaultSize: undefined,
          id: undefined,
          maxSize: undefined,
          minSize: undefined,
          onResize: undefined,
          ...initial,
          ...updated
        }),
      {
        wrapper: ({ children }) =>
          createElement(
            GroupContext.Provider,
            {
              value: group
            },
            children
          )
      }
    );
  }

  beforeEach(() => {
    group = new MutableGroupForTest();
    group.mockGroupHTMLElementInterface.resizeForTest({
      width: 100,
      height: 50
    });
  });

  test("throws if rendered outside of a Group", () => {
    expect(() =>
      renderHookExternal(() =>
        useMutablePanel({
          collapsedSize: undefined,
          collapsible: undefined,
          elementRef: createRef<HTMLDivElement | null>(),
          defaultSize: undefined,
          id: undefined,
          maxSize: undefined,
          minSize: undefined,
          onResize: undefined
        })
      )
    ).toThrow(
      "Group Context not found; did you render a Panel or Separator outside of a Group?"
    );
  });

  test("should recreate mutable Panel when id or (parent) Group change", () => {
    const { rerender, result } = renderHook({
      id: "one"
    });

    let panel = result.current.panel;

    rerender({
      id: "two"
    });
    expect(panel).not.toBe(result.current.panel);
    panel = result.current.panel;

    group = new MutableGroupForTest({ id: "group-two" });

    rerender({
      id: "two"
    });

    expect(panel).not.toBe(result.current.panel);
  });

  test("should not recreate mutable Panel if defaultSize changes", () => {
    const { rerender, result } = renderHook({
      defaultSize: 25
    });

    const panel = result.current.panel;

    rerender({
      defaultSize: 50
    });

    expect(panel).toBe(result.current.panel);
  });

  test("should update mutable Panel if constraints props change", () => {
    const { rerender, result } = renderHook({
      collapsedSize: 0,
      collapsible: false,
      maxSize: 100,
      minSize: 0
    });

    let panel = result.current.panel;

    rerender({
      collapsedSize: 0,
      collapsible: false,
      maxSize: 100,
      minSize: 10
    });

    expect(panel).toBe(result.current.panel);
    expect(panel.minSize).toBe(10);

    panel = result.current.panel;

    rerender({
      collapsedSize: 0,
      collapsible: true,
      maxSize: 100,
      minSize: 10
    });

    expect(panel).toBe(result.current.panel);
    expect(panel.collapsible).toBe(true);

    panel = result.current.panel;

    rerender({
      collapsedSize: 5,
      collapsible: true,
      maxSize: 100,
      minSize: 10
    });

    expect(panel).toBe(result.current.panel);
    expect(panel.collapsedSize).toBe(5);

    panel = result.current.panel;

    rerender({
      collapsedSize: 5,
      collapsible: true,
      maxSize: 50,
      minSize: 10
    });

    expect(panel).toBe(result.current.panel);
    expect(panel.maxSize).toBe(50);
  });

  test("should stabilize unstable callback refs", () => {
    const onResizeStableA = vi.fn();

    setDefaultElementBounds(new DOMRect(0, 0, 50, 50));

    const { rerender, result } = renderHook({
      onResize: onResizeStableA
    });

    group.flushPendingValidation();

    const panel = result.current.panel;

    const onResizeStableB = vi.fn();

    rerender({
      onResize: onResizeStableB
    });

    expect(panel).toBe(result.current.panel);

    setDefaultElementBounds(new DOMRect(0, 0, 55, 50));

    expect(onResizeStableA).toHaveBeenCalledTimes(0);
    expect(onResizeStableB).toHaveBeenCalledTimes(1);
  });

  test("should not invoke ResizeObserver if no user resize handler is provided", () => {
    simulateUnsupportedEnvironmentForTest();

    renderHook({
      onResize: undefined
    });
  });

  test("should schedule a re-render when the Panel styles changes", () => {
    const { result } = renderHook({
      id: "left"
    });

    const removePanels = group.addPanels(
      new MutablePanelForTest({
        id: "right",
        group
      })
    );
    group.flushPendingValidation();

    const panel = result.current.panel;

    expect(panel.style).toMatchInlineSnapshot(`
      {
        "flexGrow": 50,
      }
    `);

    group
      .startLayoutTransaction()
      .proposedUpdate({
        left: 35,
        right: 65
      })
      .endTransaction();

    expect(panel.style).toMatchInlineSnapshot(`
      {
        "flexGrow": 35,
      }
    `);

    removePanels();
  });
});
