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
import { Direction, Panel, PanelId } from "./types";

type Props = {
  autoSaveId?: string;
  children: ReactNode[];
  className?: string;
  direction: Direction;
  height: number;
  width: number;
};

const PRECISION = 5;

// TODO [panels]
// Within an active drag, remember original positions to refine more easily on expand.
// Look at what the Chrome devtools Sources does.

export default function PanelGroup({ autoSaveId, children, className = "", direction, height, width }: Props) {
  const panelsRef = useRef<Panel[]>([]);

  // 0-1 values representing the relative size of each panel.
  const [sizes, setSizes] = useState<number[]>([]);

  // Store committed values to avoid unnecessarily re-running memoization/effects functions.
  const committedValuesRef = useRef<{
    direction: Direction;
    height: number;
    sizes: number[];
    width: number;
  }>({
    direction,
    height,
    sizes,
    width,
  });
  useLayoutEffect(() => {
    committedValuesRef.current.direction = direction;
    committedValuesRef.current.height = height;
    committedValuesRef.current.sizes = sizes;
    committedValuesRef.current.width = width;
  });

  // Once all panels have registered themselves,
  // Compute the initial sizes based on default weights.
  // This assumes that panels register during initial mount (no conditional rendering)!
  useLayoutEffect(() => {
    const panels = panelsRef.current;
    const sizes = committedValuesRef.current.sizes;
    if (sizes.length === panels.length) {
      return;
    }

    // If this panel has been configured to persist sizing information,
    // default size should be restored from local storage if possible.
    let defaultSizes: number[] | undefined = undefined;
    if (autoSaveId) {
      try {
        const value = localStorage.getItem(`PanelGroup:sizes:${autoSaveId}`);
        if (value) {
          defaultSizes = JSON.parse(value);
        }
      } catch (error) {}
    }

    if (sizes.length === 0 && defaultSizes != null && defaultSizes.length === panels.length) {
      setSizes(defaultSizes);
    } else {
      const totalWeight = panels.reduce((weight, panel) => {
        return weight + panel.defaultSize;
      }, 0);

      setSizes(panels.map(panel => panel.defaultSize / totalWeight));
    }
  }, [autoSaveId]);

  useEffect(() => {
    if (autoSaveId && sizes.length > 0) {
      // If this panel has been configured to persist sizing information, save sizes to local storage.
      localStorage.setItem(`PanelGroup:sizes:${autoSaveId}`, JSON.stringify(sizes));
    }
  }, [autoSaveId, sizes]);

  const getPanelStyle = useCallback(
    (id: PanelId): CSSProperties => {
      const panels = panelsRef.current;

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

  const registerPanel = useCallback((id: PanelId, panel: Panel) => {
    const panels = panelsRef.current;
    const index = panels.findIndex(panel => panel.id === id);
    if (index >= 0) {
      panels.splice(index, 1);
    }
    panels.push(panel);
  }, []);

  const registerResizeHandle = useCallback((idBefore: PanelId, idAfter: PanelId) => {
    return (event: MouseEvent) => {
      event.preventDefault();

      const panels = panelsRef.current;
      const { direction, height, sizes: prevSizes, width } = committedValuesRef.current;

      const isHorizontal = direction === "horizontal";
      const movement = isHorizontal ? event.movementX : event.movementY;
      const delta = isHorizontal ? movement / width : movement / height;

      const nextSizes = adjustByDelta(panels, idBefore, idAfter, delta, prevSizes);
      if (prevSizes !== nextSizes) {
        setSizes(nextSizes);
      }
    };
  }, []);

  const context = useMemo(
    () => ({
      direction,
      getPanelStyle,
      registerPanel,
      registerResizeHandle,
    }),
    [direction, getPanelStyle, registerPanel, registerResizeHandle]
  );

  return (
    <PanelGroupContext.Provider value={context}>
      <div className={className}>
        {children}
      </div>
    </PanelGroupContext.Provider>
  );
}

function adjustByDelta(
  panels: Panel[],
  idBefore: PanelId,
  idAfter: PanelId,
  delta: number,
  prevSizes: number[]
): number[] {
  if (delta === 0) {
    return prevSizes;
  }

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
  let index = panels.findIndex(panel => panel.id === pivotId);
  while (true) {
    const panel = panels[index];
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
      if (++index >= panels.length) {
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
  index = panels.findIndex(panel => panel.id === pivotId);
  nextSizes[index] = prevSizes[index] + deltaApplied;

  return nextSizes;
}

function getOffset(
  panels: Panel[],
  id: PanelId,
  direction: Direction,
  sizes: number[],
  height: number,
  width: number
): number {
  let index = panels.findIndex(panel => panel.id === id);
  if (index < 0) {
    return 0;
  }

  let scaledOffset = 0;

  for (index = index - 1; index >= 0; index--) {
    const panel = panels[index];
    scaledOffset += getSize(panels, panel.id, direction, sizes, height, width);
  }

  return Math.round(scaledOffset);
}

function getSize(
  panels: Panel[],
  id: PanelId,
  direction: Direction,
  sizes: number[],
  height: number,
  width: number
): number {
  const index = panels.findIndex(panel => panel.id === id);
  const size = sizes[index];
  if (size == null) {
    return 0;
  }

  const totalSize = direction === "horizontal" ? width : height;

  if (panels.length === 1) {
    return totalSize;
  } else {
    return Math.round(size * totalSize);
  }
}
