import { afterEach, describe, expect, test } from "vitest";
import { calculateHitRegions } from "../dom/calculateHitRegions";
import { mountAxis } from "../mountAxis";
import { getMountedAxes, getMountedAxisState } from "../mutable-state/axes";
import {
  getInteractionState,
  updateInteractionState
} from "../mutable-state/interactions";
import { mockGroup, type MockGroup } from "../test/mockGroup";
import type { ResizePreviewMode } from "../types";
import { calculateResizePreviews } from "../utils/calculateResizePreviews";
import { updateActiveHitRegions } from "../utils/updateActiveHitRegion";
import { onDocumentContextMenu } from "./onDocumentContextMenu";
import { onDocumentPointerCancel } from "./onDocumentPointerCancel";
import { onDocumentPointerDown } from "./onDocumentPointerDown";
import { onDocumentPointerLeave } from "./onDocumentPointerLeave";
import { onDocumentPointerMove } from "./onDocumentPointerMove";
import { onDocumentPointerUp } from "./onDocumentPointerUp";
import { onWindowBlur } from "./onWindowBlur";
import { onWindowPageHide } from "./onWindowPageHide";

// Groups may be mounted in more than one document (e.g. a popup window)
// Pointer events in one document should not affect groups in another
describe("pointer events from a different document", () => {
  let cleanup: (() => void) | undefined;

  afterEach(() => {
    cleanup?.();
    cleanup = undefined;

    updateInteractionState({
      state: "inactive",
      cursorFlags: 0
    });
  });

  function setup(resizePreviewMode: ResizePreviewMode = "panel") {
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

    const otherDocument = document.implementation.createHTMLDocument();

    return { group, otherDocument };
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
      ownerDocument: document,
      pointerDownAtPoint,
      pointerId: 1,
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

  function mockEvent(
    currentTarget: Document,
    clientX: number,
    {
      buttons = 1,
      pointerId = 1
    }: { buttons?: number; pointerId?: number } = {}
  ) {
    return {
      button: 0,
      buttons,
      clientX,
      clientY: 50,
      currentTarget,
      defaultPrevented: false,
      movementX: 10,
      movementY: 0,
      pointerId,
      pointerType: "mouse",
      preventDefault: () => {},
      target: currentTarget.body
    } as unknown as PointerEvent;
  }

  test("pointerdown does not start a drag", () => {
    const { otherDocument } = setup();

    onDocumentPointerDown(mockEvent(otherDocument, 100));

    expect(getInteractionState().state).toBe("inactive");
  });

  test("pointermove does not hover", () => {
    const { otherDocument } = setup();

    onDocumentPointerMove(mockEvent(otherDocument, 100));

    expect(getInteractionState().state).toBe("inactive");
  });

  test("pointermove does not update an active drag", () => {
    const { group, otherDocument } = setup();

    startDrag(group, 20);
    expect(getFirstPanelSize(group)).toBe(60);

    onDocumentPointerMove(mockEvent(otherDocument, 180));
    expect(getInteractionState().state).toBe("active");
    expect(getFirstPanelSize(group)).toBe(60);

    // Movement within the drag's own document still resizes
    onDocumentPointerMove(mockEvent(document, 140));
    expect(getFirstPanelSize(group)).toBe(70);
  });

  test("pointerleave does not update an active drag", () => {
    const { group, otherDocument } = setup();

    startDrag(group, 20);

    onDocumentPointerLeave(mockEvent(otherDocument, -10));
    expect(getInteractionState().state).toBe("active");
    expect(getFirstPanelSize(group)).toBe(60);
  });

  function blurWindow(ownerDocument: Document) {
    const mockWindow = { document: ownerDocument };
    onWindowBlur({
      currentTarget: mockWindow,
      target: mockWindow
    } as unknown as FocusEvent);
  }

  const ignoredEvents: [string, (otherDocument: Document) => void][] = [
    [
      "pointermove with no buttons pressed from another document",
      (otherDocument) =>
        onDocumentPointerMove(mockEvent(otherDocument, 180, { buttons: 0 }))
    ],
    [
      "pointermove with no buttons pressed from another pointer",
      () =>
        onDocumentPointerMove(
          mockEvent(document, 180, { buttons: 0, pointerId: 2 })
        )
    ],
    [
      "pointerup from another document",
      (otherDocument) => onDocumentPointerUp(mockEvent(otherDocument, 180))
    ],
    [
      "pointerup from another pointer",
      () => onDocumentPointerUp(mockEvent(document, 180, { pointerId: 2 }))
    ],
    [
      "contextmenu from another document",
      (otherDocument) => onDocumentContextMenu(mockEvent(otherDocument, 180))
    ],
    [
      "pointercancel from another document",
      (otherDocument) => onDocumentPointerCancel(mockEvent(otherDocument, 180))
    ],
    [
      "pointercancel from another pointer",
      () => onDocumentPointerCancel(mockEvent(document, 180, { pointerId: 2 }))
    ],
    ["blur of another window", (otherDocument) => blurWindow(otherDocument)]
  ];

  for (const [name, dispatch] of ignoredEvents) {
    test(`${name} does not end an active drag`, () => {
      const { group, otherDocument } = setup("separator");

      startDrag(group, 20);

      dispatch(otherDocument);
      expect(getInteractionState().state).toBe("active");
      expect(getFirstPanelSize(group)).toBe(50);

      // The drag still ends normally from its own pointer and document
      onDocumentPointerUp(mockEvent(document, 140));
      expect(getInteractionState().state).toBe("inactive");
      expect(getFirstPanelSize(group)).toBe(70);
    });
  }

  test("pointerdown from another pointer does not replace the active drag", () => {
    const { group } = setup("separator");

    startDrag(group, 20);

    onDocumentPointerDown(mockEvent(document, 100, { pointerId: 2 }));
    expect(getInteractionState()).toMatchObject({
      pointerId: 1,
      state: "active"
    });
    expect(getFirstPanelSize(group)).toBe(50);

    // The original drag still ends normally
    onDocumentPointerUp(mockEvent(document, 140));
    expect(getInteractionState().state).toBe("inactive");
    expect(getFirstPanelSize(group)).toBe(70);
  });

  for (const [name, getDocument] of [
    ["the same document", () => document],
    ["another document", (otherDocument: Document) => otherDocument]
  ] as const) {
    test(`pointerdown from the drag's pointer in ${name} ends the drag without starting a new one`, () => {
      const { group, otherDocument } = setup("separator");

      startDrag(group, 20);

      onDocumentPointerDown(mockEvent(getDocument(otherDocument), 100));
      expect(getInteractionState().state).toBe("inactive");
      expect(getFirstPanelSize(group)).toBe(60);
    });
  }

  test("pagehide of the drag's window ends the drag", () => {
    const { group } = setup("separator");

    startDrag(group, 20);

    window.dispatchEvent(new Event("pagehide"));
    expect(getInteractionState().state).toBe("inactive");
    expect(getFirstPanelSize(group)).toBe(60);
  });

  test("pagehide of another window does not end the drag", () => {
    const { group, otherDocument } = setup("separator");

    startDrag(group, 20);

    onWindowPageHide({
      currentTarget: { document: otherDocument }
    } as unknown as PageTransitionEvent);
    expect(getInteractionState().state).toBe("active");
    expect(getFirstPanelSize(group)).toBe(50);
  });
});
