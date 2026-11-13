import { describe, expect, test } from "vitest";
import type { NativeDrag } from "../mutable-state/nativeDrag";
import { isNativeTearOff } from "./isNativeTearOff";

const view = { innerHeight: 600, innerWidth: 800 } as Window;

function createDrag(
  lastDragover: { clientX: number; clientY: number; time: number } | undefined,
  { isDropped = false, lastMoveStep = 0, lastRemoteDragoverTime = 0 } = {}
): NativeDrag {
  return {
    dragGroup: "group",
    hasSource: () => true,
    id: "drag",
    isDropped,
    isRemote: false,
    isShared: false,
    lastCopyEvent: undefined,
    lastDocument: undefined,
    lastDragover: lastDragover && { ...lastDragover, view },
    lastMoveStep,
    lastRemoteDragoverTime,
    node: { tab: { data: undefined, id: "1" }, type: "tab" },
    previewOwners: new Map(),
    removeFromSource: () => {},
    source: { tabId: "1", type: "tab" },
    sourceOwner: {}
  };
}

describe("isNativeTearOff", () => {
  test("a drag released after leaving the window (near its edge) is torn off", () => {
    expect(
      isNativeTearOff(
        createDrag({ clientX: 24, clientY: 81, time: 0 }, { lastMoveStep: 27 }),
        1000
      )
    ).toBe(true);
    expect(
      isNativeTearOff(
        createDrag(
          { clientX: 790, clientY: 300, time: 0 },
          { lastMoveStep: 1 }
        ),
        1000
      )
    ).toBe(true);
  });

  test("a fast move can leave the window from further away", () => {
    expect(
      isNativeTearOff(
        createDrag(
          { clientX: 60, clientY: 300, time: 0 },
          { lastMoveStep: 40 }
        ),
        1000
      )
    ).toBe(true);
  });

  test("a drag that ended over a window isn't torn off", () => {
    // Still being dragged over a window recently (e.g. canceled with Escape)
    expect(
      isNativeTearOff(createDrag({ clientX: 5, clientY: 300, time: 900 }), 1000)
    ).toBe(false);

    // Released away from the edges (e.g. where it can't be dropped), and the drag image animated back
    expect(
      isNativeTearOff(
        createDrag(
          { clientX: 260, clientY: 100, time: 0 },
          { lastMoveStep: 1 }
        ),
        560
      )
    ).toBe(false);
  });

  test("a drag released over another page isn't torn off", () => {
    // Left this window near its edge, but another page reported the pointer over it since
    expect(
      isNativeTearOff(
        createDrag(
          { clientX: 24, clientY: 81, time: 0 },
          { lastMoveStep: 27, lastRemoteDragoverTime: 900 }
        ),
        1000
      )
    ).toBe(false);

    // Then left that page too
    expect(
      isNativeTearOff(
        createDrag(
          { clientX: 24, clientY: 81, time: 0 },
          { lastMoveStep: 27, lastRemoteDragoverTime: 500 }
        ),
        1000
      )
    ).toBe(true);
  });

  test("dropped drags aren't torn off", () => {
    expect(
      isNativeTearOff(
        createDrag({ clientX: 5, clientY: 300, time: 0 }, { isDropped: true }),
        1000
      )
    ).toBe(false);
    expect(isNativeTearOff(createDrag(undefined), 1000)).toBe(false);
  });
});
