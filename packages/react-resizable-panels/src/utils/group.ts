import { PRECISION } from "../constants";
import { InitialDragState } from "../PanelGroup";
import { PanelData, ResizeEvent } from "../types";

export function adjustByDelta(
  event: ResizeEvent | null,
  panels: Map<string, PanelData>,
  idBefore: string,
  idAfter: string,
  delta: number,
  prevSizes: number[],
  panelSizeBeforeCollapse: Map<string, number>,
  initialDragState: InitialDragState | null
): number[] {
  const { sizes: initialSizes } = initialDragState || {};

  // If we're resizing by mouse or touch, use the initial sizes as a base.
  // This has the benefit of causing force-collapsed panels to spring back open if drag is reversed.
  const baseSizes = initialSizes || prevSizes;

  if (delta === 0) {
    return baseSizes;
  }

  const panelsArray = panelsMapToSortedArray(panels);

  const nextSizes = baseSizes.concat();

  let deltaApplied = 0;

  // A resizing panel affects the panels before or after it.
  //
  // A negative delta means the panel immediately after the resizer should grow/expand by decreasing its offset.
  // Other panels may also need to shrink/contract (and shift) to make room, depending on the min weights.
  //
  // A positive delta means the panel immediately before the resizer should "expand".
  // This is accomplished by shrinking/contracting (and shifting) one or more of the panels after the resizer.

  // Max-bounds check the panel being expanded first.
  {
    const pivotId = delta < 0 ? idAfter : idBefore;
    const index = panelsArray.findIndex((panel) => panel.id === pivotId);
    const panel = panelsArray[index];
    const baseSize = baseSizes[index];

    const nextSize = safeResizePanel(panel, Math.abs(delta), baseSize, event);
    if (baseSize === nextSize) {
      // If there's no room for the pivot panel to grow, we can ignore this drag update.
      return baseSizes;
    } else {
      if (nextSize === 0 && baseSize > 0) {
        panelSizeBeforeCollapse.set(pivotId, baseSize);
      }

      delta = delta < 0 ? baseSize - nextSize : nextSize - baseSize;
    }
  }

  let pivotId = delta < 0 ? idBefore : idAfter;
  let index = panelsArray.findIndex((panel) => panel.id === pivotId);
  while (true) {
    const panel = panelsArray[index];
    const baseSize = baseSizes[index];

    const deltaRemaining = Math.abs(delta) - Math.abs(deltaApplied);

    const nextSize = safeResizePanel(
      panel,
      0 - deltaRemaining,
      baseSize,
      event
    );
    if (baseSize !== nextSize) {
      if (nextSize === 0 && baseSize > 0) {
        panelSizeBeforeCollapse.set(panel.id, baseSize);
      }

      deltaApplied += baseSize - nextSize;

      nextSizes[index] = nextSize;

      if (
        deltaApplied
          .toPrecision(PRECISION)
          .localeCompare(Math.abs(delta).toPrecision(PRECISION), undefined, {
            numeric: true,
          }) >= 0
      ) {
        break;
      }
    }

    if (delta < 0) {
      if (--index < 0) {
        break;
      }
    } else {
      if (++index >= panelsArray.length) {
        break;
      }
    }
  }

  // If we were unable to resize any of the panels panels, return the previous state.
  // This will essentially bailout and ignore the "mousemove" event.
  if (deltaApplied === 0) {
    return baseSizes;
  }

  // Adjust the pivot panel before, but only by the amount that surrounding panels were able to shrink/contract.
  pivotId = delta < 0 ? idAfter : idBefore;
  index = panelsArray.findIndex((panel) => panel.id === pivotId);
  nextSizes[index] = baseSizes[index] + deltaApplied;

  return nextSizes;
}

export function callPanelCallbacks(
  panelsArray: PanelData[],
  prevSizes: number[],
  nextSizes: number[]
) {
  nextSizes.forEach((nextSize, index) => {
    const prevSize = prevSizes[index];
    if (prevSize !== nextSize) {
      const { callbacksRef, collapsible } = panelsArray[index];
      const { onCollapse, onResize } = callbacksRef.current;

      if (onResize) {
        onResize(nextSize);
      }

      if (collapsible && onCollapse) {
        // Falsy check handles both previous size of 0
        // and initial size of undefined (when mounting)
        if (!prevSize && nextSize !== 0) {
          onCollapse(false);
        } else if (prevSize !== 0 && nextSize === 0) {
          onCollapse(true);
        }
      }
    }
  });
}

