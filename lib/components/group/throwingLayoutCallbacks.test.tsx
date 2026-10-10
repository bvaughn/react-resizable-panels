import { render } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { onDocumentPointerCancel } from "../../global/event-handlers/onDocumentPointerCancel";
import { onDocumentPointerDown } from "../../global/event-handlers/onDocumentPointerDown";
import { onDocumentPointerMove } from "../../global/event-handlers/onDocumentPointerMove";
import { onDocumentPointerUp } from "../../global/event-handlers/onDocumentPointerUp";
import { getMountedAxes } from "../../global/mutable-state/axes";
import {
  getInteractionState,
  updateInteractionState
} from "../../global/mutable-state/interactions";
import type { ResizePreviewMode } from "../../global/types";
import { setElementBoundsFunction } from "../../utils/test/mockBoundingClientRect";
import { Panel } from "../panel/Panel";
import { Separator } from "../separator/Separator";
import { Group } from "./Group";
import type { GroupImperativeHandle, Layout } from "./types";

// Layout change callbacks (e.g. onLayoutChange, onLayoutChanged) run synchronously while a drag is being ended
// An error thrown by one should not leave the drag stuck or prevent other groups from being updated
describe("layout change callbacks that throw", () => {
  afterEach(() => {
    updateInteractionState({
      state: "inactive",
      cursorFlags: 0
    });
  });

  // Groups overlap and share a separator position, so all of them are part of the same drag
  function setup(
    groups: {
      onLayoutChange?: (layout: Layout) => void;
      onLayoutChanged?: (layout: Layout) => void;
    }[],
    resizePreviewMode: ResizePreviewMode
  ) {
    setElementBoundsFunction((element) => {
      if (element.hasAttribute("data-group")) {
        return new DOMRect(0, 0, 200, 100);
      } else if (element.id.startsWith("left")) {
        return new DOMRect(0, 0, 100, 100);
      } else if (element.id.startsWith("separator")) {
        return new DOMRect(100, 0, 0, 100);
      } else if (element.id.startsWith("right")) {
        return new DOMRect(100, 0, 100, 100);
      }
    });

    const groupRefs = groups.map(() => createRef<GroupImperativeHandle>());

    render(
      <>
        {groups.map((callbacks, index) => (
          <Group
            groupRef={groupRefs[index]}
            key={index}
            {...callbacks}
            resizePreviewMode={resizePreviewMode}
          >
            <Panel id={`left-${index}`} />
            <Separator id={`separator-${index}`} />
            <Panel id={`right-${index}`} />
          </Group>
        ))}
      </>
    );

    // Returns a getter for the size of each group's left panel
    return groupRefs.map(
      (groupRef, index) => () => groupRef.current!.getLayout()[`left-${index}`]
    );
  }

  // Throws only for layouts produced by the drag (not the initial mount layout)
  function throwIfResized(layout: Layout) {
    if (Object.values(layout).some((size) => size !== 50)) {
      throw Error("Expected error");
    }
  }

  function pointerEvent(clientX: number, buttons = 1) {
    return {
      button: 0,
      buttons,
      clientX,
      clientY: 50,
      currentTarget: document,
      defaultPrevented: false,
      movementX: 10,
      movementY: 0,
      pointerId: 1,
      pointerType: "mouse",
      preventDefault: () => {}
    } as unknown as PointerEvent;
  }

  function startDrag() {
    onDocumentPointerDown(pointerEvent(100));
    onDocumentPointerMove(pointerEvent(140));
    expect(getInteractionState().state).toBe("active");
  }

  const endings: [string, () => void][] = [
    ["pointerup", () => onDocumentPointerUp(pointerEvent(140, 0))],
    // The same pointer can't be pressed twice, so its release was missed
    [
      "pointerdown (missed pointerup)",
      () => onDocumentPointerDown(pointerEvent(140))
    ],
    [
      "pointercancel",
      () =>
        onDocumentPointerCancel({
          currentTarget: document
        } as unknown as PointerEvent)
    ]
  ];

  for (const [name, endDrag] of endings) {
    // Separator mode is the only mode that commits a layout before the drag ends
    test(`${name} ends the drag if onLayoutChange throws while committing (resizePreviewMode=separator)`, () => {
      const [getLeftSize] = setup(
        [{ onLayoutChange: throwIfResized }],
        "separator"
      );

      startDrag();
      expect(getLeftSize()).toBe(50);

      expect(endDrag).toThrow("Expected error");

      expect(getInteractionState().state).toBe("inactive");
      expect(getLeftSize()).toBe(70);

      // Later pointer movement should not continue resizing
      onDocumentPointerMove(pointerEvent(180));
      expect(getLeftSize()).toBe(70);
    });

    for (const resizePreviewMode of ["panel", "separator"] as const) {
      test(`${name} notifies every group if onLayoutChanged throws (resizePreviewMode=${resizePreviewMode})`, () => {
        const onLayoutChangedA = vi.fn(throwIfResized);
        const onLayoutChangedB = vi.fn();
        const [getLeftSizeA, getLeftSizeB] = setup(
          [
            { onLayoutChanged: onLayoutChangedA },
            { onLayoutChanged: onLayoutChangedB }
          ],
          resizePreviewMode
        );
        onLayoutChangedA.mockClear();
        onLayoutChangedB.mockClear();

        startDrag();
        expect(endDrag).toThrow("Expected error");

        expect(getInteractionState().state).toBe("inactive");
        expect(onLayoutChangedA).toHaveBeenCalledOnce();
        expect(onLayoutChangedB).toHaveBeenCalledOnce();
        expect(getLeftSizeA()).toBe(70);
        expect(getLeftSizeB()).toBe(70);
      });
    }
  }

  // During a drag, onLayoutChange is called before the drag ends (and is memoized after that)
  // so this is only reachable by updates that call both handlers at once (e.g. the imperative API)
  test("onLayoutChanged is still called if onLayoutChange throws", () => {
    const onLayoutChanged = vi.fn();
    const groupRef = createRef<GroupImperativeHandle>();

    setElementBoundsFunction((element) => {
      if (element.hasAttribute("data-group")) {
        return new DOMRect(0, 0, 200, 100);
      } else if (element.id === "left") {
        return new DOMRect(0, 0, 100, 100);
      } else if (element.id === "right") {
        return new DOMRect(100, 0, 100, 100);
      }
    });

    render(
      <Group
        groupRef={groupRef}
        onLayoutChange={throwIfResized}
        onLayoutChanged={onLayoutChanged}
      >
        <Panel id="left" />
        <Panel id="right" />
      </Group>
    );
    onLayoutChanged.mockClear();

    expect(() => groupRef.current!.setLayout({ left: 70, right: 30 })).toThrow(
      "Expected error"
    );

    expect(onLayoutChanged).toHaveBeenCalledOnce();
    expect(onLayoutChanged.mock.calls[0][0]).toEqual({ left: 70, right: 30 });
  });

  test("pointerup is prevented if a layout change callback throws", () => {
    setup([{ onLayoutChanged: throwIfResized }], "panel");

    startDrag();

    const preventDefault = vi.fn();
    expect(() =>
      onDocumentPointerUp(
        Object.assign(pointerEvent(140, 0), { preventDefault })
      )
    ).toThrow("Expected error");

    expect(preventDefault).toHaveBeenCalled();
  });

  test("pointermove resizes every group if onLayoutChange throws (resizePreviewMode=panel)", () => {
    const [getLeftSizeA, getLeftSizeB] = setup(
      [{ onLayoutChange: throwIfResized }, {}],
      "panel"
    );

    onDocumentPointerDown(pointerEvent(100));
    expect(() => onDocumentPointerMove(pointerEvent(140))).toThrow(
      "Expected error"
    );

    expect(getInteractionState().state).toBe("active");
    expect(getLeftSizeA()).toBe(70);
    expect(getLeftSizeB()).toBe(70);
  });

  test("a group is unmounted if onLayoutChange throws during mount", () => {
    const onLayoutChanged = vi.fn();

    setElementBoundsFunction((element) => {
      if (element.hasAttribute("data-group")) {
        return new DOMRect(0, 0, 200, 100);
      } else if (element.id === "left") {
        return new DOMRect(0, 0, 100, 100);
      } else if (element.id === "right") {
        return new DOMRect(100, 0, 100, 100);
      }
    });

    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    try {
      expect(() =>
        render(
          <Group
            onLayoutChange={() => {
              throw Error("Expected error");
            }}
            onLayoutChanged={onLayoutChanged}
          >
            <Panel id="left" />
            <Panel id="right" />
          </Group>
        )
      ).toThrow("Expected error");
    } finally {
      consoleError.mockRestore();
    }

    expect(onLayoutChanged).toHaveBeenCalled();
    expect(getMountedAxes().size).toBe(0);
  });

  test("every panel is notified of a resize if an onResize callback throws", () => {
    setElementBoundsFunction((element) => {
      if (element.hasAttribute("data-group")) {
        return new DOMRect(0, 0, 200, 100);
      } else if (element.id === "left") {
        return new DOMRect(0, 0, 100, 100);
      } else if (element.id === "right") {
        return new DOMRect(100, 0, 100, 100);
      }
    });

    const onResizeLeft = vi.fn();
    const onResizeRight = vi.fn();

    render(
      <Group>
        <Panel id="left" onResize={onResizeLeft} />
        <Panel id="right" onResize={onResizeRight} />
      </Group>
    );

    onResizeLeft.mockImplementation(() => {
      throw Error("Expected error");
    });
    onResizeLeft.mockClear();
    onResizeRight.mockClear();

    expect(() =>
      setElementBoundsFunction((element) => {
        if (element.hasAttribute("data-group")) {
          return new DOMRect(0, 0, 400, 100);
        } else if (element.id === "left") {
          return new DOMRect(0, 0, 200, 100);
        } else if (element.id === "right") {
          return new DOMRect(200, 0, 200, 100);
        }
      })
    ).toThrow("Expected error");

    expect(onResizeLeft).toHaveBeenCalled();
    expect(onResizeRight).toHaveBeenCalled();
  });

  // Panel sizes can't be calculated as percentages if the group has a size of 0
  // (This could indicate that it's within a hidden subtree)
  test("panels are not notified of a resize in the same batch as a group with a size of 0", () => {
    setElementBoundsFunction((element) => {
      if (element.hasAttribute("data-group")) {
        return new DOMRect(0, 0, 200, 100);
      } else if (element.id === "left") {
        return new DOMRect(0, 0, 100, 100);
      } else if (element.id === "right") {
        return new DOMRect(100, 0, 100, 100);
      }
    });

    const onResize = vi.fn();

    render(
      <Group>
        <Panel id="left" onResize={onResize} />
        <Panel id="right" />
      </Group>
    );
    onResize.mockClear();

    // The group is observed before its panels, so its entry comes first in the batch
    // (A group's size is the sum of its panel sizes)
    setElementBoundsFunction(() => new DOMRect(0, 0, 0, 0));

    expect(onResize).not.toHaveBeenCalled();
  });
});
