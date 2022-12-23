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

import { PanelGroupContext } from "./PanelContexts";
import { Direction, PanelData } from "./types";

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
      try {
        const value = localStorage.getItem(
          createLocalStorageKey(autoSaveId, panels)
        );
        if (value) {
          defaultSizes = JSON.parse(value);
        }
      } catch (error) {}
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
    if (autoSaveId) {
      if (sizes.length === 0 || sizes.length !== panels.size) {
        return;
      }

      // If this panel has been configured to persist sizing information, save sizes to local storage.
      localStorage.setItem(
        createLocalStorageKey(autoSaveId, panels),
        JSON.stringify(sizes)
      );
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
    (idBefore: string, idAfter: string) => {
      return (event: MouseEvent) => {
        event.preventDefault();

        const {
          direction,
          height,
          panels,
          sizes: prevSizes,
          width,
        } = committedValuesRef.current;

        const isHorizontal = direction === "horizontal";
        const movement = isHorizontal ? event.movementX : event.movementY;
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

      // TODO [issues/5] Add to Map
    },
    []
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

  const context = useMemo(
    () => ({
      direction,
      getPanelStyle,
      registerPanel,
      registerResizeHandle,
      unregisterPanel,
    }),
    [
      direction,
      getPanelStyle,
      registerPanel,
      registerResizeHandle,
      unregisterPanel,
    ]
  );

  return (
    <PanelGroupContext.Provider value={context}>
      <div className={className}>{children}</div>
    </PanelGroupContext.Provider>
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

function createLocalStorageKey(
  autoSaveId: string,
  panels: Map<string, PanelData>
): string {
  const panelsArray = panelsMapToSortedArray(panels);
  const panelIds = panelsArray.map((panel) => panel.id);

  return `PanelGroup:sizes:${autoSaveId}${panelIds.join("|")}`;
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