export function getBeforeAndAfterIds(
  id: string,
  panelsArray: PanelData[]
): [idBefore: string | null, idAFter: string | null] {
  if (panelsArray.length < 2) {
    return [null, null];
  }

  const index = panelsArray.findIndex((panel) => panel.id === id);
  if (index < 0) {
    return [null, null];
  }

  const isLastPanel = index === panelsArray.length - 1;
  const idBefore = isLastPanel ? panelsArray[index - 1].id : id;
  const idAfter = isLastPanel ? id : panelsArray[index + 1].id;

  return [idBefore, idAfter];
}

// This method returns a number between 1 and 100 representing
// the % of the group's overall space this panel should occupy.
export function getFlexGrow(
  panels: Map<string, PanelData>,
  id: string,
  sizes: number[]
): string {
  if (panels.size === 1) {
    return "100";
  }

  const panelsArray = panelsMapToSortedArray(panels);

  const index = panelsArray.findIndex((panel) => panel.id === id);
  const size = sizes[index];
  if (size == null) {
    return "0";
  }

  return size.toPrecision(PRECISION);
}

export function getPanel(id: string): HTMLDivElement | null {
  const element = document.querySelector(`[data-panel-id="${id}"]`);
  if (element) {
    return element as HTMLDivElement;
  }
  return null;
}

export function getPanelGroup(id: string): HTMLDivElement | null {
  const element = document.querySelector(`[data-panel-group-id="${id}"]`);
  if (element) {
    return element as HTMLDivElement;
  }
  return null;
}

export function getResizeHandle(id: string): HTMLDivElement | null {
  const element = document.querySelector(
    `[data-panel-resize-handle-id="${id}"]`
  );
  if (element) {
    return element as HTMLDivElement;
  }
  return null;
}

export function getResizeHandleIndex(id: string): number | null {
  const handles = getResizeHandles();
  const index = handles.findIndex(
    (handle) => handle.getAttribute("data-panel-resize-handle-id") === id
  );
  return index ?? null;
}

export function getResizeHandles(): HTMLDivElement[] {
  return Array.from(document.querySelectorAll(`[data-panel-resize-handle-id]`));
}

export function getResizeHandlesForGroup(groupId: string): HTMLDivElement[] {
  return Array.from(
    document.querySelectorAll(
      `[data-panel-resize-handle-id][data-panel-group-id="${groupId}"]`
    )
  );
}

export function getResizeHandlePanelIds(
  groupId: string,
  handleId: string,
  panelsArray: PanelData[]
): [idBefore: string | null, idAfter: string | null] {
  const handle = getResizeHandle(handleId);
  const handles = getResizeHandlesForGroup(groupId);
  const index = handles.indexOf(handle);

  const idBefore: string | null = panelsArray[index]?.id ?? null;
  const idAfter: string | null = panelsArray[index + 1]?.id ?? null;

  return [idBefore, idAfter];
}

export function panelsMapToSortedArray(
  panels: Map<string, PanelData>
): PanelData[] {
  return Array.from(panels.values()).sort((a, b) => a.order - b.order);
}

function safeResizePanel(
  panel: PanelData,
  delta: number,
  prevSize: number,
  event: ResizeEvent | null
): number {
  const nextSizeUnsafe = prevSize + delta;

  if (panel.collapsible) {
    if (prevSize > 0) {
      if (nextSizeUnsafe <= 0) {
        return 0;
      }
    } else {
      const isKeyboardEvent = event?.type?.startsWith("key");
      if (!isKeyboardEvent) {
        // Keyboard events should expand a collapsed panel to the min size,
        // but mouse events should wait until the panel has reached its min size
        // to avoid a visual flickering when dragging between collapsed and min size.
        if (nextSizeUnsafe < panel.minSize) {
          return 0;
        }
      }
    }
  }

  const nextSize = Math.min(
    panel.maxSize,
    Math.max(panel.minSize, nextSizeUnsafe)
  );

  return nextSize;
}
