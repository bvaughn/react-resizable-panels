import { afterEach, describe, expect, test } from "vitest";
import {
  CURSOR_FLAG_HORIZONTAL_MAX,
  CURSOR_FLAG_HORIZONTAL_MIN,
  CURSOR_FLAG_VERTICAL_MAX,
  CURSOR_FLAG_VERTICAL_MIN
} from "../../constants";
import { calculateHitRegions } from "../dom/calculateHitRegions";
import { onDocumentPointerMove } from "../event-handlers/onDocumentPointerMove";
import { mountGroup } from "../mountGroup";
import {
  getMountedGroups,
  getMountedGroupState
} from "../mutable-state/groups";
import {
  getInteractionState,
  updateInteractionState
} from "../mutable-state/interactions";
import { mockGroup } from "../test/mockGroup";
import { calculateResizePreviews } from "./calculateResizePreviews";
import { updateActiveHitRegions } from "./updateActiveHitRegion";

describe("updateActiveHitRegions preview bounds", () => {
  let unmount: (() => void) | undefined;

  afterEach(() => {
    unmount?.();

    updateInteractionState({
      state: "inactive",
      cursorFlags: 0
    });
  });

  test("missed pointer-up commits the last preview rather than the later hover position", () => {
    const group = mockGroup(new DOMRect(0, 0, 200, 100), {
      resizePreviewMode: "separator"
    });
    group.addPanel(new DOMRect(0, 0, 100, 100));
    group.addPanel(new DOMRect(100, 0, 100, 100));
    unmount = mountGroup(group);

    const hitRegions = calculateHitRegions({ group });
    const initialLayoutMap = new Map([
      [group, getMountedGroupState(group.id, true).layout]
    ]);
    const pointerDownAtPoint = { x: 100, y: 50 };

    updateInteractionState({
      cursorFlags: 0,
      didPointerMove: false,
      hitRegions,
      initialLayoutMap,
      pointerDownAtPoint,
      previewLayoutMap: new Map(initialLayoutMap),
      previews: calculateResizePreviews(group, hitRegions),
      state: "active"
    });

    updateActiveHitRegions({
      commit: false,
      document,
      event: { clientX: 140, clientY: 50, movementX: 40, movementY: 0 },
      hitRegions,
      initialLayoutMap,
      mountedGroups: getMountedGroups(),
      pointerDownAtPoint,
      prevCursorFlags: 0
    });
    expect(
      getMountedGroupState(group.id, true).layout[group.panels[0].id]
    ).toBe(50);

    onDocumentPointerMove({
      buttons: 0,
      clientX: 100,
      clientY: 50,
      currentTarget: document,
      defaultPrevented: false,
      movementX: -40,
      movementY: 0
    } as unknown as PointerEvent);

    expect(getInteractionState().state).toBe("inactive");
    expect(
      getMountedGroupState(group.id, true).layout[group.panels[0].id]
    ).toBe(70);
  });

  for (const orientation of ["horizontal", "vertical"] as const) {
    for (const direction of [-1, 1]) {
      for (const disableCursor of [false, true]) {
        test(`${orientation}, direction ${direction}, disableCursor=${disableCursor}`, () => {
          const horizontal = orientation === "horizontal";
          const rect = (start: number, size: number) =>
            horizontal
              ? new DOMRect(start, 0, size, 100)
              : new DOMRect(0, start, 100, size);

          const group = mockGroup(rect(0, 200), {
            orientation,
            resizePreviewMode: "separator"
          });
          group.mutableState.disableCursor = disableCursor;
          group.addPanel(rect(0, 100), "a", {
            minSize: "25%"
          });
          group.addPanel(rect(100, 100), "b", {
            minSize: "25%"
          });

          unmount = mountGroup(group);

          const initialLayout = getMountedGroupState(group.id, true).layout;
          const hitRegions = calculateHitRegions({ group });
          const initialLayoutMap = new Map([[group, initialLayout]]);
          const pointerDownAtPoint = {
            x: 100,
            y: 100
          };

          updateInteractionState({
            state: "active",
            cursorFlags: 0,
            didPointerMove: false,
            hitRegions,
            initialLayoutMap,
            pointerDownAtPoint,
            previewLayoutMap: new Map(initialLayoutMap),
            previews: calculateResizePreviews(group, hitRegions)
          });

          let previousDelta = 0;
          const move = (delta: number, commit = false) => {
            const movement = delta - previousDelta;
            previousDelta = delta;

            updateActiveHitRegions({
              commit,
              document,
              hitRegions,
              initialLayoutMap,
              mountedGroups: getMountedGroups(),
              pointerDownAtPoint,
              prevCursorFlags: getInteractionState().cursorFlags,
              event: {
                clientX: 100 + (horizontal ? delta : 0),
                clientY: 100 + (horizontal ? 0 : delta),
                movementX: horizontal ? movement : 0,
                movementY: horizontal ? 0 : movement
              }
            });
          };

          const expectedFlag = disableCursor
            ? 0
            : horizontal
              ? direction < 0
                ? CURSOR_FLAG_HORIZONTAL_MIN
                : CURSOR_FLAG_HORIZONTAL_MAX
              : direction < 0
                ? CURSOR_FLAG_VERTICAL_MIN
                : CURSOR_FLAG_VERTICAL_MAX;

          move(direction * 60);
          const previousState = getInteractionState();

          move(direction * 70);
          expect(getInteractionState().cursorFlags).toBe(expectedFlag);
          expect(getMountedGroupState(group.id, true).layout).toEqual(
            initialLayout
          );

          const state = getInteractionState();
          if (state.state !== "active") {
            throw Error("Expected active interaction");
          }

          expect(state.previews[0].offset).toBe(direction * 50);
          if (previousState.state !== "active") {
            throw Error("Expected active interaction");
          }
          expect(state.previews).toBe(previousState.previews);
          expect(state.previews[0]).toBe(previousState.previews[0]);

          // A rounded pointer event must preserve the bounds cursor.
          move(direction * 70);
          expect(getInteractionState().cursorFlags).toBe(expectedFlag);

          // Returning to the allowed range clears the bounds cursor.
          move(direction * 20);
          expect(getInteractionState().cursorFlags).toBe(0);

          move(direction * 60);
          move(direction * 70);

          // Committing the same preview still updates the mounted layout.
          move(direction * 70, true);
          expect(
            getMountedGroupState(group.id, true).layout[group.panels[0].id]
          ).toBe(50 + direction * 25);
        });
      }
    }
  }
});
