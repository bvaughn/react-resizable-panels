import { PRECISION } from "../constants";
import { PanelData } from "../types";

export function adjustByDelta(
  panels: Map<string, PanelData>,
  idBefore: string,
  idAfter: string,
  delta: number,
  prevSizes: number[]
): number[] {
  if (delta === 0) {
    return prevSizes;
  }

  const panelsArray = panelsMapToSortedArray(panels);

  const nextSizes = prevSizes.concat();

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
    const prevSize = prevSizes[index];

    const nextSize = safeResizePanel(panel, Math.abs(delta), prevSize);
    if (prevSize === nextSize) {
      return prevSizes;
    } else {
      delta = delta < 0 ? prevSize - nextSize : nextSize - prevSize;
    }
  }

  let pivotId = delta < 0 ? idBefore : idAfter;
  let index = panelsArray.findIndex((panel) => panel.id === pivotId);
  while (true) {
    const panel = panelsArray[index];
    const prevSize = prevSizes[index];

    const nextSize = safeResizePanel(panel, 0 - Math.abs(delta), prevSize);
    if (prevSize !== nextSize) {
      deltaApplied += prevSize - nextSize;

      nextSizes[index] = nextSize;

      if (deltaApplied.toPrecision(PRECISION) >= delta.toPrecision(PRECISION)) {
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
    return prevSizes;
  }

  // Adjust the pivot panel before, but only by the amount that surrounding panels were able to shrink/contract.
  pivotId = delta < 0 ? idAfter : idBefore;
  index = panelsArray.findIndex((panel) => panel.id === pivotId);
  nextSizes[index] = prevSizes[index] + deltaApplied;

  return nextSizes;
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
  prevSize: number
): number {
  const nextSizeUnsafe = prevSize + delta;
  const nextSize = Math.min(
    panel.maxSize,
    Math.max(panel.minSize, nextSizeUnsafe)
  );
  return nextSize;
}
