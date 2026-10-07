import { afterEach, describe, expect, test } from "vitest";
import { calculateHitRegions } from "../dom/calculateHitRegions";
import { onDocumentPointerMove } from "../event-handlers/onDocumentPointerMove";
import { mountAxis } from "../mountAxis";
import { getMountedAxes, getMountedAxisState } from "../mutable-state/axes";
import {
  getInteractionState,
  updateInteractionState
} from "../mutable-state/interactions";
import { mockGroup, type MockGroup } from "../test/mockGroup";
import type { ResizePreviewMode } from "../types";
import { calculateResizePreviews } from "./calculateResizePreviews";
import { updateActiveHitRegions } from "./updateActiveHitRegion";

describe("abortActivePointerResize", () => {
  let cleanup: (() => void) | undefined;

  afterEach(() => {
    cleanup?.();
    cleanup = undefined;

    updateInteractionState({
      state: "inactive",
      cursorFlags: 0
    });
  });

  function setup(resizePreviewMode: ResizePreviewMode) {
    const group = mockGroup(new DOMRect(0, 0, 200, 100), {
      resizePreviewMode
    });
    group.addPanel(new DOMRect(0, 0, 100, 100), "a");
    group.addSeparator(new DOMRect(100, 0, 0, 100), "separator");
    group.addPanel(new DOMRect(100, 0, 100, 100), "b");

    document.body.appendChild(group.element);
    const unmount = mountAxis(group);

    cleanup = () => {
      unmount();
      group.element.remove();
    };

    return group;
  }

  function startDrag(group: MockGroup, deltaX: number) {
    const hitRegions = calculateHitRegions({ axis: group });
    const initialLayoutMap = new Map([
      [group, getMountedAxisState(group.id, true).layout]
    ]);
    const pointerDownAtPoint = { x: 100, y: 50 };

    updateInteractionState({
      cursorFlags: 0,
      didPointerMove: false,
      hitRegions,
      initialLayoutMap,
      pointerDownAtPoint,
      previewLayoutMap: new Map(initialLayoutMap),
      previews:
        group.resizePreviewMode === "separator"
          ? calculateResizePreviews(group, hitRegions)
          : [],
      state: "active"
    });

    updateActiveHitRegions({
      commit: false,
      document,
      event: {
        clientX: 100 + deltaX,
        clientY: 50,
        movementX: deltaX,
        movementY: 0
      },
      hitRegions,
      initialLayoutMap,
      mountedAxes: getMountedAxes(),
      pointerDownAtPoint,
      prevCursorFlags: 0
    });
  }

  function getFirstPanelSize(group: MockGroup) {
    return getMountedAxisState(group.id, true).layout[group.items[0].id];
  }

  function movePointer(clientX: number) {
    onDocumentPointerMove({
      buttons: 1,
      clientX,
      clientY: 50,
      currentTarget: document,
      defaultPrevented: false,
      movementX: 10,
      movementY: 0,
      pointerId: 1
    } as unknown as PointerEvent);
  }

  const interruptions: [string, (group: MockGroup) => void][] = [
    ["pointercancel", () => document.dispatchEvent(new Event("pointercancel"))],
    [
      "lostpointercapture",
      (group) =>
        group.separators[0].element.dispatchEvent(
          new Event("lostpointercapture", { bubbles: true })
        )
    ],
    ["window blur", () => window.dispatchEvent(new Event("blur"))]
  ];

  for (const [name, interrupt] of interruptions) {
    for (const resizePreviewMode of ["panel", "separator"] as const) {
      test(`${name} ends the drag and commits the current layout (resizePreviewMode=${resizePreviewMode})`, () => {
        const group = setup(resizePreviewMode);

        startDrag(group, 40);
        expect(getInteractionState().state).toBe("active");
        expect(getFirstPanelSize(group)).toBe(
          resizePreviewMode === "separator" ? 50 : 70
        );

        interrupt(group);

        expect(getInteractionState().state).toBe("inactive");
        expect(getFirstPanelSize(group)).toBe(70);
        expect(document.documentElement.style.cursor).toBe("");

        // Later pointer movement should not continue resizing
        movePointer(180);
        expect(getFirstPanelSize(group)).toBe(70);
      });
    }
  }

  test("lostpointercapture is ignored while another active separator still holds capture", () => {
    const group = setup("panel");
    const separatorElement = group.separators[0].element;

    startDrag(group, 40);

    const otherElement = document.createElement("div");
    document.body.appendChild(otherElement);
    separatorElement.hasPointerCapture = () => true;
    try {
      separatorElement.dispatchEvent(
        new Event("lostpointercapture", { bubbles: true })
      );
      expect(getInteractionState().state).toBe("active");

      // Capture lost by an element that isn't part of the drag
      separatorElement.hasPointerCapture = () => false;
      otherElement.dispatchEvent(
        new Event("lostpointercapture", { bubbles: true })
      );
      expect(getInteractionState().state).toBe("active");
    } finally {
      otherElement.remove();
    }
  });

  test("events are ignored when no drag is active", () => {
    const group = setup("panel");

    document.dispatchEvent(new Event("pointercancel"));
    window.dispatchEvent(new Event("blur"));

    expect(getInteractionState().state).toBe("inactive");
    expect(getFirstPanelSize(group)).toBe(50);
  });
});
