import {
  CSSProperties,
  ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import useUniqueId from "./hooks/useUniqueId";

import { PanelContext, PanelGroupContext } from "./PanelContexts";
import { Direction, PanelData, ResizeEvent } from "./types";
import { loadPanelLayout, savePanelGroupLayout } from "./utils/serialization";
import { Coordinates, getUpdatedCoordinates } from "./utils/coordinates";

type Props = {
  autoSaveId?: string;
  children?: ReactNode;
  className?: string;
  direction: Direction;
  height: number;
  width: number;
};

const PRECISION = 5;

// TODO [panels]
// Within an active drag, remember original positions to refine more easily on expand.
// Look at what the Chrome devtools Sources does.

export default function PanelGroup({
  autoSaveId,
  children = null,
  className = "",
  direction,
  height,
  width,
}: Props) {
  const groupId = useUniqueId();

  const [activeHandleId, setActiveHandleId] = useState<string | null>(null);
  const [panels, setPanels] = useState<Map<string, PanelData>>(new Map());

  // 0-1 values representing the relative size of each panel.
  const [sizes, setSizes] = useState<number[]>([]);

  // Store committed values to avoid unnecessarily re-running memoization/effects functions.
  const committedValuesRef = useRef<{
    direction: Direction;
    height: number;
    panels: Map<string, PanelData>;
    sizes: number[];
    width: number;
  }>({
    direction,
    height,
    panels,
    sizes,
    width,
  });

  // Tracks the most recent coordinates of a touch/mouse event.
  // This is needed to calculate movement (because TouchEvent doesn't support movementX and movementY).
  const prevCoordinatesRef = useRef<Coordinates>({
    screenX: 0,
    screenY: 0,
  });

  useLayoutEffect(() => {
    committedValuesRef.current.direction = direction;
    committedValuesRef.current.height = height;
    committedValuesRef.current.panels = panels;
    committedValuesRef.current.sizes = sizes;
    committedValuesRef.current.width = width;
  });

  // Once all panels have registered themselves,
  // Compute the initial sizes based on default weights.
  // This assumes that panels register during initial mount (no conditional rendering)!
  useLayoutEffect(() => {
    const sizes = committedValuesRef.current.sizes;
    if (sizes.length === panels.size) {
      return;
    }

    // TODO [panels]
    // Validate that the total minSize is <= 1.

    // If this panel has been configured to persist sizing information,
    // default size should be restored from local storage if possible.
    let defaultSizes: number[] | undefined = undefined;
    if (autoSaveId) {
      const panelIds = panelsMapToSortedArray(panels).map((panel) => panel.id);
      defaultSizes = loadPanelLayout(autoSaveId, panelIds);
    }

    if (defaultSizes != null) {
      setSizes(defaultSizes);
    } else {
      const panelsArray = panelsMapToSortedArray(panels);
      const totalWeight = panelsArray.reduce((weight, panel) => {
        return weight + panel.defaultSize;
      }, 0);

      setSizes(panelsArray.map((panel) => panel.defaultSize / totalWeight));
    }
  }, [autoSaveId, panels]);

  useEffect(() => {
    // If this panel has been configured to persist sizing information, save sizes to local storage.
    if (autoSaveId) {
      if (sizes.length === 0 || sizes.length !== panels.size) {
        return;
      }

      const panelIds = panelsMapToSortedArray(panels).map((panel) => panel.id);
      savePanelGroupLayout(autoSaveId, panelIds, sizes);
    }
  }, [autoSaveId, panels, sizes]);

  const getPanelStyle = useCallback(
    (id: string): CSSProperties => {
      const { panels } = committedValuesRef.current;

      const offset = getOffset(panels, id, direction, sizes, height, width);
      const size = getSize(panels, id, direction, sizes, height, width);

      if (direction === "horizontal") {
        return {
          height: "100%",
          position: "absolute",
          left: offset,
          top: 0,
          width: size,
        };
      } else {
        return {
          height: size,
          position: "absolute",
          left: 0,
          top: offset,
          width: "100%",
        };
      }
    },
    [direction, height, sizes, width]
  );

  const registerPanel = useCallback((id: string, panel: PanelData) => {
    setPanels((prevPanels) => {
      if (prevPanels.has(id)) {
        return prevPanels;
      }

      const nextPanels = new Map(prevPanels);
      nextPanels.set(id, panel);

      return nextPanels;
    });
  }, []);

  const registerResizeHandle = useCallback(
    (id: string) => {
      const resizeHandler = (event: ResizeEvent) => {
        event.preventDefault();

        const {
          direction,
          height,
          panels,
          sizes: prevSizes,
          width,
        } = committedValuesRef.current;

        const handle = document.querySelector(
          `[data-panel-resize-handle-id="${id}"]`
        );
        const handles = Array.from(
          document.querySelectorAll(`[data-panel-group-id="${groupId}"]`)
        );
        const index = handles.indexOf(handle);
        const panelsArray = panelsMapToSortedArray(panels);
        const idBefore: string | null = panelsArray[index]?.id ?? null;
        const idAfter: string | null = panelsArray[index + 1]?.id ?? null;
        if (idBefore == null || idAfter == null) {
          return;
        }

        const nextCoordinates = getUpdatedCoordinates(
          event,
          prevCoordinatesRef.current,
          { height, width },
          direction
        );
        prevCoordinatesRef.current = {
          screenX: nextCoordinates.screenX,
          screenY: nextCoordinates.screenY,
        };

        const isHorizontal = direction === "horizontal";
        const movement = isHorizontal
          ? nextCoordinates.movementX
          : nextCoordinates.movementY;
        const delta = isHorizontal ? movement / width : movement / height;

        const nextSizes = adjustByDelta(
          panels,
          idBefore,
          idAfter,
          delta,
          prevSizes
        );
        if (prevSizes !== nextSizes) {
          setSizes(nextSizes);
        }
      };

      return resizeHandler;
    },
    [groupId]
  );

  const unregisterPanel = useCallback((id: string) => {
    setPanels((prevPanels) => {
      if (!prevPanels.has(id)) {
        return prevPanels;
      }

      const nextPanels = new Map(prevPanels);
      nextPanels.delete(id);

      return nextPanels;
    });
  }, []);

  const panelGroupContext = useMemo(
    () => ({
      direction,
      getPanelStyle,
      groupId,
      registerPanel,
      registerResizeHandle,
      startDragging: (id: string) => setActiveHandleId(id),
      stopDragging: () => {
        setActiveHandleId(null);
        prevCoordinatesRef.current = {
          screenX: 0,
          screenY: 0,
        };
      },
      unregisterPanel,
    }),
    [
      direction,
      getPanelStyle,
      groupId,
      registerPanel,
      registerResizeHandle,
      unregisterPanel,
    ]
  );

  const panelContext = useMemo(
    () => ({
      activeHandleId,
    }),
    [activeHandleId]
  );

  return (
    <PanelContext.Provider value={panelContext}>
      <PanelGroupContext.Provider value={panelGroupContext}>
        <div className={className}>{children}</div>
      </PanelGroupContext.Provider>
    </PanelContext.Provider>
  );
}

function adjustByDelta(
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
  let pivotId = delta < 0 ? idBefore : idAfter;
  let index = panelsArray.findIndex((panel) => panel.id === pivotId);
  while (true) {
    const panel = panelsArray[index];
    const prevSize = prevSizes[index];
    const nextSize = Math.max(prevSize - Math.abs(delta), panel.minSize);
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

function getOffset(
  panels: Map<string, PanelData>,
  id: string,
  direction: Direction,
  sizes: number[],
  height: number,
  width: number
): number {
  const panelsArray = panelsMapToSortedArray(panels);

  let index = panelsArray.findIndex((panel) => panel.id === id);
  if (index < 0) {
    return 0;
  }

  let scaledOffset = 0;

  for (index = index - 1; index >= 0; index--) {
    const panel = panelsArray[index];
    scaledOffset += getSize(panels, panel.id, direction, sizes, height, width);
  }

  return Math.round(scaledOffset);
}

function getSize(
  panels: Map<string, PanelData>,
  id: string,
  direction: Direction,
  sizes: number[],
  height: number,
  width: number
): number {
  const totalSize = direction === "horizontal" ? width : height;

  if (panels.size === 1) {
    return totalSize;
  }

  const panelsArray = panelsMapToSortedArray(panels);

  const index = panelsArray.findIndex((panel) => panel.id === id);
  const size = sizes[index];
  if (size == null) {
    return 0;
  }

  return Math.round(size * totalSize);
}

function panelsMapToSortedArray(panels: Map<string, PanelData>): PanelData[] {
  return Array.from(panels.values()).sort((a, b) => a.order - b.order);
}
