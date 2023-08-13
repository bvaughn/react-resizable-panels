import { isDevelopment } from "#is-development";
import { CommittedValues, InitialDragState } from "../PanelGroup";
import { PRECISION } from "../constants";
import { PanelData, ResizeEvent, Units } from "../types";

export function adjustByDelta(
  event: ResizeEvent | null,
  committedValues: CommittedValues,
  idBefore: string,
  idAfter: string,
  deltaPixels: number,
  prevSizes: number[],
  panelSizeBeforeCollapse: Map<string, number>,
  initialDragState: InitialDragState | null
): number[] {
  const { id: groupId, panels, units } = committedValues;

  const groupSizePixels =
    units === "pixels" ? getAvailableGroupSizePixels(groupId) : NaN;

  const { sizes: initialSizes } = initialDragState || {};

  // If we're resizing by mouse or touch, use the initial sizes as a base.
  // This has the benefit of causing force-collapsed panels to spring back open if drag is reversed.
  const baseSizes = initialSizes || prevSizes;

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
    const pivotId = deltaPixels < 0 ? idAfter : idBefore;
    const index = panelsArray.findIndex(
      (panel) => panel.current.id === pivotId
    );
    const panel = panelsArray[index];
    const baseSize = baseSizes[index];

    const nextSize = safeResizePanel(
      units,
      groupSizePixels,
      panel,
      baseSize,
      baseSize + Math.abs(deltaPixels),
      event
    );
    if (baseSize === nextSize) {
      // If there's no room for the pivot panel to grow, we can ignore this drag update.
      return baseSizes;
    } else {
      if (nextSize === 0 && baseSize > 0) {
        panelSizeBeforeCollapse.set(pivotId, baseSize);
      }

      deltaPixels = deltaPixels < 0 ? baseSize - nextSize : nextSize - baseSize;
    }
  }

  let pivotId = deltaPixels < 0 ? idBefore : idAfter;
  let index = panelsArray.findIndex((panel) => panel.current.id === pivotId);
  while (true) {
    const panel = panelsArray[index];
    const baseSize = baseSizes[index];

    const deltaRemaining = Math.abs(deltaPixels) - Math.abs(deltaApplied);

    const nextSize = safeResizePanel(
      units,
      groupSizePixels,
      panel,
      baseSize,
      baseSize - deltaRemaining,
      event
    );
    if (baseSize !== nextSize) {
      if (nextSize === 0 && baseSize > 0) {
        panelSizeBeforeCollapse.set(panel.current.id, baseSize);
      }

      deltaApplied += baseSize - nextSize;

      nextSizes[index] = nextSize;

      if (
        deltaApplied
          .toPrecision(PRECISION)
          .localeCompare(
            Math.abs(deltaPixels).toPrecision(PRECISION),
            undefined,
            {
              numeric: true,
            }
          ) >= 0
      ) {
        break;
      }
    }

    if (deltaPixels < 0) {
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
  pivotId = deltaPixels < 0 ? idAfter : idBefore;
  index = panelsArray.findIndex((panel) => panel.current.id === pivotId);
  nextSizes[index] = baseSizes[index] + deltaApplied;

  return nextSizes;
}

export function callPanelCallbacks(
  panelsArray: PanelData[],
  sizes: number[],
  panelIdToLastNotifiedSizeMap: Record<string, number>
) {
  sizes.forEach((size, index) => {
    const panelRef = panelsArray[index];
    if (!panelRef) {
      // Handle initial mount (when panels are registered too late to be in the panels array)
      // The subsequent render+effects will handle the resize notification
      return;
    }

    const { callbacksRef, collapsedSize, collapsible, id } = panelRef.current;

    const lastNotifiedSize = panelIdToLastNotifiedSizeMap[id];
    if (lastNotifiedSize !== size) {
      panelIdToLastNotifiedSizeMap[id] = size;

      const { onCollapse, onResize } = callbacksRef.current!;

      if (onResize) {
        onResize(size, lastNotifiedSize);
      }

      if (collapsible && onCollapse) {
        if (
          (lastNotifiedSize == null || lastNotifiedSize === collapsedSize) &&
          size !== collapsedSize
        ) {
          onCollapse(false);
        } else if (
          lastNotifiedSize !== collapsedSize &&
          size === collapsedSize
        ) {
          onCollapse(true);
        }
      }
    }
  });
}

export function calculateDefaultLayout({
  groupId,
  panels,
  units,
}: {
  groupId: string;
  panels: Map<string, PanelData>;
  units: Units;
}): number[] {
  const groupSizePixels =
    units === "pixels" ? getAvailableGroupSizePixels(groupId) : NaN;
  const panelsArray = panelsMapToSortedArray(panels);
  const sizes = Array<number>(panelsArray.length);

  let numPanelsWithSizes = 0;
  let remainingSize = 100;

  // Assigning default sizes requires a couple of passes:
  // First, all panels with defaultSize should be set as-is
  for (let index = 0; index < panelsArray.length; index++) {
    const panel = panelsArray[index];
    const { defaultSize } = panel.current;

    if (defaultSize != null) {
      numPanelsWithSizes++;

      sizes[index] =
        units === "pixels"
          ? (defaultSize / groupSizePixels) * 100
          : defaultSize;

      remainingSize -= sizes[index];
    }
  }

  // Remaining total size should be distributed evenly between panels
  // This may require two passes, depending on min/max constraints
  for (let index = 0; index < panelsArray.length; index++) {
    const panel = panelsArray[index];
    let { defaultSize, id, maxSize, minSize } = panel.current;
    if (defaultSize != null) {
      continue;
    }

    if (units === "pixels") {
      minSize = (minSize / groupSizePixels) * 100;
      if (maxSize != null) {
        maxSize = (maxSize / groupSizePixels) * 100;
      }
    }

    const remainingPanels = panelsArray.length - numPanelsWithSizes;
    const size = Math.min(
      maxSize != null ? maxSize : 100,
      Math.max(minSize, remainingSize / remainingPanels)
    );

    sizes[index] = size;
    numPanelsWithSizes++;
    remainingSize -= size;
  }

  // If there is additional, left over space, assign it to any panel(s) that permits it
  // (It's not worth taking multiple additional passes to evenly distribute)
  if (remainingSize !== 0) {
    for (let index = 0; index < panelsArray.length; index++) {
      const panel = panelsArray[index];
      let { maxSize, minSize } = panel.current;

      if (units === "pixels") {
        minSize = (minSize / groupSizePixels) * 100;
        if (maxSize != null) {
          maxSize = (maxSize / groupSizePixels) * 100;
        }
      }

      const size = Math.min(
        maxSize != null ? maxSize : 100,
        Math.max(minSize, sizes[index] + remainingSize)
      );

      if (size !== sizes[index]) {
        remainingSize -= size - sizes[index];
        sizes[index] = size;

        // Fuzzy comparison to account for imprecise floating point math
        if (Math.abs(remainingSize).toFixed(3) === "0.000") {
          break;
        }
      }
    }
  }

  // Finally, if there is still left-over size, log an error
  if (Math.abs(remainingSize).toFixed(3) !== "0.000") {
    if (isDevelopment) {
      console.error(
        `Invalid panel group configuration; default panel sizes should total 100% but was ${(
          100 - remainingSize
        ).toFixed(
          1
        )}%. This can cause the cursor to become misaligned while dragging.`
      );
    }
  }

  return sizes;
}

export function getBeforeAndAfterIds(
  id: string,
  panelsArray: PanelData[]
): [idBefore: string | null, idAFter: string | null] {
  if (panelsArray.length < 2) {
    return [null, null];
  }

  const index = panelsArray.findIndex((panel) => panel.current.id === id);
  if (index < 0) {
    return [null, null];
  }

  const isLastPanel = index === panelsArray.length - 1;
  const idBefore = isLastPanel ? panelsArray[index - 1].current.id : id;
  const idAfter = isLastPanel ? id : panelsArray[index + 1].current.id;

  return [idBefore, idAfter];
}

export function getAvailableGroupSizePixels(groupId: string): number {
  const panelGroupElement = getPanelGroup(groupId);
  if (panelGroupElement == null) {
    return NaN;
  }

  const direction = panelGroupElement.getAttribute(
    "data-panel-group-direction"
  );
  const resizeHandles = getResizeHandlesForGroup(groupId);
  if (direction === "horizontal") {
    return (
      panelGroupElement.offsetWidth -
      resizeHandles.reduce((accumulated, handle) => {
        return accumulated + handle.offsetWidth;
      }, 0)
    );
  } else {
    return (
      panelGroupElement.offsetHeight -
      resizeHandles.reduce((accumulated, handle) => {
        return accumulated + handle.offsetHeight;
      }, 0)
    );
  }
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

  const index = panelsArray.findIndex((panel) => panel.current.id === id);
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
  const index = handle ? handles.indexOf(handle) : -1;

  const idBefore: string | null = panelsArray[index]?.current?.id ?? null;
  const idAfter: string | null = panelsArray[index + 1]?.current?.id ?? null;

  return [idBefore, idAfter];
}

export function panelsMapToSortedArray(
  panels: Map<string, PanelData>
): PanelData[] {
  return Array.from(panels.values()).sort((panelA, panelB) => {
    const orderA = panelA.current.order;
    const orderB = panelB.current.order;
    if (orderA == null && orderB == null) {
      return 0;
    } else if (orderA == null) {
      return -1;
    } else if (orderB == null) {
      return 1;
    } else {
      return orderA - orderB;
    }
  });
}

export function safeResizePanel(
  units: Units,
  groupSizePixels: number,
  panel: PanelData,
  prevSize: number,
  nextSize: number,
  event: ResizeEvent | null = null
): number {
  let { collapsedSize, collapsible, maxSize, minSize } = panel.current;

  if (units === "pixels") {
    collapsedSize = (collapsedSize / groupSizePixels) * 100;
    if (maxSize != null) {
      maxSize = (maxSize / groupSizePixels) * 100;
    }
    minSize = (minSize / groupSizePixels) * 100;
  }

  if (collapsible) {
    if (prevSize > collapsedSize) {
      // Mimic VS COde behavior; collapse a panel if it's smaller than half of its min-size
      if (nextSize <= minSize / 2 + collapsedSize) {
        return collapsedSize;
      }
    } else {
      const isKeyboardEvent = event?.type?.startsWith("key");
      if (!isKeyboardEvent) {
        // Keyboard events should expand a collapsed panel to the min size,
        // but mouse events should wait until the panel has reached its min size
        // to avoid a visual flickering when dragging between collapsed and min size.
        if (nextSize < minSize) {
          return collapsedSize;
        }
      }
    }
  }

  return Math.min(maxSize != null ? maxSize : 100, Math.max(minSize, nextSize));
}

export function validatePanelProps(units: Units, panelData: PanelData) {
  const { collapsible, defaultSize, maxSize, minSize } = panelData.current;

  // Basic props validation
  if (minSize < 0 || (units === "percentages" && minSize > 100)) {
    if (isDevelopment) {
      console.error(`Invalid Panel minSize provided, ${minSize}`);
    }

    panelData.current.minSize = 0;
  }

  if (maxSize != null) {
    if (maxSize < 0 || (units === "percentages" && maxSize > 100)) {
      if (isDevelopment) {
        console.error(`Invalid Panel maxSize provided, ${maxSize}`);
      }

      panelData.current.maxSize = null;
    }
  }

  if (defaultSize !== null) {
    if (defaultSize < 0 || (units === "percentages" && defaultSize > 100)) {
      if (isDevelopment) {
        console.error(`Invalid Panel defaultSize provided, ${defaultSize}`);
      }

      panelData.current.defaultSize = null;
    } else if (defaultSize < minSize && !collapsible) {
      if (isDevelopment) {
        console.error(
          `Panel minSize (${minSize}) cannot be greater than defaultSize (${defaultSize})`
        );
      }

      panelData.current.defaultSize = minSize;
    } else if (maxSize != null && defaultSize > maxSize) {
      if (isDevelopment) {
        console.error(
          `Panel maxSize (${maxSize}) cannot be less than defaultSize (${defaultSize})`
        );
      }

      panelData.current.defaultSize = maxSize;
    }
  }
}

export function validatePanelGroupLayout({
  groupId,
  panels,
  nextSizes,
  prevSizes,
  units,
}: {
  groupId: string;
  panels: Map<string, PanelData>;
  nextSizes: number[];
  prevSizes: number[];
  units: Units;
}): number[] {
  // Clone because this method modifies
  nextSizes = [...nextSizes];

  const panelsArray = panelsMapToSortedArray(panels);

  const groupSizePixels =
    units === "pixels" ? getAvailableGroupSizePixels(groupId) : NaN;

  let remainingSize = 0;

  // First, check all of the proposed sizes against the min/max constraints
  for (let index = 0; index < panelsArray.length; index++) {
    const panel = panelsArray[index];
    const prevSize = prevSizes[index];
    const nextSize = nextSizes[index];
    const safeNextSize = safeResizePanel(
      units,
      groupSizePixels,
      panel,
      prevSize,
      nextSize
    );
    if (nextSize != safeNextSize) {
      remainingSize += nextSize - safeNextSize;
      nextSizes[index] = safeNextSize;

      if (isDevelopment) {
        console.error(
          `Invalid size (${nextSize}) specified for Panel "${panel.current.id}" given the panel's min/max size constraints`
        );
      }
    }
  }

  // If there is additional, left over space, assign it to any panel(s) that permits it
  // (It's not worth taking multiple additional passes to evenly distribute)
  if (remainingSize.toFixed(3) !== "0.000") {
    for (let index = 0; index < panelsArray.length; index++) {
      const panel = panelsArray[index];

      let { maxSize, minSize } = panel.current;

      if (units === "pixels") {
        minSize = (minSize / groupSizePixels) * 100;
        if (maxSize != null) {
          maxSize = (maxSize / groupSizePixels) * 100;
        }
      }

      const size = Math.min(
        maxSize != null ? maxSize : 100,
        Math.max(minSize, nextSizes[index] + remainingSize)
      );

      if (size !== nextSizes[index]) {
        remainingSize -= size - nextSizes[index];
        nextSizes[index] = size;

        // Fuzzy comparison to account for imprecise floating point math
        if (Math.abs(remainingSize).toFixed(3) === "0.000") {
          break;
        }
      }
    }
  }

  // If we still have remainder, the requested layout wasn't valid and we should warn about it
  if (remainingSize.toFixed(3) !== "0.000") {
    if (isDevelopment) {
      console.error(
        `"Invalid panel group configuration; default panel sizes should total 100% but was ${
          100 - remainingSize
        }%`
      );
    }
  }

  return nextSizes;
}
