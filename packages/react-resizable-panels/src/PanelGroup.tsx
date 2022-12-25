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
import {
  adjustByDelta,
  getOffset,
  getResizeHandlePanelIds,
  getSize,
  panelsMapToSortedArray,
} from "./utils/group";
import { useWindowSplitterPanelGroupBehavior } from "./hooks/useWindowSplitterBehavior";

export type CommittedValues = {
  direction: Direction;
  height: number;
  panels: Map<string, PanelData>;
  sizes: number[];
  width: number;
};

export type PanelDataMap = Map<string, PanelData>;

type Props = {
  autoSaveId?: string;
  children?: ReactNode;
  className?: string;
  direction: Direction;
  height: number;
  width: number;
};

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
  const [panels, setPanels] = useState<PanelDataMap>(new Map());

  // 0-1 values representing the relative size of each panel.
  const [sizes, setSizes] = useState<number[]>([]);

  // Store committed values to avoid unnecessarily re-running memoization/effects functions.
  const committedValuesRef = useRef<CommittedValues>({
    direction,
    height,
    panels,
    sizes,
    width,
  });

  // Tracks the most recent coordinates of a touch/mouse event.
  // This is needed to calculate movement (because TouchEvent doesn't support movementX and movementY).
  const prevOffsetRef = useRef<number>(0);

  useLayoutEffect(() => {
    committedValuesRef.current.direction = direction;
    committedValuesRef.current.height = height;
    committedValuesRef.current.panels = panels;
    committedValuesRef.current.sizes = sizes;
    committedValuesRef.current.width = width;
  });

  useWindowSplitterPanelGroupBehavior({
    committedValuesRef,
    groupId,
    panels,
    setSizes,
    sizes,
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
    (handleId: string) => {
      const resizeHandler = (event: ResizeEvent) => {
        event.preventDefault();

        const {
          direction,
          height,
          panels,
          sizes: prevSizes,
          width,
        } = committedValuesRef.current;

        const panelsArray = panelsMapToSortedArray(panels);

        const [idBefore, idAfter] = getResizeHandlePanelIds(
          groupId,
          handleId,
          panelsArray
        );
        if (idBefore == null || idAfter == null) {
          return;
        }

        const nextCoordinates = getUpdatedCoordinates(
          event,
          prevOffsetRef.current,
          { height, width },
          direction
        );
        prevOffsetRef.current = nextCoordinates.offset;

        const isHorizontal = direction === "horizontal";
        const movement = nextCoordinates.movement;
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
        prevOffsetRef.current = 0;
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
