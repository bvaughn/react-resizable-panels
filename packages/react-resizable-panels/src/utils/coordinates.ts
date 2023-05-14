import { PRECISION } from "../constants";
import { InitialDragState } from "../PanelGroup";
import { Direction, PanelData, ResizeEvent } from "../types";
import {
  getPanelGroup,
  getResizeHandle,
  getResizeHandlePanelIds,
} from "./group";

export type Coordinates = {
  movement: number;
  offset: number;
};

export type Size = {
  height: number;
  width: number;
};

export function getDragOffset(
  event: ResizeEvent,
  handleId: string,
  direction: Direction,
  initialOffset: number = 0,
  initialHandleElementRect: DOMRect | null = null
): number {
  const isHorizontal = direction === "horizontal";

  let pointerOffset = 0;
  if (isMouseEvent(event)) {
    pointerOffset = isHorizontal ? event.clientX : event.clientY;
  } else if (isTouchEvent(event)) {
    const firstTouch = event.touches[0];
    pointerOffset = isHorizontal ? firstTouch.screenX : firstTouch.screenY;
  } else {
    return 0;
  }

  const handleElement = getResizeHandle(handleId)!;
  const rect =
    initialHandleElementRect || handleElement.getBoundingClientRect();
  const elementOffset = isHorizontal ? rect.left : rect.top;

  return pointerOffset - elementOffset - initialOffset;
}

// https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/movementX
export function getMovement(
  event: ResizeEvent,
  groupId: string,
  handleId: string,
  panelsArray: PanelData[],
  direction: Direction,
  prevSizes: number[],
  initialDragState: InitialDragState | null
): number {
  const {
    dragOffset = 0,
    dragHandleRect,
    sizes: initialSizes,
  } = initialDragState || {};

  // If we're resizing by mouse or touch, use the initial sizes as a base.
  // This has the benefit of causing force-collapsed panels to spring back open if drag is reversed.
  const baseSizes = initialSizes || prevSizes;

  if (isKeyDown(event)) {
    const isHorizontal = direction === "horizontal";

    const groupElement = getPanelGroup(groupId)!;
    const rect = groupElement.getBoundingClientRect();
    const groupSizeInPixels = isHorizontal ? rect.width : rect.height;

    const denominator = event.shiftKey ? 10 : 100;
    const delta = groupSizeInPixels / denominator;

    let movement = 0;
    switch (event.key) {
      case "ArrowDown":
        movement = isHorizontal ? 0 : delta;
        break;
      case "ArrowLeft":
        movement = isHorizontal ? -delta : 0;
        break;
      case "ArrowRight":
        movement = isHorizontal ? delta : 0;
        break;
      case "ArrowUp":
        movement = isHorizontal ? 0 : -delta;
        break;
      case "End":
        movement = groupSizeInPixels;
        break;
      case "Home":
        movement = -groupSizeInPixels;
        break;
    }

    // If the Panel being resized is collapsible,
    // we need to special case resizing around the minSize boundary.
    // If contracting, Panels should shrink to their minSize and then snap to fully collapsed.
    // If expanding from collapsed, they should snap back to their minSize.
    const [idBefore, idAfter] = getResizeHandlePanelIds(
      groupId,
      handleId,
      panelsArray
    );
    const targetPanelId = movement < 0 ? idBefore : idAfter;
    const targetPanelIndex = panelsArray.findIndex(
      (panel) => panel.current.id === targetPanelId
    );
    const targetPanel = panelsArray[targetPanelIndex];
    if (targetPanel.current.collapsible) {
      const baseSize = baseSizes[targetPanelIndex];
      if (
        baseSize === 0 ||
        baseSize.toPrecision(PRECISION) ===
          targetPanel.current.minSize.toPrecision(PRECISION)
      ) {
        movement =
          movement < 0
            ? -targetPanel.current.minSize * groupSizeInPixels
            : targetPanel.current.minSize * groupSizeInPixels;
      }
    }

    return movement;
  } else {
    return getDragOffset(
      event,
      handleId,
      direction,
      dragOffset,
      dragHandleRect
    );
  }
}

export function isKeyDown(event: ResizeEvent): event is KeyboardEvent {
  return event.type === "keydown";
}

export function isMouseEvent(event: ResizeEvent): event is MouseEvent {
  return event.type.startsWith("mouse");
}

export function isTouchEvent(event: ResizeEvent): event is TouchEvent {
  return event.type.startsWith("touch");
}
